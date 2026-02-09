import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, ROUTES } from "../../../shared/constants";
import { apiRequest } from "../../../shared/utils";
import TemplateDetailsForm from "../components/TemplateDetailsForm";
import TemplateEditorCard from "../components/TemplateEditorCard";
import LuminaInspirationCard from "../components/LuminaInspirationCard";

const DEFAULT_CONTENT = `Hi [First Name],

[Draft your email template content here...]

Best regards,
[Your Name]`;

export default function CreateTemplate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Follow-Up");
  const [tone, setTone] = useState<"normal" | "casual">("normal");
  const [content, setContent] = useState(DEFAULT_CONTENT);

  const handleCreateTemplate = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const description =
      trimmedContent.length > 0
        ? `${trimmedContent.replace(/\s+/g, " ").slice(0, 140)}${
            trimmedContent.length > 140 ? "..." : ""
          }`
        : "New template";

    try {
      await apiRequest(API_ENDPOINTS.TEMPLATES, {
        method: "POST",
        body: JSON.stringify({
          title: trimmedTitle.length > 0 ? trimmedTitle : "Untitled Template",
          description,
          content: trimmedContent.length > 0 ? trimmedContent : DEFAULT_CONTENT,
          category,
          tone,
        }),
      });
      navigate(ROUTES.TEMPLATES);
    } catch (error) {
      console.error("Failed to create template", error);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.8), transparent),
              radial-gradient(2px 2px at 60% 70%, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.6), transparent),
              radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.6), transparent),
              radial-gradient(2px 2px at 90% 40%, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 33% 60%, rgba(255,255,255,0.6), transparent),
              radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.6), transparent),
              radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5), transparent),
              radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.5), transparent),
              radial-gradient(1px 1px at 90% 90%, rgba(255,255,255,0.5), transparent)`,
            backgroundSize: "200% 200%",
            backgroundPosition: "0% 0%",
          }}
        />
      </div>

      <div className="relative z-10 p-6 pb-24 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create New Template</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Design your personalized email template for outreach campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
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
              onCreateTemplate={handleCreateTemplate}
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
