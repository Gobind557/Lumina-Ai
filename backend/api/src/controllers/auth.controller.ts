import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createUser, generateToken, validateUser } from "../services/auth.service";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = signupSchema.parse(req.body);
    const user = await createUser({
      email: payload.email,
      password: payload.password,
      firstName: payload.first_name,
      lastName: payload.last_name,
    });
    const token = generateToken(user);
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await validateUser(payload.email, payload.password);
    const token = generateToken(user);
    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
};
