import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest } from "next/server";
import { AuthPayload } from "./types";

const secret = process.env.JWT_SECRET as string;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (data: object): string => {
  return jwt.sign(data, secret, { expiresIn: "16h" });
};

export const verifyToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, secret);
};

export const authenticate = async (req: NextRequest): Promise<AuthPayload> => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) {
    throw new Error('Token missing');
  }

  try {
    const payload = jwt.verify(token, secret) as AuthPayload;
    return payload; // Type-safe payload
  } catch {
    throw new Error('Invalid token');
  }
};