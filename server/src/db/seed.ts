import dotenv from "dotenv";
import { pool } from "./pool";
dotenv.config();

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `
     
    `,
      [],
    );

    const { rows: cats } = await client.query(
      "SELECT id, name FROM categories",
    );
    const c = Object.fromEntries(cats.map((x) => [x.name, x.id]));

    const products = [
      [
        "Laptop Pro 15",
        "LAP-001",
        c["Electronics"],
        1200.0,
        45,
        5,
        "High-performance laptop",
      ],
      [
        "Wireless Mouse",
        "MOU-001",
        c["Electronics"],
        25.0,
        8,
        10,
        "Ergonomic wireless mouse",
      ],
      [
        "USB-C Hub",
        "USB-001",
        c["Electronics"],
        49.0,
        3,
        15,
        "7-in-1 USB-C hub",
      ],
      [
        "Mechanical Keyboard",
        "KEY-001",
        c["Electronics"],
        89.0,
        22,
        5,
        "Tactile mechanical keyboard",
      ],
      [
        '27" Monitor',
        "MON-001",
        c["Electronics"],
        349.0,
        7,
        3,
        "4K IPS display",
      ],
      [
        "A4 Paper (Ream)",
        "PAP-001",
        c["Office Supplies"],
        8.0,
        200,
        50,
        "500 sheets per ream",
      ],
      [
        "Ballpoint Pens (Box)",
        "PEN-001",
        c["Office Supplies"],
        5.0,
        4,
        20,
        "Box of 50 pens",
      ],
      [
        "Heavy Duty Stapler",
        "STP-001",
        c["Office Supplies"],
        18.0,
        14,
        5,
        "Staples up to 50 pages",
      ],
      [
        "Whiteboard Markers",
        "MRK-001",
        c["Office Supplies"],
        12.0,
        2,
        10,
        "Pack of 8 colours",
      ],
      [
        "Filing Cabinet",
        "CAB-001",
        c["Office Supplies"],
        220.0,
        6,
        2,
        "3-drawer steel cabinet",
      ],
      [
        "Claw Hammer",
        "HAM-001",
        c["Tools"],
        18.0,
        30,
        10,
        "16oz steel claw hammer",
      ],
      [
        "Screwdriver Set",
        "SCR-001",
        c["Tools"],
        35.0,
        2,
        5,
        "12-piece precision set",
      ],
      [
        "Cordless Drill",
        "DRL-001",
        c["Tools"],
        89.0,
        9,
        3,
        "18V cordless power drill",
      ],
      [
        "Measuring Tape 5m",
        "TAP-001",
        c["Tools"],
        8.0,
        40,
        15,
        "Auto-lock measuring tape",
      ],
      [
        "Safety Gloves",
        "GLV-001",
        c["Tools"],
        6.0,
        1,
        20,
        "Cut-resistant work gloves",
      ],
    ];

    for (const [name, sku, cat_id, price, qty, min, desc] of products) {
      await client.query(
        `
        INSERT INTO products (name, sku, category_id, price, quantity, min_threshold, description)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (sku) DO NOTHING
      `,
        [name, sku, cat_id, price, qty, min, desc],
      );
    }

    await client.query("COMMIT");
    console.log("✅ Seed completed");
    console.log("👤 Admin:  admin@stockwise.com / admin123");
    console.log("👤 Staff:  staff@stockwise.com / staff123");
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch(() => process.exit(1));
