import { Router, type Router as RouterType } from "express";
import {
  register,
  login,
  logout,
  getMe,
  getUsers,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

// ========================
// Create Router Instance
// ========================

/**
 * authRouter - Handles all authentication-related routes.
 *
 * Base path: /api/auth (set in index.ts when mounting this router)
 *
 * Routes:
 * POST   /register  → Create a new user account
 * POST   /login     → Authenticate and receive a JWT cookie
 * POST   /logout    → Clear the JWT cookie
 * GET    /me        → Get the currently authenticated user (protected)
 * GET    /users     → Get all users (protected)
 */
const router: RouterType = Router();

// ========================
// Public Routes (no authentication required)
// ========================

// Register a new user — validates input, hashes password, sets JWT cookie
router.post("/register", register);

// Login an existing user — verifies credentials, sets JWT cookie
router.post("/login", login);

// Logout — clears the JWT cookie (no auth required to avoid edge cases)
router.post("/logout", logout);

// ========================
// Protected Routes (authentication required)
// ========================

// Get current user profile — requires valid JWT in cookie
// The "protect" middleware runs first: verifies token → attaches user to req
router.get("/me", protect, getMe);

// get all users 
router.get("/users", protect, getUsers);

export default router;
