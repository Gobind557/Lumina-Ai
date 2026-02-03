import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../models";
import { env } from "../config/env";
import { ApiError } from "../middleware/error.middleware";

export const createUser = async (payload: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existing) {
    throw new ApiError(409, "EMAIL_IN_USE", "Email already registered");
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: "user",
    },
  });

  return user;
};

export const validateUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");
  }

  return user;
};

export const generateToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};
