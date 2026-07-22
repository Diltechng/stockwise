import "dotenv/config";
import { pool } from "./pool";

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log("Starting migration...");

    // Enable UUID generation
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);

    await client.query("BEGIN");

    // Drop tables (reverse dependency order)
    await client.query(`DROP TABLE IF EXISTS stock_history CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS products CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS categories CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS users CASCADE;`);

    //
    // USERS
    //
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("users created");

    //
    // CATEGORIES
    //
    await client.query(`
      CREATE TABLE categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("categories created");

    //
    // PRODUCTS
    //
    await client.query(`
      CREATE TABLE products (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        min_threshold INTEGER NOT NULL DEFAULT 10,

        category_id UUID
          REFERENCES categories(id)
          ON DELETE SET NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("products created");

    //
    // STOCK HISTORY
    //
    await client.query(`
      CREATE TABLE stock_history (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

        product_id BIGINT NOT NULL
          REFERENCES products(id)
          ON DELETE CASCADE,

        user_id UUID NOT NULL
          REFERENCES users(id)
          ON DELETE CASCADE,

        type VARCHAR(3) NOT NULL
          CHECK (type IN ('IN', 'OUT')),

        quantity INTEGER NOT NULL
          CHECK (quantity > 0),

        note TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("stock_history created");

    await client.query("COMMIT");

    console.log("Migration completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch((error) => {
  console.error("Top level error:", error);
  process.exit(1);
});