import { Router } from "express";
import passport from "./passport";
import { login, signup } from "./auth.controller";
import { oauthCallback } from "./oauth.controller";
import { env } from "../../config/env";

export const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.CORS_ORIGIN}/login?error=oauth`,
  }),
  oauthCallback
);

authRoutes.get(
  "/linkedin",
  passport.authenticate("linkedin", { session: false })
);
authRoutes.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    session: false,
    failureRedirect: `${env.CORS_ORIGIN}/login?error=oauth`,
  }),
  oauthCallback
);
