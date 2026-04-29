import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, GripVertical, ArrowLeft, Eye, Send, Globe, Settings2, FileText, Link2, CheckCircle2, LayoutPanelTop, Wand2 } from "lucide-react";

type QuestionType =
  | "nps_0_10"
  | "csat_1_5"
  | "ces_1_5"
  | "emoji"
  | "yes_no"
  | "single_choice"
  | "multi_choice"
  | "text"
  | "textarea";

type Option = { id: string; text: string; value: string; score?: number };
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
type Section = { id: string; code: string; title: string; description: string; questions: Question[] };

type SurveyState = {
  id?: number;
  name: string;
  code: string;
  type: "" | "nps" | "csat" | "ces" | "custom";
  description: string;
  intro: string;
  thankYou: string;
  branch: string;
  department: string;
  language: string;
  status: "" | "draft" | "published" | "paused";
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

type MasterItem = {
  id: number;
  name: string;
};

type MasterApiResponse = {
  success: boolean;
  message?: string;
  data: {
    branches: MasterItem[];
    departments: MasterItem[];
  };
};

const uid = () => Math.random().toString(36).slice(2, 9);

const defaultQuestion = (): Question => ({
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
});

const MASTER_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/get_masters.php`;
const SAVE_SURVEY_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/save.php`;

type SaveSurveyPayload = {
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

function isChoiceType(type: string) {
  return type === "single_choice" || type === "multi_choice";
}

function validateSurveyForm(
  survey: SurveyState,
  sections: Section[]
): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {
    survey: {},
    sections: [],
  };

  if (!survey.name?.trim()) errors.survey!.name = "Survey name is required.";
  if (!survey.code?.trim()) errors.survey!.code = "Survey code is required.";
  if (!survey.type?.trim()) errors.survey!.type = "Survey type is required.";
  if (!survey.branch?.trim()) errors.survey!.branch = "Branch is required.";
  if (!survey.department?.trim()) errors.survey!.department = "Department is required.";

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

    if (!section.title?.trim()) sectionError.section.title = "Section title is required.";
    if (!section.code?.trim()) sectionError.section.code = "Section code is required.";
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
      branch_name: survey.branch || "",
      department_name: survey.department || "",
      language_code: survey.language || "en",
      status: (survey.status || "draft") as "draft" | "published" | "paused",
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

async function saveSurveyApi(
  payload: SaveSurveyPayload,
  token: string
): Promise<any> {
  console.log("save api run.....")
  const response = await fetch(SAVE_SURVEY_API_URL, {
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

async function fetchMasters(): Promise<MasterApiResponse> {
  const response = await fetch(MASTER_API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to load master data.");
  }

  return data;
}

function QuestionTypePill({ type }: { type: QuestionType }) {
  return <Badge variant="secondary" className="rounded-full">{type.replace(/_/g, " ")}</Badge>;
}

function SurveyPreview({ survey, sections }: { survey: SurveyState; sections: Section[] }) {
  return (
    <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-950 text-white p-6">
        <div className="text-2xl font-semibold">{survey.name || "Untitled Survey"}</div>
        <div className="text-sm text-slate-300 mt-2">{survey.description || "Survey description will appear here."}</div>
      </div>
      <div className="p-6 space-y-6">
        {survey.intro && (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="pt-6 text-sm text-slate-600">{survey.intro}</CardContent>
          </Card>
        )}
        {sections.map((section, i) => (
          <Card key={section.id} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">{i + 1}. {section.title || `Section ${i + 1}`}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.questions.map((q, qi) => (
                <div key={q.id} className="rounded-2xl border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{qi + 1}. {q.text || "Untitled question"}</div>
                    <QuestionTypePill type={q.type} />
                  </div>
                  {q.helpText && <div className="text-sm text-slate-500">{q.helpText}</div>}
                  {q.type === "textarea" && <Textarea placeholder={q.placeholder || "Your answer"} />}
                  {q.type === "text" && <Input placeholder={q.placeholder || "Your answer"} />}
                  {q.type === "yes_no" && (
                    <div className="flex gap-2">
                      <Button variant="outline">Yes</Button>
                      <Button variant="outline">No</Button>
                    </div>
                  )}
                  {q.type === "single_choice" && (
                    <div className="space-y-2">
                      {q.options.map((op) => (
                        <div key={op.id} className="rounded-xl border px-3 py-2 text-sm">○ {op.text || "Option"}</div>
                      ))}
                    </div>
                  )}
                  {q.type === "multi_choice" && (
                    <div className="space-y-2">
                      {q.options.map((op) => (
                        <div key={op.id} className="rounded-xl border px-3 py-2 text-sm">☐ {op.text || "Option"}</div>
                      ))}
                    </div>
                  )}
                  {q.type === "csat_1_5" && <div className="flex gap-2">{[1, 2, 3, 4, 5].map(n => <Button key={n} variant="outline" size="sm">{n}</Button>)}</div>}
                  {q.type === "nps_0_10" && <div className="flex flex-wrap gap-2">{Array.from({ length: 11 }, (_, i) => i).map(n => <Button key={n} variant="outline" size="sm">{n}</Button>)}</div>}
                  {q.type === "ces_1_5" && <div className="flex gap-2">{[1, 2, 3, 4, 5].map(n => <Button key={n} variant="outline" size="sm">{n}</Button>)}</div>}
                  {q.type === "emoji" && <div className="flex gap-2 text-2xl">🙂 😐 😕 😠 😍</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Thank you message: <span className="font-medium">{survey.thankYou || "Thank you for your feedback."}</span>
        </div>
      </div>
    </div>
  );
}

export default function SurveyCreationScreenAllInOne() {
  const [survey, setSurvey] = useState<SurveyState>({
    name: "",
    code: "",
    type: "",
    description: "",
    intro: "",
    thankYou: "",
    branch: "",
    department: "",
    language: "en",
    status: "",
    anonymous: false,
    allowMultipleResponses: false,
    requireLogin: false,
    publishWeb: false,
    publishQR: false,
    publishKiosk: false,
    publishEmail: false,
    startDate: "",
    endDate: "",
  });

  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [branches, setBranches] = useState<MasterItem[]>([]);
  const [departments, setDepartments] = useState<MasterItem[]>([]);
  const [mastersLoading, setMastersLoading] = useState(false);

  useEffect(() => {
    async function loadMasters() {
      try {
        setMastersLoading(true);
        const result = await fetchMasters();
        setBranches(result.data.branches || []);
        setDepartments(result.data.departments || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load branch and department masters.");
      } finally {
        setMastersLoading(false);
      }
    }
    loadMasters();
  }, []);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId) ?? sections[0],
    [sections, selectedSectionId]
  );
  const selectedQuestion = useMemo(
    () => selectedSection?.questions.find((q) => q.id === selectedQuestionId) ?? selectedSection?.questions[0],
    [selectedSection, selectedQuestionId]
  );

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveDraft() {
    const draftSurvey: SurveyState = { ...survey, status: "draft" };
    const validation = validateSurveyForm(draftSurvey, sections);
    setErrors(validation.errors);
    if (!validation.isValid) return;

    const payload = buildSurveyPayload(draftSurvey, sections);

    try {
      setIsSaving(true);
      const token = localStorage.getItem("jwt_token") || "";
      const result = await saveSurveyApi(payload, token);
      toast.success("Survey draft saved successfully.");
      setTimeout(() => {
        navigate("/survey");
      }, 1000);
      setSurvey((prev) => ({ ...prev, status: "draft", id: result?.survey_id || prev.id }));
    } catch (error: any) {
      toast.error(error.message || "Unable to save draft.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    console.log("running .....")
    const publishSurvey: SurveyState = { ...survey, status: "published" };
    const validation = validateSurveyForm(publishSurvey, sections);
    setErrors(validation.errors);
    if (!validation.isValid) return;
    console.log('true validation')
    const payload = buildSurveyPayload(publishSurvey, sections);
    console.log('payload', payload)
    try {
      setIsSaving(true);
      const token = localStorage.getItem("jwt_token") || "";
      const result = await saveSurveyApi(payload, token);
      toast.success("Survey published successfully.");
      setTimeout(() => {
        navigate("/survey");
      }, 1000);
      setSurvey((prev) => ({ ...prev, status: "published", id: result?.survey_id || prev.id }));
    } catch (error: any) {
      toast.error(error.message || "Unable to publish survey.");
    } finally {
      setIsSaving(false);
    }
  }

  const updateSurvey = (key: keyof SurveyState, value: string | boolean) =>
    setSurvey((s) => ({ ...s, [key]: value }));

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
      prev.map((s) => (s.id === selectedSection.id ? { ...s, questions: [...s.questions, q] } : s))
    );
    setSelectedQuestionId(q.id);
  };

  const updateSection = (sectionId: string, key: keyof Section, value: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, [key]: value } : s)));
  };

  const updateQuestion = (questionId: string, key: keyof Question, value: any) => {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        questions: s.questions.map((q) => (q.id === questionId ? { ...q, [key]: value } : q)),
      }))
    );
  };

  const addOption = () => {
    if (!selectedQuestion) return;
    const next = [...selectedQuestion.options, { id: uid(), text: "", value: "", score: selectedQuestion.options.length + 1 }];
    updateQuestion(selectedQuestion.id, "options", next);
  };

  const updateOption = (optionId: string, key: keyof Option, value: string | number) => {
    if (!selectedQuestion) return;
    updateQuestion(
      selectedQuestion.id,
      "options",
      selectedQuestion.options.map((op) => (op.id === optionId ? { ...op, [key]: value } : op))
    );
  };

  const removeOption = (optionId: string) => {
    if (!selectedQuestion) return;
    updateQuestion(selectedQuestion.id, "options", selectedQuestion.options.filter((op) => op.id !== optionId));
  };

  const removeQuestion = (questionId: string) => {
    if (!selectedSection) return;
    const updatedSections = sections.map((s) =>
      s.id === selectedSection.id ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) } : s
    );
    setSections(updatedSections);
    const nextQuestion = updatedSections.find((s) => s.id === selectedSection.id)?.questions[0];
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

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const readiness = Math.min(100, 35 + (survey.name ? 10 : 0) + (sections.length ? 15 : 0) + (totalQuestions ? 20 : 0) + ((survey.publishWeb || survey.publishQR || survey.publishKiosk || survey.publishEmail) ? 20 : 0));

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Back Link */}
      <div className="mb-4">
        <Link to="/survey" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Survey
        </Link>
      </div>
      <ToastContainer />
      <div className="mx-auto max-w-[1550px] space-y-6">
        <Card className="rounded-[28px] shadow-sm border-0">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-2"><LayoutPanelTop className="h-4 w-4" /> One-Screen Survey Studio</div>
                <CardTitle className="text-3xl">Create and publish survey in one page</CardTitle>
                <CardDescription className="mt-2 text-base">
                  Three stacked boxes: survey info, survey builder, and publishing — exactly in one vertical flow.
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" className="rounded-2xl"><Eye className="mr-2 h-4 w-4" /> Preview</Button>
                <Button variant="outline" className="rounded-2xl" onClick={handleSaveDraft} disabled={isSaving}><FileText className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save Draft"}</Button>
                <Button className="rounded-2xl" onClick={handlePublish} disabled={isSaving}><Send className="mr-2 h-4 w-4" /> {isSaving ? "Publishing..." : "Publish"}</Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> 1. Basic Survey Info</CardTitle>
            <CardDescription>Define the core identity and behavior of the survey.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 xl:col-span-2">
              <Label>Survey Name</Label>
              <Input value={survey.name} onChange={(e) => updateSurvey("name", e.target.value)} />
              {errors.survey?.name && <p className="text-sm text-red-600">{errors.survey.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Survey Code</Label>
              <Input value={survey.code} onChange={(e) => updateSurvey("code", e.target.value)} />
              {errors.survey?.code && <p className="text-sm text-red-600">{errors.survey.code}</p>}
            </div>
            <div className="space-y-2">
              <Label>Survey Type</Label>
              <Select value={survey.type} onValueChange={(v: any) => updateSurvey("type", v)}>
                <SelectTrigger><SelectValue placeholder="Select survey type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nps">NPS</SelectItem>
                  <SelectItem value="csat">CSAT</SelectItem>
                  <SelectItem value="ces">CES</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.survey?.type && <p className="text-sm text-red-600">{errors.survey.type}</p>}
            </div>
            <div className="space-y-2 xl:col-span-4">
              <Label>Description</Label>
              <Textarea value={survey.description} onChange={(e) => updateSurvey("description", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={survey.branch} onValueChange={(v) => updateSurvey("branch", v)} disabled={mastersLoading}>
                <SelectTrigger><SelectValue placeholder={mastersLoading ? "Loading branches..." : "Select branch"} /></SelectTrigger>
                <SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              {errors.survey?.branch && <p className="text-sm text-red-600">{errors.survey.branch}</p>}
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={survey.department} onValueChange={(v) => updateSurvey("department", v)} disabled={mastersLoading}>
                <SelectTrigger><SelectValue placeholder={mastersLoading ? "Loading departments..." : "Select department"} /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
              {errors.survey?.department && <p className="text-sm text-red-600">{errors.survey.department}</p>}
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={survey.startDate} onChange={(e) => updateSurvey("startDate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={survey.endDate} onChange={(e) => updateSurvey("endDate", e.target.value)} />
              {errors.survey?.endDate && <p className="text-sm text-red-600">{errors.survey.endDate}</p>}
            </div>
            <div className="space-y-2 xl:col-span-2">
              <Label>Intro Message</Label>
              <Textarea value={survey.intro} onChange={(e) => updateSurvey("intro", e.target.value)} />
            </div>
            <div className="space-y-2 xl:col-span-2">
              <Label>Thank You Message</Label>
              <Textarea value={survey.thankYou} onChange={(e) => updateSurvey("thankYou", e.target.value)} />
            </div>
            <div className="rounded-2xl border p-4 flex items-center justify-between">
              <div><div className="font-medium">Anonymous</div><div className="text-sm text-slate-500">Allow anonymous responses</div></div>
              <Switch checked={survey.anonymous} onCheckedChange={(v) => updateSurvey("anonymous", v)} />
            </div>
            <div className="rounded-2xl border p-4 flex items-center justify-between">
              <div><div className="font-medium">Multiple Responses</div><div className="text-sm text-slate-500">Allow the same person to answer again</div></div>
              <Switch checked={survey.allowMultipleResponses} onCheckedChange={(v) => updateSurvey("allowMultipleResponses", v)} />
            </div>
            <div className="rounded-2xl border p-4 flex items-center justify-between xl:col-span-2">
              <div><div className="font-medium">Require Login</div><div className="text-sm text-slate-500">Restrict this survey to logged-in users only</div></div>
              <Switch checked={survey.requireLogin} onCheckedChange={(v) => updateSurvey("requireLogin", v)} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5" /> 2. Create Survey</CardTitle>
                <CardDescription>Create sections, questions, options, and preview without leaving the page.</CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" className="rounded-xl" onClick={addSection}><Plus className="mr-1 h-4 w-4" /> Add Section</Button>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={addQuestion} disabled={!selectedSection}><Plus className="mr-1 h-4 w-4" /> Add Question</Button>
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
                          No sections added yet.
                        </div>
                      ) : null}
                      {sections.map((section, i) => (
                        <div key={section.id} className={`rounded-2xl border p-3 ${selectedSectionId === section.id ? "border-slate-900 bg-slate-50" : "bg-white"}`}>
                          <div className="flex items-start gap-3">
                            <GripVertical className="mt-1 h-4 w-4 text-slate-400" />
                            <button className="flex-1 text-left" onClick={() => { setSelectedSectionId(section.id); setSelectedQuestionId(section.questions[0]?.id || ""); }}>
                              <div className="font-medium">{i + 1}. {section.title || `Section ${i + 1}`}</div>
                              <div className="text-sm text-slate-500">{section.questions.length} questions</div>
                            </button>
                            <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="rounded-3xl border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Section Details</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Section Title</Label>
                          <Input value={selectedSection?.title || ""} onChange={(e) => selectedSection && updateSection(selectedSection.id, "title", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Section Code</Label>
                          <Input value={selectedSection?.code || ""} onChange={(e) => selectedSection && updateSection(selectedSection.id, "code", e.target.value)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Description</Label>
                          <Textarea value={selectedSection?.description || ""} onChange={(e) => selectedSection && updateSection(selectedSection.id, "description", e.target.value)} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Question Editor</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {errors.survey?.sections && <div className="text-sm text-red-600">{errors.survey.sections}</div>}
                        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
                          <div className="space-y-3">
                            <div className="font-medium">Questions</div>
                            <ScrollArea className="pr-3">
                              <div className="space-y-3">
                                {selectedSection?.questions.map((q, i) => (
                                  <div key={q.id} className={`rounded-2xl border p-3 ${selectedQuestionId === q.id ? "border-slate-900 bg-slate-50" : "bg-white"}`}>
                                    <div className="flex items-start gap-3">
                                      <GripVertical className="mt-1 h-4 w-4 text-slate-400" />
                                      <button className="flex-1 text-left" onClick={() => setSelectedQuestionId(q.id)}>
                                        <div className="font-medium line-clamp-2">{i + 1}. {q.text || "Untitled question"}</div>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                          <QuestionTypePill type={q.type} />
                                          {q.required && <Badge variant="outline" className="rounded-full">Required</Badge>}
                                        </div>
                                      </button>
                                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}><Trash2 className="h-4 w-4" /></Button>
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
                                    <Textarea value={selectedQuestion.text} onChange={(e) => updateQuestion(selectedQuestion.id, "text", e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Question Code</Label>
                                    <Input value={selectedQuestion.code} onChange={(e) => updateQuestion(selectedQuestion.id, "code", e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Question Type</Label>
                                    <Select value={selectedQuestion.type} onValueChange={(v) => updateQuestion(selectedQuestion.id, "type", v as QuestionType)}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="nps_0_10">NPS 0-10</SelectItem>
                                        <SelectItem value="csat_1_5">CSAT 1-5</SelectItem>
                                        <SelectItem value="ces_1_5">CES 1-5</SelectItem>
                                        <SelectItem value="emoji">Emoji</SelectItem>
                                        <SelectItem value="yes_no">Yes / No</SelectItem>
                                        <SelectItem value="single_choice">Single Choice</SelectItem>
                                        <SelectItem value="multi_choice">Multiple Choice</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="textarea">Textarea</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <Label>Help Text</Label>
                                    <Input value={selectedQuestion.helpText} onChange={(e) => updateQuestion(selectedQuestion.id, "helpText", e.target.value)} />
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <Label>Placeholder</Label>
                                    <Input value={selectedQuestion.placeholder} onChange={(e) => updateQuestion(selectedQuestion.id, "placeholder", e.target.value)} />
                                  </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                  <div className="rounded-2xl border p-4 flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">Required</div>
                                      <div className="text-sm text-slate-500">Respondent must answer this question</div>
                                    </div>
                                    <Switch checked={selectedQuestion.required} onCheckedChange={(v) => updateQuestion(selectedQuestion.id, "required", v)} />
                                  </div>
                                  <div className="rounded-2xl border p-4 flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">Scoring Enabled</div>
                                      <div className="text-sm text-slate-500">Use this question in score calculations</div>
                                    </div>
                                    <Switch checked={selectedQuestion.scoringEnabled} onCheckedChange={(v) => updateQuestion(selectedQuestion.id, "scoringEnabled", v)} />
                                  </div>
                                </div>

                                {(["single_choice", "multi_choice"] as QuestionType[]).includes(selectedQuestion.type) && (
                                  <Card className="rounded-3xl bg-slate-50 border-dashed">
                                    <CardHeader>
                                      <div className="flex items-center justify-between gap-3">
                                        <CardTitle className="text-base">Answer Options</CardTitle>
                                        <Button size="sm" className="rounded-xl" onClick={addOption}><Plus className="mr-2 h-4 w-4" /> Add Option</Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      {selectedQuestion.options.map((op) => (
                                        <div key={op.id} className="grid gap-3 rounded-2xl border bg-white p-3 md:grid-cols-[1fr_1fr_110px_50px]">
                                          <Input value={op.text} onChange={(e) => updateOption(op.id, "text", e.target.value)} placeholder="Option text" />
                                          <Input value={op.value} onChange={(e) => updateOption(op.id, "value", e.target.value)} placeholder="Option value" />
                                          <Input type="number" value={op.score ?? 0} onChange={(e) => updateOption(op.id, "score", Number(e.target.value))} placeholder="Score" />
                                          <Button variant="ghost" size="icon" onClick={() => removeOption(op.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                      ))}
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            ) : (
                              <div className="rounded-3xl border border-dashed p-10 text-center text-slate-500">Select or add a question to begin editing.</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <SurveyPreview survey={survey} sections={sections} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> 3. Publishing</CardTitle>
            <CardDescription>Review readiness, enable channels, preview link, and publish from this final box.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                <Card className="rounded-3xl border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Channel Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-2">
                    {errors.survey?.publish && <div className="md:col-span-2 text-sm text-red-600">{errors.survey.publish}</div>}
                    {[
                      ["publishWeb", "Web Link", Link2],
                      ["publishQR", "QR Code", Globe],
                      ["publishKiosk", "Kiosk", LayoutPanelTop],
                      ["publishEmail", "Email Invite", Send],
                    ].map(([key, label, Icon]: any) => (
                      <label key={key} className="rounded-2xl border p-4 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-slate-100 p-2"><Icon className="h-4 w-4" /></div>
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-slate-500">Enable during publish</div>
                          </div>
                        </div>
                        <Checkbox checked={(survey as any)[key]} onCheckedChange={(v) => updateSurvey(key as keyof SurveyState, !!v)} />
                      </label>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Publish Assets</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border p-4">
                      <div className="font-medium mb-2">Survey Link</div>
                      <Input value={survey.code ? `https://survey.local/${survey.code.toLowerCase()}` : ""} readOnly />
                    </div>
                    <div className="rounded-2xl border p-4">
                      <div className="font-medium mb-2">QR Preview</div>
                      <div className="rounded-2xl bg-slate-100 h-28 flex items-center justify-center text-slate-500">QR preview area</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-3xl border-slate-900 bg-slate-950 text-white h-fit">
                <CardHeader>
                  <CardTitle>Launch Panel</CardTitle>
                  <CardDescription className="text-slate-300">Go live from here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="text-sm text-slate-300">Readiness</div>
                    <div className="text-2xl font-semibold mt-1">{readiness}%</div>
                    <Progress value={readiness} className="h-3 mt-3" />
                  </div>
                  <div className="grid gap-3 grid-cols-2">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="text-sm text-slate-300">Sections</div>
                      <div className="text-2xl font-semibold mt-1">{sections.length}</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="text-sm text-slate-300">Questions</div>
                      <div className="text-2xl font-semibold mt-1">{totalQuestions}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 text-sm space-y-2">
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Basic details completed</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Questions added</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Preview available</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Publish channels selected</div>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-100" onClick={handlePublish} disabled={isSaving}><Send className="mr-2 h-4 w-4" /> {isSaving ? "Publishing..." : "Publish Now"}</Button>
                    <Button variant="outline" className="w-full rounded-2xl border-white/20 text-white bg-transparent hover:bg-white/10" onClick={handleSaveDraft} disabled={isSaving}>{isSaving ? "Saving..." : "Save as Draft"}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
