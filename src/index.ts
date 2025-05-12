import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import http from 'http';
import cors from 'cors';
import LoginRoute from './routes/login'
import RegisterRoute from './routes/register'
import AdminLoginRoute from './routes/adminLogin'
import AdminRegisterRoute from './routes/adminRegister'
import GetPlansRoute from './routes/getSubscriptionPlansAdmin'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser";
import { createTables } from './utils/db';

dotenv.config()
const app: Application = express();
app.use(cookieParser())
const port: number = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

(async () => {
  await createTables()
})()


// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? '*' 
    : 'production-domain.com'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with cache control
app.use(express.static(path.join(process.cwd(), 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0'
}));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Routes
app.use('/api/v1/auth', LoginRoute)
app.use('/api/v1/auth', RegisterRoute)
app.use('/api/v1/admin', GetPlansRoute)
app.use('/api/v1/admin', AdminLoginRoute)
app.use('/api/v1/admin', AdminRegisterRoute)


// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  
  const response = {
    error: {
      message: 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      })
    }
  };

  res.status(500).json(response);
});

// Server startup
server.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});

// Process event handlers
const shutdown = async (signal: string) => {
  console.log(`[${new Date().toISOString()}] Received ${signal}. Shutting down gracefully...`);
  
  try {
    server.close(() => {
      console.log('[%s] HTTP server closed', new Date().toISOString());
      process.exit(0);
    });

    // Force shutdown after 5 seconds
    setTimeout(() => {
      console.error('[%s] Could not close connections in time, forcefully shutting down', new Date().toISOString());
      process.exit(1);
    }, 5000).unref();
    
  } catch (err) {
    console.error('[%s] Error during shutdown:', new Date().toISOString(), err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('[%s] Uncaught Exception:', new Date().toISOString(), err);
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[%s] Unhandled Rejection at:', new Date().toISOString(), promise, 'reason:', reason);
});