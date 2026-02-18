export type TemplateCategory =
  | "Follow-Up"
  | "Cold Outreach"
  | "Announcement"
  | "LinkedIn Connection"
  | "Humor";

export interface TemplateCardData {
  id: string;
  title: string;
  description: string;
  content?: string;
  category: TemplateCategory;
  usedCount: number;
  modifiedAgo: string;
  openRate?: number;
  replyRate?: number;
  isFavorite: boolean;
  isRecent?: boolean;
  tags?: string[];
}
