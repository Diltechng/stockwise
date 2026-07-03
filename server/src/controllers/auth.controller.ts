import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool";
import { AuthRequest } from "../middleware/auth";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is missing");
}

type User = {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: string;
};

// Register
export const register = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      full_name,
      email,
      password,
      role = "staff",
    } = req.body;

    if (!full_name || !email || !password) {
      res.status(400).json({
        success: false,
        error: "All fields are required",
      });
      return;
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: "Email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (
        full_name,
        email,
        password,
        role
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, role, created_at
      `,
      [full_name, email, hashedPassword, role],
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Login
export const login = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
      return;
    }

    const result = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Logout
export const logout = (
  _req: Request,
  res: Response,
): void => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Get Current User
export const getProfile = (
  req: AuthRequest,
  res: Response,
): void => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};