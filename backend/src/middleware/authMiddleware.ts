import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

// ========================
// Extend Express Request Type
// ========================

/**
 * Extend the Express Request interface to include a `user` property.
 *
 * This allows us to attach the authenticated user to the request
 * object in the middleware, and access it in controllers with
 * proper TypeScript typing (no need for `req as any`).
 */
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// ========================
// JWT Payload Interface
// ========================

/**
 * JwtPayload - Defines the shape of our JWT token payload.
 *
 * We only store the user ID in the token — minimal data
 * reduces token size and limits exposure if the token is compromised.
 */
interface JwtPayload {
  id: string;
  iat: number; // Issued at (auto-added by jsonwebtoken)
  exp: number; // Expiration time (auto-added by jsonwebtoken)
}

// ========================
// Auth Middleware
// ========================

/**
 * protect - Middleware that verifies the JWT token from cookies.
 *
 * Flow:
 * 1. Extract the JWT from the HTTP-only cookie named "token"
 * 2. Verify the token using the JWT_SECRET from .env
 * 3. Find the user in the database by the ID in the token payload
 * 4. Attach the user to req.user for use in controllers
 * 5. Call next() to pass control to the next middleware/controller
 *
 * If any step fails, respond with 401 Unauthorized.
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Step 1: Get the token from the HTTP-only cookie
    const token = req.cookies?.token;

    // If no token exists, the user is not authenticated
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
      return;
    }

    // Step 2: Verify the token — this checks both the signature and expiration
    // If the token is invalid or expired, jwt.verify() throws an error
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Step 3: Find the user by the ID stored in the token
    // We exclude the password field (it's excluded by default via select: false)
    const user = await User.findById(decoded.id);

    // If the user no longer exists (e.g., account was deleted), reject
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Not authorized — user no longer exists",
      });
      return;
    }

    // Step 4: Attach the user to the request object
    // This makes the user available in all subsequent middleware and controllers
    req.user = user;

    // Step 5: Pass control to the next middleware or route handler
    next();
  } catch (error) {
    // Handle specific JWT errors for clear error messages
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Not authorized — invalid token",
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Not authorized — token has expired",
      });
      return;
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
