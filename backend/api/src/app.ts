import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { routes } from "./routes";

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(requestIdMiddleware);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

app.use(errorMiddleware);
