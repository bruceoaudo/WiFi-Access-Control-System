import userPool from "./db";

export const registerUser = async (name:string, phone:string, password:string) => {
    try {
      // Insert the new user
      await userPool.query(
        `INSERT INTO USERS (NAME, PHONE, PASSWORD) VALUES ($1, $2, $3)`,
        [name, phone, password]
      );
    } catch (error: any) {
        throw new Error(error.message)
    }
}