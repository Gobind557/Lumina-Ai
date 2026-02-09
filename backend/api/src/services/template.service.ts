import { prisma } from "../models";
import { ApiError } from "../middleware/error.middleware";

export const listTemplates = async (params: {
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
            { title: { contains: params.search, mode: "insensitive" } },
            { description: { contains: params.search, mode: "insensitive" } },
            { content: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, templates] = await Promise.all([
    prisma.template.count({ where }),
    prisma.template.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: params.limit,
      skip: params.offset,
    }),
  ]);

  return { total, templates };
};

export const getTemplate = async (userId: string, id: string) => {
  const template = await prisma.template.findFirst({ where: { id, userId } });
  if (!template) {
    throw new ApiError(404, "NOT_FOUND", "Template not found");
  }
  return template;
};

export const createTemplate = async (payload: {
  userId: string;
  workspaceId?: string | null;
  title: string;
  description: string;
  content: string;
  category: string;
  tone?: string | null;
  isFavorite?: boolean;
}) => {
  return prisma.template.create({
    data: {
      userId: payload.userId,
      workspaceId: payload.workspaceId ?? null,
      title: payload.title,
      description: payload.description,
      content: payload.content,
      category: payload.category,
      tone: payload.tone ?? null,
      isFavorite: payload.isFavorite ?? false,
    },
  });
};

export const updateTemplate = async (
  userId: string,
  id: string,
  payload: {
    workspaceId?: string | null;
    title?: string | null;
    description?: string | null;
    content?: string | null;
    category?: string | null;
    tone?: string | null;
    usedCount?: number | null;
    openRate?: number | null;
    replyRate?: number | null;
    isFavorite?: boolean | null;
  }
) => {
  const existing = await prisma.template.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Template not found");
  }

  return prisma.template.update({
    where: { id },
    data: {
      workspaceId: payload.workspaceId ?? existing.workspaceId,
      title: payload.title ?? existing.title,
      description: payload.description ?? existing.description,
      content: payload.content ?? existing.content,
      category: payload.category ?? existing.category,
      tone: payload.tone ?? existing.tone,
      usedCount: payload.usedCount ?? existing.usedCount,
      openRate: payload.openRate ?? existing.openRate,
      replyRate: payload.replyRate ?? existing.replyRate,
      isFavorite: payload.isFavorite ?? existing.isFavorite,
    },
  });
};

export const deleteTemplate = async (userId: string, id: string) => {
  const existing = await prisma.template.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Template not found");
  }
  await prisma.template.delete({ where: { id } });
};
