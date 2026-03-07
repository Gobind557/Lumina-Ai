/**
 * Pre-built templates used when campaign steps reference template IDs
 * that don't exist in the database (frontend MOCK_TEMPLATES ids 1-6).
 * Content uses {{firstName}}, {{lastName}}, {{company}}, {{email}} for variable replacement.
 */
export const PREBUILT_TEMPLATES: Record<
  string,
  { title: string; content: string }
> = {
  "1": {
    title: "Value-Based Follow-Up",
    content: `Hi {{firstName}},

I wanted to follow up on my previous message. Based on your focus on scaling {{company}}, I thought you might find this relevant.

Would you be open to a quick 15-minute call this week to explore how we've helped similar teams?

Best regards`,
  },
  "2": {
    title: "Referral Request",
    content: `Hi {{firstName}},

I hope this finds you well. I'm reaching out because a mutual connection suggested you might be a good fit for what we're building at {{company}}.

Would you have a few minutes this week for a brief intro call?

Thanks,
{{name}}`,
  },
  "3": {
    title: "Cold Outreach - Pain Point",
    content: `Hi {{firstName}},

I noticed your team at {{company}} is likely spending hours on manual processes. We help companies like yours automate these workflows and save 10+ hours per week.

Would you be open to a 15-minute demo to see if it's a fit?

Best,
{{name}}`,
  },
  "4": {
    title: "Product Announcement",
    content: `Hi {{firstName}},

We're excited to announce a new feature that will help {{company}} streamline your workflow. This update includes improvements you've been asking for.

Would you like a quick walkthrough? I'm happy to schedule a call at your convenience.

Best regards`,
  },
  "5": {
    title: "LinkedIn Connection",
    content: `Hi {{firstName}},

I came across your profile and was impressed by your work in the industry. I'd love to connect and learn more about what you're building at {{company}}.

Looking forward to connecting.

{{name}}`,
  },
  "6": {
    title: "Webinar Invitation",
    content: `Hi {{firstName}},

You're invited to our upcoming webinar where we'll cover strategies that have helped teams at companies like {{company}} achieve better results.

Would you like me to save you a spot? Just reply with your preferred time.

Best,
{{name}}`,
  },
};

export function getPrebuiltTemplate(
  templateId: string | null
): { title: string; content: string } | null {
  if (!templateId) return null;
  return PREBUILT_TEMPLATES[templateId] ?? null;
}
