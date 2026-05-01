import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS, ROUTES } from "../../../shared/constants";
import { apiRequest } from "../../../shared/utils";
import { MOCK_TEMPLATES } from "../data/mockTemplates";
import TemplateDetailsForm from "../components/TemplateDetailsForm";
import TemplateEditorCard from "../components/TemplateEditorCard";
import LuminaInspirationCard from "../components/LuminaInspirationCard";

const DEFAULT_CONTENT = `Hi [First Name],

[Draft your email template content here...]

Best regards,
[Your Name]`;

export default function EditTemplate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Follow-Up");
  const [tone, setTone] = useState<"normal" | "casual">("normal");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isApiTemplate, setIsApiTemplate] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadTemplate = async () => {
      // Pre-built templates: use local data, skip API call to avoid 404
      const prebuilt = MOCK_TEMPLATES.find((x) => x.id === id);
      if (prebuilt) {
        setIsApiTemplate(false);
        setTitle(prebuilt.title);
        setCategory(prebuilt.category);
        setContent(prebuilt.content ?? prebuilt.description);
        return;
      }

      try {
        const response = await apiRequest<{
          id: string;
          title: string;
          description: string;
          content: string;
          category: string;
          tone?: string | null;
        }>(`${API_ENDPOINTS.TEMPLATES}/${id}`);

        setIsApiTemplate(true);
        setTitle(response.title);
        setCategory(response.category);
        setContent(response.content);
        if (response.tone === "normal" || response.tone === "casual") {
          setTone(response.tone);
        }
      } catch (error) {
        navigate(ROUTES.TEMPLATES);
      }
    };

    loadTemplate();
  }, [id, navigate]);

  const handleSaveTemplate = async () => {
    if (id && isApiTemplate) {
      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();
      const description =
        trimmedContent.length > 0
          ? `${trimmedContent.replace(/\s+/g, " ").slice(0, 140)}${
              trimmedContent.length > 140 ? "..." : ""
            }`
          : "New template";
      try {
        await apiRequest(`${API_ENDPOINTS.TEMPLATES}/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            title: trimmedTitle.length > 0 ? trimmedTitle : "Untitled Template",
            description,
            content: trimmedContent.length > 0 ? trimmedContent : DEFAULT_CONTENT,
            category,
            tone,
          }),
        });
      } catch (error) {
        console.error("Failed to update template", error);
      }
    }
    navigate(ROUTES.TEMPLATES);
  };

  const handleImproveClarity = async () => {
    if (!content) return;
    try {
      const response = await apiRequest<{ text: string }>(API_ENDPOINTS.AI_REWRITE_TEXT, {
        method: "POST",
        body: JSON.stringify({
          text: content,
          instruction: "Improve clarity and flow, ensuring professional language.",
        }),
      });
      setContent(response.text);
    } catch (error) {
      console.error("AI failed", error);
    }
  };

  const handleChangeTone = async () => {
    if (!content) return;
    try {
      const response = await apiRequest<{ text: string }>(API_ENDPOINTS.AI_REWRITE_TEXT, {
        method: "POST",
        body: JSON.stringify({
          text: content,
          instruction: `Rewrite this email in a ${tone === "normal" ? "casual" : "professional"} tone.`,
        }),
      });
      setContent(response.text);
    } catch (error) {
      console.error("AI failed", error);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 relative">
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Edit Template</h1>
          <p className="text-sm text-slate-500">
            Update your email template for outreach campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <TemplateDetailsForm
              title={title}
              onTitleChange={setTitle}
              category={category}
              onCategoryChange={setCategory}
              tone={tone}
              onToneChange={setTone}
            />
          </div>
          <div className="lg:col-span-5">
            <TemplateEditorCard
              content={content}
              onContentChange={setContent}
              status={title ? `Draft: ${title}` : "Draft: Untitled Template"}
              onCreateTemplate={handleSaveTemplate}
              onImproveClarity={handleImproveClarity}
              onChangeTone={handleChangeTone}
            />
          </div>
          <div className="lg:col-span-3">
            <LuminaInspirationCard onSelect={(newContent) => setContent(newContent)} />
          </div>
        </div>
      </div>
    </div>
  );
}
