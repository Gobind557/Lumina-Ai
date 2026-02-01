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
