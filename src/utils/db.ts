import { Pool } from "pg";

// User DB
export const userPool = new Pool({
  user: process.env.POSTGRES_USER_USER,
  host: process.env.POSTGRES_HOST_USER,
  database: process.env.POSTGRES_DB_USER,
  password: process.env.POSTGRES_PASSWORD_USER,
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
  password: process.env.POSTGRES_PASSWORD_SUBSCRIPTION_PLAN,
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
  password: process.env.POSTGRES_PASSWORD_PAYMENT,
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
  password: process.env.POSTGRES_PASSWORD_ADMIN,
  port: Number(process.env.POSTGRES_PORT_ADMIN),
});

paymentPool.on('connect', () => {
  console.log('Connected to Admin database');
});

paymentPool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});