import { prisma } from "../models";
import { ApiError } from "../middleware/error.middleware";

export const listProspects = async (params: {
  workspaceId?: string;
  email?: string;
  search?: string;
  limit: number;
  offset: number;
}) => {
  const where = {
    ...(params.workspaceId ? { workspaceId: params.workspaceId } : {}),
    ...(params.email
      ? { email: { equals: params.email, mode: "insensitive" } }
      : {}),
    ...(params.search
      ? {
          OR: [
            { email: { contains: params.search, mode: "insensitive" } },
            { firstName: { contains: params.search, mode: "insensitive" } },
            { lastName: { contains: params.search, mode: "insensitive" } },
            { company: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, prospects] = await Promise.all([
    prisma.prospect.count({ where }),
    prisma.prospect.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: params.limit,
      skip: params.offset,
    }),
  ]);

  return { total, prospects };
};

export const getProspect = async (id: string) => {
  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) {
    throw new ApiError(404, "NOT_FOUND", "Prospect not found");
  }
  return prospect;
};

export const createProspect = async (payload: {
  workspaceId?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  customFields?: Record<string, unknown>;
}) => {
  return prisma.prospect.create({
    data: {
      workspaceId: payload.workspaceId ?? null,
      email: payload.email,
      firstName: payload.firstName ?? null,
      lastName: payload.lastName ?? null,
      company: payload.company ?? null,
      jobTitle: payload.jobTitle ?? null,
      customFields: payload.customFields ?? {},
    },
  });
};

export const updateProspect = async (
  id: string,
  payload: {
    workspaceId?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    jobTitle?: string | null;
    customFields?: Record<string, unknown>;
  }
) => {
  const existing = await prisma.prospect.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Prospect not found");
  }

  return prisma.prospect.update({
    where: { id },
    data: {
      workspaceId: payload.workspaceId ?? existing.workspaceId,
      email: payload.email ?? existing.email,
      firstName: payload.firstName ?? existing.firstName,
      lastName: payload.lastName ?? existing.lastName,
      company: payload.company ?? existing.company,
      jobTitle: payload.jobTitle ?? existing.jobTitle,
      customFields: payload.customFields ?? existing.customFields,
    },
  });
};

export const deleteProspect = async (id: string) => {
  const existing = await prisma.prospect.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Prospect not found");
  }
  await prisma.prospect.delete({ where: { id } });
};
