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

  findOrCreateOAuthUser: async (data: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  }): Promise<{ user: { id: string; email: string; role: string }; isNew: boolean }> => {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { user: { id: existing.id, email: existing.email, role: existing.role }, isNew: false };
    }
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        role: "user",
      },
    });
    return { user: { id: user.id, email: user.email, role: user.role }, isNew: true };
  },

  deleteUser: (id: string) => prisma.user.delete({ where: { id } }),
};
