import { Request, Response } from "express";
import { generateToken } from "./auth.service";
import { env } from "../../config/env";

export const oauthCallback = (req: Request, res: Response) => {
  if (!req.user) {
    return res.redirect(`${env.CORS_ORIGIN}/login?error=oauth`);
  }

  const user = req.user as { id: string; email: string; role: string };
  const token = generateToken(user);

  const redirectUrl = `${env.CORS_ORIGIN}/auth/callback?token=${encodeURIComponent(
    token
  )}`;
  return res.redirect(redirectUrl);
};
