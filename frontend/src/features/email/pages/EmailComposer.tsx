import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Flag,
  List,
  ListOrdered,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Loader2,
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
  const initialDraft = useMemo<EmailDraft | undefined>(() => {
    if (!templateId) return undefined;
    const template = MOCK_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return undefined;
    const now = new Date();
    return {
      id: template.id,
      subject: template.title,
      content: template.description,
      createdAt: now,
      updatedAt: now,
    };
  }, [templateId]);
  const { draft, updateSubject, updateContent, updateProspectId, saveDraftNow } =
    useEmailDraft(initialDraft);
  const [aiState, setAIState] = useState<AIState>("idle");
  const [aiConfidence, setAIConfidence] = useState<number>(0.87);
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

  // Mock AI suggestions for demo
  const suggestions = [
    {
      id: "1",
      start: 0,
      end: 0,
      text: "[insert personalized text here]",
      confidence: 0.87,
    },
  ];

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
      setAIState("thinking");
      const draftId = await saveDraftNow();
      const prospectId =
        draft.prospectId ||
        (typeof window !== "undefined"
          ? localStorage.getItem("default_prospect_id")
          : null);
      if (!draftId || !prospectId) return;
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
        updateSubject(response.suggestion.subject);
      }
      if (response.suggestion?.body) {
        updateContent(response.suggestion.body);
      }
      setAIConfidence(response.confidence ?? 0.87);
      setAIState("suggestion_ready");
    } catch {
      setAIState("idle");
    }
  };

  const handleToneChange = async (newTone: "formal" | "casual") => {
    setTone(newTone);
    try {
      setAIState("thinking");
      const draftId = await saveDraftNow();
      if (!draftId) return;
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
        updateSubject(response.suggestion.subject);
      }
      if (response.suggestion?.body) {
        updateContent(response.suggestion.body);
      }
      setAIConfidence(response.confidence ?? 0.87);
      setAIState("suggestion_ready");
    } catch {
      setAIState("idle");
    }
  };

  const handleShorten = async () => {
    try {
      setAIState("thinking");
      const draftId = await saveDraftNow();
      if (!draftId) return;
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
        updateContent(response.suggestion.body);
      }
      setAIConfidence(response.confidence ?? 0.87);
      setAIState("suggestion_ready");
    } catch {
      setAIState("idle");
    }
  };

  const handleImprove = async () => {
    try {
      setAIState("thinking");
      const draftId = await saveDraftNow();
      if (!draftId) return;
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
        updateContent(response.suggestion.body);
      }
      setAIConfidence(response.confidence ?? 0.87);
      setAIState("suggestion_ready");
    } catch {
      setAIState("idle");
    }
  };

  const handleOptimizeReply = async () => {
    try {
      setAIState("thinking");
      const draftId = await saveDraftNow();
      if (!draftId) return;
      const response = await apiRequest<{
        suggestion: { body?: string };
        confidence: number;
      }>(API_ENDPOINTS.AI_REWRITE, {
        method: "POST",
        body: JSON.stringify({
          draft_id: draftId,
          instruction: "Optimize for higher replies.",
        }),
      });
      if (response.suggestion?.body) {
        updateContent(response.suggestion.body);
      }
      setAIConfidence(response.confidence ?? 0.87);
      setAIState("suggestion_ready");
    } catch {
      setAIState("idle");
    }
  };

  // const handleSuggestionAccept = (_suggestionId: string) => {
  //   // Handle suggestion acceptance
  //   setAIState("idle");
  // };

  const handleSendModeChange = (mode: SendMode) => {
    setSendMode(mode);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Composer Area */}
      <div className="flex-1 flex flex-col p-4 space-y-3 overflow-hidden min-h-0">
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
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden glass-card border border-slate-200/70 shadow-[0_20px_60px_rgba(99,102,241,0.12)]">
            {/* Subject Line */}
            <div className="flex-shrink-0 p-3 border-b border-slate-200/70">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Subject
              </label>
              <input
                type="text"
                value={draft.subject}
                onChange={(e) => updateSubject(e.target.value)}
                placeholder="What's this email about?"
                className="w-full px-3 py-2.5 bg-white/80 border border-slate-200/70 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-sm"
              />
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
                  suggestions={suggestions}
                />

                {/* AI Action Bar */}
                <div className="flex-shrink-0 px-3 pb-2">
                  <AIActionBar
                    onPersonalize={handlePersonalize}
                    onToneChange={handleToneChange}
                    onShorten={handleShorten}
                    onImprove={handleImprove}
                    onOptimizeReply={handleOptimizeReply}
                    currentTone={tone}
                  />
                </div>

                {/* Toolbar */}
                <div className="border-t border-slate-200/70 bg-white/70 px-3 py-1.5 flex items-center gap-1 flex-wrap flex-shrink-0">
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Flag"
                  >
                    <Flag className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-slate-200/70 rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
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
        isNewRecipient={isNewRecipient}
        tone={tone}
        sendMode={sendMode}
        onToneChange={handleToneChange}
        onSendModeChange={handleSendModeChange}
      />
    </div>
  );
}
