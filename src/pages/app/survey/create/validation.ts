import { useState } from "react";

export type QuestionType =
  | "nps_0_10"
  | "csat_1_5"
  | "ces_1_5"
  | "emoji"
  | "yes_no"
  | "single_choice"
  | "multi_choice"
  | "text"
  | "textarea";

export type Option = {
  id?: number | string;
  text: string;
  value: string;
  score?: number | null;
};

export type Question = {
  id?: number | string;
  code: string;
  text: string;
  type: QuestionType;
  required: boolean;
  helpText: string;
  placeholder: string;
  scoringEnabled: boolean;
  options: Option[];
};

export type Section = {
  id?: number | string;
  code: string;
  title: string;
  description: string;
  questions: Question[];
};

export type SurveyState = {
  id?: number;
  name: string;
  code: string;
  type: "nps" | "csat" | "ces" | "custom";
  description: string;
  intro: string;
  thankYou: string;
  branch: string;
  department: string;
  language: string;
  status: "draft" | "published" | "paused";
  anonymous: boolean;
  allowMultipleResponses: boolean;
  requireLogin: boolean;
  publishWeb: boolean;
  publishQR: boolean;
  publishKiosk: boolean;
  publishEmail: boolean;
  startDate: string;
  endDate: string;
};

export type SaveSurveyPayload = {
  survey: {
    id?: number;
    survey_name: string;
    survey_code: string;
    survey_type: "nps" | "csat" | "ces" | "custom";
    description: string;
    intro_message: string;
    thank_you_message: string;
    branch_name: string;
    department_name: string;
    language_code: string;
    status: "draft" | "published" | "paused";
    is_anonymous: boolean;
    allow_multiple_responses: boolean;
    require_login: boolean;
    start_date: string | null;
    end_date: string | null;
  };
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

export type ValidationErrors = {
  survey?: Record<string, string>;
  sections?: Array<{
    section?: Record<string, string>;
    questions?: Array<{
      question?: Record<string, string>;
      options?: Array<Record<string, string>>;
    }>;
  }>;
};

export function isChoiceType(type: string) {
  return type === "single_choice" || type === "multi_choice";
}

export function validateSurveyForm(
  survey: SurveyState,
  sections: Section[]
): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {
    survey: {},
    sections: [],
  };

  if (!survey.name?.trim()) {
    errors.survey!.name = "Survey name is required.";
  }

  if (!survey.code?.trim()) {
    errors.survey!.code = "Survey code is required.";
  }

  if (!survey.type?.trim()) {
    errors.survey!.type = "Survey type is required.";
  }

  if (survey.startDate && survey.endDate && survey.endDate < survey.startDate) {
    errors.survey!.endDate = "End date cannot be before start date.";
  }

  const hasPublishChannel =
    survey.publishWeb || survey.publishQR || survey.publishKiosk || survey.publishEmail;

  if (survey.status === "published" && !hasPublishChannel) {
    errors.survey!.publish = "At least one publish channel must be enabled.";
  }

  if (!sections || sections.length === 0) {
    errors.survey!.sections = "At least one section is required.";
  }

  sections.forEach((section) => {
    const sectionError: {
      section: Record<string, string>;
      questions: Array<{
        question: Record<string, string>;
        options: Array<Record<string, string>>;
      }>;
    } = {
      section: {},
      questions: [],
    };

    if (!section.title?.trim()) {
      sectionError.section.title = "Section title is required.";
    }

    if (!section.code?.trim()) {
      sectionError.section.code = "Section code is required.";
    }

    if (!section.questions || section.questions.length === 0) {
      sectionError.section.questions = "At least one question is required in each section.";
    }

    section.questions?.forEach((question) => {
      const questionError: {
        question: Record<string, string>;
        options: Array<Record<string, string>>;
      } = {
        question: {},
        options: [],
      };

      if (!question.text?.trim()) {
        questionError.question.text = "Question text is required.";
      }

      if (!question.code?.trim()) {
        questionError.question.code = "Question code is required.";
      }

      if (!question.type?.trim()) {
        questionError.question.type = "Question type is required.";
      }

      if (isChoiceType(question.type)) {
        if (!question.options || question.options.length < 2) {
          questionError.question.options = "At least 2 options are required.";
        }

        question.options?.forEach((option) => {
          const optionError: Record<string, string> = {};

          if (!option.text?.trim()) {
            optionError.text = "Option text is required.";
          }

          if (!option.value?.trim()) {
            optionError.value = "Option value is required.";
          }

          questionError.options.push(optionError);
        });
      }

      sectionError.questions.push(questionError);
    });

    errors.sections!.push(sectionError);
  });

  const hasSurveyErrors = Object.keys(errors.survey || {}).length > 0;

  const hasSectionErrors = (errors.sections || []).some((sectionErr) => {
    const hasSectionLevel = Object.keys(sectionErr.section || {}).length > 0;
    const hasQuestionLevel = (sectionErr.questions || []).some((qErr) => {
      const hasQ = Object.keys(qErr.question || {}).length > 0;
      const hasOptions = (qErr.options || []).some(
        (optErr: Record<string, string>) => Object.keys(optErr || {}).length > 0
      );
      return hasQ || hasOptions;
    });
    return hasSectionLevel || hasQuestionLevel;
  });

  return {
    isValid: !hasSurveyErrors && !hasSectionErrors,
    errors,
  };
}

export function buildSurveyPayload(
  survey: SurveyState,
  sections: Section[]
): SaveSurveyPayload {
  return {
    survey: {
      id: survey.id,
      survey_name: survey.name?.trim() || "",
      survey_code: survey.code?.trim() || "",
      survey_type: survey.type,
      description: survey.description?.trim() || "",
      intro_message: survey.intro?.trim() || "",
      thank_you_message: survey.thankYou?.trim() || "",
      branch_name: survey.branch || "",
      department_name: survey.department || "",
      language_code: survey.language || "en",
      status: survey.status || "draft",
      is_anonymous: !!survey.anonymous,
      allow_multiple_responses: !!survey.allowMultipleResponses,
      require_login: !!survey.requireLogin,
      start_date: survey.startDate || null,
      end_date: survey.endDate || null,
    },
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
      public_link: survey.code ? `https://survey.local/${survey.code.toLowerCase()}` : "",
      qr_code_path: "",
    },
  };
}

export async function saveSurveyApi(
  payload: SaveSurveyPayload,
  token: string
): Promise<any> {
  const response = await fetch("/api/surveys/save.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save survey.");
  }

  return data;
}

export function useSurveySaveHandlers(
  survey: SurveyState,
  setSurvey: React.Dispatch<React.SetStateAction<SurveyState>>,
  sections: Section[]
) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveDraft() {
    const draftSurvey: SurveyState = { ...survey, status: "draft" };
    const validation = validateSurveyForm(draftSurvey, sections);

    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    const payload = buildSurveyPayload(draftSurvey, sections);

    try {
      setIsSaving(true);

      const token = localStorage.getItem("jwt_token") || "";
      const result = await saveSurveyApi(payload, token);

      console.log("Draft saved:", result);
      alert("Survey draft saved successfully.");

      setSurvey((prev) => ({ ...prev, status: "draft" }));
    } catch (error: any) {
      alert(error.message || "Unable to save draft.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    const publishSurvey: SurveyState = { ...survey, status: "published" };
    const validation = validateSurveyForm(publishSurvey, sections);

    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    const payload = buildSurveyPayload(publishSurvey, sections);

    try {
      setIsSaving(true);

      const token = localStorage.getItem("jwt_token") || "";
      const result = await saveSurveyApi(payload, token);

      console.log("Survey published:", result);
      alert("Survey published successfully.");

      setSurvey((prev) => ({ ...prev, status: "published" }));
    } catch (error: any) {
      alert(error.message || "Unable to publish survey.");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    errors,
    setErrors,
    isSaving,
    handleSaveDraft,
    handlePublish,
  };
}
