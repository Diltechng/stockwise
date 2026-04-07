import "dotenv/config";
import { pool } from "./pool";

const migrate = async () => {
  console.log("🔥 MIGRATION FILE RUNNING");
  const client = await pool.connect();
  console.log(client);
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL
      )
    `);

    await client.query("COMMIT");
    console.log("✅ Migration completed");
  } catch (err) {
    await client.query("ROLLBACK");

    if (err instanceof Error) {
      console.error("❌ Migration failed:", err.message);
    } else {
      console.error("❌ Migration failed:", err);
    }

    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate().catch(() => process.exit(1));
