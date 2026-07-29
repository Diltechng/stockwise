import { Request, Response } from "express";
import { pool } from "../db/pool";

export const getDashboard = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const productsResult = await pool.query(`
      SELECT COUNT(*)::int AS total_products
      FROM products
    `);

    // Low stock products
    const lowStockResult = await pool.query(`
      SELECT COUNT(*)::int AS low_stock_count
      FROM products
      WHERE quantity <= min_threshold
    `);

    // Inventory value
    const valueResult = await pool.query(`
      SELECT
        COALESCE(SUM(price * quantity),0)::numeric AS total_value
      FROM products
    `);

    // Category breakdown
    const categoryResult = await pool.query(`
      SELECT
        c.name,
        COALESCE(SUM(p.quantity),0)::int AS total_quantity
      FROM categories c
      LEFT JOIN products p
        ON p.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);

    // Recent stock activity
    const activityResult = await pool.query(`
      SELECT
        sh.id,
        p.name AS product_name,
        p.sku,
        u.full_name AS user_name,
        sh.type,
        sh.quantity,
        sh.note,
        sh.created_at
      FROM stock_history sh
      JOIN products p
        ON sh.product_id = p.id
      JOIN users u
        ON sh.user_id = u.id
      ORDER BY sh.created_at DESC
      LIMIT 10
    `);

    res.json({
      total_products: productsResult.rows[0].total_products,
      low_stock_count: lowStockResult.rows[0].low_stock_count,
      total_value: Number(valueResult.rows[0].total_value),
      category_breakdown: categoryResult.rows,
      recent_activity: activityResult.rows,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};