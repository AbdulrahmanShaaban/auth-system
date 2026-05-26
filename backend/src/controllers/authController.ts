import { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import User from "../models/User";

// ========================
// Zod Validation Schemas
// ========================

/**
 * registerSchema - Validates the request body for user registration.
 *
 * Rules:
 * - name: must be at least 2 characters
 * - email: must be a valid email format
 * - password: must be at least 8 characters
 */
const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

/**
 * loginSchema - Validates the request body for user login.
 *
 * Rules:
 * - email: must be a valid email format
 * - password: must not be empty
 */
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

// ========================
// Helper: Generate JWT Token
// ========================

/**
 * generateToken - Creates a signed JWT token for the given user ID.
 *
 * @param userId - The MongoDB _id of the user
 * @returns A signed JWT string
 */
const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId }, // Payload — only store the user ID (minimal data)
    process.env.JWT_SECRET as string, // Secret key from .env
    {
      expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
    } // Token expiry
  );
};

// ========================
// Helper: Set JWT Cookie
// ========================

/**
 * setTokenCookie - Attaches the JWT as an HTTP-only cookie to the response.
 *
 * Security settings:
 * - httpOnly: true  → JavaScript can't access the cookie (prevents XSS)
 * - secure: true    → Cookie only sent over HTTPS (in production)
 * - sameSite: "lax" → Prevents CSRF on cross-origin POST requests
 * - maxAge          → Cookie expires when the JWT expires
 */
const setTokenCookie = (res: Response, token: string): void => {
  res.cookie("token", token, {
    httpOnly: true, // Not accessible via document.cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // Protects against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

// ========================
// Controller: Register
// ========================

/**
 * register - Creates a new user account.
 *
 * Flow:
 * 1. Validate input with Zod
 * 2. Check if email already exists
 * 3. Create user (password is auto-hashed by the pre-save hook)
 * 4. Generate JWT and set it as an HTTP-only cookie
 * 5. Return the user data (without password)
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Step 1: Validate request body against the Zod schema
    const validatedData = registerSchema.parse(req.body);

    // Step 2: Check if a user with this email already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
      return;
    }

    // Step 3: Create the new user
    // The pre-save hook in User.ts will automatically hash the password
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
    });

    // Step 4: Generate JWT and set it in an HTTP-only cookie
    const token = generateToken(user._id.toString());
    setTokenCookie(res, token);

    // Step 5: Return success response (password is excluded due to select: false)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Handle Zod validation errors separately for clear error messages
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }

    // Handle all other errors
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ========================
// Controller: Login
// ========================

/**
 * login - Authenticates a user and starts a session.
 *
 * Flow:
 * 1. Validate input with Zod
 * 2. Find user by email (explicitly select password since it's hidden by default)
 * 3. Compare the provided password with the stored hash
 * 4. Generate JWT and set it as an HTTP-only cookie
 * 5. Return the user data (without password)
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Step 1: Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Step 2: Find user by email — must use .select("+password") because
    // the password field has select: false in the schema
    const user = await User.findOne({ email: validatedData.email }).select(
      "+password"
    );

    // If no user found, return a generic error (don't reveal which field is wrong)
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Step 3: Compare passwords using the instance method from User.ts
    const isPasswordCorrect = await user.comparePassword(
      validatedData.password
    );

    if (!isPasswordCorrect) {
      // Same generic message — prevents email enumeration attacks
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Step 4: Generate JWT and set cookie
    const token = generateToken(user._id.toString());
    setTokenCookie(res, token);

    // Step 5: Return success response (without password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }

    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ========================
// Controller: Logout
// ========================

/**
 * logout - Ends the user's session by clearing the JWT cookie.
 *
 * We clear the cookie by setting it to an empty string with maxAge: 0,
 * which tells the browser to delete it immediately.
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Clear the token cookie — this effectively logs the user out
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ========================
// Controller: Get Current User
// ========================

/**
 * getMe - Returns the currently authenticated user's profile.
 *
 * This route is protected by the auth middleware, which:
 * 1. Reads the JWT from the cookie
 * 2. Verifies and decodes it
 * 3. Attaches the user object to req.user
 *
 * So by the time we get here, req.user is guaranteed to exist.
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by the auth middleware (see authMiddleware.ts)
    // The Express Request type is augmented in authMiddleware.ts
    const user = req.user;

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// all users controller

export const getUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("GetUsers error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};