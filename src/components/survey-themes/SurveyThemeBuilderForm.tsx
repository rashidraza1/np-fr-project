import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Palette, Type, LayoutTemplate, Images, ChevronRight, ChevronLeft, Save, Loader2 } from "lucide-react";

export type ThemeLayoutMode = "single_page" | "multi_page";
export type ThemeBackgroundType = "color" | "image";
export type ThemeButtonBackgroundType = "color" | "image";
export type SmileyMode = "default" | "custom";

export type SurveyThemeFormState = {
  id?: number;
  theme_name: string;
  theme_code: string;
  description: string;
  is_active: boolean;
  layout_mode: ThemeLayoutMode;
  background_type: ThemeBackgroundType;
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
  choice_button_bg_type: ThemeButtonBackgroundType;
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
  smiley_mode: SmileyMode;
  smiley_size: number;
  smiley_3_image_1: string;
  smiley_3_image_2: string;
  smiley_3_image_3: string;
  smiley_5_image_1: string;
  smiley_5_image_2: string;
  smiley_5_image_3: string;
  smiley_5_image_4: string;
  smiley_5_image_5: string;
};

export type ThemeAssetUploadResponse = {
  success: boolean;
  message?: string;
  file_path?: string;
  file_name?: string;
};

type Props = {
  mode: "create" | "edit";
  initialValue?: SurveyThemeFormState;
  onSubmit: (payload: SurveyThemeFormState) => Promise<void>;
  onCancel?: () => void;
  saving?: boolean;
};

const fontFamilies = [
  "Inter",
  "Arial",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Georgia",
  "Times New Roman",
  "Garamond",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Lato",
  "Montserrat",
  "Nunito",
  "Segoe UI",
];

const fontWeights = [
  { value: "400", label: "Normal (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semi Bold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Bolder (800)" },
];

const DEFAULT_SMILEY_3 = ["😞", "😐", "😊"];
const DEFAULT_SMILEY_5 = ["😡", "😕", "😐", "🙂", "😍"];

const singlePageQuestions = [
  { type: "nps_0_10", text: "How likely are you to recommend us to others?" },
  { type: "csat_1_5", text: "How satisfied are you with the support received today?" },
  { type: "ces_1_5", text: "How easy was it to complete your request today?" },
  { type: "smiley_3", text: "How would you rate the friendliness of our staff?" },
  { type: "smiley_5", text: "How was your overall experience today?" },
  { type: "yes_no", text: "Would you recommend us to your friends or colleagues?" },
  { type: "single_choice", text: "How satisfied are you with our service today?" },
  { type: "multi_choice", text: "Which of the following services did you use?" },
  { type: "text", text: "What did you like most about the service?" },
  { type: "textarea", text: "Please share any additional comments." },
  { type: "date", text: "Select your preferred follow-up date." },
  { type: "file_upload", text: "Please upload any supporting document if required." },
] as const;

const multiPageQuestions = [
  { type: "nps_0_10", text: "How likely are you to recommend us to others?" },
  { type: "csat_1_5", text: "How satisfied are you with the support received today?" },
  { type: "ces_1_5", text: "How easy was it to complete your request today?" },
  { type: "smiley_3", text: "How would you rate the friendliness of our staff?" },
  { type: "smiley_5", text: "How was your overall experience today?" },
  { type: "yes_no", text: "Would you recommend us to your friends or colleagues?" },
  { type: "single_choice", text: "How satisfied are you with our service today?" },
  { type: "multi_choice", text: "Which of the following services did you use?" },
  { type: "text", text: "What did you like most about the service?" },
  { type: "textarea", text: "Please share any additional comments." },
  { type: "date", text: "Select your preferred follow-up date." },
  { type: "file_upload", text: "Please upload any supporting document if required." },
] as const;

export const defaultThemeState = (): SurveyThemeFormState => ({
  theme_name: "",
  theme_code: "",
  description: "",
  is_active: true,
  layout_mode: "multi_page",
  background_type: "color",
  background_color: "#eaf2ff",
  background_image_path: "",
  background_size: "cover",
  background_position: "center",
  question_font_family: "Inter",
  question_font_weight: "700",
  question_font_size: 28,
  question_font_color: "#0f172a",
  answer_font_family: "Inter",
  answer_font_weight: "500",
  answer_font_size: 16,
  answer_font_color: "#0f172a",
  choice_button_bg_type: "color",
  choice_button_bg_color: "#ffffff",
  choice_button_bg_image_path: "",
  choice_button_text_color: "#0f172a",
  choice_button_border_color: "#cbd5e1",
  choice_button_radius: 18,
  choice_button_padding_y: 16,
  choice_button_padding_x: 18,
  choice_button_gap: 12,
  nav_button_bg_color: "#0f172a",
  nav_button_text_color: "#ffffff",
  nav_button_radius: 14,
  nav_button_font_size: 15,
  next_button_text: "Next",
  prev_button_text: "Previous",
  smiley_mode: "default",
  smiley_size: 56,
  smiley_3_image_1: "",
  smiley_3_image_2: "",
  smiley_3_image_3: "",
  smiley_5_image_1: "",
  smiley_5_image_2: "",
  smiley_5_image_3: "",
  smiley_5_image_4: "",
  smiley_5_image_5: "",
});

const UPLOAD_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/theme/upload_theme_asset.php`;

export function SurveyThemeBuilderForm({ mode, initialValue, onSubmit, onCancel, saving = false }: Props) {
  const [form, setForm] = useState<SurveyThemeFormState>(initialValue ?? defaultThemeState());
  const [previewStep, setPreviewStep] = useState(0);
  const [uploadingKey, setUploadingKey] = useState<string>("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialValue) {
      setForm(initialValue);
    }
  }, [initialValue]);

  const updateField = <K extends keyof SurveyThemeFormState>(key: K, value: SurveyThemeFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadAsset = async (file: File, assetType: string) => {
    const token = localStorage.getItem("jwt_token") || "";
    const fd = new FormData();
    fd.append("asset", file);
    fd.append("asset_type", assetType);

    const response = await fetch(UPLOAD_API_URL, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: fd,
    });

    const data: ThemeAssetUploadResponse = await response.json();
    if (!response.ok || !data.success || !data.file_path) {
      throw new Error(data.message || "Upload failed.");
    }

    return data.file_path;
  };

  const handleAssetUpload = async (file: File | undefined, key: keyof SurveyThemeFormState, assetType: string) => {
    if (!file) return;

    try {
      setUploadingKey(String(key));
      const path = await uploadAsset(file, assetType);
      if (mountedRef.current) {
        updateField(key, path as SurveyThemeFormState[typeof key]);
      }
    } catch (error: any) {
      alert(error.message || "Unable to upload file.");
    } finally {
      if (mountedRef.current) {
        setUploadingKey("");
      }
    }
  };

  const previewBackgroundStyle = useMemo(() => {
    if (form.background_type === "image" && form.background_image_path) {
      return {
        backgroundImage: `url(${form.background_image_path})`,
        backgroundSize: form.background_size,
        backgroundPosition: form.background_position,
        backgroundRepeat: "no-repeat",
      } as React.CSSProperties;
    }

    return {
      background: form.background_color,
    } as React.CSSProperties;
  }, [form]);

  const choiceButtonStyle: React.CSSProperties = {
    fontFamily: form.answer_font_family,
    fontWeight: form.answer_font_weight,
    fontSize: `${form.answer_font_size}px`,
    color: form.choice_button_text_color,
    background:
      form.choice_button_bg_type === "image" && form.choice_button_bg_image_path
        ? `url(${form.choice_button_bg_image_path}) center/cover no-repeat`
        : form.choice_button_bg_color,
    borderColor: form.choice_button_border_color,
    borderRadius: `${form.choice_button_radius}px`,
    padding: `${form.choice_button_padding_y}px ${form.choice_button_padding_x}px`,
  };

  const navButtonStyle: React.CSSProperties = {
    background: form.nav_button_bg_color,
    color: form.nav_button_text_color,
    borderRadius: `${form.nav_button_radius}px`,
    fontSize: `${form.nav_button_font_size}px`,
  };

  const activeMultiPageQuestion = multiPageQuestions[Math.min(previewStep, multiPageQuestions.length - 1)];

  const smiley3Assets = form.smiley_mode === "custom"
    ? [form.smiley_3_image_1, form.smiley_3_image_2, form.smiley_3_image_3].map((item, index) => item || DEFAULT_SMILEY_3[index])
    : DEFAULT_SMILEY_3;

  const smiley5Assets = form.smiley_mode === "custom"
    ? [form.smiley_5_image_1, form.smiley_5_image_2, form.smiley_5_image_3, form.smiley_5_image_4, form.smiley_5_image_5].map((item, index) => item || DEFAULT_SMILEY_5[index])
    : DEFAULT_SMILEY_5;

  const renderSmileyGrid = (items: string[], cols: string) => (
    <div className={`grid ${cols} gap-3`}>
      {items.map((item, index) => (
        <button
          key={`${item}-${index}`}
          className="aspect-square border shadow-sm"
          style={{
            ...choiceButtonStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
          type="button"
        >
          {item.startsWith("/") || item.startsWith("http") ? (
            <img src={item} alt={`Smiley ${index + 1}`} style={{ width: `${form.smiley_size}px`, height: `${form.smiley_size}px`, objectFit: "contain" }} />
          ) : (
            <span style={{ fontSize: `${form.smiley_size}px`, lineHeight: 1 }}>{item}</span>
          )}
        </button>
      ))}
    </div>
  );

  const renderPreviewAnswerBlock = (questionType: string) => {
    if (questionType === "single_choice" || questionType === "multi_choice") {
      const labels = questionType === "multi_choice"
        ? ["Billing", "Support", "Delivery", "Installation", "Other"]
        : ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"];

      return (
        <div className="grid gap-3" style={{ gap: `${form.choice_button_gap}px` }}>
          {labels.map((label) => (
            <button key={label} type="button" className="w-full border text-left shadow-sm transition hover:scale-[1.01]" style={choiceButtonStyle}>
              {label}
            </button>
          ))}
        </div>
      );
    }

    if (questionType === "yes_no") {
      return (
        <div className="grid grid-cols-2 gap-3">
          {["Yes", "No"].map((label) => (
            <button key={label} type="button" className="w-full border text-left shadow-sm transition hover:scale-[1.01]" style={choiceButtonStyle}>
              {label}
            </button>
          ))}
        </div>
      );
    }

    if (questionType === "nps_0_10") {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
          <div className="grid grid-cols-11 gap-2">
            {Array.from({ length: 10 }).map((_, index) => {
              const value = index + 1;
              return (
                <button key={value} type="button" className="aspect-square border shadow-sm" style={{ ...choiceButtonStyle, padding: "0", borderRadius: `${Math.max(10, form.choice_button_radius - 4)}px` }}>
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (questionType === "csat_1_5") {
      return (
        <div className="grid grid-cols-5 gap-3">
          {["1", "2", "3", "4", "5"].map((label) => (
            <button key={label} type="button" className="aspect-square border shadow-sm" style={{ ...choiceButtonStyle, padding: "0", borderRadius: `${Math.max(10, form.choice_button_radius - 4)}px` }}>
              {label}
            </button>
          ))}
        </div>
      );
    }

    if (questionType === "ces_1_5") {
      return (
        <div className="grid grid-cols-5 gap-3">
          {["1", "2", "3", "4", "5"].map((label) => (
            <button key={label} type="button" className="aspect-square border shadow-sm" style={{ ...choiceButtonStyle, padding: "0", borderRadius: `${Math.max(10, form.choice_button_radius - 4)}px` }}>
              {label}
            </button>
          ))}
        </div>
      );
    }

    if (questionType === "smiley_3") {
      return renderSmileyGrid(smiley3Assets, "grid-cols-3");
    }

    if (questionType === "smiley_5") {
      return renderSmileyGrid(smiley5Assets, "grid-cols-5");
    }

    if (questionType === "text") {
      return <input className="w-full rounded-2xl border bg-white px-4 py-4 outline-none" style={{ fontFamily: form.answer_font_family, fontWeight: form.answer_font_weight, fontSize: `${form.answer_font_size}px`, color: form.answer_font_color }} placeholder="Type your answer here" />;
    }

    if (questionType === "textarea") {
      return <textarea className="min-h-[130px] w-full rounded-2xl border bg-white px-4 py-4 outline-none" style={{ fontFamily: form.answer_font_family, fontWeight: form.answer_font_weight, fontSize: `${form.answer_font_size}px`, color: form.answer_font_color }} placeholder="Write your feedback here" />;
    }

    if (questionType === "date") {
      return <input type="date" className="w-full rounded-2xl border bg-white px-4 py-4 outline-none" style={{ fontFamily: form.answer_font_family, fontWeight: form.answer_font_weight, fontSize: `${form.answer_font_size}px`, color: form.answer_font_color }} />;
    }

    return (
      <div className="rounded-2xl border-2 border-dashed bg-white px-4 py-8 text-center">
        <div style={{ fontFamily: form.answer_font_family, fontWeight: form.answer_font_weight, fontSize: `${form.answer_font_size}px`, color: form.answer_font_color }}>
          Choose file / Upload file
        </div>
        <div className="text-sm text-slate-500 mt-2">Supported preview for document or image upload question</div>
      </div>
    );
  };

  const handleSubmit = async () => {
    await onSubmit(form);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Palette className="h-4 w-4" /> Survey Theme Studio
              </div>
              <CardTitle className="text-3xl">{mode === "create" ? "Create Theme" : "Edit Theme"}</CardTitle>
              <CardDescription className="mt-2 text-base">
                Build reusable survey submission themes with live preview for kiosk, tablet, and web surveys.
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {onCancel ? (
                <Button variant="outline" className="rounded-2xl" onClick={onCancel} type="button">
                  Cancel
                </Button>
              ) : null}
              <Button className="rounded-2xl" onClick={handleSubmit} disabled={saving} type="button">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {mode === "create" ? "Save Theme" : "Update Theme"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[620px_1fr] items-start">
        <div className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-4 rounded-2xl h-auto p-1">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="fonts">Fonts</TabsTrigger>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6 space-y-6">
              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><LayoutTemplate className="h-5 w-5" /> Basic Theme Info</CardTitle>
                  <CardDescription>Create a reusable survey appearance profile.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Theme Name</Label>
                    <Input value={form.theme_name} onChange={(e) => updateField("theme_name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Theme Code</Label>
                    <Input value={form.theme_code} onChange={(e) => updateField("theme_code", e.target.value)} />
                  </div>
                  <div className="rounded-2xl border p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">Active Theme</div>
                      <div className="text-sm text-slate-500">Allow this theme to be selected in surveys</div>
                    </div>
                    <Switch checked={form.is_active} onCheckedChange={(v) => updateField("is_active", v)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Layout Mode</CardTitle>
                  <CardDescription>Choose how the survey should flow for respondents.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <button type="button" className={`rounded-3xl border p-5 text-left transition ${form.layout_mode === "single_page" ? "border-slate-900 bg-slate-50" : "bg-white"}`} onClick={() => updateField("layout_mode", "single_page")}>
                    <div className="font-semibold text-lg">All Questions On One Page</div>
                    <div className="text-sm text-slate-500 mt-2">Show all survey questions in one long form.</div>
                  </button>
                  <button type="button" className={`rounded-3xl border p-5 text-left transition ${form.layout_mode === "multi_page" ? "border-slate-900 bg-slate-50" : "bg-white"}`} onClick={() => updateField("layout_mode", "multi_page")}>
                    <div className="font-semibold text-lg">One Question Per Page</div>
                    <div className="text-sm text-slate-500 mt-2">Show one question at a time with next/previous navigation.</div>
                  </button>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Smiley Settings</CardTitle>
                  <CardDescription>Control smiley size and optionally upload your own 3-smiley or 5-smiley image set.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Smiley Display Mode</Label>
                      <Select value={form.smiley_mode} onValueChange={(v) => updateField("smiley_mode", v as SmileyMode)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Smileys</SelectItem>
                          <SelectItem value="custom">Custom Uploaded Smileys</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Smiley Size (px)</Label>
                      <Input type="number" value={form.smiley_size} onChange={(e) => updateField("smiley_size", Number(e.target.value) || 0)} />
                    </div>
                  </div>

                  <div className="rounded-2xl border p-4 bg-slate-50">
                    <div className="font-medium mb-3">Custom 3 Smileys Upload</div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {(["smiley_3_image_1", "smiley_3_image_2", "smiley_3_image_3"] as const).map((key, index) => (
                        <div key={key} className="space-y-2">
                          <Label>Smiley {index + 1}</Label>
                          <Input type="file" accept="image/*" onChange={(e) => handleAssetUpload(e.target.files?.[0], key, key)} />
                          {uploadingKey === key ? <div className="text-xs text-slate-500">Uploading...</div> : null}
                          {form[key] ? <div className="text-xs text-slate-500 break-all">{form[key]}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border p-4 bg-slate-50">
                    <div className="font-medium mb-3">Custom 5 Smileys Upload</div>
                    <div className="grid gap-3 md:grid-cols-5">
                      {(["smiley_5_image_1", "smiley_5_image_2", "smiley_5_image_3", "smiley_5_image_4", "smiley_5_image_5"] as const).map((key, index) => (
                        <div key={key} className="space-y-2">
                          <Label>Smiley {index + 1}</Label>
                          <Input type="file" accept="image/*" onChange={(e) => handleAssetUpload(e.target.files?.[0], key, key)} />
                          {uploadingKey === key ? <div className="text-xs text-slate-500">Uploading...</div> : null}
                          {form[key] ? <div className="text-xs text-slate-500 break-all">{form[key]}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="background" className="mt-6 space-y-6">
              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Images className="h-5 w-5" /> Background Settings</CardTitle>
                  <CardDescription>Control background color or image styling for the survey screen.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <button type="button" className={`rounded-3xl border p-4 text-left ${form.background_type === "color" ? "border-slate-900 bg-slate-50" : "bg-white"}`} onClick={() => updateField("background_type", "color")}>
                      <div className="font-semibold">Solid Color</div>
                      <div className="text-sm text-slate-500 mt-1">Use a clean color background.</div>
                    </button>
                    <button type="button" className={`rounded-3xl border p-4 text-left ${form.background_type === "image" ? "border-slate-900 bg-slate-50" : "bg-white"}`} onClick={() => updateField("background_type", "image")}>
                      <div className="font-semibold">Background Image</div>
                      <div className="text-sm text-slate-500 mt-1">Use an uploaded image for the survey screen.</div>
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-3">
                        <Input type="color" value={form.background_color} onChange={(e) => updateField("background_color", e.target.value)} className="h-12 w-20 p-1" />
                        <Input value={form.background_color} onChange={(e) => updateField("background_color", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Background Image Upload</Label>
                      <Input type="file" accept="image/*" onChange={(e) => handleAssetUpload(e.target.files?.[0], "background_image_path", "background")} />
                      {uploadingKey === "background_image_path" ? <div className="text-xs text-slate-500">Uploading...</div> : null}
                      {form.background_image_path ? <div className="text-xs text-slate-500 break-all">{form.background_image_path}</div> : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Background Size</Label>
                      <Select value={form.background_size} onValueChange={(v) => updateField("background_size", v as SurveyThemeFormState["background_size"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cover</SelectItem>
                          <SelectItem value="contain">Contain</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Background Position</Label>
                      <Select value={form.background_position} onValueChange={(v) => updateField("background_position", v as SurveyThemeFormState["background_position"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fonts" className="mt-6 space-y-6">
              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5" /> Question Font Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select value={form.question_font_family} onValueChange={(v) => updateField("question_font_family", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{fontFamilies.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font Weight</Label>
                    <Select value={form.question_font_weight} onValueChange={(v) => updateField("question_font_weight", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{fontWeights.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font Size (px)</Label>
                    <Input type="number" value={form.question_font_size} onChange={(e) => updateField("question_font_size", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Font Color</Label>
                    <div className="flex gap-3">
                      <Input type="color" value={form.question_font_color} onChange={(e) => updateField("question_font_color", e.target.value)} className="h-12 w-20 p-1" />
                      <Input value={form.question_font_color} onChange={(e) => updateField("question_font_color", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Answer Font Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select value={form.answer_font_family} onValueChange={(v) => updateField("answer_font_family", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{fontFamilies.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font Weight</Label>
                    <Select value={form.answer_font_weight} onValueChange={(v) => updateField("answer_font_weight", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{fontWeights.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font Size (px)</Label>
                    <Input type="number" value={form.answer_font_size} onChange={(e) => updateField("answer_font_size", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Font Color</Label>
                    <div className="flex gap-3">
                      <Input type="color" value={form.answer_font_color} onChange={(e) => updateField("answer_font_color", e.target.value)} className="h-12 w-20 p-1" />
                      <Input value={form.answer_font_color} onChange={(e) => updateField("answer_font_color", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buttons" className="mt-6 space-y-6">
              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Choice Button Styling</CardTitle>
                  <CardDescription>Used for question types like Yes/No, Single Choice, Multiple Choice, CSAT, CES, NPS, smileys, and similar clickable answer styles.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Button Background Type</Label>
                    <Select value={form.choice_button_bg_type} onValueChange={(v) => updateField("choice_button_bg_type", v as ThemeButtonBackgroundType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="color">Solid Color</SelectItem>
                        <SelectItem value="image">Background Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Button Background Image Upload</Label>
                    <Input type="file" accept="image/*" onChange={(e) => handleAssetUpload(e.target.files?.[0], "choice_button_bg_image_path", "button")} />
                    {uploadingKey === "choice_button_bg_image_path" ? <div className="text-xs text-slate-500">Uploading...</div> : null}
                    {form.choice_button_bg_image_path ? <div className="text-xs text-slate-500 break-all">{form.choice_button_bg_image_path}</div> : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Button Background Color</Label>
                    <div className="flex gap-3">
                      <Input type="color" value={form.choice_button_bg_color} onChange={(e) => updateField("choice_button_bg_color", e.target.value)} className="h-12 w-20 p-1" />
                      <Input value={form.choice_button_bg_color} onChange={(e) => updateField("choice_button_bg_color", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Button Text Color</Label>
                    <div className="flex gap-3">
                      <Input type="color" value={form.choice_button_text_color} onChange={(e) => updateField("choice_button_text_color", e.target.value)} className="h-12 w-20 p-1" />
                      <Input value={form.choice_button_text_color} onChange={(e) => updateField("choice_button_text_color", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Border Color</Label>
                    <div className="flex gap-3">
                      <Input type="color" value={form.choice_button_border_color} onChange={(e) => updateField("choice_button_border_color", e.target.value)} className="h-12 w-20 p-1" />
                      <Input value={form.choice_button_border_color} onChange={(e) => updateField("choice_button_border_color", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Border Radius (px)</Label>
                    <Input type="number" value={form.choice_button_radius} onChange={(e) => updateField("choice_button_radius", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vertical Padding (px)</Label>
                    <Input type="number" value={form.choice_button_padding_y} onChange={(e) => updateField("choice_button_padding_y", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Horizontal Padding (px)</Label>
                    <Input type="number" value={form.choice_button_padding_x} onChange={(e) => updateField("choice_button_padding_x", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Gap Between Buttons (px)</Label>
                    <Input type="number" value={form.choice_button_gap} onChange={(e) => updateField("choice_button_gap", Number(e.target.value) || 0)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Navigation Buttons</CardTitle>
                  <CardDescription>Used mainly for one-question-per-page survey flow.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Previous Button Text</Label>
                    <Input value={form.prev_button_text} onChange={(e) => updateField("prev_button_text", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Button Text</Label>
                    <Input value={form.next_button_text} onChange={(e) => updateField("next_button_text", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Background Color</Label>
                    <div className="flex gap-3">
                      <Input type="color" value={form.nav_button_bg_color} onChange={(e) => updateField("nav_button_bg_color", e.target.value)} className="h-12 w-20 p-1" />
                      <Input value={form.nav_button_bg_color} onChange={(e) => updateField("nav_button_bg_color", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Button Text Color</Label>
                    <div className="flex gap-3">
                      <Input type="color" value={form.nav_button_text_color} onChange={(e) => updateField("nav_button_text_color", e.target.value)} className="h-12 w-20 p-1" />
                      <Input value={form.nav_button_text_color} onChange={(e) => updateField("nav_button_text_color", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Border Radius (px)</Label>
                    <Input type="number" value={form.nav_button_radius} onChange={(e) => updateField("nav_button_radius", Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Font Size (px)</Label>
                    <Input type="number" value={form.nav_button_font_size} onChange={(e) => updateField("nav_button_font_size", Number(e.target.value) || 0)} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="xl:sticky xl:top-6">
          <Card className="rounded-[28px] border-0 shadow-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Live Survey Preview</CardTitle>
                  <CardDescription>Real-time visual preview of the selected theme.</CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Badge variant="secondary" className="rounded-full">{form.layout_mode === "multi_page" ? "One Question Per Page" : "All Questions On One Page"}</Badge>
                  <Badge variant="outline" className="rounded-full">{form.theme_name || "Untitled Theme"}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-[36px] border border-slate-200 p-4 bg-slate-200/70">
                <div className="rounded-[32px] p-6 min-h-[760px]" style={previewBackgroundStyle}>
                  <div className="mb-6 rounded-[26px] bg-white/80 backdrop-blur px-5 py-4 border border-white/70 shadow-sm">
                    <div className="text-2xl font-semibold text-slate-900">{form.theme_name || "Untitled Theme"}</div>
                    <div className="text-sm text-slate-600 mt-1">{form.description || "Theme description will appear here."}</div>
                  </div>

                  {form.layout_mode === "multi_page" ? (
                    <div className="rounded-[32px] bg-white/92 p-6 shadow-xl border border-white/70 backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-3 mb-6">
                        <div>
                          <div className="text-sm text-slate-500 font-medium">Question {previewStep + 1} of {multiPageQuestions.length}</div>
                          <div className="w-40 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-slate-900 rounded-full transition-all" style={{ width: `${((previewStep + 1) / multiPageQuestions.length) * 100}%` }} />
                          </div>
                        </div>
                        <Badge className="rounded-full">{activeMultiPageQuestion.type.replace(/_/g, " ")}</Badge>
                      </div>
                      <div className="mb-5 leading-snug" style={{ fontFamily: form.question_font_family, fontWeight: form.question_font_weight, fontSize: `${form.question_font_size}px`, color: form.question_font_color }}>
                        {activeMultiPageQuestion.text}
                      </div>
                      <div className="mb-8">{renderPreviewAnswerBlock(activeMultiPageQuestion.type)}</div>
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button type="button" className="inline-flex items-center gap-2 px-5 py-3 font-medium shadow-sm disabled:opacity-50" style={navButtonStyle} disabled={previewStep === 0} onClick={() => setPreviewStep((prev) => Math.max(0, prev - 1))}>
                          <ChevronLeft className="h-4 w-4" />
                          {form.prev_button_text}
                        </button>
                        <button type="button" className="inline-flex items-center gap-2 px-5 py-3 font-medium shadow-sm disabled:opacity-50" style={navButtonStyle} disabled={previewStep === multiPageQuestions.length - 1} onClick={() => setPreviewStep((prev) => Math.min(multiPageQuestions.length - 1, prev + 1))}>
                          {form.next_button_text}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {singlePageQuestions.map((question, index) => (
                        <div key={`${question.type}-${index}`} className="rounded-3xl bg-white/90 p-5 shadow-sm border border-white/70 backdrop-blur">
                          <div className="mb-4" style={{ fontFamily: form.question_font_family, fontWeight: form.question_font_weight, fontSize: `${Math.max(20, form.question_font_size - 4)}px`, color: form.question_font_color }}>
                            {index + 1}. {question.text}
                          </div>
                          {renderPreviewAnswerBlock(question.type)}
                        </div>
                      ))}
                      <div className="flex justify-end gap-3">
                        <button type="button" className="px-5 py-3 font-medium shadow-sm" style={navButtonStyle}>Submit Survey</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
