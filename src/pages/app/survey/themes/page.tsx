import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil } from "lucide-react";

type ThemeListItem = {
  id: number;
  theme_name: string;
  theme_code: string;
  description: string;
  layout_mode: "single_page" | "multi_page";
  is_active: number;
  background_type: string;
  surveys_count: number;
  updated_at: string;
};

type ThemeListResponse = {
  success: boolean;
  message?: string;
  data?: {
    themes: ThemeListItem[];
  };
};

const LIST_THEME_API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/theme/list_themes.php`;

export default function SurveyThemeListPage() {
  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [layoutFilter, setLayoutFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadThemes() {
      try {
        const response = await fetch(LIST_THEME_API_URL, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data: ThemeListResponse = await response.json();
        if (!response.ok || !data.success || !data.data) {
          throw new Error(data.message || "Failed to load themes.");
        }
        setThemes(data.data.themes || []);
      } catch (error: any) {
        toast.error(error.message || "Unable to load themes.");
      } finally {
        setLoading(false);
      }
    }

    loadThemes();
  }, []);

  const filteredThemes = useMemo(() => {
    return themes.filter((theme) => {
      const lowerSearch = search.trim().toLowerCase();
      const matchesSearch = [theme.theme_name, theme.theme_code, theme.description]
        .join(" ")
        .toLowerCase()
        .includes(lowerSearch);
      const matchesLayout = layoutFilter === "all" ? true : theme.layout_mode === layoutFilter;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? theme.is_active === 1
          : theme.is_active === 0;
      return matchesSearch && matchesLayout && matchesStatus;
    });
  }, [themes, search, layoutFilter, statusFilter]);

  const activeCount = themes.filter((theme) => theme.is_active === 1).length;
  const singlePageCount = themes.filter((theme) => theme.layout_mode === "single_page").length;
  const multiPageCount = themes.filter((theme) => theme.layout_mode === "multi_page").length;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <ToastContainer />
      <div className="mx-auto max-w-[1500px] space-y-6">
        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Plus className="h-4 w-4" /> Survey Theme Studio
                </div>
                <CardTitle className="text-3xl">Theme Listing</CardTitle>
                <CardDescription className="mt-2 text-base">
                  Create, manage, and reuse survey themes for your survey screens.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-2xl" onClick={() => navigate("/survey/themes/create") }>
                  <Plus className="mr-2 h-4 w-4" /> Add Theme
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-500">Total Themes</div>
              <div className="text-3xl font-semibold mt-2">{themes.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-500">Active Themes</div>
              <div className="text-3xl font-semibold mt-2">{activeCount}</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-500">Single Page Themes</div>
              <div className="text-3xl font-semibold mt-2">{singlePageCount}</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-500">Multi Page Themes</div>
              <div className="text-3xl font-semibold mt-2">{multiPageCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Search by name, code, or description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={layoutFilter} onValueChange={setLayoutFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Layout mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Layout Modes</SelectItem>
                <SelectItem value="single_page">Single Page</SelectItem>
                <SelectItem value="multi_page">Multi Page</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Available Themes</CardTitle>
            <CardDescription>{filteredThemes.length} theme(s) found.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-slate-500">Loading themes...</div>
            ) : filteredThemes.length === 0 ? (
              <div className="py-8 text-slate-500">No themes found.</div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredThemes.map((theme) => (
                  <div key={theme.id} className="rounded-3xl border bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xl font-semibold text-slate-900">{theme.theme_name}</div>
                        <div className="text-sm text-slate-500 mt-1">{theme.theme_code}</div>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <Badge variant={theme.is_active === 1 ? "default" : "secondary"} className="rounded-full">
                          {theme.is_active === 1 ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                          {theme.layout_mode === "multi_page" ? "Multi Page" : "Single Page"}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-600 min-h-[40px]">
                      {theme.description || "No description provided."}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span>Background: <strong>{theme.background_type}</strong></span>
                      <span>Linked Surveys: <strong>{theme.surveys_count ?? 0}</strong></span>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-400">Updated: {theme.updated_at}</div>
                      <Button className="rounded-2xl" onClick={() => navigate(`/survey/themes/edit/${theme.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
