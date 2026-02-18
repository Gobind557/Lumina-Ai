import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createProspect,
  deleteProspect,
  getProspect,
  listProspects,
  updateProspect,
} from "../services/prospect.service";

const listSchema = z.object({
  workspace_id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});

const createSchema = z.object({
  workspace_id: z.string().uuid().optional(),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  custom_fields: z.record(z.any()).optional(),
});

const updateSchema = z.object({
  workspace_id: z.string().uuid().optional(),
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  custom_fields: z.record(z.any()).optional(),
});

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listSchema.parse(req.query);
    const result = await listProspects({
      workspaceId: query.workspace_id,
      email: query.email,
      search: query.search,
      limit: query.limit,
      offset: query.offset,
    });
    return res.json({
      prospects: result.prospects.map((prospect) => ({
        id: prospect.id,
        workspace_id: prospect.workspaceId,
        email: prospect.email,
        first_name: prospect.firstName,
        last_name: prospect.lastName,
        company: prospect.company,
        job_title: prospect.jobTitle,
        custom_fields: prospect.customFields,
        created_at: prospect.createdAt,
        updated_at: prospect.updatedAt,
      })),
      pagination: {
        total: result.total,
        limit: query.limit,
        offset: query.offset,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prospect = await getProspect(req.params.id);
    return res.json({
      id: prospect.id,
      workspace_id: prospect.workspaceId,
      email: prospect.email,
      first_name: prospect.firstName,
      last_name: prospect.lastName,
      company: prospect.company,
      job_title: prospect.jobTitle,
      custom_fields: prospect.customFields,
      created_at: prospect.createdAt,
      updated_at: prospect.updatedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createSchema.parse(req.body);
    const prospect = await createProspect({
      workspaceId: payload.workspace_id,
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name,
      company: payload.company,
      jobTitle: payload.job_title,
      customFields: payload.custom_fields,
    });
    return res.status(201).json({
      id: prospect.id,
      workspace_id: prospect.workspaceId,
      email: prospect.email,
      first_name: prospect.firstName,
      last_name: prospect.lastName,
      company: prospect.company,
      job_title: prospect.jobTitle,
      custom_fields: prospect.customFields,
      created_at: prospect.createdAt,
      updated_at: prospect.updatedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateSchema.parse(req.body);
    const prospect = await updateProspect(req.params.id, {
      workspaceId: payload.workspace_id,
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name,
      company: payload.company,
      jobTitle: payload.job_title,
      customFields: payload.custom_fields,
    });
    return res.json({
      id: prospect.id,
      workspace_id: prospect.workspaceId,
      email: prospect.email,
      first_name: prospect.firstName,
      last_name: prospect.lastName,
      company: prospect.company,
      job_title: prospect.jobTitle,
      custom_fields: prospect.customFields,
      created_at: prospect.createdAt,
      updated_at: prospect.updatedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteProspect(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
