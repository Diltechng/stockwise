import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { pool } from "../db/pool";

// Get Stock History
export const getStockHistory = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
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
      ORDER BY sh.created_at DESC;
    `);

    return res.status(200).json({
      success: true,
      history: result.rows,
    });
  } catch (error) {
    console.error("Get Stock History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Create Stock Movement
export const createStockMovement = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { product_id, quantity, type, note } = req.body;

    const userId = req.user.id;

    // Validation
    if (!product_id || !quantity || !type) {
      return res.status(400).json({
        success: false,
        message: "Product, quantity and type are required",
      });
    }

    if (!["IN", "OUT"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock type",
      });
    }

    await client.query("BEGIN");

    // Get Product
    const productResult = await client.query(
      `
      SELECT *
      FROM products
      WHERE id = $1
      `,
      [product_id],
    );

    if (productResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = productResult.rows[0];

    // Prevent negative stock
    if (type === "OUT" && product.quantity < Number(quantity)) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    // Update product quantity
    await client.query(
      `
      UPDATE products
      SET
        quantity = CASE
          WHEN $1 = 'IN'
          THEN quantity + $2
          ELSE quantity - $2
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [type, Number(quantity), product_id],
    );

    // Save stock history
    await client.query(
      `
      INSERT INTO stock_history
      (
        product_id,
        user_id,
        type,
        quantity,
        note
      )
      VALUES
      ($1, $2, $3, $4, $5)
      `,
      [product_id, userId, type, Number(quantity), note || null],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Stock updated successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create Stock Movement Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    client.release();
  }
};
