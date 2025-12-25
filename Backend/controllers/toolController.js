import Tool from '../models/toolModel.js';

export const listNewTool = async (req, res, next) => {
  const { name, category, description, condition, longitude, latitude } = req.body;
  try {
    const tool = new Tool({
      name,
      category,
      description,
      condition,
      owner: req.user._id, 
      imageUrl: req.file.path, 
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    const createdTool = await tool.save();
    res.status(201).json(createdTool);
  } catch (error) {
    next(error);
  }
};

export const getNearbyTools = async (req, res, next) => {
  const { lng, lat, dist } = req.query; 
  try {
    const tools = await Tool.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          
          $maxDistance: parseInt(dist) || 10000,
        },
      },
      availability: true,
    }).populate('owner', 'name trustScore'); 

    res.json(tools);
  } catch (error) {
    next(error);
  }
};

export const getToolById = async (req, res, next) => {
  try {
    const tool = await Tool.findById(req.params.id).populate(
      'owner',
      'name trustScore'
    );

    if (tool) {
      res.json(tool);
    } else {
      res.status(404);
      throw new Error('Tool not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a tool
// @route   PUT /api/tools/:id
export const updateTool = async (req, res, next) => {
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      res.status(404);
      throw new Error('Tool not found');
    }

    if (tool.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    tool.name = req.body.name || tool.name;
    tool.category = req.body.category || tool.category;
    tool.description = req.body.description || tool.description;
    tool.condition = req.body.condition || tool.condition;

    // If a new file is uploaded, update the imageUrl
    if (req.file) {
      tool.imageUrl = req.file.path;
    }

    const updatedTool = await tool.save();
    res.json(updatedTool);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a tool
// @route   DELETE /api/tools/:id
export const deleteTool = async (req, res, next) => {
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      res.status(404);
      throw new Error('Tool not found');
    }

    // Check if the user is the owner
    if (tool.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this tool');
    }

    await tool.deleteOne();
    res.json({ message: 'Tool removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tools for a specific user
// @route   GET /api/tools/user/:userId
export const getToolsByUserId = async (req, res, next) => {
  try {
    const tools = await Tool.find({ owner: req.params.userId }).populate('owner', 'name');
    if (tools) {
      res.json(tools);
    } else {
      res.status(404);
      throw new Error('Could not find tools for this user.');
    }
  } catch (error) {
    next(error);
  }
};