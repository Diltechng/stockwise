import { Request, Response } from "express";
import { pool } from "../db/pool";

// GET ALL CATEGORIES
export const getCategories = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.description,
        COUNT(p.id) AS products_count
      FROM categories c
      LEFT JOIN products p
      ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    res.status(200).json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
};

// GET SINGLE CATEGORY
export const getCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      category: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch category",
    });
  }
};

// CREATE CATEGORY
export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: "Category name is required",
      });
      return;
    }

    const exists = await pool.query(
      "SELECT id FROM categories WHERE LOWER(name)=LOWER($1)",
      [name],
    );

    if (exists.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: "Category already exists",
      });
      return;
    }

    const result = await pool.query(
      `
      INSERT INTO categories(name, description)
      VALUES($1,$2)
      RETURNING *
      `,
      [name, description || null],
    );

    res.status(201).json({
      success: true,
      category: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to create category",
    });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await pool.query(
      `
      UPDATE categories
      SET
        name=$1,
        description=$2
      WHERE id=$3
      RETURNING *
      `,
      [name, description || null, id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      category: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to update category",
    });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE products
      SET category_id=NULL
      WHERE category_id=$1
      `,
      [id],
    );

    const result = await pool.query(
      `
      DELETE FROM categories
      WHERE id=$1
      RETURNING *
      `,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to delete category",
    });
  }
};