import dotenv from "dotenv";
import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
dotenv.config();

const app: Express = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// connect to MongoDB
connectDB();

// export app
export default app;