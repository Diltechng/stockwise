import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import dotenv from "dotenv";
import productRoutes from "./routes/product.routes";

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

pool.on("error", (err: Error) => {
  console.error("PostgreSQL error:", err.message);
});

// Middleware
app.use(cors());
app.use(express.json());

type User = {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: string;
  created_at: Date;
};

// Health Check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

// Register User
app.post(
  "/api/auth/register",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        full_name,
        email,
        password,
        role = "staff",
      }: {
        full_name: string;
        email: string;
        password: string;
        role?: string;
      } = req.body;

      if (!full_name || !email || !password) {
        res.status(400).json({
          success: false,
          error: "All fields are required",
        });
        return;
      }

      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email],
      );

      if (existingUser.rows.length > 0) {
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
    } catch (error: unknown) {
      console.error("Register Error:", error);

      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      });
    }
  },
);

// Login User
app.post(
  "/api/auth/login",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: { email: string; password: string } =
        req.body;

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

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        jwtSecret,
        {
          expiresIn: "1h",
        },
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: unknown) {
      console.error("Login Error:", error);

      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      });
    }
  },
);

app.get("/api/products", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM products
      ORDER BY id DESC
    `);

    res.status(200).json(result.rows);
  } catch (err: any) {
    console.error(err.message);

    res.status(500).json({
      error: "Failed to fetch products",
    });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const { name, sku, quantity, price } = req.body;

    if (!name || !sku || !quantity || !price) {
      return res.status(400).json({
        error: 'Name, SKU, quantity and price are required'
      });
    }

    const result = await pool.query(
      `
      INSERT INTO products (name, sku, quantity, price)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, sku, quantity, price]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server database error' });
  }
});
app.put('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, sku, price, description, quantity, min_threshold, category_id } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE products
      SET name = $1, sku = $2, price = $3, description = $4, quantity = $5, min_threshold = $6, category_id = $7
      WHERE id = $8
      RETURNING *
      `,
      [name, sku, price, description, quantity, min_threshold, category_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server database error' });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: 'Server database error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});