import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";

// ========================
// Load Environment Variables
// ========================

/**
 * dotenv.config() reads the .env file and loads its values
 * into process.env. This MUST run before accessing any
 * environment variables (like MONGO_URI, JWT_SECRET, etc.)
 */
dotenv.config();

// ========================
// Create Express Application
// ========================

const app = express();

// ========================
// Global Middleware
// ========================

/**
 * CORS (Cross-Origin Resource Sharing)
 *
 * - origin: allows requests from your frontend URL (set in .env)
 * - credentials: true — allows cookies to be sent with cross-origin requests
 *   (required for our HTTP-only JWT cookie to work across domains)
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

/**
 * JSON Body Parser
 *
 * Parses incoming request bodies with JSON payloads.
 * After this middleware, req.body contains the parsed JSON object.
 * limit: "10mb" prevents overly large payloads (basic DoS protection).
 */
app.use(express.json({ limit: "10mb" }));

/**
 * Cookie Parser
 *
 * Parses cookies from the Cookie header and populates req.cookies.
 * This is required for our auth middleware to read the JWT token
 * from the HTTP-only cookie.
 */
app.use(cookieParser());

// ========================
// API Routes
// ========================

/**
 * Mount the auth router at /api/auth
 *
 * All routes defined in auth.ts will be prefixed with /api/auth:
 * POST   /api/auth/register
 * POST   /api/auth/login
 * POST   /api/auth/logout
 * GET    /api/auth/me
 * GET    /api/auth/users
 */
app.use("/api/auth", authRoutes);

/**
 * Health Check Route
 *
 * A simple endpoint to verify the server is running.
 * Useful for monitoring, load balancers, and deployment checks.
 */
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ========================
// Start Server
// ========================

const PORT = process.env.PORT || 5000;

/**
 * Boot sequence:
 * 1. Connect to MongoDB
 * 2. Start listening for HTTP requests
 *
 * If the DB connection fails, connectDB() will call process.exit(1)
 * and the server will never start — which is the correct behavior.
 */
const startServer = async (): Promise<void> => {
  // Step 1: Connect to the database
  await connectDB();

  // Step 2: Start the HTTP server
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`💚 Health:   http://localhost:${PORT}/api/health`);
    console.log(`🔧 Mode:     ${process.env.NODE_ENV || "development"}\n`);
  });
};

// Run the boot sequence
startServer();
