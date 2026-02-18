import { prisma } from "../../infrastructure/prisma";

export const prospectRepository = {
  list: (params: {
    workspaceId?: string;
    email?: string;
    search?: string;
    limit: number;
    offset: number;
  }) => {
    const where = {
      ...(params.workspaceId ? { workspaceId: params.workspaceId } : {}),
      ...(params.email
        ? { email: { equals: params.email, mode: "insensitive" as const } }
        : {}),
      ...(params.search
        ? {
            OR: [
              { email: { contains: params.search, mode: "insensitive" as const } },
              { firstName: { contains: params.search, mode: "insensitive" as const } },
              { lastName: { contains: params.search, mode: "insensitive" as const } },
              { company: { contains: params.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    return Promise.all([
      prisma.prospect.count({ where }),
      prisma.prospect.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: params.limit,
        skip: params.offset,
      }),
    ]);
  },

  getById: (id: string) => prisma.prospect.findUnique({ where: { id } }),

  create: (data: {
    workspaceId?: string | null;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    jobTitle?: string | null;
    customFields?: object;
  }) =>
    prisma.prospect.create({
      data: {
        workspaceId: data.workspaceId ?? null,
        email: data.email,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        company: data.company ?? null,
        jobTitle: data.jobTitle ?? null,
        customFields: (data.customFields ?? {}) as object,
      },
    }),

  update: (
    id: string,
    data: {
      workspaceId?: string | null;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      company?: string | null;
      jobTitle?: string | null;
      customFields?: object;
    }
  ) => {
    const updateData: Record<string, unknown> = {};
    if (data.workspaceId !== undefined) updateData.workspaceId = data.workspaceId;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.customFields !== undefined) updateData.customFields = data.customFields;
    return prisma.prospect.update({ where: { id }, data: updateData as never });
  },

  delete: (id: string) => prisma.prospect.delete({ where: { id } }),
};
