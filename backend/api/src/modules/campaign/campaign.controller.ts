import { Request, Response, NextFunction } from "express";
import {
  listCampaigns,
  getCampaignWithMetrics,
  createCampaign,
  updateCampaignStatus,
  getCampaignProspects,
  getCampaignSteps,
  upsertCampaignSteps,
} from "./campaign.service";

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const status = req.query.status as string | undefined;
    const limit = Math.min(parseInt(String(req.query.limit)) || 50, 100);
    const offset = parseInt(String(req.query.offset)) || 0;
    const result = await listCampaigns({
      userId,
      status: status || undefined,
      limit,
      offset,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const { id } = req.params;
    const campaign = await getCampaignWithMetrics(id, userId);
    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const { name, description, startDate, endDate, workspaceId, prospectIds, status, steps } = req.body;
    const campaign = await createCampaign({
      userId,
      workspaceId: workspaceId ?? null,
      name: name || "Untitled Campaign",
      description: description ?? null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      prospectIds: Array.isArray(prospectIds) ? prospectIds : undefined,
      status: status || undefined,
      steps: Array.isArray(steps) ? steps : undefined,
    });
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
};

export const getSteps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const { id } = req.params;
    const steps = await getCampaignSteps(id, userId);
    res.json(steps);
  } catch (error) {
    next(error);
  }
};

export const upsertSteps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const { id } = req.params;
    const { steps } = req.body;
    if (!Array.isArray(steps)) {
      return res.status(400).json({ error: { message: "steps must be an array" } });
    }
    const validated = steps.map((s: unknown, i: number) => {
      if (typeof s !== "object" || s === null) throw new Error("Invalid step");
      const o = s as Record<string, unknown>;
      const stepNumber = typeof o.stepNumber === "number" ? o.stepNumber : i + 1;
      const templateId = typeof o.templateId === "string" ? o.templateId : "";
      const delayDays = typeof o.delayDays === "number" ? o.delayDays : 0;
      return { stepNumber, templateId, delayDays };
    });
    const result = await upsertCampaignSteps(id, userId, validated);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProspects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const { id } = req.params;
    const prospects = await getCampaignProspects(id, userId);
    res.json(prospects);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: { message: "Invalid status. Use one of: " + validStatuses.join(", ") },
      });
    }
    const campaign = await updateCampaignStatus(id, userId, status);
    res.json(campaign);
  } catch (error) {
    next(error);
  }
};
