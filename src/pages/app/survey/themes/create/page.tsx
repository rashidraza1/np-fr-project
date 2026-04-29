import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SurveyThemeBuilderForm, SurveyThemeFormState } from "@/components/survey-themes/SurveyThemeBuilderForm";

const SAVE_THEME_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/theme/save_theme.php`;

export default function SurveyThemeCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

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
        body: JSON.stringify({ theme: payload }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save theme.");
      }
      toast.success("Theme created successfully.");
      setTimeout(() => navigate("/survey/themes"), 900);
    } catch (error: any) {
      toast.error(error.message || "Unable to create theme.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <ToastContainer />
      <div className="mx-auto max-w-[1600px]">
        <SurveyThemeBuilderForm
          mode="create"
          onSubmit={handleSubmit}
          saving={saving}
          onCancel={() => navigate("/survey/themes")}
        />
      </div>
    </div>
  );
}
