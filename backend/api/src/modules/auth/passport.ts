import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy, Profile as LinkedInProfile } from "passport-linkedin-oauth2";
import { env } from "../../config/env";
import { findOrCreateOAuthUser } from "./auth.service";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile: GoogleProfile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google profile missing email"));
        const user = await findOrCreateOAuthUser({
          email,
          firstName: profile.name?.givenName ?? null,
          lastName: profile.name?.familyName ?? null,
        });
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

passport.use(
  new LinkedInStrategy(
    {
      clientID: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
      callbackURL: env.LINKEDIN_CALLBACK_URL,
      scope: ["r_liteprofile", "r_emailaddress"],
    },
    async (_accessToken, _refreshToken, profile: LinkedInProfile, done) => {
      try {
        const email =
          (profile as any).emails?.[0]?.value ||
          (profile as any).emailAddress ||
          null;
        if (!email) return done(new Error("LinkedIn profile missing email"));
        const user = await findOrCreateOAuthUser({
          email,
          firstName: profile.name?.givenName ?? null,
          lastName: profile.name?.familyName ?? null,
        });
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
