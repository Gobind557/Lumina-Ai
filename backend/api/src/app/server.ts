import { env } from "../config/env";
import { app } from "./app";

export function startServer(): void {
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on :${env.PORT}`);
  });
}
