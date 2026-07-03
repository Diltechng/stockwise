import "dotenv/config";
import { pool } from "./pool";

const migrate = async () => {
  const client = await pool.connect();
  console.log(client);
  try {
    console.log("MIGRATION FILE RUNNING");

    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    console.log("pgcrypto");

    await client.query("BEGIN");
    console.log("BEGIN");

    await client.query(`DROP TABLE IF EXISTS users CASCADE`);
    await client.query(`DROP TABLE IF EXISTS stock CASCADE`);

    //categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);
    console.log("categories created");

    //users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("users created");

    //products
    await client.query(`
CREATE TABLE IF NOT EXISTS products (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    min_threshold INTEGER DEFAULT 10,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);
    console.log("products created");

    //stock
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock (
        id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        public_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
        name VARCHAR(255) NOT NULL
      )
    `);
    console.log("stocks created");

    await client.query("COMMIT");
    console.log("Migration completed");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch((err) => {
  console.error("TOP LEVEL ERROR:", err);
  process.exit(1);
});
