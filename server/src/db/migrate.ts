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

    //users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255)
      )
    `);
    console.log("users created");

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
