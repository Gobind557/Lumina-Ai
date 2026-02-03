import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "demo@salescopilot.ai" },
    update: {},
    create: {
      email: "demo@salescopilot.ai",
      passwordHash: "dev-seed-only",
      firstName: "Demo",
      lastName: "User",
      role: "admin",
    },
  });
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
