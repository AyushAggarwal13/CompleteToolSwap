import express from 'express';
import { listNewTool, getNearbyTools,getToolById,updateTool,deleteTool,getToolsByUserId } from '../controllers/toolController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../services/uploadService.js';

const router = express.Router();

// Create new tool
router.post('/', protect, upload.single('image'), listNewTool);
// Get nearby tools
router.get('/nearby', getNearbyTools);
// Update tool (includes image update)
router.put('/:id', protect, upload.single('image'), updateTool);
// Delete tool
router.delete('/:id', protect, deleteTool);
// Get tool by ID
router.get('/:id', getToolById);
// New route to get tools by user ID (for ProfilePage)
router.get('/user/:userId', getToolsByUserId); 


export default router;