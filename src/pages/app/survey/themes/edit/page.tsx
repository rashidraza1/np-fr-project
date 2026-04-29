import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";
import { SurveyThemeBuilderForm, SurveyThemeFormState } from "@/components/survey-themes/SurveyThemeBuilderForm";

const SAVE_THEME_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/theme/save_theme.php`;
const GET_THEME_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/theme/get_theme_by_id.php`;

export default function SurveyThemeEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<SurveyThemeFormState | null>(null);

  useEffect(() => {
    async function loadTheme() {
      if (!id) {
        toast.error("Theme ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${GET_THEME_API_URL}?id=${encodeURIComponent(id)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (!response.ok || !data.success || !data.data?.theme) {
          throw new Error(data.message || "Failed to load theme.");
        }
        setTheme(data.data.theme as SurveyThemeFormState);
      } catch (error: any) {
        toast.error(error.message || "Unable to load theme.");
      } finally {
        setLoading(false);
      }
    }

    loadTheme();
  }, [id]);

  const handleSubmit = async (payload: SurveyThemeFormState) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("jwt_token") || "";
      const response = await fetch(SAVE_THEME_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ theme: { ...payload, id: Number(id) } }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update theme.");
      }
      toast.success("Theme updated successfully.");
      setTimeout(() => navigate("/survey/themes"), 900);
    } catch (error: any) {
      toast.error(error.message || "Unable to update theme.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <ToastContainer />
        <div className="rounded-3xl bg-white border border-slate-200 px-8 py-6 shadow-sm inline-flex items-center gap-3 text-slate-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading theme for edit...
        </div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <ToastContainer />
        <div className="mx-auto max-w-3xl rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
          Theme not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <ToastContainer />
      <div className="mx-auto max-w-[1600px]">
        <SurveyThemeBuilderForm
          mode="edit"
          initialValue={theme}
          onSubmit={handleSubmit}
          saving={saving}
          onCancel={() => navigate("/survey/themes")}
        />
      </div>
    </div>
  );
}
