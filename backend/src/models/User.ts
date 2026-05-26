import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// ========================
// TypeScript Interface
// ========================

/**
 * IUser - Defines the shape of a User document in MongoDB.
 *
 * Extends Mongoose's Document type so we get access to
 * built-in methods like .save(), .toJSON(), etc.
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  // Custom instance method to compare passwords during login
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ========================
// Mongoose Schema
// ========================

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true, // Removes leading/trailing whitespace
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Creates a MongoDB unique index for fast lookups
      lowercase: true, // Normalizes email to lowercase before saving
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // By default, don't return password in queries (security)
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Only these two values are allowed
      default: "user", // New users default to "user" role
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// ========================
// Pre-Save Hook: Hash Password
// ========================

/**
 * Before saving a user document, check if the password field
 * has been modified. If so, hash it with bcrypt.
 *
 * This runs on both .save() and .create() calls.
 * It does NOT run on .findOneAndUpdate() — by design,
 * password changes should go through the model's .save() method.
 */
userSchema.pre("save", async function () {
  // "this" refers to the user document being saved

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return;
  }

  // Generate a salt with 12 rounds (good balance of security vs speed)
  const salt = await bcrypt.genSalt(12);

  // Hash the plain-text password with the salt
  this.password = await bcrypt.hash(this.password, salt);
});

// ========================
// Instance Method: Compare Password
// ========================

/**
 * comparePassword - Compares a plain-text password to the stored hash.
 *
 * Used during login to verify the user's credentials.
 * bcrypt.compare() is timing-safe (prevents timing attacks).
 *
 * @param candidatePassword - The plain-text password to check
 * @returns true if the password matches, false otherwise
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // "this.password" is the hashed password from the database
  return bcrypt.compare(candidatePassword, this.password);
};

// ========================
// Export Model
// ========================

// Create and export the Mongoose model
// "User" is the model name — Mongoose will create a "users" collection in MongoDB
const User = mongoose.model<IUser>("User", userSchema);

export default User;
