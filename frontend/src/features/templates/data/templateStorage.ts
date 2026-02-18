import type { TemplateCardData } from "../types";

const STORAGE_KEY = "userTemplates";

export const getStoredTemplates = (): TemplateCardData[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TemplateCardData[]) : [];
  } catch {
    return [];
  }
};

export const saveStoredTemplates = (templates: TemplateCardData[]) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

export const findStoredTemplate = (id: string) => {
  const existing = getStoredTemplates();
  return existing.find((template) => template.id === id);
};

export const addStoredTemplate = (template: TemplateCardData) => {
  const existing = getStoredTemplates();
  saveStoredTemplates([template, ...existing]);
};

export const updateStoredTemplate = (id: string, updates: Partial<TemplateCardData>) => {
  const existing = getStoredTemplates();
  const next = existing.map((template) =>
    template.id === id ? { ...template, ...updates } : template
  );
  saveStoredTemplates(next);
};
