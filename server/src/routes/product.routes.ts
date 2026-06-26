import { Router, Request, Response } from "express";
import { Pool } from "pg";
const pool = new Pool();

const router = Router();

type ProductBody = {
  name: string;
  sku: string;
  description?: string;
  price: number;
  quantity: number;
  min_threshold: number;
  category_id?: number | null;
};

// GET ALL PRODUCTS
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error: unknown) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Internal server error",
    });
  }
});

router.post("/api/products", async (req: Request, res: Response): Promise<void> => {
  try {
    const body: ProductBody = req.body;

    const {
      name,
      sku,
      description,
      price,
      quantity,
      min_threshold,
      category_id,
    } = body;

    if (
      !name ||
      !sku ||
      price === undefined ||
      quantity === undefined ||
      min_threshold === undefined
    ) {
      res.status(400).json({
        success: false,
        error: "All required fields must be provided",
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
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        name,
        sku,
        description ?? null,
        price,
        quantity,
        min_threshold,
        category_id ?? null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (error: unknown) {
    console.error("CREATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Internal server error",
    });
  }
});

export default router;