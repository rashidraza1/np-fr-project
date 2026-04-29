import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  FilePenLine,
  Eye,
  Send,
  BarChart3,
  Archive,
  Plus,
  LayoutGrid,
  Table2,
  MonitorSmartphone,
} from "lucide-react";

type SurveyStatus = "draft" | "published" | "paused";
type SurveyType = "nps" | "csat" | "ces" | "custom";

type SurveyRow = {
  id: number;
  survey_name: string;
  survey_code: string;
  survey_type: SurveyType;
  description: string;
  status: SurveyStatus;
  start_date: string | null;
  end_date: string | null;
  section_count: number;
  question_count: number;
  response_count: number;
  created_at: string;
  updated_at: string;
  devices: string[];
};

type SurveyListApiResponse = {
  success: boolean;
  message?: string;
  data: SurveyRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    summary: {
      total_surveys: number;
      draft_count: number;
      published_count: number;
      paused_count: number;
    };
  };
};

type Filters = {
  search: string;
  status: string;
  survey_type: string;
  page: number;
  limit: number;
};

const API_URL = `${import.meta.env.VITE_SURVEY_API_URL}api/list.php`;
const JWT_ENABLED = false;
const JWT_STORAGE_KEY = "jwt_token";
const DEFAULT_LIMIT = 10;

function statusBadgeClass(status: string) {
  if (status === "published") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "draft") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

function prettyStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function prettyType(type: string) {
  return type.toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return value;
}

function buildQueryString(filters: Filters) {
  const params = new URLSearchParams();

  const search = filters.search.trim();
  if (search !== "") params.set("search", search);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.survey_type !== "all") params.set("survey_type", filters.survey_type);

  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));

  return params.toString();
}

async function fetchSurveyList(filters: Filters): Promise<SurveyListApiResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (JWT_ENABLED) {
    const token = localStorage.getItem(JWT_STORAGE_KEY) || "";
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const query = buildQueryString(filters);
  const response = await fetch(`${API_URL}?${query}`, {
    method: "GET",
    headers,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to load surveys.");
  }

  return data;
}

export default function SurveyListingPageWithApi() {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    survey_type: "all",
    page: 1,
    limit: DEFAULT_LIMIT,
  });

  const [rows, setRows] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");

  const [meta, setMeta] = useState<SurveyListApiResponse["meta"]>({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    total_pages: 1,
    summary: {
      total_surveys: 0,
      draft_count: 0,
      published_count: 0,
      paused_count: 0,
    },
  });

  const filterValidation = useMemo(() => {
    const errors: Record<string, string> = {};

    if (filters.search.length > 150) {
      errors.search = "Search text must be 150 characters or less.";
    }

    if (filters.page < 1) {
      errors.page = "Page must be at least 1.";
    }

    if (filters.limit < 1 || filters.limit > 100) {
      errors.limit = "Limit must be between 1 and 100.";
    }

    return errors;
  }, [filters]);

  const loadData = async () => {
    if (Object.keys(filterValidation).length > 0) {
      setErrorText("Please fix filter validation errors before searching.");
      return;
    }

    try {
      setLoading(true);
      setErrorText("");

      const result = await fetchSurveyList(filters);

      setRows(result.data || []);
      setMeta(result.meta);
    } catch (error: any) {
      setErrorText(error.message || "Unable to load survey list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" || key === "limit" ? (value as number) : 1,
    }));
  }

  function handleSearchSubmit() {
    setFilters((prev) => ({ ...prev, page: 1 }));
    setTimeout(() => {
      loadData();
    }, 0);
  }

  function handleResetFilters() {
    setFilters({
      search: "",
      status: "all",
      survey_type: "all",
      page: 1,
      limit: DEFAULT_LIMIT,
    });
    setTimeout(() => {
      loadData();
    }, 0);
  }

  function goToEdit(id: number) {
    window.location.href = `/survey/edit/${id}`;
  }

  function goToView(id: number) {
    window.location.href = `/survey/view/${id}`;
  }

  function goToPublish(id: number) {
    window.location.href = `/survey/publish/${id}`;
  }

  function goToAnalytics(id: number) {
    window.location.href = `/survey/analytics/${id}`;
  }

  function goToResponses(id: number) {
    window.location.href = `/survey/responses/${id}`;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[28px] bg-gradient-to-r from-slate-950 to-blue-700 text-white p-7 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm text-blue-100 mb-2">Survey Management</div>
              <h1 className="text-3xl font-bold tracking-tight">Survey Listing / Library</h1>
              <p className="text-blue-100 mt-2 max-w-3xl">
                Browse all surveys from the database, filter results, and move directly into view, edit, publish,
                analytics, or responses.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" /> {loading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
                onClick={() => (window.location.href = "/survey/archive")}
              >
                <Archive className="h-4 w-4" /> Archived Surveys
              </button>

              <button
                className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 inline-flex items-center gap-2"
                onClick={() => (window.location.href = "/survey/create")}
              >
                <Plus className="h-4 w-4" /> Create Survey
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Total Surveys</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{meta.summary.total_surveys}</div>
          </div>
          <div className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Published</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{meta.summary.published_count}</div>
          </div>
          <div className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Draft</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{meta.summary.draft_count}</div>
          </div>
          <div className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Paused</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{meta.summary.paused_count}</div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Filter and manage surveys</h2>
            <p className="text-slate-500 mt-1">Search survey name, code, description, and devices.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <Search className="h-4 w-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none"
                placeholder="Search survey name, code, description, device"
              />
              {filterValidation.search && (
                <p className="text-sm text-red-600 mt-2">{filterValidation.search}</p>
              )}
            </div>

            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </select>

            <select
              value={filters.survey_type}
              onChange={(e) => updateFilter("survey_type", e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">All Types</option>
              <option value="csat">CSAT</option>
              <option value="nps">NPS</option>
              <option value="ces">CES</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 flex-wrap">
              <button
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
                onClick={handleSearchSubmit}
                disabled={loading}
              >
                <Filter className="h-4 w-4" /> Apply Filters
              </button>

              <button
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold"
                onClick={handleResetFilters}
                disabled={loading}
              >
                Reset
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setView("table")}
                className={`rounded-full px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 border ${view === "table" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}
              >
                <Table2 className="h-4 w-4" /> Table View
              </button>
              <button
                onClick={() => setView("cards")}
                className={`rounded-full px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 border ${view === "cards" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}
              >
                <LayoutGrid className="h-4 w-4" /> Card View
              </button>
            </div>
          </div>

          {errorText && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errorText}
            </div>
          )}

          {view === "table" ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-4">Survey</th>
                    <th className="text-left px-4 py-4">Type</th>
                    <th className="text-left px-4 py-4">Devices</th>
                    <th className="text-left px-4 py-4">Status</th>
                    <th className="text-left px-4 py-4">Dates</th>
                    <th className="text-left px-4 py-4">Structure</th>
                    <th className="text-left px-4 py-4">Responses</th>
                    <th className="text-left px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                        No surveys found.
                      </td>
                    </tr>
                  ) : null}

                  {rows.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100 bg-white">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{item.survey_name}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.survey_code}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-bold">
                          {prettyType(item.survey_type)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {(item.devices || []).length ? (
                            item.devices.map((device, index) => (
                              <span
                                key={`${item.id}-${index}`}
                                className="rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-bold inline-flex items-center gap-1"
                              >
                                <MonitorSmartphone className="h-3 w-3" />
                                {device}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(item.status)}`}>
                          {prettyStatus(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>{formatDate(item.start_date)}</div>
                        <div className="text-xs text-slate-500 mt-1">to {formatDate(item.end_date)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div>{item.section_count} sections</div>
                        <div className="text-xs text-slate-500 mt-1">{item.question_count} questions</div>
                      </td>
                      <td className="px-4 py-4 font-semibold">{item.response_count}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2" onClick={() => goToView(item.id)}>
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2" onClick={() => goToEdit(item.id)}>
                            <FilePenLine className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2" onClick={() => goToPublish(item.id)}>
                            <Send className="h-3.5 w-3.5" /> Publish
                          </button>
                          <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2" onClick={() => goToAnalytics(item.id)}>
                            <BarChart3 className="h-3.5 w-3.5" /> Analytics
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {rows.length === 0 && !loading ? (
                <div className="rounded-[22px] border border-slate-200 bg-white p-8 text-center text-slate-500 xl:col-span-2">
                  No surveys found.
                </div>
              ) : null}

              {rows.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-bold text-slate-900">{item.survey_name}</div>
                      <div className="text-sm text-slate-500 mt-1">{item.survey_code}</div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(item.status)}`}>
                      {prettyStatus(item.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-bold">
                      {prettyType(item.survey_type)}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase text-slate-500 mb-2">Devices</div>
                    <div className="flex flex-wrap gap-2">
                      {(item.devices || []).length ? (
                        item.devices.map((device, index) => (
                          <span
                            key={`${item.id}-card-${index}`}
                            className="rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <MonitorSmartphone className="h-3 w-3" />
                            {device}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">No devices linked</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-[11px] font-bold uppercase text-slate-500">Sections</div>
                      <div className="text-lg font-bold mt-1">{item.section_count}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-[11px] font-bold uppercase text-slate-500">Questions</div>
                      <div className="text-lg font-bold mt-1">{item.question_count}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-[11px] font-bold uppercase text-slate-500">Responses</div>
                      <div className="text-lg font-bold mt-1">{item.response_count}</div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600">
                    <div><span className="font-semibold">Dates:</span> {formatDate(item.start_date)} to {formatDate(item.end_date)}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2" onClick={() => goToView(item.id)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2" onClick={() => goToEdit(item.id)}>
                      <FilePenLine className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2" onClick={() => goToPublish(item.id)}>
                      <Send className="h-3.5 w-3.5" /> Publish
                    </button>
                    <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2" onClick={() => goToResponses(item.id)}>
                      <Eye className="h-3.5 w-3.5" /> Responses
                    </button>
                    <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2" onClick={() => goToAnalytics(item.id)}>
                      <BarChart3 className="h-3.5 w-3.5" /> Analytics
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-500">
              Page <span className="font-bold text-slate-800">{meta.page}</span> of{" "}
              <span className="font-bold text-slate-800">{meta.total_pages}</span> • Total{" "}
              <span className="font-bold text-slate-800">{meta.total}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                disabled={meta.page <= 1 || loading}
                onClick={() => updateFilter("page", meta.page - 1)}
              >
                Previous
              </button>

              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                disabled={meta.page >= meta.total_pages || loading}
                onClick={() => updateFilter("page", meta.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
