import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const db = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: String(process.env.POSTGRES_PASSWORD),
  port: Number(process.env.POSTGRES_PORT),
});

db.on("connect", () => {
  console.log("Connected to database");
});

db.on("error", (err) => {
  console.error("PostgreSQL connection error:", err);
});

export async function createTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        phonenumber VARCHAR(20),
        password VARCHAR(255)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS admin (
        admin_id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(20),
        phonenumber VARCHAR(20),
        password VARCHAR(255)
      );
    `);

    await db.query(`
   CREATE TABLE IF NOT EXISTS subscription_plan (
    plan_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    cost NUMERIC(10, 2) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    admin_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(admin_id)
);
`);

    await db.query(`
      CREATE TABLE IF NOT EXISTS plan_features (
    feature_id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL,
    feature VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES subscription_plan(plan_id) ON DELETE CASCADE
);
    `);

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_plan_features_plan_id ON plan_features(plan_id);
      `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS payment (
        payment_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        plan_id INTEGER REFERENCES subscription_plan(plan_id)
      );
    `);

    console.log("All tables checked/created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}
