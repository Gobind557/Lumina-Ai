import { execSync } from "node:child_process";

execSync("npx prisma db seed", { stdio: "inherit" });
