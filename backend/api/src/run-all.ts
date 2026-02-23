/**
 * Single entry point for local development: API + email worker + analytics consumer + campaign consumer.
 * Run with: npm run dev:all
 */
import { startServer } from "./app/server";

// Start Redis event consumers (subscribe on import)
import "./modules/analytics/analytics.consumer";
import "./modules/campaign/campaign.consumer";

// Start BullMQ email worker (runs on import)
import "./modules/email/email.worker";

startServer();
