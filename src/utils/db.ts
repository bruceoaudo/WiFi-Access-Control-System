import { Pool } from "pg";
import dotenv from 'dotenv'

dotenv.config()

// User DB
export const userPool = new Pool({
  user: process.env.POSTGRES_USER_USER,
  host: process.env.POSTGRES_HOST_USER,
  database: process.env.POSTGRES_DB_USER,
  password: String(process.env.POSTGRES_PASSWORD_USER),
  port: Number(process.env.POSTGRES_PORT_USER),
});

userPool.on('connect', () => {
  console.log('Connected to User database');
});

userPool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// Subscription Plan DB
export const subscriptionPlanPool = new Pool({
  user: process.env.POSTGRES_USER_SUBSCRIPTION_PLAN,
  host: process.env.POSTGRES_HOST_SUBSCRIPTION_PLAN,
  database: process.env.POSTGRES_DB_SUBSCRIPTION_PLAN,
  password: String(process.env.POSTGRES_PASSWORD_SUBSCRIPTION_PLAN),
  port: Number(process.env.POSTGRES_PORT_SUBSCRIPTION_PLAN),
});

subscriptionPlanPool.on("connect", () => {
  console.log("Connected to Subscription Plan database");
});

subscriptionPlanPool.on("error", (err) => {
  console.error("PostgreSQL connection error:", err);
});

// Payment DB
export const paymentPool = new Pool({
  user: process.env.POSTGRES_USER_PAYMENT,
  host: process.env.POSTGRES_HOST_PAYMENT,
  database: process.env.POSTGRES_DB_PAYMENT,
  password: String(process.env.POSTGRES_PASSWORD_PAYMENT),
  port: Number(process.env.POSTGRES_PORT_PAYMENT),
});

paymentPool.on('connect', () => {
  console.log('Connected to Payment database');
});

paymentPool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});


// Admin DB
export const adminPool = new Pool({
  user: process.env.POSTGRES_USER_ADMIN,
  host: process.env.POSTGRES_HOST_ADMIN,
  database: process.env.POSTGRES_DB_ADMIN,
  password: String(process.env.POSTGRES_PASSWORD_ADMIN),
  port: Number(process.env.POSTGRES_PORT_ADMIN),
});

adminPool.on('connect', () => {
  console.log('Connected to Admin database');
});

adminPool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

export async function createTables() {
  try {
    await userPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        phonenumber VARCHAR(20),
        password VARCHAR(255)
      );
    `);

    await adminPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        admin_id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(20),
        phonenumber VARCHAR(20),
        password VARCHAR(255)
      );
    `);

    await subscriptionPlanPool.query(`
      CREATE TABLE IF NOT EXISTS subscription_plan (
        subscription_id SERIAL PRIMARY KEY,
        offer_name VARCHAR(255),
        offer_description TEXT,
        cost NUMERIC,
        time DATE
      );
    `);

    await paymentPool.query(`
      CREATE TABLE IF NOT EXISTS payments (
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
