import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";
import dashboardRoutes from "./routes/dashboard.routes";

import "./db/pool";
import stockRoutes from "./routes/stock.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middleware

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "StockWise API is running",
  });
});

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 Handler

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error Handler

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  },
);

// Start Server

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
