const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT),
});

pool.on('connect', () => {
  console.log('Connected to User database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

export default pool;