import { db } from "./db";

export const registerUser = async (name:string, phone:string, password:string) => {
    try {
      // Insert the new user
      await db.query(
        `INSERT INTO users (NAME, PHONENUMBER, PASSWORD) VALUES ($1, $2, $3)`,
        [name, phone, password]
      );
    } catch (error: any) {
        throw new Error(error.message)
    }
}