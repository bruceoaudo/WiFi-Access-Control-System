import argon2 from "argon2";

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch {
    return false;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password, {
    type: argon2.argon2id, // Use Argon2id for better security
    memoryCost: 2 ** 16, // 64 MB of memory (default is 4096 KiB = 2^12)
    timeCost: 3, // Number of iterations (default is 3)
    parallelism: 1, // Number of threads (default is 1)
  });
};
