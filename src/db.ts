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
    await db.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        phonenumber VARCHAR(20),
        password TEXT NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        fingerprint TEXT NOT NULL,
        jti TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        revoked BOOLEAN DEFAULT FALSE
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS admin (
        admin_id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phonenumber VARCHAR(20),
        password TEXT NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id INTEGER REFERENCES admin(admin_id) ON DELETE CASCADE,
        fingerprint TEXT NOT NULL,
        jti TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        revoked BOOLEAN DEFAULT FALSE
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS subscription_plan (
        plan_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        cost NUMERIC(10, 2) NOT NULL CHECK (cost >= 0),
        duration VARCHAR(50) NOT NULL,
        is_popular BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        admin_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admin(admin_id) ON DELETE CASCADE
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
      CREATE TABLE IF NOT EXISTS mpesa_payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES subscription_plan(plan_id) ON DELETE CASCADE,
        checkout_request_id VARCHAR(100) NOT NULL UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("All tables checked/created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}