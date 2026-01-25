import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
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

  useEffect(() => {
    if (!id) return;
    const t = MOCK_TEMPLATES.find((x) => x.id === id);
    if (t) {
      setTitle(t.title);
      setCategory(t.category);
      setContent(t.description + "\n\n...");
    } else {
      navigate(ROUTES.TEMPLATES);
    }
  }, [id, navigate]);

  const handleSaveTemplate = () => {
    navigate(ROUTES.TEMPLATES);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative">
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

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Edit Template</h1>
          <p className="text-sm text-gray-400">
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
