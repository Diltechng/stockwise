import { Request, Response } from "express";
import { pool } from "../db/pool";

// GET ALL PRODUCTS
export const getProducts = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(`
SELECT
    p.*,
    c.name AS category_name
FROM products p
LEFT JOIN categories c
ON p.category_id = c.id
ORDER BY p.id DESC;
`);

    res.status(200).json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
    });
  }
};

// GET SINGLE PRODUCT
export const getProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c
      ON p.category_id = c.id
      WHERE p.id = $1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
    });
  }
};

// CREATE PRODUCT
export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      name,
      sku,
      description,
      price,
      quantity = 0,
      min_threshold = 10,
    } = req.body;

    const category_id =
      req.body.category_id &&
      req.body.category_id.trim() !== ""
        ? req.body.category_id
        : null;

    if (!name || !sku || price == null) {
      res.status(400).json({
        success: false,
        error: "Name, SKU and Price are required",
      });
      return;
    }

    const skuExists = await pool.query(
      "SELECT id FROM products WHERE sku = $1",
      [sku],
    );

    if (skuExists.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: "SKU already exists",
      });
      return;
    }

    const result = await pool.query(
      `
      INSERT INTO products (
        name,
        sku,
        description,
        price,
        quantity,
        min_threshold,
        category_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *;
      `,
      [
        name,
        sku,
        description,
        price,
        quantity,
        min_threshold,
        category_id,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to create product",
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const {
      name,
      sku,
      description,
      price,
      quantity,
      min_threshold,
    } = req.body;

    const category_id =
      req.body.category_id &&
      req.body.category_id.trim() !== ""
        ? req.body.category_id
        : null;

    const result = await pool.query(
      `
      UPDATE products
      SET
        name = $1,
        sku = $2,
        description = $3,
        price = $4,
        quantity = $5,
        min_threshold = $6,
        category_id = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *;
      `,
      [
        name,
        sku,
        description,
        price,
        quantity,
        min_threshold,
        category_id,
        id,
      ],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to update product",
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING *
      `,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to delete product",
    });
  }
};
