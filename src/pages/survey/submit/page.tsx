import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, ChevronLeft, ChevronRight, Upload, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

type ThemeData = {
  id: number | null;
  theme_name: string;
  layout_mode: "single_page" | "multi_page";
  background_type: "color" | "image";
  background_color: string;
  background_image_url: string;
  background_size: string;
  background_position: string;
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
  choice_button_bg_image_url: string;
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
  smiley_size: number;
  smiley_mode: "default" | "custom";
  smiley3_urls: string[];
  smiley5_urls: string[];
};

type OptionItem = {
  id: number;
  option_text: string;
  option_value: string;
  option_score: number | null;
  sort_order: number;
};

type QuestionItem = {
  id: number;
  question_code: string;
  question_text: string;
  question_type: QuestionType;
  help_text: string;
  placeholder_text: string;
  is_required: number;
  scoring_enabled: number;
  options: OptionItem[];
};

type SectionItem = {
  id: number;
  section_code: string;
  section_title: string;
  section_description: string;
  sort_order: number;
  questions: QuestionItem[];
};

type SurveyPayload = {
  survey: {
    id: number;
    survey_name: string;
    survey_code: string;
    survey_type: string;
    description: string;
    intro_message: string;
    thank_you_message: string;
    start_date: string | null;
    end_date: string | null;
  };
  theme: ThemeData;
  sections: SectionItem[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: SurveyPayload;
};

type AnswerMap = Record<string, string | string[] | File | null>;

const API_BASE = `${import.meta.env.VITE_SURVEY_API_URL}api/`;
const GET_SURVEY_API_URL = `${API_BASE}get_device_survey.php`;
const SUBMIT_SURVEY_API_URL = `${API_BASE}submit_survey_response.php`;

const defaultTheme: ThemeData = {
  id: null,
  theme_name: "Default Theme",
  layout_mode: "single_page",
  background_type: "color",
  background_color: "#f8fafc",
  background_image_url: "",
  background_size: "cover",
  background_position: "center",
  question_font_family: "Inter",
  question_font_weight: "700",
  question_font_size: 26,
  question_font_color: "#0f172a",
  answer_font_family: "Inter",
  answer_font_weight: "500",
  answer_font_size: 16,
  answer_font_color: "#0f172a",
  choice_button_bg_type: "color",
  choice_button_bg_color: "#ffffff",
  choice_button_bg_image_url: "",
  choice_button_text_color: "#0f172a",
  choice_button_border_color: "#cbd5e1",
  choice_button_radius: 16,
  choice_button_padding_y: 16,
  choice_button_padding_x: 16,
  choice_button_gap: 12,
  nav_button_bg_color: "#0f172a",
  nav_button_text_color: "#ffffff",
  nav_button_radius: 14,
  nav_button_font_size: 15,
  next_button_text: "Next",
  prev_button_text: "Previous",
  smiley_size: 48,
  smiley_mode: "default",
  smiley3_urls: [],
  smiley5_urls: [],
};

const defaultSmiley3 = ["😞", "😐", "😊"];
const defaultSmiley5 = ["😡", "😕", "😐", "🙂", "😍"];

function flattenQuestions(sections: SectionItem[]): QuestionItem[] {
  return sections
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((section) => section.questions);
}

export default function SurveySubmissionPage() {
  const { deviceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [payload, setPayload] = useState<SurveyPayload | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  useEffect(() => {
    async function loadSurvey() {
      if (!deviceId) {
        setErrorMessage("Device ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${GET_SURVEY_API_URL}?device_id=${encodeURIComponent(deviceId)}`);
        const data: ApiResponse = await response.json();
        if (!response.ok || !data.success || !data.data) throw new Error(data.message || "Unable to load survey.");
        setPayload({ ...data.data, theme: { ...defaultTheme, ...(data.data.theme || {}) } });
      } catch (error: any) {
        setErrorMessage(error.message || "Unable to load survey.");
      } finally {
        setLoading(false);
      }
    }
    loadSurvey();
  }, [deviceId]);

  const questions = useMemo(() => flattenQuestions(payload?.sections || []), [payload]);
  const theme = payload?.theme || defaultTheme;
  const currentQuestion = questions[currentIndex];

  const backgroundStyle = useMemo(() => {
    if (theme.background_type === "image" && theme.background_image_url) {
      return {
        backgroundImage: `url(${theme.background_image_url})`,
        backgroundSize: theme.background_size || "cover",
        backgroundPosition: theme.background_position || "center",
        backgroundRepeat: "no-repeat",
      };
    }
    return { background: theme.background_color || "#f8fafc" };
  }, [theme]);

  const questionStyle = {
    fontFamily: theme.question_font_family,
    fontWeight: theme.question_font_weight,
    fontSize: `${theme.question_font_size}px`,
    color: theme.question_font_color,
  } as const;

  const answerStyle = {
    fontFamily: theme.answer_font_family,
    fontWeight: theme.answer_font_weight,
    fontSize: `${theme.answer_font_size}px`,
    color: theme.answer_font_color,
  } as const;

  const choiceButtonStyle = {
    ...answerStyle,
    background:
      theme.choice_button_bg_type === "image" && theme.choice_button_bg_image_url
        ? `url(${theme.choice_button_bg_image_url}) center/cover no-repeat`
        : theme.choice_button_bg_color,
    borderColor: theme.choice_button_border_color,
    borderRadius: `${theme.choice_button_radius}px`,
    padding: `${theme.choice_button_padding_y}px ${theme.choice_button_padding_x}px`,
  } as const;

  const navButtonStyle = {
    background: theme.nav_button_bg_color,
    color: theme.nav_button_text_color,
    borderRadius: `${theme.nav_button_radius}px`,
    fontSize: `${theme.nav_button_font_size}px`,
  } as const;

  function setAnswer(questionId: number, value: string | string[] | File | null) {
    setAnswers((prev) => ({ ...prev, [String(questionId)]: value }));
  }

  function toggleMultiChoice(questionId: number, optionValue: string, checked: boolean) {
    const key = String(questionId);
    const current = Array.isArray(answers[key]) ? [...(answers[key] as string[])] : [];
    const next = checked ? [...current, optionValue] : current.filter((x) => x !== optionValue);
    setAnswer(questionId, next);
  }

  function validateQuestion(question: QuestionItem): string | null {
    if (!question || !question.is_required) return null;
    const value = answers[String(question.id)];
    if (question.question_type === "file_upload") return value instanceof File ? null : "Please upload a file.";
    if (Array.isArray(value)) return value.length > 0 ? null : "Please choose at least one option.";
    return value ? null : "Please answer this question.";
  }

  async function handleSubmit() {
    if (!payload || !deviceId) return;
    for (const question of questions) {
      const error = validateQuestion(question);
      if (error) {
        setErrorMessage(error);
        const index = questions.findIndex((x) => x.id === question.id);
        if (index >= 0) setCurrentIndex(index);
        return;
      }
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      const formData = new FormData();
      formData.append("device_id", String(deviceId));
      formData.append("survey_id", String(payload.survey.id));
      const serializableAnswers = questions.map((question) => {
        const value = answers[String(question.id)];
        if (value instanceof File) {
          formData.append(`file_${question.id}`, value);
          return {
            question_id: question.id,
            question_type: question.question_type,
            value: null,
            file_field: `file_${question.id}`,
          };
        }
        return {
          question_id: question.id,
          question_type: question.question_type,
          value: value ?? null,
          file_field: null,
        };
      });
      formData.append("answers", JSON.stringify(serializableAnswers));
      const response = await fetch(SUBMIT_SURVEY_API_URL, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to submit survey.");
      setSubmitted(true);
    } catch (error: any) {
      setErrorMessage(error.message || "Unable to submit survey.");
    } finally {
      setSubmitting(false);
    }
  }

  function renderMetricButtons(question: QuestionItem, labels: string[]) {
    const value = String(answers[String(question.id)] || "");
    return (
      <div className={`grid gap-2 ${labels.length === 11 ? "grid-cols-6 sm:grid-cols-11" : "grid-cols-5"}`}>
        {labels.map((label) => (
          <button
            type="button"
            key={label}
            className={`border shadow-sm min-h-[56px] ${value === label ? "ring-2 ring-slate-900" : ""}`}
            style={{ ...choiceButtonStyle, padding: "0", borderRadius: `${Math.max(10, theme.choice_button_radius - 4)}px` }}
            onClick={() => setAnswer(question.id, label)}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  function renderSmileys(question: QuestionItem, count: 3 | 5) {
    const selected = String(answers[String(question.id)] || "");
    const defaults = count === 3 ? defaultSmiley3 : defaultSmiley5;
    const customUrls = count === 3 ? theme.smiley3_urls : theme.smiley5_urls;
    const items = theme.smiley_mode === "custom" && customUrls.length ? customUrls.map((item, index) => item || defaults[index]) : defaults;
    return (
      <div className={`grid gap-3 ${count === 3 ? "grid-cols-3" : "grid-cols-5"}`}>
        {items.map((item, index) => {
          const value = String(index + 1);
          return (
            <button
              type="button"
              key={value}
              className={`aspect-square border shadow-sm ${selected === value ? "ring-2 ring-slate-900" : ""}`}
              style={{ ...choiceButtonStyle, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
              onClick={() => setAnswer(question.id, value)}
            >
              {item && item.startsWith("http") ? (
                <img
                  src={item}
                  alt={`Smiley ${value}`}
                  style={{ width: `${theme.smiley_size}px`, height: `${theme.smiley_size}px`, objectFit: "contain" }}
                />
              ) : (
                <span style={{ fontSize: `${theme.smiley_size}px`, lineHeight: 1 }}>{item}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  function renderChoiceButtons(question: QuestionItem) {
    const gapStyle = { gap: `${theme.choice_button_gap}px` };
    if (question.question_type === "yes_no") {
      return (
        <div className="grid grid-cols-2" style={gapStyle}>
          {['Yes', 'No'].map((label) => (
            <button
              type="button"
              key={label}
              className={`w-full border text-left shadow-sm transition hover:scale-[1.01] ${answers[String(question.id)] === label ? "ring-2 ring-slate-900" : ""}`}
              style={choiceButtonStyle}
              onClick={() => setAnswer(question.id, label)}
            >
              {label}
            </button>
          ))}
        </div>
      );
    }

    if (question.question_type === "single_choice") {
      return (
        <div className="grid" style={gapStyle}>
          {question.options.map((option) => (
            <button
              type="button"
              key={option.id}
              className={`w-full border text-left shadow-sm transition hover:scale-[1.01] ${answers[String(question.id)] === option.option_value ? "ring-2 ring-slate-900" : ""}`}
              style={choiceButtonStyle}
              onClick={() => setAnswer(question.id, option.option_value)}
            >
              {option.option_text}
            </button>
          ))}
        </div>
      );
    }

    if (question.question_type === "multi_choice") {
      const selected = Array.isArray(answers[String(question.id)]) ? (answers[String(question.id)] as string[]) : [];
      return (
        <div className="grid" style={gapStyle}>
          {question.options.map((option) => {
            const checked = selected.includes(option.option_value);
            return (
              <label
                key={option.id}
                className={`w-full border shadow-sm transition hover:scale-[1.01] flex items-center justify-between cursor-pointer ${checked ? "ring-2 ring-slate-900" : ""}`}
                style={choiceButtonStyle}
              >
                <span>{option.option_text}</span>
                <Checkbox checked={checked} onCheckedChange={(value) => toggleMultiChoice(question.id, option.option_value, !!value)} />
              </label>
            );
          })}
        </div>
      );
    }

    return null;
  }

  function renderQuestion(question: QuestionItem, index: number) {
    return (
      <Card key={question.id} className="rounded-3xl bg-white/92 border border-white/70 shadow-sm backdrop-blur-sm">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div style={questionStyle} className="leading-snug">
            {index + 1}. {question.question_text}
          </div>
          {question.help_text ? <div className="text-sm text-slate-500">{question.help_text}</div> : null}
          {question.question_type === "nps_0_10" && renderMetricButtons(question, ["0","1","2","3","4","5","6","7","8","9","10"])}
          {question.question_type === "csat_1_5" && renderMetricButtons(question, ["1","2","3","4","5"])}
          {question.question_type === "ces_1_5" && renderMetricButtons(question, ["1","2","3","4","5"])}
          {question.question_type === "smiley_3" && renderSmileys(question, 3)}
          {question.question_type === "smiley_5" && renderSmileys(question, 5)}
          {(["yes_no", "single_choice", "multi_choice"] as string[]).includes(question.question_type) && renderChoiceButtons(question)}
          {question.question_type === "text" && (
            <Input
              value={String(answers[String(question.id)] || "")}
              onChange={(e) => setAnswer(question.id, e.target.value)}
              placeholder={question.placeholder_text || "Type your answer here"}
              style={answerStyle}
              className="h-14 rounded-2xl bg-white"
            />
          )}
          {question.question_type === "textarea" && (
            <Textarea
              value={String(answers[String(question.id)] || "")}
              onChange={(e) => setAnswer(question.id, e.target.value)}
              placeholder={question.placeholder_text || "Write your feedback here"}
              style={answerStyle}
              className="min-h-[140px] rounded-2xl bg-white"
            />
          )}
          {question.question_type === "date" && (
            <Input
              type="date"
              value={String(answers[String(question.id)] || "")}
              onChange={(e) => setAnswer(question.id, e.target.value)}
              style={answerStyle}
              className="h-14 rounded-2xl bg-white"
            />
          )}
          {question.question_type === "file_upload" && (
            <label className="rounded-2xl border-2 border-dashed bg-white px-4 py-8 text-center block cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-7 w-7 text-slate-500" />
                <div style={answerStyle}>
                  {(answers[String(question.id)] instanceof File && (answers[String(question.id)] as File).name) || "Choose file / Upload file"}
                </div>
                <div className="text-sm text-slate-500">Supported file upload</div>
              </div>
              <input type="file" className="hidden" onChange={(e) => setAnswer(question.id, e.target.files?.[0] || null)} />
            </label>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 flex items-center justify-center">
        <div className="rounded-3xl bg-white border border-slate-200 px-8 py-6 shadow-sm inline-flex items-center gap-3 text-slate-700">
          <Loader2 className="h-5 w-5 animate-spin" />Loading survey...
        </div>
      </div>
    );

  if (errorMessage && !payload)
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 flex items-center justify-center">
        <div className="max-w-xl rounded-3xl bg-white border border-slate-200 px-8 py-8 shadow-sm text-center">
          <div className="text-2xl font-semibold text-slate-900">Survey unavailable</div>
          <div className="text-slate-600 mt-3">{errorMessage}</div>
        </div>
      </div>
    );

  if (!payload) return null;

  if (submitted)
    return (
      <div className="min-h-screen px-4 py-8 sm:py-10" style={backgroundStyle}>
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-[32px] border-white/70 bg-white/92 shadow-xl backdrop-blur-sm">
            <CardContent className="p-8 sm:p-10 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
              <div className="text-3xl font-semibold text-slate-900 mt-5">Thank you</div>
              <div className="text-slate-600 mt-3">{payload.survey.thank_you_message || "Thank you for your feedback."}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );

  const progressValue = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen px-3 py-4 sm:px-4 sm:py-8" style={backgroundStyle}>
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] border border-white/70 bg-white/80 shadow-lg backdrop-blur-sm overflow-hidden">
          <div className="bg-slate-950 text-white px-5 py-6 sm:px-8">
            <div className="text-2xl sm:text-3xl font-semibold">{payload.survey.survey_name}</div>
            <div className="text-sm sm:text-base text-slate-300 mt-2">{payload.survey.description || "Please share your feedback below."}</div>
          </div>
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {payload.survey.intro_message ? (
              <Card className="rounded-3xl border-dashed">
                <CardContent className="p-5 text-slate-600">{payload.survey.intro_message}</CardContent>
              </Card>
            ) : null}

            {theme.layout_mode === "multi_page" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-slate-600">Question {currentIndex + 1} of {questions.length}</div>
                  <div className="w-40 sm:w-56">
                    <Progress value={progressValue} />
                  </div>
                </div>
                {currentQuestion ? renderQuestion(currentQuestion, currentIndex) : null}
                {errorMessage ? <div className="text-sm text-red-600">{errorMessage}</div> : null}
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => {
                      setErrorMessage("");
                      setCurrentIndex((prev) => Math.max(0, prev - 1));
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 font-medium shadow-sm disabled:opacity-50"
                    style={navButtonStyle}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {theme.prev_button_text || "Previous"}
                  </button>
                  {currentIndex === questions.length - 1 ? (
                    <Button type="button" disabled={submitting} onClick={handleSubmit} className="px-6 py-3" style={navButtonStyle}>
                      {submitting ? "Submitting..." : "Submit Survey"}
                    </Button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const error = currentQuestion ? validateQuestion(currentQuestion) : null;
                        if (error) {
                          setErrorMessage(error);
                          return;
                        }
                        setErrorMessage("");
                        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 font-medium shadow-sm"
                      style={navButtonStyle}
                    >
                      {theme.next_button_text || "Next"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => renderQuestion(question, index))}
                {errorMessage ? <div className="text-sm text-red-600">{errorMessage}</div> : null}
                <div className="flex justify-end">
                  <Button type="button" disabled={submitting} onClick={handleSubmit} className="px-6 py-3" style={navButtonStyle}>
                    {submitting ? "Submitting..." : "Submit Survey"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
