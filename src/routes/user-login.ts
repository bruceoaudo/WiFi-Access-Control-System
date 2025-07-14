import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { validateUserLoginDetails } from "../utils";
import crypto from "crypto";
import { db } from "../db";
import { exec } from "child_process";

const router = Router();

// --- JWT Setup ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters long");
}

// --- Whitelist in Nodogsplash ---
async function whitelistClient(
  mac: string,
  ip: string,
  duration: number = 3600
) {
  return new Promise((resolve, reject) => {
    exec(`sudo ndsctl allow ${mac} ${duration}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed to whitelist ${mac}:`, stderr);
        reject(new Error("Failed to grant network access"));
      } else {
        console.log(`Whitelisted ${mac} (${ip}) for ${duration} seconds`);
        resolve(stdout);
      }
    });
  });
}

// --- Login Route ---
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    // 1. Validate credentials
    const { userId } = await validateUserLoginDetails(phone, password);

    console.log(req);

    // 2. Get client details
    const clientIp = req.ip || req.connection.remoteAddress;
    const clientMac =
      req.query.mac || req.headers["x-nds-mac"] || "00:00:00:00:00:00";

    // 3. Whitelist in nodogsplash
    await whitelistClient(clientMac.toString(), clientIp!.toString());

    // 4. Create JWT session
    const fingerprint = crypto.randomUUID();
    const jti = crypto.randomUUID();

    await db.query(
      "INSERT INTO user_sessions (user_id, fingerprint, jti, mac_address) VALUES ($1, $2, $3, $4)",
      [userId, fingerprint, jti, clientMac]
    );

    const token = jwt.sign(
      {
        sub: userId,
        jti,
        fingerprint,
        //mac: clientMac, // Optional: embed MAC in JWT
      },
      JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "7d",
      }
    );

    // 5. Set secure cookie
    res.cookie("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.on("finish", () => {
      if (res.statusCode === 200) {
        whitelistClient(clientMac.toString(), clientIp!.toString()).catch(
          console.error
        );
      }
    });

    res.status(200).json({
      message: "Login successful",
      access_duration: "1 hour",
    });
    return;
  } catch (err: any) {
    console.error("Login error:", err.message);
    res.status(401).json({ error: err.message });
  }
});

export default router;
