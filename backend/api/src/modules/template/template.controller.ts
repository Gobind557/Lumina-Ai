import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
} from "./template.service";
import { ApiError } from "../../shared/errors";

const listSchema = z.object({
  workspace_id: z.string().uuid().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});

const createSchema = z.object({
  workspace_id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  tone: z.string().optional(),
  is_favorite: z.boolean().optional(),
});

const updateSchema = z.object({
  workspace_id: z.string().uuid().optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  tone: z.string().optional(),
  used_count: z.number().int().nonnegative().optional(),
  open_rate: z.number().int().nonnegative().optional(),
  reply_rate: z.number().int().nonnegative().optional(),
  is_favorite: z.boolean().optional(),
});

function requireUserId(req: Request): string {
  const userId = req.user?.id;
  if (!userId || typeof userId !== "string") throw new ApiError(401, "UNAUTHORIZED", "Missing user context");
  return userId;
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const query = listSchema.parse(req.query);
    const result = await listTemplates({
      userId,
      workspaceId: query.workspace_id,
      search: query.search,
      category: query.category,
      limit: query.limit,
      offset: query.offset,
    });
    return res.json({
      templates: result.templates.map((t) => ({
        id: t.id,
        workspace_id: t.workspaceId,
        title: t.title,
        description: t.description,
        content: t.content,
        category: t.category,
        tone: t.tone,
        used_count: t.usedCount,
        open_rate: t.openRate,
        reply_rate: t.replyRate,
        is_favorite: t.isFavorite,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
      })),
      pagination: { total: result.total, limit: query.limit, offset: query.offset },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const template = await getTemplate(userId, req.params.id);
    return res.json({
      id: template.id,
      workspace_id: template.workspaceId,
      title: template.title,
      description: template.description,
      content: template.content,
      category: template.category,
      tone: template.tone,
      used_count: template.usedCount,
      open_rate: template.openRate,
      reply_rate: template.replyRate,
      is_favorite: template.isFavorite,
      created_at: template.createdAt,
      updated_at: template.updatedAt,
    });
  } catch (error) {
    return next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const payload = createSchema.parse(req.body);
    const template = await createTemplate({
      userId,
      workspaceId: payload.workspace_id,
      title: payload.title,
      description: payload.description,
      content: payload.content,
      category: payload.category,
      tone: payload.tone,
      isFavorite: payload.is_favorite,
    });
    return res.status(201).json({
      id: template.id,
      workspace_id: template.workspaceId,
      title: template.title,
      description: template.description,
      content: template.content,
      category: template.category,
      tone: template.tone,
      used_count: template.usedCount,
      open_rate: template.openRate,
      reply_rate: template.replyRate,
      is_favorite: template.isFavorite,
      created_at: template.createdAt,
      updated_at: template.updatedAt,
    });
  } catch (error) {
    return next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    const payload = updateSchema.parse(req.body);
    const template = await updateTemplate(userId, req.params.id, {
      workspaceId: payload.workspace_id,
      title: payload.title,
      description: payload.description,
      content: payload.content,
      category: payload.category,
      tone: payload.tone,
      usedCount: payload.used_count,
      openRate: payload.open_rate,
      replyRate: payload.reply_rate,
      isFavorite: payload.is_favorite,
    });
    return res.json({
      id: template.id,
      workspace_id: template.workspaceId,
      title: template.title,
      description: template.description,
      content: template.content,
      category: template.category,
      tone: template.tone,
      used_count: template.usedCount,
      open_rate: template.openRate,
      reply_rate: template.replyRate,
      is_favorite: template.isFavorite,
      created_at: template.createdAt,
      updated_at: template.updatedAt,
    });
  } catch (error) {
    return next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req);
    await deleteTemplate(userId, req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
