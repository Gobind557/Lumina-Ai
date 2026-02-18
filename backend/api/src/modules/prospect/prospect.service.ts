import { ApiError } from "../../shared/errors";
import { prospectRepository } from "./prospect.repository";

export const listProspects = (params: {
  workspaceId?: string;
  email?: string;
  search?: string;
  limit: number;
  offset: number;
}) => prospectRepository.list(params).then(([total, prospects]) => ({ total, prospects }));

export const getProspect = async (id: string) => {
  const prospect = await prospectRepository.getById(id);
  if (!prospect) throw new ApiError(404, "NOT_FOUND", "Prospect not found");
  return prospect;
};

export const createProspect = (payload: {
  workspaceId?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  customFields?: Record<string, unknown>;
}) =>
  prospectRepository.create({
    ...payload,
    customFields: payload.customFields as object | undefined,
  });

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
  const existing = await prospectRepository.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Prospect not found");
  return prospectRepository.update(id, {
    ...payload,
    customFields: payload.customFields as object | undefined,
  });
};

export const deleteProspect = async (id: string) => {
  const existing = await prospectRepository.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", "Prospect not found");
  await prospectRepository.delete(id);
};
