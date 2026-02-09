import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS, ROUTES } from "../../../shared/constants";
import { apiRequest } from "../../../shared/utils";
import { MOCK_TEMPLATES } from "../data/mockTemplates";
import TemplateDetailsForm from "../components/TemplateDetailsForm";
import TemplateEditorCard from "../components/TemplateEditorCard";
import LuminaInspirationCard from "../components/LuminaInspirationCard";
import type { TemplateCardData } from "../components/TemplateCard";

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
        const fallback = MOCK_TEMPLATES.find((x) => x.id === id);
        const t: TemplateCardData | undefined = fallback;
        if (!t) {
          navigate(ROUTES.TEMPLATES);
          return;
        }
        setIsApiTemplate(false);
        setTitle(t.title);
        setCategory(t.category);
        setContent(t.content ?? t.description);
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
              onImproveClarity={() => {}}
              onChangeTone={() => {}}
              onOptimizeReplies={() => {}}
            />
          </div>
          <div className="lg:col-span-3">
            <LuminaInspirationCard />
          </div>
        </div>
      </div>
    </div>
  );
}
