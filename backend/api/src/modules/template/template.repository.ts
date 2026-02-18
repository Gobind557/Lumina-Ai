import { prisma } from "../../infrastructure/prisma";

export const templateRepository = {
  list: (params: {
    userId: string;
    workspaceId?: string;
    search?: string;
    category?: string;
    limit: number;
    offset: number;
  }) => {
    const where = {
      userId: params.userId,
      ...(params.workspaceId ? { workspaceId: params.workspaceId } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: "insensitive" as const } },
              { description: { contains: params.search, mode: "insensitive" as const } },
              { content: { contains: params.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    return Promise.all([
      prisma.template.count({ where }),
      prisma.template.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: params.limit,
        skip: params.offset,
      }),
    ]);
  },

  getById: (userId: string, id: string) =>
    prisma.template.findFirst({ where: { id, userId } }),

  create: (data: {
    userId: string;
    workspaceId?: string | null;
    title: string;
    description: string;
    content: string;
    category: string;
    tone?: string | null;
    isFavorite?: boolean;
  }) =>
    prisma.template.create({
      data: {
        ...data,
        workspaceId: data.workspaceId ?? null,
        tone: data.tone ?? null,
        isFavorite: data.isFavorite ?? false,
      },
    }),

  update: (
    _userId: string,
    id: string,
    data: Partial<{
      workspaceId: string | null;
      title: string;
      description: string;
      content: string;
      category: string;
      tone: string | null;
      usedCount: number | null;
      openRate: number | null;
      replyRate: number | null;
      isFavorite: boolean;
    }>
  ) => {
    const updateData: Record<string, unknown> = {};
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) updateData[k] = v;
    });
    return prisma.template.update({ where: { id }, data: updateData as never });
  },

  delete: (id: string) => prisma.template.delete({ where: { id } }),
};
