import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import http from "http";
import cors, { CorsOptions } from "cors";
import LoginRoute from "./routes/user-login";
import RegisterRoute from "./routes/user-register";
import AdminLoginRoute from "./routes/admin-login";
import AdminRegisterRoute from "./routes/admin-register";
import GetAdminPlansRoute from "./routes/admin-get-subscription-plans";
import GetPlansRoute from "./routes/user-get-subscription-plans";
import CreatePlansRoute from "./routes/admin-create-subscription-plan";
import PurchasePlanRoute from "./routes/user-purchase-plan";
import PaymentStatusRoute from "./routes/user-payment-status";
import MpesaCallBackRoute from "./routes/mpesa-callback";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createTables, db } from "./db";
import GetAllTransactionsRoute from "./routes/admin-get-all-transactions";
import { Server } from "socket.io";
import GetDailySignupCountRoute from "./routes/admin-get-daily-signups"
import GetDailyRevenueRoute from "./routes/admin-get-daily-revenue"
import GetAdminAccountDetails from "./routes/admin-get-account-details"
import ChangeAdminPassword from "./routes/admin-change-password"

dotenv.config();
const app: Application = express();
app.use(cookieParser());
const port: number = Number(process.env.PORT) || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:4000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
app.set("trust proxy", 1);

const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", "http://localhost:4000"],
  methods: ["GET", "POST", "UPDATE", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],

      styleSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
      ],

      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
      ],

      connectSrc: [
        "'self'",
        "http://localhost:3000", // Admin dashboard
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
      ],

      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],

      imgSrc: ["'self'", "data:"],

      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

(async () => {
  await createTables();
})();

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with cache control
app.use(
  express.static(path.join(process.cwd(), "public"), {
    maxAge: process.env.NODE_ENV === "production" ? "1y" : "0",
  })
);

// MPESA Callback
app.post("/mpesa/callback", (req: Request, res: Response) => {
  (async () => {
    try {
      console.log(
        "M-Pesa Callback Request Body:",
        JSON.stringify(req.body, null, 2)
      );

      const body = req.body;
      const callback = body.Body?.stkCallback;

      const checkoutRequestID = callback?.CheckoutRequestID;
      const resultCode = callback?.ResultCode;

      let status = "failed";
      if (resultCode === 0) {
        status = "success";
      } else if (resultCode === 1032) {
        status = "cancelled";
      }

      await db.query(
        `UPDATE mpesa_payments SET status = $1 WHERE checkout_request_id = $2`,
        [status, checkoutRequestID]
      );

      res.sendStatus(200);
    } catch (error) {
      console.error("Callback error:", error);
      res.sendStatus(500);
    }
  })();
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy" });
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

// --- Rate Limiter ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many attempts. Please try again later.",
  },
});

// Routes
app.use("/api/v1/mpesa", MpesaCallBackRoute);
//app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/auth", LoginRoute);
app.use("/api/v1/auth", RegisterRoute);
app.use("/api/v1/plans", GetPlansRoute);
app.use("/api/v1/plans", PurchasePlanRoute);
app.use("/api/v1/plans", PaymentStatusRoute);

//app.use("/api/v1/admin/auth", authLimiter);
app.use("/api/v1/admin/auth", AdminLoginRoute);
app.use("/api/v1/admin/auth", AdminRegisterRoute);
app.use("/api/v1/admin", GetAdminPlansRoute);
app.use("/api/v1/admin", GetAllTransactionsRoute);
app.use("/api/v1/admin", CreatePlansRoute);
app.use("/api/v1/admin", GetDailySignupCountRoute);
app.use("/api/v1/admin", GetDailyRevenueRoute);
app.use("/api/v1/admin", GetAdminAccountDetails);
app.use("/api/v1/admin", ChangeAdminPassword);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);

  const response = {
    error: {
      message: "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && {
        details: err.message,
        stack: err.stack,
      }),
    },
  };

  res.status(500).json(response);
});

// Server startup
server.listen(port, () => {
  console.log(
    `[${new Date().toISOString()}] Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${port}`
  );
});

// Process event handlers
const shutdown = async (signal: string) => {
  console.log(
    `[${new Date().toISOString()}] Received ${signal}. Shutting down gracefully...`
  );

  try {
    server.close(() => {
      console.log("[%s] HTTP server closed", new Date().toISOString());
      process.exit(0);
    });

    // Force shutdown after 5 seconds
    setTimeout(() => {
      console.error(
        "[%s] Could not close connections in time, forcefully shutting down",
        new Date().toISOString()
      );
      process.exit(1);
    }, 5000).unref();
  } catch (err) {
    console.error("[%s] Error during shutdown:", new Date().toISOString(), err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  console.error("[%s] Uncaught Exception:", new Date().toISOString(), err);
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "[%s] Unhandled Rejection at:",
    new Date().toISOString(),
    promise,
    "reason:",
    reason
  );
});

export {io}
