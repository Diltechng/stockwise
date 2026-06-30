import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import dotenv from "dotenv";
//STASH --- BACKEND
dotenv.config();

const app = express();
const PORT = 4000;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on("connect", () => {
  console.log("PostgreSQL connected Successfully");
});

pool.on("error", (err) => {
  console.error("PostgreSQL error:", err.message);
});

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

// Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `
      INSERT INTO users (
        full_name,
        email,
        password
      )
      VALUES ($1, $2, $3)
      RETURNING id, full_name, email, role, created_at
      `,
      [full_name, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});