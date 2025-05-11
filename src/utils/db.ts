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
        subscription_id SERIAL PRIMARY KEY,
        offer_name VARCHAR(255),
        offer_description TEXT,
        cost NUMERIC,
        time DATE
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS payment (
        payment_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        subscription_id INTEGER REFERENCES subscription_plan(subscription_id)
      );
    `);

    console.log("All tables checked/created successfully.");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}