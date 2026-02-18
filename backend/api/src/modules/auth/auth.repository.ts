import { prisma } from "../../infrastructure/prisma";

export const authRepository = {
  findUserByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  createUser: (data: {
    email: string;
    passwordHash: string;
    firstName?: string | null;
    lastName?: string | null;
  }) =>
    prisma.user.create({
      data: { ...data, role: "user" },
    }),

  findOrCreateOAuthUser: (data: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  }) => {
    return prisma.user.upsert({
      where: { email: data.email },
      create: {
        email: data.email,
        passwordHash: null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        role: "user",
      },
      update: {},
    });
  },
};
