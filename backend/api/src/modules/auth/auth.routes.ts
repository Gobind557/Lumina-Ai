import { Router } from "express";
import passport from "./passport";
import { login, signup } from "./auth.controller";
import { oauthCallback } from "./oauth.controller";
import { generateToken } from "./auth.service";
import { authRepository } from "./auth.repository";
import { env } from "../../config/env";

export const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
authRoutes.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false, failureRedirect: `${env.CORS_ORIGIN}/login?error=oauth` },
    (err: Error | null, user: { id: string; email: string; role: string } | null, info?: { isNew?: boolean }) => {
      if (err || !user) return res.redirect(`${env.CORS_ORIGIN}/login?error=oauth`);
      const state = (req.query.state as string) || "";
      const isNew = info?.isNew === true;
      if (state === "login" && isNew) {
        authRepository.deleteUser(user.id).catch(() => {});
        return res.redirect(`${env.CORS_ORIGIN}/signup?oauth_new=1`);
      }
      const token = generateToken(user);
      return res.redirect(`${env.CORS_ORIGIN}/auth/callback?token=${encodeURIComponent(token)}`);
    }
  )(req, res, next);
});

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
