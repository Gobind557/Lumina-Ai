import { ApiError } from "../../shared/errors";
import { templateRepository } from "./template.repository";

export const listTemplates = (params: {
  userId: string;
  workspaceId?: string;
  search?: string;
  category?: string;
  limit: number;
  offset: number;
}) =>
  templateRepository.list(params).then(([total, templates]) => ({
    total,
    templates,
  }));

export const getTemplate = async (userId: string, id: string) => {
  const template = await templateRepository.getById(userId, id);
  if (!template) throw new ApiError(404, "NOT_FOUND", "Template not found");
  return template;
};

export const createTemplate = (payload: {
  userId: string;
  workspaceId?: string | null;
  title: string;
  description: string;
  content: string;
  category: string;
  tone?: string | null;
  isFavorite?: boolean;
}) => templateRepository.create(payload);

export const updateTemplate = async (
  userId: string,
  id: string,
  payload: Partial<{
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
  const existing = await templateRepository.getById(userId, id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Template not found");
  return templateRepository.update(userId, id, payload);
};

export const deleteTemplate = async (userId: string, id: string) => {
  const existing = await templateRepository.getById(userId, id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Template not found");
  await templateRepository.delete(id);
};
