import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Loader2,
  Sparkles,
  Undo2,
} from "lucide-react";
import {
  CopilotPanel,
  RichTextEditor,
  GlowRing,
  AIActionBar,
  SendModes,
  type AIState,
  type SendMode,
} from "../components";
import { useEmailDraft } from "../hooks";
import { apiRequest } from "@/shared/utils";
import { API_ENDPOINTS } from "@/shared/constants";
import { MOCK_TEMPLATES } from "../../templates/data/mockTemplates";
import type { EmailDraft, Prospect } from "../../../shared/types";
import {
  generateSuggestions,
  highlightsFromSuggestions,
  suggestionsToWeakPhrases,
} from "../utils/generateSuggestions";
import {
  pickSuggestedSubject,
  stripLeadingSubjectPrefixFromBody,
} from "../utils/pickSuggestedSubject";

type ProspectPayload = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
};

export default function EmailComposer() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("templateId");
  const [fetchedTemplateDraft, setFetchedTemplateDraft] =
    useState<EmailDraft | null>(null);
  const [templateFetchDone, setTemplateFetchDone] = useState(false);

  const initialDraftFromMock = useMemo<EmailDraft | undefined>(() => {
    if (!templateId) return undefined;
    const template = MOCK_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return undefined;
    const now = new Date();
    return {
      id: "",
      subject: template.title,
      content: (template as { content?: string }).content ?? template.description,
      createdAt: now,
      updatedAt: now,
    };
  }, [templateId]);

  useEffect(() => {
    if (!templateId || MOCK_TEMPLATES.some((t) => t.id === templateId)) {
      setTemplateFetchDone(true);
      setFetchedTemplateDraft(null);
      return;
    }
    setTemplateFetchDone(false);
    setFetchedTemplateDraft(null);
    let cancelled = false;
    (async () => {
      try {
        const t = await apiRequest<{
          id: string;
          title: string;
          description: string;
          content: string;
        }>(`${API_ENDPOINTS.TEMPLATES}/${encodeURIComponent(templateId)}`);
        if (cancelled) return;
        const now = new Date();
        setFetchedTemplateDraft({
          id: "",
          subject: t.title,
          content: t.content ?? t.description ?? "",
          createdAt: now,
          updatedAt: now,
        });
      } catch {
        if (!cancelled) setFetchedTemplateDraft(null);
      } finally {
        if (!cancelled) setTemplateFetchDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const initialDraft = initialDraftFromMock ?? fetchedTemplateDraft ?? undefined;
  const loadingTemplate =
    !!templateId && !initialDraftFromMock && !templateFetchDone;
  const { draft, updateSubject, updateContent, updateProspectId, saveDraftNow } =
    useEmailDraft(initialDraft);
  const [aiState, setAIState] = useState<AIState>("idle");
  const [aiConfidence, setAIConfidence] = useState<number>(0.87);
  const [aiScore, setAiScore] = useState<number>(82);
  const [sendMode, setSendMode] = useState<SendMode>("send_at_best_time");
  const [tone, setTone] = useState<"formal" | "casual">("casual");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [showRecipientDetails, setShowRecipientDetails] = useState(false);
  const [prospectStatus, setProspectStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [prospectError, setProspectError] = useState<string | null>(null);
  const [prospect, setProspect] = useState<ProspectPayload | null>(null);
  const [insightsProspect, setInsightsProspect] = useState<Prospect | undefined>(
    undefined
  );
  const [sendStatus, setSendStatus] = useState<
    "idle" | "sending" | "queued" | "sent" | "failed"
  >("idle");
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentEmailId, setSentEmailId] = useState<string | null>(null);
  const [isNewRecipient, setIsNewRecipient] = useState(false);

  const calculateAIScore = (body: string, subj: string) => {
    let score = 50;
    const t = body.toLowerCase();
    const s = subj.toLowerCase();
    const normalizedRecipientName = recipientName.trim().toLowerCase();

    // Basic structure heuristics
    if (/\bhi\b|hello/i.test(body)) score += 12;
    if (t.includes("james") || (normalizedRecipientName && t.includes(normalizedRecipientName)))
      score += 15;
    if (t.includes("thank you") || t.includes("thanks")) score += 8;
    if (body.length > 120) score += 8;
    if (body.length > 350) score -= 6;

    // Personalization signals
    if (t.includes("[insert personalized text here]")) score -= 10; // placeholder = weak
    if (recipientCompany.trim() && t.includes(recipientCompany.toLowerCase()))
      score += 18;

    // Subject quality signals
    if (s.length > 4 && s.length < 70) score += 6;
    if (s.includes("?")) score += 5;

    // Tone signals (light touch)
    if (tone === "formal") {
      score += (t.includes("regards") || t.includes("sincerely")) ? 4 : 0;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  useEffect(() => {
    setAiScore(calculateAIScore(draft.content, draft.subject));
  }, [draft.content, draft.subject, recipientCompany, recipientName, tone]);

  type AISuggestionKind =
    | "personalize"
    | "tone"
    | "shorten"
    | "improve"
    | "subject"
    | "company";

  type WeakPhrase = { text: string; hint: string };

  const prospectForSuggestions = useMemo(
    () => ({
      company:
        insightsProspect?.company?.trim() ||
        recipientCompany.trim() ||
        prospect?.company?.trim() ||
        null,
      first_name:
        prospect?.first_name?.trim() ||
        recipientName.trim().split(/\s+/)[0] ||
        null,
      last_name:
        prospect?.last_name?.trim() ||
        recipientName.trim().split(/\s+/).slice(1).join(" ") ||
        null,
      name: insightsProspect?.name?.trim() || recipientName.trim() || null,
    }),
    [
      insightsProspect?.company,
      insightsProspect?.name,
      prospect?.company,
      prospect?.first_name,
      prospect?.last_name,
      recipientCompany,
      recipientName,
    ],
  );

  const liveBodySuggestions = useMemo(
    () => generateSuggestions(draft.content, prospectForSuggestions),
    [draft.content, prospectForSuggestions],
  );

  const inlineHighlights = useMemo(
    () => highlightsFromSuggestions(draft.content, liveBodySuggestions),
    [draft.content, liveBodySuggestions],
  );

  type PendingAISuggestion = {
    kind: AISuggestionKind;
    label: string;
    beforeContent?: string;
    afterContent?: string;
    beforeSubject?: string;
    afterSubject?: string;
    confidence?: number;
    weakPhrases?: WeakPhrase[];
  };

  const [pendingSuggestion, setPendingSuggestion] =
    useState<PendingAISuggestion | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<{
    subject: string;
    content: string;
  } | null>(null);
  /** What the last Apply changed — controls where the Undo control appears. */
  const [undoIncludesBody, setUndoIncludesBody] = useState(false);
  const [undoIncludesSubject, setUndoIncludesSubject] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const editorCardRef = useRef<HTMLDivElement | null>(null);

  const ensureProspect = async () => {
    const email = recipientEmail.trim().toLowerCase();
    if (!email) {
      setProspectError("Enter a recipient email.");
      setProspectStatus("error");
      return null;
    }

    setProspectStatus("loading");
    setProspectError(null);
    try {
      const response = await apiRequest<{ prospects: ProspectPayload[] }>(
        `${API_ENDPOINTS.PROSPECTS}?email=${encodeURIComponent(email)}`
      );
      if (response.prospects.length > 0) {
        const found = response.prospects[0];
        setIsNewRecipient(false);
        setProspect(found);
        updateProspectId(found.id);
        localStorage.setItem("default_prospect_id", found.id);
        setRecipientName(
          [found.first_name, found.last_name].filter(Boolean).join(" ")
        );
        setRecipientCompany(found.company ?? "");
        setInsightsProspect({
          id: found.id,
          name: [found.first_name, found.last_name].filter(Boolean).join(" ") || "Prospect",
          email: found.email,
          company: found.company ?? undefined,
        });
        setProspectStatus("ready");
        return found.id;
      }

      const created = await apiRequest<ProspectPayload>(API_ENDPOINTS.PROSPECTS, {
        method: "POST",
        body: JSON.stringify({
          email,
          first_name: recipientName || undefined,
          company: recipientCompany || undefined,
        }),
      });
      setIsNewRecipient(true);
      setProspect(created);
      updateProspectId(created.id);
      localStorage.setItem("default_prospect_id", created.id);
      setInsightsProspect({
        id: created.id,
        name: recipientName || "Prospect",
        email: created.email,
        company: recipientCompany || undefined,
      });
      setProspectStatus("ready");
      return created.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load prospect";
      setProspectError(message);
      setProspectStatus("error");
      return null;
    }
  };

  const getTokenEmail = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return "";
    try {
      const payload = token.split(".")[1];
      if (!payload) return "";
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const json = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
      const decoded = JSON.parse(json) as { email?: string };
      return decoded.email ?? "";
    } catch {
      return "";
    }
  };

  const handleRecipientLookup = async () => {
    await ensureProspect();
  };

  const handleSend = async () => {
    setSendError(null);
    setSendStatus("sending");
    setSentEmailId(null);
    const prospectId = await ensureProspect();
    if (!prospectId) {
      setSendStatus("idle");
      return;
    }

    const draftId = await saveDraftNow(prospectId);
    if (!draftId) {
      setSendError("Draft not ready. Add a recipient first.");
      setSendStatus("idle");
      return;
    }

    const fromEmail = getTokenEmail();
    if (!fromEmail) {
      setSendError("Please log in again.");
      setSendStatus("idle");
      return;
    }

    try {
      const response = await apiRequest<{ id: string; status: string }>(
        `${API_ENDPOINTS.EMAILS}/send`,
        {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          idempotency_key:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : String(Date.now()),
          from_email: fromEmail,
          to_email: recipientEmail.trim().toLowerCase(),
        }),
        }
      );
      setSentEmailId(response.id);
      setSendStatus("queued");
      setIsNewRecipient(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send email";
      setSendError(message);
      setSendStatus("failed");
    }
  };

  useEffect(() => {
    if (!sentEmailId || (sendStatus !== "queued" && sendStatus !== "sending")) {
      return;
    }

    let isCancelled = false;
    const poll = async () => {
      try {
        const response = await apiRequest<{
          id: string;
          status: "PENDING_SEND" | "SENT" | "FAILED";
        }>(`${API_ENDPOINTS.EMAILS}/${sentEmailId}`);
        if (isCancelled) return;
        if (response.status === "SENT") {
          setSendStatus("sent");
          return;
        }
        if (response.status === "FAILED") {
          setSendStatus("failed");
          setSendError("Email failed to send. Check SMTP/worker logs.");
          return;
        }
        setTimeout(poll, 2000);
      } catch {
        if (!isCancelled) {
          setTimeout(poll, 3000);
        }
      }
    };

    const timer = setTimeout(poll, 1500);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [sentEmailId, sendStatus]);

  const handlePersonalize = async () => {
    try {
      setAIState("generating");
      setPendingSuggestion(null);
      setUndoSnapshot(null);
      setUndoIncludesBody(false);
      setUndoIncludesSubject(false);
      const draftId = await saveDraftNow();
      if (!draftId) {
        setAIState("idle");
        setToastMessage("Couldn’t save draft — add a recipient and look up the prospect first.");
        window.setTimeout(() => setToastMessage(null), 4500);
        return;
      }
      const prospectId =
        draft.prospectId ||
        (typeof window !== "undefined"
          ? localStorage.getItem("default_prospect_id")
          : null);
      if (!prospectId) {
        setAIState("idle");
        setToastMessage("Personalize needs a linked prospect — enter the recipient email and look them up.");
        window.setTimeout(() => setToastMessage(null), 4500);
        return;
      }
      const response = await apiRequest<{
        suggestion: { subject?: string; body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_PERSONALIZE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          prospect_id: prospectId,
          tone,
        }),
      });
      if (response.suggestion?.subject) {
        // Subject applied only after user clicks "Apply"
      }
      if (response.suggestion?.body) {
        // Body applied only after user clicks "Apply"
      }
      setAIConfidence(response.confidence ?? 0.87);

      const beforeContent = draft.content;
      const beforeSubject = draft.subject;
      const cleanedBody = response.suggestion?.body
        ? stripLeadingSubjectPrefixFromBody(response.suggestion.body)
        : undefined;
      setPendingSuggestion({
        kind: "personalize",
        label: "Personalize your email with AI",
        beforeContent,
        afterContent: cleanedBody,
        beforeSubject,
        afterSubject: response.suggestion?.subject,
        confidence: response.confidence ?? 0.87,
        weakPhrases: suggestionsToWeakPhrases(
          generateSuggestions(beforeContent, prospectForSuggestions),
        ),
      });

      setAIState("suggested");
      setTimeout(() => editorCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } catch (e) {
      setAIState("idle");
      const msg = e instanceof Error ? e.message : "Personalize failed";
      setToastMessage(msg);
      window.setTimeout(() => setToastMessage(null), 4500);
    }
  };

  const handleToneChange = async (newTone: "formal" | "casual") => {
    setTone(newTone);
    try {
      setAIState("generating");
      setPendingSuggestion(null);
      setUndoSnapshot(null);
      setUndoIncludesBody(false);
      setUndoIncludesSubject(false);
      const draftId = await saveDraftNow();
      if (!draftId) {
        setAIState("idle");
        return;
      }
      const response = await apiRequest<{
        suggestion: { subject?: string; body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_REWRITE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          instruction: `Rewrite in a ${newTone} tone.`,
        }),
      });
      if (response.suggestion?.subject) {
        // Apply only via preview
      }
      if (response.suggestion?.body) {
        // Apply only via preview
      }
      setAIConfidence(response.confidence ?? 0.87);

      const beforeContentTone = draft.content;
      const toneBody = response.suggestion?.body
        ? stripLeadingSubjectPrefixFromBody(response.suggestion.body)
        : undefined;
      setPendingSuggestion({
        kind: "tone",
        label: `Rewrite in ${newTone} tone`,
        beforeContent: beforeContentTone,
        afterContent: toneBody,
        beforeSubject: draft.subject,
        afterSubject: response.suggestion?.subject,
        confidence: response.confidence ?? 0.87,
        weakPhrases: suggestionsToWeakPhrases(
          generateSuggestions(beforeContentTone, prospectForSuggestions),
        ),
      });
      setAIState("suggested");
      setTimeout(() => editorCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } catch {
      setAIState("idle");
    }
  };

  const handleShorten = async () => {
    try {
      setAIState("generating");
      setPendingSuggestion(null);
      setUndoSnapshot(null);
      setUndoIncludesBody(false);
      setUndoIncludesSubject(false);
      const draftId = await saveDraftNow();
      if (!draftId) return;
      if (!draftId) {
        setAIState("idle");
        return;
      }
      const response = await apiRequest<{
        suggestion: { body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_REWRITE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          instruction: "Make it more concise.",
        }),
      });
      if (response.suggestion?.body) {
        // Apply only via preview
      }
      setAIConfidence(response.confidence ?? 0.87);

      const beforeShorten = draft.content;
      const shortBody = response.suggestion?.body
        ? stripLeadingSubjectPrefixFromBody(response.suggestion.body)
        : undefined;
      setPendingSuggestion({
        kind: "shorten",
        label: "Shorten your message",
        beforeContent: beforeShorten,
        afterContent: shortBody,
        beforeSubject: draft.subject,
        afterSubject: undefined,
        confidence: response.confidence ?? 0.87,
        weakPhrases: suggestionsToWeakPhrases(
          generateSuggestions(beforeShorten, prospectForSuggestions),
        ),
      });
      setAIState("suggested");
      setTimeout(() => editorCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } catch {
      setAIState("idle");
    }
  };

  const handleImprove = async () => {
    try {
      setAIState("generating");
      setPendingSuggestion(null);
      setUndoSnapshot(null);
      setUndoIncludesBody(false);
      setUndoIncludesSubject(false);
      const draftId = await saveDraftNow();
      if (!draftId) {
        setAIState("idle");
        return;
      }
      const response = await apiRequest<{
        suggestion: { body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_REWRITE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          instruction: "Improve clarity and readability.",
        }),
      });
      if (response.suggestion?.body) {
        // Apply only via preview
      }
      setAIConfidence(response.confidence ?? 0.87);

      const beforeImprove = draft.content;
      const improveBody = response.suggestion?.body
        ? stripLeadingSubjectPrefixFromBody(response.suggestion.body)
        : undefined;
      setPendingSuggestion({
        kind: "improve",
        label: "Improve clarity and readability",
        beforeContent: beforeImprove,
        afterContent: improveBody,
        beforeSubject: draft.subject,
        afterSubject: undefined,
        confidence: response.confidence ?? 0.87,
        weakPhrases: suggestionsToWeakPhrases(
          generateSuggestions(beforeImprove, prospectForSuggestions),
        ),
      });
      setAIState("suggested");
      setTimeout(() => editorCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } catch {
      setAIState("idle");
    }
  };

  const handleGenerateSubject = async () => {
    try {
      setAIState("generating");
      setPendingSuggestion(null);
      setUndoSnapshot(null);
      setUndoIncludesBody(false);
      setUndoIncludesSubject(false);
      const draftId = await saveDraftNow();
      if (!draftId) {
        setAIState("idle");
        return;
      }
      const response = await apiRequest<{
        suggestion: { subject?: string; body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_REWRITE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          instruction:
            "Generate 3 subject line options, pick the strongest one, and return ONLY the final subject string.",
        }),
      });

      setAIConfidence(response.confidence ?? 0.87);

      const afterSubject = pickSuggestedSubject(draft.subject, response.suggestion);
      if (!afterSubject) {
        setAIState("idle");
        setToastMessage("No subject returned — check your AI key and try again.");
        window.setTimeout(() => setToastMessage(null), 4500);
        return;
      }

      setPendingSuggestion({
        kind: "subject",
        label: "Generate subject with AI",
        beforeSubject: draft.subject,
        afterSubject,
        confidence: response.confidence ?? 0.87,
      });
      setAIState("suggested");
      setTimeout(() => editorCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    } catch (e) {
      setAIState("idle");
      const msg = e instanceof Error ? e.message : "Subject generation failed";
      setToastMessage(msg);
      window.setTimeout(() => setToastMessage(null), 4500);
    }
  };

  const handleApplyAISuggestion = async (
    suggestionId: "personalize" | "subject" | "company",
  ) => {
    if (suggestionId === "personalize") {
      await handlePersonalize();
      return;
    }

    if (suggestionId === "subject") {
      await handleGenerateSubject();
      return;
    }

    if (suggestionId === "company") {
      const company = recipientCompany || prospect?.company || "";
      if (!company) return;

      setUndoSnapshot(null);
      setUndoIncludesBody(false);
      setUndoIncludesSubject(false);

      const alreadyMentioned = draft.content
        .toLowerCase()
        .includes(company.toLowerCase());
      if (alreadyMentioned) return;

      const line = `\n\nP.S. I’d love to learn more about how ${company} approaches outreach and where you’re looking to improve reply rates.`;
      const beforeContent = draft.content;
      const afterContent = `${draft.content}${line}`;
      setPendingSuggestion({
        kind: "company",
        label: "Mention company for personalization",
        beforeContent,
        afterContent,
        confidence: 0.68,
        weakPhrases: suggestionsToWeakPhrases(
          generateSuggestions(beforeContent, prospectForSuggestions),
        ),
      });
      setAIState("suggested");
      setTimeout(() => editorCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }
  };

  const applyPendingSuggestion = () => {
    if (!pendingSuggestion) return;
    setUndoSnapshot({ subject: draft.subject, content: draft.content });

    const willChangeSubject =
      pendingSuggestion.afterSubject != null &&
      pendingSuggestion.afterSubject !== draft.subject;
    const willChangeBody =
      pendingSuggestion.afterContent != null &&
      pendingSuggestion.afterContent !== draft.content;
    setUndoIncludesSubject(willChangeSubject);
    setUndoIncludesBody(willChangeBody);

    if (pendingSuggestion.afterSubject != null) {
      updateSubject(pendingSuggestion.afterSubject);
    }
    if (pendingSuggestion.afterContent != null) {
      updateContent(pendingSuggestion.afterContent);
    }

    setPendingSuggestion(null);
    setAIState("applied");
    setToastMessage("Suggestion applied");
    window.setTimeout(() => {
      setAIState("idle");
      setToastMessage(null);
    }, 1600);
  };

  const rejectPendingSuggestion = () => {
    setPendingSuggestion(null);
    setAIState("idle");
  };

  const undoAppliedSuggestion = () => {
    if (!undoSnapshot) return;
    updateSubject(undoSnapshot.subject);
    updateContent(undoSnapshot.content);
    setUndoSnapshot(null);
    setUndoIncludesBody(false);
    setUndoIncludesSubject(false);
    setAIState("idle");
    setToastMessage("Undid AI suggestion");
    window.setTimeout(() => setToastMessage(null), 1400);
  };

  // const handleSuggestionAccept = (_suggestionId: string) => {
  //   // Handle suggestion acceptance
  //   setAIState("idle");
  // };

  const handleSendModeChange = (mode: SendMode) => {
    setSendMode(mode);
  };

  if (loadingTemplate) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading template…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col lg:flex-row h-full min-h-0 overflow-y-auto lg:overflow-hidden">
      {/* Main Composer Area */}
      <div className="flex min-h-[600px] lg:min-h-0 flex-1 flex-col space-y-3 lg:overflow-hidden p-4 shrink-0 lg:shrink">
        {toastMessage ? (
          <div className="absolute left-1/2 top-4 -translate-x-1/2 z-[60] rounded-xl border border-purple-200/70 bg-white/90 backdrop-blur-xl px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
            {toastMessage}
          </div>
        ) : null}
        <div className="rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              To
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              onBlur={handleRecipientLookup}
              placeholder="james@technova.com"
              className="flex-1 min-w-[220px] px-3 py-2 bg-white/90 border border-slate-200/70 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              type="button"
              onClick={() => setShowRecipientDetails((prev) => !prev)}
              className="text-xs text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {showRecipientDetails ? "Hide prospect details" : "Add prospect details"}
            </button>
            {prospectStatus === "loading" && (
              <span className="text-xs text-slate-500">Looking up…</span>
            )}
            {prospectStatus === "ready" && prospect && (
              <span className="text-xs text-emerald-600">
                Prospect linked: {prospect.email}
              </span>
            )}
          </div>
          {showRecipientDetails && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              <input
                type="text"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 bg-white/90 border border-slate-200/70 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <input
                type="text"
                value={recipientCompany}
                onChange={(event) => setRecipientCompany(event.target.value)}
                placeholder="Company"
                className="w-full px-3 py-2 bg-white/90 border border-slate-200/70 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          )}
          {(prospectError || sendError) && (
            <div className="text-xs text-rose-600 mt-2">
              {sendError || prospectError}
            </div>
          )}
        </div>

        {/* Card Container with Glow Ring */}
        <GlowRing aiState={aiState} confidence={aiConfidence}>
            <div
              ref={editorCardRef}
              className="flex-1 flex flex-col min-h-0 overflow-y-auto glass-card border border-slate-200/70 shadow-[0_20px_60px_rgba(99,102,241,0.12)]"
            >
            {/* Subject Line */}
            <div className="flex-shrink-0 p-3 border-b border-slate-200/70">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Subject
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={draft.subject}
                  onChange={(e) => updateSubject(e.target.value)}
                  placeholder="What's this email about?"
                  className="w-full px-3 py-2.5 pr-36 bg-white/80 border border-slate-200/70 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400/40 transition-all text-sm shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleGenerateSubject}
                  disabled={aiState === "generating"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md text-xs font-semibold border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                  aria-label="Generate subject with AI"
                >
                  ✨ Generate Subject
                </button>
              </div>

              {pendingSuggestion?.kind === "subject" && pendingSuggestion.afterSubject ? (
                <div className="mt-3 rounded-lg bg-purple-50 border border-purple-100 px-3 py-2.5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">💡 AI Suggestion</div>
                      <div className="text-xs text-slate-600">Generate subject with AI</div>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Confidence:{" "}
                      <span className="font-semibold text-purple-700">
                        {Math.round((pendingSuggestion.confidence ?? 0.87) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="rounded-md border border-purple-100 bg-white/70 p-2">
                      <div className="text-[11px] font-semibold text-slate-600 mb-1">
                        Before
                      </div>
                      <div className="text-[12px] text-slate-700 whitespace-pre-wrap break-words max-h-24 overflow-auto">
                        {pendingSuggestion.beforeSubject || "—"}
                      </div>
                    </div>
                    <div className="rounded-md border border-purple-100 bg-purple-50/70 p-2">
                      <div className="text-[11px] font-semibold text-slate-600 mb-1">
                        After
                      </div>
                      <div className="text-[12px] text-slate-900 whitespace-pre-wrap break-words max-h-24 overflow-auto">
                        {pendingSuggestion.afterSubject || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={rejectPendingSuggestion}
                      className="inline-flex items-center rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors shadow-sm"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={applyPendingSuggestion}
                      className="inline-flex items-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 transition-colors shadow-sm hover:shadow-md"
                    >
                      <Sparkles className="w-4 h-4" />
                      Apply
                    </button>
                  </div>
                </div>
              ) : null}

              {undoSnapshot &&
              !pendingSuggestion &&
              undoIncludesSubject &&
              !undoIncludesBody ? (
                <div className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-3 py-2.5 shadow-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Applied.</span> You can undo the
                    subject change.
                  </div>
                  <button
                    type="button"
                    onClick={undoAppliedSuggestion}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50/80 transition-colors shadow-sm"
                  >
                    <Undo2 className="w-4 h-4" />
                    Undo
                  </button>
                </div>
              ) : null}
            </div>

            {/* Email Body */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-shrink-0 px-3 pt-4 pb-3">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Message
                </label>
              </div>
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <RichTextEditor
                  value={draft.content}
                  onChange={updateContent}
                  aiScore={aiScore}
                  inlineHighlights={inlineHighlights}
                  aiSuggestion={
                    pendingSuggestion?.afterContent != null
                      ? {
                          label: pendingSuggestion.label,
                          before: pendingSuggestion.beforeContent ?? "",
                          after: pendingSuggestion.afterContent ?? "",
                          confidence: pendingSuggestion.confidence,
                          weakPhrases: pendingSuggestion.weakPhrases,
                        }
                      : null
                  }
                  onApplySuggestion={applyPendingSuggestion}
                  onRejectSuggestion={rejectPendingSuggestion}
                  onUndoSuggestion={undoAppliedSuggestion}
                  canUndo={
                    !!undoSnapshot &&
                    !pendingSuggestion &&
                    undoIncludesBody
                  }
                />

                {/* AI Action Bar */}
                <div className="flex-shrink-0 px-3 pb-2">
                  <AIActionBar
                    onPersonalize={handlePersonalize}
                    onToneChange={handleToneChange}
                    onShorten={handleShorten}
                    onImprove={handleImprove}
                    currentTone={tone}
                    isGenerating={aiState === "generating"}
                  />
                </div>

                {/* Toolbar */}
                <div className="border-t border-slate-200/70 bg-white/70 px-3 py-1.5 flex items-center gap-1 flex-wrap flex-shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); document.execCommand("bold", false); }}
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); document.execCommand("italic", false); }}
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const url = prompt("Enter link URL:");
                      if (url) document.execCommand("createLink", false, url);
                    }}
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); document.execCommand("justifyLeft", false); }}
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); document.execCommand("justifyCenter", false); }}
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); document.execCommand("justifyRight", false); }}
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const selection = window.getSelection();
                      if (selection && selection.toString().length > 0) {
                        const text = selection.toString();
                        const bulleted = text.split('\n').map(line => '• ' + line).join('\n');
                        document.execCommand("insertText", false, bulleted);
                      } else {
                        document.execCommand("insertText", false, "• ");
                      }
                    }}
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const selection = window.getSelection();
                      if (selection && selection.toString().length > 0) {
                        const text = selection.toString();
                        const numbered = text.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
                        document.execCommand("insertText", false, numbered);
                      } else {
                        document.execCommand("insertText", false, "1. ");
                      }
                    }}
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0 p-3 border-t border-slate-200/70">
              <div className="flex flex-col items-end gap-2">
                <SendModes
                  onSendModeChange={handleSendModeChange}
                  defaultMode={sendMode}
                  onSend={handleSend}
                />
                {sendStatus !== "idle" && (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium border w-full max-w-[320px] ${
                      sendStatus === "sending"
                        ? "bg-slate-50 text-slate-600 border-slate-200"
                        : sendStatus === "queued"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : sendStatus === "sent"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {sendStatus === "sending" && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="flex-1">Preparing your email…</span>
                      </>
                    )}
                    {sendStatus === "queued" && (
                      <>
                        <Clock3 className="w-4 h-4" />
                        <span className="flex-1">
                          Step 1 queued. Tracking engagement…
                        </span>
                      </>
                    )}
                    {sendStatus === "sent" && (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="flex-1">Sent successfully</span>
                      </>
                    )}
                    {sendStatus === "failed" && (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span className="flex-1">Send failed. Check SMTP.</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlowRing>
      </div>

      {/* Copilot Panel */}
      <CopilotPanel
        draft={draft}
        prospect={insightsProspect}
        recipientName={recipientName}
        recipientCompany={recipientCompany}
        isNewRecipient={isNewRecipient}
        tone={tone}
        sendMode={sendMode}
        aiState={aiState}
        onToneChange={handleToneChange}
        onSendModeChange={handleSendModeChange}
        onApplyAISuggestion={handleApplyAISuggestion}
      />
    </div>
  );
}
