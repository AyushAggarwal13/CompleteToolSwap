import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import toolRoutes from "./routes/toolRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import User from "./models/userModel.js";
import userRouter from "./routes/userRoutes.js";
import cronJob from "./services/cronService.js";

dotenv.config();

const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    cronJob.start();
    console.log('Cron job started');
  } else {
    console.log('Cron job disabled (MongoDB not connected)');
  }
};

startServer();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.send("ToolSwap API is running...");
});

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

const activeUsers = {};

io.on("connection", (socket) => {
  console.log(`A user connected with socket ID: ${socket.id}`);

  socket.on("add_user", async (userId) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        activeUsers[userId] = { socketId: socket.id, name: user.name };
        console.log(`User "${user.name}" added to active list.`);
      }
    } catch (error) {
      console.error("Error finding user for socket:", error);
    }
  });

  socket.on("disconnect", () => {
    for (const userId in activeUsers) {
      if (activeUsers[userId].socketId === socket.id) {
        console.log(`User "${activeUsers[userId].name}" disconnected.`);
        delete activeUsers[userId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { io, activeUsers };
