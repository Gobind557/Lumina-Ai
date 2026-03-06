/**
 * Renders template content with prospect/user placeholders.
 * Supports: {{firstName}}, {{lastName}}, {{company}}, {{email}}, {{name}}
 */
export function renderTemplate(
  text: string,
  vars: {
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    email?: string | null;
  }
): string {
  const name = [vars.firstName, vars.lastName].filter(Boolean).join(" ") || vars.email || "";
  return text
    .replace(/\{\{firstName\}\}/g, vars.firstName ?? "")
    .replace(/\{\{lastName\}\}/g, vars.lastName ?? "")
    .replace(/\{\{company\}\}/g, vars.company ?? "")
    .replace(/\{\{email\}\}/g, vars.email ?? "")
    .replace(/\{\{name\}\}/g, name);
}
