import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Trash2,
  GripVertical,
  ArrowLeft,
  Eye,
  Send,
  Settings2,
  FileText,
  LayoutPanelTop,
  Wand2,
  Loader2,
  MonitorSmartphone,
} from "lucide-react";

type QuestionType =
  | "nps_0_10"
  | "csat_1_5"
  | "ces_1_5"
  | "smiley_3"
  | "smiley_5"
  | "yes_no"
  | "single_choice"
  | "multi_choice"
  | "text"
  | "textarea"
  | "date"
  | "file_upload";

type Option = {
  id: string;
  text: string;
  value: string;
  score?: number | null;
};

type Question = {
  id: string;
  code: string;
  text: string;
  type: QuestionType;
  required: boolean;
  helpText: string;
  placeholder: string;
  scoringEnabled: boolean;
  options: Option[];
};

type Section = {
  id: string;
  code: string;
  title: string;
  description: string;
  questions: Question[];
};

type DeviceItem = {
  id: number;
  name: string;
  branch_name: string;
};

type SurveyState = {
  id?: number;
  name: string;
  code: string;
  type: "" | "nps" | "csat" | "ces" | "custom";
  description: string;
  intro: string;
  thankYou: string;
  deviceIds: number[];
  language: string;
  status: "" | "draft" | "published" | "paused";
  anonymous: boolean;
  allowMultipleResponses: boolean;
  requireLogin: boolean;
  publishWeb: boolean;
  publishQR: boolean;
  publishKiosk: boolean;
  publishEmail: boolean;
  themeId: number | null;
  startDate: string;
  endDate: string;
};

type MasterApiResponse = {
  success: boolean;
  message?: string;
  data: { devices: DeviceItem[] };
};

type SurveyThemeConfig = {
  id: number;
  theme_name: string;
  theme_code: string;
  description?: string;
  is_active: boolean | number;
  layout_mode: "single_page" | "multi_page";
  background_type: "color" | "image";
  background_color: string;
  background_image_path: string;
  background_size: "cover" | "contain" | "auto";
  background_position: "center" | "top" | "bottom" | "left" | "right";
  question_font_family: string;
  question_font_weight: string;
  question_font_size: number;
  question_font_color: string;
  answer_font_family: string;
  answer_font_weight: string;
  answer_font_size: number;
  answer_font_color: string;
  choice_button_bg_type: "color" | "image";
  choice_button_bg_color: string;
  choice_button_bg_image_path: string;
  choice_button_text_color: string;
  choice_button_border_color: string;
  choice_button_radius: number;
  choice_button_padding_y: number;
  choice_button_padding_x: number;
  choice_button_gap: number;
  nav_button_bg_color: string;
  nav_button_text_color: string;
  nav_button_radius: number;
  nav_button_font_size: number;
  next_button_text: string;
  prev_button_text: string;
  smiley_mode: "default" | "custom";
  smiley_size: number;
  smiley_3_image_1?: string;
  smiley_3_image_2?: string;
  smiley_3_image_3?: string;
  smiley_5_image_1?: string;
  smiley_5_image_2?: string;
  smiley_5_image_3?: string;
  smiley_5_image_4?: string;
  smiley_5_image_5?: string;
};

type ThemeDetailsApiResponse = {
  success: boolean;
  message?: string;
  data: {
    theme: SurveyThemeConfig;
  };
};


type ValidationErrors = {
  survey?: Record<string, string>;
  sections?: Array<{
    section?: Record<string, string>;
    questions?: Array<{
      question?: Record<string, string>;
      options?: Array<Record<string, string>>;
    }>;
  }>;
};

type SaveSurveyPayload = {
  survey: {
    id?: number;
    survey_name: string;
    survey_code: string;
    survey_type: "nps" | "csat" | "ces" | "custom";
    description: string;
    intro_message: string;
    thank_you_message: string;
    language_code: string;
    status: "draft" | "published" | "paused";
    is_anonymous: boolean;
    allow_multiple_responses: boolean;
    require_login: boolean;
    theme_id: number | null;
    start_date: string | null;
    end_date: string | null;
  };
  device_ids: number[];
  sections: Array<{
    id?: number | string;
    section_code: string;
    section_title: string;
    section_description: string;
    sort_order: number;
    questions: Array<{
      id?: number | string;
      question_code: string;
      question_text: string;
      question_type: QuestionType;
      help_text: string;
      placeholder_text: string;
      is_required: boolean;
      scoring_enabled: boolean;
      sort_order: number;
      options: Array<{
        id?: number | string;
        option_text: string;
        option_value: string;
        option_score: number | null;
        sort_order: number;
      }>;
    }>;
  }>;
  publish_settings: {
    publish_web: boolean;
    publish_qr: boolean;
    publish_kiosk: boolean;
    publish_email: boolean;
    public_link: string;
    qr_code_path: string;
  };
};

type GetSurveyApiResponse = {
  success: boolean;
  message?: string;
  data: {
    survey: {
      id: number;
      survey_name: string;
      survey_code: string;
      survey_type: "nps" | "csat" | "ces" | "custom";
      description: string;
      intro_message: string;
      thank_you_message: string;
      language_code: string;
      status: "draft" | "published" | "paused";
      is_anonymous: number;
      allow_multiple_responses: number;
      require_login: number;
      theme_id?: number | null;
      start_date: string | null;
      end_date: string | null;
    };
    devices: Array<{
      id: number;
      device_name: string;
      branch_name: string;
    }>;
    sections: Array<{
      id: number;
      section_code: string;
      section_title: string;
      section_description: string;
      sort_order: number;
      questions: Array<{
        id: number;
        question_code: string;
        question_text: string;
        question_type: QuestionType;
        help_text: string;
        placeholder_text: string;
        is_required: number;
        scoring_enabled: number;
        sort_order: number;
        options: Array<{
          id: number;
          option_text: string;
          option_value: string;
          option_score: number | null;
          sort_order: number;
        }>;
      }>;
    }>;
    publish_settings: {
      publish_web: number;
      publish_qr: number;
      publish_kiosk: number;
      publish_email: number;
      public_link: string;
      qr_code_path: string;
    };
  };
};

const uid = () => Math.random().toString(36).slice(2, 9);
const MASTER_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/get_masters_devices.php`;
const GET_SURVEY_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/get_survey_by_id.php`;
const SAVE_SURVEY_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/save.php`;
const GET_THEME_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/theme/get_theme_by_id.php`;

function defaultQuestion(): Question {
  return {
    id: uid(),
    code: "",
    text: "",
    type: "single_choice",
    required: true,
    helpText: "",
    placeholder: "",
    scoringEnabled: false,
    options: [
      { id: uid(), text: "", value: "", score: 1 },
      { id: uid(), text: "", value: "", score: 2 },
    ],
  };
}

function isChoiceType(type: string) {
  return type === "single_choice" || type === "multi_choice";
}

function validateSurveyForm(
  survey: SurveyState,
  sections: Section[]
): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = { survey: {}, sections: [] };

  if (!survey.name?.trim()) errors.survey!.name = "Survey name is required.";
  if (!survey.code?.trim()) errors.survey!.code = "Survey code is required.";
  if (!survey.type?.trim()) errors.survey!.type = "Survey type is required.";
  if (!survey.deviceIds?.length) errors.survey!.devices = "Please select at least one device.";

  if (survey.startDate && survey.endDate && survey.endDate < survey.startDate) {
    errors.survey!.endDate = "End date cannot be before start date.";
  }

  const hasPublishChannel =
    survey.publishWeb ||
    survey.publishQR ||
    survey.publishKiosk ||
    survey.publishEmail;

  if (survey.status === "published" && !hasPublishChannel) {
    errors.survey!.publish = "At least one publish channel must be enabled.";
  }

  if (!sections || sections.length === 0) {
    errors.survey!.sections = "At least one section is required.";
  }

  sections.forEach((section) => {
    const sectionError = {
      section: {} as Record<string, string>,
      questions: [] as Array<{
        question: Record<string, string>;
        options: Array<Record<string, string>>;
      }>,
    };

    if (!section.title?.trim()) sectionError.section.title = "Section title is required.";
    if (!section.code?.trim()) sectionError.section.code = "Section code is required.";
    if (!section.questions || section.questions.length === 0) {
      sectionError.section.questions = "At least one question is required in each section.";
    }

    section.questions?.forEach((question) => {
      const questionError = {
        question: {} as Record<string, string>,
        options: [] as Array<Record<string, string>>,
      };

      if (!question.text?.trim()) questionError.question.text = "Question text is required.";
      if (!question.code?.trim()) questionError.question.code = "Question code is required.";
      if (!question.type?.trim()) questionError.question.type = "Question type is required.";

      if (isChoiceType(question.type)) {
        if (!question.options || question.options.length < 2) {
          questionError.question.options = "At least 2 options are required.";
        }

        question.options?.forEach((option) => {
          const optionError: Record<string, string> = {};
          if (!option.text?.trim()) optionError.text = "Option text is required.";
          if (!option.value?.trim()) optionError.value = "Option value is required.";
          questionError.options.push(optionError);
        });
      }

      sectionError.questions.push(questionError);
    });

    errors.sections!.push(sectionError);
  });

  const hasSurveyErrors = Object.keys(errors.survey || {}).length > 0;
  const hasSectionErrors = (errors.sections || []).some(
    (sectionErr) =>
      Object.keys(sectionErr.section || {}).length > 0 ||
      (sectionErr.questions || []).some(
        (qErr) =>
          Object.keys(qErr.question || {}).length > 0 ||
          (qErr.options || []).some(
            (optErr) => Object.keys(optErr || {}).length > 0
          )
      )
  );

  return { isValid: !hasSurveyErrors && !hasSectionErrors, errors };
}

function buildSurveyPayload(
  survey: SurveyState,
  sections: Section[]
): SaveSurveyPayload {
  return {
    survey: {
      id: survey.id,
      survey_name: survey.name?.trim() || "",
      survey_code: survey.code?.trim() || "",
      survey_type: (survey.type || "custom") as "nps" | "csat" | "ces" | "custom",
      description: survey.description?.trim() || "",
      intro_message: survey.intro?.trim() || "",
      thank_you_message: survey.thankYou?.trim() || "",
      language_code: survey.language || "en",
      status: (survey.status || "draft") as "draft" | "published" | "paused",
      is_anonymous: !!survey.anonymous,
      allow_multiple_responses: !!survey.allowMultipleResponses,
      require_login: !!survey.requireLogin,
      theme_id: survey.themeId && survey.themeId > 0 ? survey.themeId : null,
      start_date: survey.startDate || null,
      end_date: survey.endDate || null,
    },
    device_ids: survey.deviceIds,
    sections: sections.map((section, sectionIndex) => ({
      id: section.id,
      section_code: section.code?.trim() || "",
      section_title: section.title?.trim() || "",
      section_description: section.description?.trim() || "",
      sort_order: sectionIndex + 1,
      questions: (section.questions || []).map((question, questionIndex) => ({
        id: question.id,
        question_code: question.code?.trim() || "",
        question_text: question.text?.trim() || "",
        question_type: question.type,
        help_text: question.helpText?.trim() || "",
        placeholder_text: question.placeholder?.trim() || "",
        is_required: !!question.required,
        scoring_enabled: !!question.scoringEnabled,
        sort_order: questionIndex + 1,
        options: (question.options || []).map((option, optionIndex) => ({
          id: option.id,
          option_text: option.text?.trim() || "",
          option_value: option.value?.trim() || "",
          option_score:
            option.score === null || option.score === undefined
              ? null
              : Number(option.score),
          sort_order: optionIndex + 1,
        })),
      })),
    })),
    publish_settings: {
      publish_web: !!survey.publishWeb,
      publish_qr: !!survey.publishQR,
      publish_kiosk: !!survey.publishKiosk,
      publish_email: !!survey.publishEmail,
      public_link: survey.code
        ? `https://survey.local/${survey.code.toLowerCase()}`
        : "",
      qr_code_path: "",
    },
  };
}

async function fetchMasters(): Promise<MasterApiResponse> {
  const response = await fetch(MASTER_API_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to load master data.");
  }
  return data;
}

async function fetchThemeById(id: number): Promise<SurveyThemeConfig> {
  const response = await fetch(`${GET_THEME_API_URL}?id=${encodeURIComponent(String(id))}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data: ThemeDetailsApiResponse = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to load theme details.");
  }
  return data.data.theme;
}


async function fetchSurveyById(id: string): Promise<GetSurveyApiResponse> {
  const response = await fetch(
    `${GET_SURVEY_API_URL}?id=${encodeURIComponent(id)}`,
    { method: "GET", headers: { "Content-Type": "application/json" } }
  );
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to load survey.");
  }
  return data;
}

async function saveSurveyApi(
  payload: SaveSurveyPayload,
  token: string
): Promise<any> {
  const response = await fetch(SAVE_SURVEY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to save survey.");
  return data;
}

function mapApiToSurveyState(api: GetSurveyApiResponse["data"]): {
  survey: SurveyState;
  sections: Section[];
} {
  const survey: SurveyState = {
    id: api.survey.id,
    name: api.survey.survey_name || "",
    code: api.survey.survey_code || "",
    type: api.survey.survey_type || "",
    description: api.survey.description || "",
    intro: api.survey.intro_message || "",
    thankYou: api.survey.thank_you_message || "",
    deviceIds: (api.devices || []).map((d) => d.id),
    language: api.survey.language_code || "en",
    status: api.survey.status || "draft",
    anonymous: !!api.survey.is_anonymous,
    allowMultipleResponses: !!api.survey.allow_multiple_responses,
    requireLogin: !!api.survey.require_login,
    publishWeb: !!api.publish_settings?.publish_web,
    publishQR: !!api.publish_settings?.publish_qr,
    publishKiosk: !!api.publish_settings?.publish_kiosk,
    publishEmail: !!api.publish_settings?.publish_email,
    themeId: api.survey.theme_id && Number(api.survey.theme_id) > 0 ? Number(api.survey.theme_id) : null,
    startDate: api.survey.start_date || "",
    endDate: api.survey.end_date || "",
  };

  const sections: Section[] = (api.sections || []).map((section) => ({
    id: String(section.id),
    code: section.section_code || "",
    title: section.section_title || "",
    description: section.section_description || "",
    questions: (section.questions || []).map((question) => ({
      id: String(question.id),
      code: question.question_code || "",
      text: question.question_text || "",
      type: question.question_type,
      required: !!question.is_required,
      helpText: question.help_text || "",
      placeholder: question.placeholder_text || "",
      scoringEnabled: !!question.scoring_enabled,
      options: (question.options || []).map((option) => ({
        id: String(option.id),
        text: option.option_text || "",
        value: option.option_value || "",
        score: option.option_score ?? null,
      })),
    })),
  }));

  return { survey, sections };
}

function QuestionTypePill({ type }: { type: QuestionType }) {
  const labelMap: Record<string, string> = {
    nps_0_10: "NPS",
    csat_1_5: "CSAT",
    ces_1_5: "CES",
    smiley_3: "3 Smileys",
    smiley_5: "5 Smileys",
    yes_no: "Yes/No",
    single_choice: "Single Choice",
    multi_choice: "Multiple Choice",
    text: "Text",
    textarea: "Text Area",
    date: "Date Calendar",
    file_upload: "File upload",
  };

  return <Badge variant="secondary" className="rounded-full">{labelMap[type] || type.replace(/_/g, " ")}</Badge>;
}

function SurveyPreview({ survey, sections, devices, theme }: { survey: SurveyState; sections: Section[]; devices: DeviceItem[]; theme: SurveyThemeConfig | null; }) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const selectedDevices = devices.filter((d) => survey.deviceIds.includes(d.id));
  const flatQuestions = sections.flatMap((section) =>
    section.questions.map((question, questionIndex) => ({
      ...question,
      sectionId: section.id,
      sectionTitle: section.title || "Untitled Section",
      sectionDescription: section.description || "",
      questionNumber: questionIndex + 1,
    }))
  );

  useEffect(() => {
    setPreviewIndex(0);
  }, [theme?.id, sections.length, flatQuestions.length]);

  const safeTheme = theme;
  const isMultiPage = safeTheme?.layout_mode === "multi_page";
  const activeQuestion = flatQuestions[Math.min(previewIndex, Math.max(flatQuestions.length - 1, 0))];

  const wrapperStyle: React.CSSProperties = safeTheme
    ? safeTheme.background_type === "image" && safeTheme.background_image_path
      ? {
          backgroundImage: `url(${safeTheme.background_image_path})`,
          backgroundSize: safeTheme.background_size || "cover",
          backgroundPosition: safeTheme.background_position || "center",
          backgroundRepeat: "no-repeat",
        }
      : { background: safeTheme.background_color || "#ffffff" }
    : {};

  const questionStyle: React.CSSProperties = safeTheme
    ? {
        fontFamily: safeTheme.question_font_family || "inherit",
        fontWeight: safeTheme.question_font_weight || "700",
        fontSize: `${safeTheme.question_font_size || 24}px`,
        color: safeTheme.question_font_color || "#0f172a",
      }
    : {};

  const answerTextStyle: React.CSSProperties = safeTheme
    ? {
        fontFamily: safeTheme.answer_font_family || "inherit",
        fontWeight: safeTheme.answer_font_weight || "500",
        fontSize: `${safeTheme.answer_font_size || 16}px`,
        color: safeTheme.answer_font_color || "#0f172a",
      }
    : {};

  const choiceButtonStyle: React.CSSProperties = safeTheme
    ? {
        ...answerTextStyle,
        background: safeTheme.choice_button_bg_type === "image" && safeTheme.choice_button_bg_image_path
          ? `url(${safeTheme.choice_button_bg_image_path}) center/cover no-repeat`
          : safeTheme.choice_button_bg_color || "#ffffff",
        color: safeTheme.choice_button_text_color || "#0f172a",
        borderColor: safeTheme.choice_button_border_color || "#cbd5e1",
        borderRadius: `${safeTheme.choice_button_radius || 18}px`,
        padding: `${safeTheme.choice_button_padding_y || 16}px ${safeTheme.choice_button_padding_x || 18}px`,
      }
    : answerTextStyle;

  const navButtonStyle: React.CSSProperties = safeTheme
    ? {
        background: safeTheme.nav_button_bg_color || "#0f172a",
        color: safeTheme.nav_button_text_color || "#ffffff",
        borderRadius: `${safeTheme.nav_button_radius || 14}px`,
        fontSize: `${safeTheme.nav_button_font_size || 15}px`,
      }
    : {};

  const getSmileyValues = (count: 3 | 5) => {
    const defaults = count === 3 ? ["😞", "😐", "😊"] : ["😡", "😕", "😐", "🙂", "😍"];
    if (!safeTheme || safeTheme.smiley_mode !== "custom") return defaults;

    const customImages = count === 3
      ? [safeTheme.smiley_3_image_1, safeTheme.smiley_3_image_2, safeTheme.smiley_3_image_3]
      : [
          safeTheme.smiley_5_image_1,
          safeTheme.smiley_5_image_2,
          safeTheme.smiley_5_image_3,
          safeTheme.smiley_5_image_4,
          safeTheme.smiley_5_image_5,
        ];

    return customImages.map((item, index) => item || defaults[index]);
  };

  const renderAnswerPreview = (question: Question) => {
    switch (question.type) {
      case "nps_0_10":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <button key={index} className="aspect-square border shadow-sm" style={{ ...choiceButtonStyle, padding: "0" }}>
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        );
      case "csat_1_5":
        return (
          <div className="grid grid-cols-5 gap-2">
            {["1", "2", "3", "4", "5"].map((value) => (
              <button key={value} className="aspect-square border shadow-sm" style={{ ...choiceButtonStyle, padding: "0" }}>
                {value}
              </button>
            ))}
          </div>
        );
      case "ces_1_5":
        return (
          <div className="grid gap-2 sm:grid-cols-5" style={{ gap: `${safeTheme?.choice_button_gap || 12}px` }}>
            {["Very Difficult", "Difficult", "Neutral", "Easy", "Very Easy"].map((label) => (
              <button key={label} className="border shadow-sm text-center" style={choiceButtonStyle}>
                {label}
              </button>
            ))}
          </div>
        );
      case "smiley_3": {
        const smileys = getSmileyValues(3);
        return (
          <div className="grid grid-cols-3 gap-3">
            {smileys.map((item, index) => (
              <div key={index} className="aspect-square border shadow-sm rounded-2xl bg-white flex items-center justify-center overflow-hidden" style={{ borderColor: safeTheme?.choice_button_border_color || "#cbd5e1" }}>
                {String(item).startsWith("/") || String(item).startsWith("http") || String(item).startsWith("blob:") ? (
                  <img src={String(item)} alt={`Smiley ${index + 1}`} style={{ width: `${safeTheme?.smiley_size || 56}px`, height: `${safeTheme?.smiley_size || 56}px`, objectFit: "contain" }} />
                ) : (
                  <span style={{ fontSize: `${safeTheme?.smiley_size || 56}px`, lineHeight: 1 }}>{String(item)}</span>
                )}
              </div>
            ))}
          </div>
        );
      }
      case "smiley_5": {
        const smileys = getSmileyValues(5);
        return (
          <div className="grid grid-cols-5 gap-3">
            {smileys.map((item, index) => (
              <div key={index} className="aspect-square border shadow-sm rounded-2xl bg-white flex items-center justify-center overflow-hidden" style={{ borderColor: safeTheme?.choice_button_border_color || "#cbd5e1" }}>
                {String(item).startsWith("/") || String(item).startsWith("http") || String(item).startsWith("blob:") ? (
                  <img src={String(item)} alt={`Smiley ${index + 1}`} style={{ width: `${safeTheme?.smiley_size || 56}px`, height: `${safeTheme?.smiley_size || 56}px`, objectFit: "contain" }} />
                ) : (
                  <span style={{ fontSize: `${safeTheme?.smiley_size || 56}px`, lineHeight: 1 }}>{String(item)}</span>
                )}
              </div>
            ))}
          </div>
        );
      }
      case "yes_no":
        return (
          <div className="grid grid-cols-2 gap-3">
            {["Yes", "No"].map((label) => (
              <button key={label} className="border shadow-sm text-left" style={choiceButtonStyle}>{label}</button>
            ))}
          </div>
        );
      case "single_choice":
      case "multi_choice": {
        const optionLabels = question.options.length > 0
          ? question.options.map((option) => option.text || option.value || "Option")
          : question.type === "multi_choice"
          ? ["Option A", "Option B", "Option C"]
          : ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"];

        return (
          <div className="grid gap-3" style={{ gap: `${safeTheme?.choice_button_gap || 12}px` }}>
            {optionLabels.map((label, index) => (
              <button key={`${label}-${index}`} className="w-full border shadow-sm text-left" style={choiceButtonStyle}>
                {label}
              </button>
            ))}
          </div>
        );
      }
      case "date":
        return (
          <input
            type="date"
            className="w-full rounded-2xl border bg-white px-4 py-4 outline-none"
            style={answerTextStyle}
          />
        );
      case "file_upload":
        return (
          <div className="rounded-2xl border-2 border-dashed bg-white px-4 py-8 text-center">
            <div style={answerTextStyle}>Choose file / Upload file</div>
            <div className="text-sm text-slate-500 mt-2">Supported preview for document or image upload question</div>
          </div>
        );
      case "textarea":
        return (
          <textarea
            className="min-h-[120px] w-full rounded-2xl border bg-white px-4 py-4 outline-none"
            style={answerTextStyle}
            placeholder={question.placeholder || "Write your answer here"}
          />
        );
      case "text":
      default:
        return (
          <input
            className="w-full rounded-2xl border bg-white px-4 py-4 outline-none"
            style={answerTextStyle}
            placeholder={question.placeholder || "Type your answer here"}
          />
        );
    }
  };

  return (
    <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-950 text-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold">{survey.name || "Untitled Survey"}</div>
            <div className="text-sm text-slate-300 mt-2">{survey.description || "Survey description will appear here."}</div>
          </div>
          {safeTheme && (
            <Badge variant="secondary" className="rounded-full bg-white/10 text-white border border-white/20">
              {safeTheme.theme_name} · {safeTheme.layout_mode === "multi_page" ? "Multi Page" : "Single Page"}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6" style={wrapperStyle}>
        {selectedDevices.length > 0 && (
          <Card className="rounded-2xl border-dashed bg-white/90">
            <CardContent className="pt-6">
              <div className="text-sm font-semibold text-slate-700 mb-3">Selected Devices</div>
              <div className="flex flex-wrap gap-2">
                {selectedDevices.map((device) => (
                  <Badge key={device.id} variant="outline" className="rounded-full px-3 py-1">
                    {device.name} ({device.branch_name})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {survey.intro && (
          <Card className="rounded-2xl border-dashed bg-white/90">
            <CardContent className="pt-6 text-sm text-slate-600">{survey.intro}</CardContent>
          </Card>
        )}

        {!safeTheme || !isMultiPage ? (
          sections.map((section, sectionIndex) => (
            <Card key={section.id} className="rounded-2xl bg-white/92">
              <CardHeader>
                <CardTitle className="text-lg">{sectionIndex + 1}. {section.title || `Section ${sectionIndex + 1}`}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.questions.map((question, questionIndex) => (
                  <div key={question.id} className="rounded-2xl border p-4 space-y-4 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div style={questionStyle}>
                        {questionIndex + 1}. {question.text || "Untitled question"}
                      </div>
                      <QuestionTypePill type={question.type} />
                    </div>
                    {question.helpText && <div className="text-sm text-slate-500">{question.helpText}</div>}
                    {renderAnswerPreview(question)}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="rounded-[32px] bg-white/92 shadow-xl border border-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              {activeQuestion ? (
                <>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div>
                      <div className="text-sm text-slate-500 font-medium">Question {previewIndex + 1} of {flatQuestions.length}</div>
                      <div className="w-40 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full transition-all" style={{ width: `${((previewIndex + 1) / Math.max(flatQuestions.length, 1)) * 100}%` }} />
                      </div>
                    </div>
                    <QuestionTypePill type={activeQuestion.type} />
                  </div>

                  <div className="mb-2 text-sm text-slate-500">{activeQuestion.sectionTitle}</div>
                  <div className="mb-5 leading-snug" style={questionStyle}>
                    {activeQuestion.text || "Untitled question"}
                  </div>
                  {activeQuestion.helpText && <div className="mb-5 text-sm text-slate-500">{activeQuestion.helpText}</div>}
                  <div className="mb-8">{renderAnswerPreview(activeQuestion)}</div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      className="px-5 py-3 font-medium shadow-sm disabled:opacity-50"
                      style={navButtonStyle}
                      disabled={previewIndex === 0}
                      onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                    >
                      {safeTheme?.prev_button_text || "Previous"}
                    </button>
                    <button
                      type="button"
                      className="px-5 py-3 font-medium shadow-sm disabled:opacity-50"
                      style={navButtonStyle}
                      disabled={previewIndex >= flatQuestions.length - 1}
                      onClick={() => setPreviewIndex((prev) => Math.min(flatQuestions.length - 1, prev + 1))}
                    >
                      {safeTheme?.next_button_text || "Next"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed p-10 text-center text-slate-500">Add at least one question to preview the selected theme.</div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Thank you message: <span className="font-medium">{survey.thankYou || "Thank you for your feedback."}</span>
        </div>
      </div>
    </div>
  );
}

export default function SurveyEditPage() {
  const params = useParams();
  const surveyId = params.id;

  const [survey, setSurvey] = useState<SurveyState>({
    name: "",
    code: "",
    type: "",
    description: "",
    intro: "",
    thankYou: "",
    deviceIds: [],
    language: "en",
    status: "",
    anonymous: false,
    allowMultipleResponses: false,
    requireLogin: false,
    publishWeb: false,
    publishQR: false,
    publishKiosk: false,
    publishEmail: false,
    themeId: null,
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<SurveyThemeConfig | null>(null);
  const [mastersLoading, setMastersLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadPage() {
      if (!surveyId) {
        toast.error("Survey ID is missing.");
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        setMastersLoading(true);

        const [masters, surveyResult] = await Promise.all([
          fetchMasters(),
          fetchSurveyById(surveyId),
        ]);

        setDevices(masters.data.devices || []);

        const mapped = mapApiToSurveyState(surveyResult.data);
        setSurvey(mapped.survey);

        if (mapped.survey.themeId && mapped.survey.themeId > 0) {
          try {
            const themeDetails = await fetchThemeById(mapped.survey.themeId);
            setSelectedTheme(themeDetails);
          } catch (themeError: any) {
            toast.error(themeError.message || "Failed to load selected theme.");
          }
        } else {
          setSelectedTheme(null);
        }
        setSections(mapped.sections);

        if (mapped.sections.length > 0) {
          setSelectedSectionId(mapped.sections[0].id);
          setSelectedQuestionId(mapped.sections[0].questions[0]?.id || "");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load survey.");
      } finally {
        setMastersLoading(false);
        setPageLoading(false);
      }
    }

    loadPage();
  }, [surveyId]);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId) ?? sections[0],
    [sections, selectedSectionId]
  );

  const selectedQuestion = useMemo(
    () =>
      selectedSection?.questions.find((q) => q.id === selectedQuestionId) ??
      selectedSection?.questions[0],
    [selectedSection, selectedQuestionId]
  );

  const selectedDevices = useMemo(
    () => devices.filter((d) => survey.deviceIds.includes(d.id)),
    [devices, survey.deviceIds]
  );

  async function handleSaveDraft() {
    const draftSurvey: SurveyState = { ...survey, status: "draft" };
    const validation = validateSurveyForm(draftSurvey, sections);
    setErrors(validation.errors);
    if (!validation.isValid) return;

    const payload = buildSurveyPayload(draftSurvey, sections);

    try {
      setIsSaving(true);
      const token = localStorage.getItem("jwt_token") || "";
      await saveSurveyApi(payload, token);
      toast.success("Survey updated as draft successfully.");
      setTimeout(() => {
        navigate("/survey");
      }, 1000);
      setSurvey((prev) => ({ ...prev, status: "draft" }));
    } catch (error: any) {
      toast.error(error.message || "Unable to save draft.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    const publishSurvey: SurveyState = { ...survey, status: "published" };
    const validation = validateSurveyForm(publishSurvey, sections);
    setErrors(validation.errors);
    if (!validation.isValid) return;

    const payload = buildSurveyPayload(publishSurvey, sections);

    try {
      setIsSaving(true);
      const token = localStorage.getItem("jwt_token") || "";
      await saveSurveyApi(payload, token);
      toast.success("Survey updated and published successfully.");
      setTimeout(() => {
        navigate("/survey");
      }, 1000);
      setSurvey((prev) => ({ ...prev, status: "published" }));
    } catch (error: any) {
      toast.error(error.message || "Unable to publish survey.");
    } finally {
      setIsSaving(false);
    }
  }

  const updateSurvey = (key: keyof SurveyState, value: string | boolean | number[]) =>
    setSurvey((s) => ({ ...s, [key]: value }));

  const toggleDevice = (deviceId: number, checked: boolean) => {
    setSurvey((prev) => ({
      ...prev,
      deviceIds: checked
        ? [...prev.deviceIds, deviceId]
        : prev.deviceIds.filter((id) => id !== deviceId),
    }));
  };

  const addSection = () => {
    const sec: Section = {
      id: uid(),
      code: `SEC-${String(sections.length + 1).padStart(2, "0")}`,
      title: "",
      description: "",
      questions: [defaultQuestion()],
    };
    setSections((prev) => [...prev, sec]);
    setSelectedSectionId(sec.id);
    setSelectedQuestionId(sec.questions[0].id);
  };

  const addQuestion = () => {
    if (!selectedSection) return;
    const q = defaultQuestion();
    setSections((prev) =>
      prev.map((s) =>
        s.id === selectedSection.id
          ? { ...s, questions: [...s.questions, q] }
          : s
      )
    );
    setSelectedQuestionId(q.id);
  };

  const updateSection = (
    sectionId: string,
    key: keyof Section,
    value: string
  ) =>
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, [key]: value } : s))
    );

  const updateQuestion = (
    questionId: string,
    key: keyof Question,
    value: any
  ) =>
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        questions: s.questions.map((q) =>
          q.id === questionId ? { ...q, [key]: value } : q
        ),
      }))
    );

  const addOption = () => {
    if (!selectedQuestion) return;
    const next = [
      ...selectedQuestion.options,
      {
        id: uid(),
        text: "",
        value: "",
        score: selectedQuestion.options.length + 1,
      },
    ];
    updateQuestion(selectedQuestion.id, "options", next);
  };

  const updateOption = (
    optionId: string,
    key: keyof Option,
    value: string | number
  ) => {
    if (!selectedQuestion) return;
    updateQuestion(
      selectedQuestion.id,
      "options",
      selectedQuestion.options.map((op) =>
        op.id === optionId ? { ...op, [key]: value } : op
      )
    );
  };

  const removeOption = (optionId: string) => {
    if (!selectedQuestion) return;
    updateQuestion(
      selectedQuestion.id,
      "options",
      selectedQuestion.options.filter((op) => op.id !== optionId)
    );
  };

  const removeQuestion = (questionId: string) => {
    if (!selectedSection) return;
    const updatedSections = sections.map((s) =>
      s.id === selectedSection.id
        ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
        : s
    );
    setSections(updatedSections);
    const nextQuestion = updatedSections.find(
      (s) => s.id === selectedSection.id
    )?.questions[0];
    setSelectedQuestionId(nextQuestion?.id || "");
  };

  const removeSection = (sectionId: string) => {
    const updated = sections.filter((s) => s.id !== sectionId);
    setSections(updated);
    if (updated.length) {
      setSelectedSectionId(updated[0].id);
      setSelectedQuestionId(updated[0].questions[0]?.id || "");
    } else {
      setSelectedSectionId("");
      setSelectedQuestionId("");
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
        <ToastContainer />
        <div className="rounded-3xl bg-white border border-slate-200 px-8 py-6 shadow-sm inline-flex items-center gap-3 text-slate-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading survey for edit...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-4">
        <Link
          to="/survey"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Survey
        </Link>
      </div>

      <ToastContainer />
      <div className="mx-auto max-w-[1550px] space-y-6">
        <Card className="rounded-[28px] shadow-sm border-0">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <LayoutPanelTop className="h-4 w-4" /> Survey Edit Studio
                </div>
                <CardTitle className="text-3xl">Edit survey</CardTitle>
                <CardDescription className="mt-2 text-base">
                  Load an existing survey from the database, update it, and save
                  or publish again.
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" className="rounded-2xl">
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  <FileText className="mr-2 h-4 w-4" />{" "}
                  {isSaving ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  className="rounded-2xl"
                  onClick={handlePublish}
                  disabled={isSaving}
                >
                  <Send className="mr-2 h-4 w-4" />{" "}
                  {isSaving ? "Publishing..." : "Publish"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
          Editing Survey ID:{" "}
          <span className="font-semibold text-slate-900">{surveyId}</span>
        </div>

        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" /> 1. Basic Survey Info
            </CardTitle>
            <CardDescription>
              Update the survey identity and settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 xl:col-span-2">
              <Label>Survey Name</Label>
              <Input
                value={survey.name}
                onChange={(e) => updateSurvey("name", e.target.value)}
              />
              {errors.survey?.name && (
                <p className="text-sm text-red-600">{errors.survey.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Survey Code</Label>
              <Input
                readOnly={!!survey.id}
                value={survey.code}
                onChange={(e) => updateSurvey("code", e.target.value)}
              />
              {errors.survey?.code && (
                <p className="text-sm text-red-600">{errors.survey.code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Survey Type</Label>
              <Select
                value={survey.type}
                onValueChange={(v: any) => updateSurvey("type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select survey type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nps">NPS</SelectItem>
                  <SelectItem value="csat">CSAT</SelectItem>
                  <SelectItem value="ces">CES</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.survey?.type && (
                <p className="text-sm text-red-600">{errors.survey.type}</p>
              )}
            </div>

            <div className="space-y-2 xl:col-span-4">
              <Label>Description</Label>
              <Textarea
                value={survey.description}
                onChange={(e) => updateSurvey("description", e.target.value)}
              />
            </div>

            <div className="space-y-2 xl:col-span-4">
              <Label className="inline-flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4" />
                Devices
              </Label>
              <div className="rounded-2xl border bg-white p-4">
                <div className="text-sm text-slate-500 mb-3">
                  Select one or more devices. Display format: Device Name (Branch Name)
                </div>

                {selectedDevices.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedDevices.map((device) => (
                      <Badge key={device.id} variant="outline" className="rounded-full px-3 py-1">
                        {device.name} ({device.branch_name})
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="max-h-60 overflow-auto space-y-3 pr-2">
                  {mastersLoading ? (
                    <div className="text-sm text-slate-500">Loading devices...</div>
                  ) : devices.length === 0 ? (
                    <div className="text-sm text-slate-500">No devices found.</div>
                  ) : (
                    devices.map((device) => (
                      <label
                        key={device.id}
                        className="rounded-2xl border p-3 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-medium text-slate-900">
                            {device.name} <span className="text-slate-500">({device.branch_name})</span>
                          </div>
                        </div>
                        <Checkbox
                          checked={survey.deviceIds.includes(device.id)}
                          onCheckedChange={(checked) => toggleDevice(device.id, !!checked)}
                        />
                      </label>
                    ))
                  )}
                </div>
              </div>
              {errors.survey?.devices && (
                <p className="text-sm text-red-600">{errors.survey.devices}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={survey.startDate}
                onChange={(e) => updateSurvey("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={survey.endDate}
                onChange={(e) => updateSurvey("endDate", e.target.value)}
              />
              {errors.survey?.endDate && (
                <p className="text-sm text-red-600">{errors.survey.endDate}</p>
              )}
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label>Intro Message</Label>
              <Textarea
                value={survey.intro}
                onChange={(e) => updateSurvey("intro", e.target.value)}
              />
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label>Thank You Message</Label>
              <Textarea
                value={survey.thankYou}
                onChange={(e) => updateSurvey("thankYou", e.target.value)}
              />
            </div>

            <div className="rounded-2xl border p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">Anonymous</div>
                <div className="text-sm text-slate-500">
                  Allow anonymous responses
                </div>
              </div>
              <Switch
                checked={survey.anonymous}
                onCheckedChange={(v) => updateSurvey("anonymous", v)}
              />
            </div>

            <div className="rounded-2xl border p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">Multiple Responses</div>
                <div className="text-sm text-slate-500">
                  Allow the same person to answer again
                </div>
              </div>
              <Switch
                checked={survey.allowMultipleResponses}
                onCheckedChange={(v) =>
                  updateSurvey("allowMultipleResponses", v)
                }
              />
            </div>

            <div className="rounded-2xl border p-4 flex items-center justify-between xl:col-span-2">
              <div>
                <div className="font-medium">Require Login</div>
                <div className="text-sm text-slate-500">
                  Restrict this survey to logged-in users only
                </div>
              </div>
              <Switch
                checked={survey.requireLogin}
                onCheckedChange={(v) => updateSurvey("requireLogin", v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" /> 2. Edit Survey
                </CardTitle>
                <CardDescription>
                  Modify sections, questions, options, and preview without
                  leaving the page.
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" className="rounded-xl" onClick={addSection}>
                  <Plus className="mr-1 h-4 w-4" /> Add Section
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={addQuestion}
                  disabled={!selectedSection}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Question
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="builder" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-2xl">
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="builder" className="mt-6">
                <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                  <Card className="rounded-3xl border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Sections</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sections.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                          No sections available.
                        </div>
                      ) : null}

                      {sections.map((section, i) => (
                        <div
                          key={section.id}
                          className={`rounded-2xl border p-3 ${
                            selectedSectionId === section.id
                              ? "border-slate-900 bg-slate-50"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <GripVertical className="mt-1 h-4 w-4 text-slate-400" />
                            <button
                              className="flex-1 text-left"
                              onClick={() => {
                                setSelectedSectionId(section.id);
                                setSelectedQuestionId(
                                  section.questions[0]?.id || ""
                                );
                              }}
                            >
                              <div className="font-medium">
                                {i + 1}. {section.title || `Section ${i + 1}`}
                              </div>
                              <div className="text-sm text-slate-500">
                                {section.questions.length} questions
                              </div>
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSection(section.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="rounded-3xl border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Section Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Section Title</Label>
                          <Input
                            value={selectedSection?.title || ""}
                            onChange={(e) =>
                              selectedSection &&
                              updateSection(
                                selectedSection.id,
                                "title",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Section Code</Label>
                          <Input
                            value={selectedSection?.code || ""}
                            onChange={(e) =>
                              selectedSection &&
                              updateSection(
                                selectedSection.id,
                                "code",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Description</Label>
                          <Textarea
                            value={selectedSection?.description || ""}
                            onChange={(e) =>
                              selectedSection &&
                              updateSection(
                                selectedSection.id,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Question Editor
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {errors.survey?.sections && (
                          <div className="text-sm text-red-600">
                            {errors.survey.sections}
                          </div>
                        )}
                        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
                          <div className="space-y-3">
                            <div className="font-medium">Questions</div>
                            <ScrollArea className="pr-3">
                              <div className="space-y-3">
                                {selectedSection?.questions.map((q, i) => (
                                  <div
                                    key={q.id}
                                    className={`rounded-2xl border p-3 ${
                                      selectedQuestionId === q.id
                                        ? "border-slate-900 bg-slate-50"
                                        : "bg-white"
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <GripVertical className="mt-1 h-4 w-4 text-slate-400" />
                                      <button
                                        className="flex-1 text-left"
                                        onClick={() =>
                                          setSelectedQuestionId(q.id)
                                        }
                                      >
                                        <div className="font-medium line-clamp-2">
                                          {i + 1}.{" "}
                                          {q.text || "Untitled question"}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                          <QuestionTypePill type={q.type} />
                                          {q.required && (
                                            <Badge
                                              variant="outline"
                                              className="rounded-full"
                                            >
                                              Required
                                            </Badge>
                                          )}
                                        </div>
                                      </button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeQuestion(q.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>

                          <div className="space-y-5">
                            {selectedQuestion ? (
                              <>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2 md:col-span-2">
                                    <Label>Question Text</Label>
                                    <Textarea
                                      value={selectedQuestion.text}
                                      onChange={(e) =>
                                        updateQuestion(
                                          selectedQuestion.id,
                                          "text",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Question Code</Label>
                                    <Input
                                      value={selectedQuestion.code}
                                      onChange={(e) =>
                                        updateQuestion(
                                          selectedQuestion.id,
                                          "code",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Question Type</Label>
                                    <Select
                                      value={selectedQuestion.type}
                                      onValueChange={(v) =>
                                        updateQuestion(
                                          selectedQuestion.id,
                                          "type",
                                          v as QuestionType
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="nps_0_10">
                                          NPS 0-10
                                        </SelectItem>
                                        <SelectItem value="csat_1_5">
                                          CSAT 1-5
                                        </SelectItem>
                                        <SelectItem value="ces_1_5">
                                          CES 1-5
                                        </SelectItem>
                                        <SelectItem value="emoji">
                                          Emoji
                                        </SelectItem>
                                        <SelectItem value="yes_no">
                                          Yes / No
                                        </SelectItem>
                                        <SelectItem value="single_choice">
                                          Single Choice
                                        </SelectItem>
                                        <SelectItem value="multi_choice">
                                          Multiple Choice
                                        </SelectItem>
                                        <SelectItem value="text">
                                          Text
                                        </SelectItem>
                                        <SelectItem value="textarea">
                                          Textarea
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <Label>Help Text</Label>
                                    <Input
                                      value={selectedQuestion.helpText}
                                      onChange={(e) =>
                                        updateQuestion(
                                          selectedQuestion.id,
                                          "helpText",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <Label>Placeholder</Label>
                                    <Input
                                      value={selectedQuestion.placeholder}
                                      onChange={(e) =>
                                        updateQuestion(
                                          selectedQuestion.id,
                                          "placeholder",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                  <div className="rounded-2xl border p-4 flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">
                                        Required
                                      </div>
                                      <div className="text-sm text-slate-500">
                                        Respondent must answer this question
                                      </div>
                                    </div>
                                    <Switch
                                      checked={selectedQuestion.required}
                                      onCheckedChange={(v) =>
                                        updateQuestion(
                                          selectedQuestion.id,
                                          "required",
                                          v
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="rounded-2xl border p-4 flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">
                                        Scoring Enabled
                                      </div>
                                      <div className="text-sm text-slate-500">
                                        Use this question in score calculations
                                      </div>
                                    </div>
                                    <Switch
                                      checked={selectedQuestion.scoringEnabled}
                                      onCheckedChange={(v) =>
                                        updateQuestion(
                                          selectedQuestion.id,
                                          "scoringEnabled",
                                          v
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                {(
                                  ["single_choice", "multi_choice"] as QuestionType[]
                                ).includes(selectedQuestion.type) && (
                                  <Card className="rounded-3xl bg-slate-50 border-dashed">
                                    <CardHeader>
                                      <div className="flex items-center justify-between gap-3">
                                        <CardTitle className="text-base">
                                          Answer Options
                                        </CardTitle>
                                        <Button
                                          size="sm"
                                          className="rounded-xl"
                                          onClick={addOption}
                                        >
                                          <Plus className="mr-2 h-4 w-4" /> Add
                                          Option
                                        </Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      {selectedQuestion.options.map((op) => (
                                        <div
                                          key={op.id}
                                          className="grid gap-3 rounded-2xl border bg-white p-3 md:grid-cols-[1fr_1fr_110px_50px]"
                                        >
                                          <Input
                                            value={op.text}
                                            onChange={(e) =>
                                              updateOption(
                                                op.id,
                                                "text",
                                                e.target.value
                                              )
                                            }
                                            placeholder="Option text"
                                          />
                                          <Input
                                            value={op.value}
                                            onChange={(e) =>
                                              updateOption(
                                                op.id,
                                                "value",
                                                e.target.value
                                              )
                                            }
                                            placeholder="Option value"
                                          />
                                          <Input
                                            type="number"
                                            value={op.score ?? 0}
                                            onChange={(e) =>
                                              updateOption(
                                                op.id,
                                                "score",
                                                Number(e.target.value)
                                              )
                                            }
                                            placeholder="Score"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeOption(op.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            ) : (
                              <div className="rounded-3xl border border-dashed p-10 text-center text-slate-500">
                                Select or add a question to begin editing.
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <SurveyPreview survey={survey} sections={sections} devices={devices} theme={selectedTheme} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
}
