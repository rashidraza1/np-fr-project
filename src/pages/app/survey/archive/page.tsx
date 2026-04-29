import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Archive, Search, RotateCcw, Eye, Trash2, CalendarDays } from "lucide-react";

const archivedSurveys = [
  { id: 1, name: "Old Front Desk Survey", code: "ARC-001", type: "CSAT", branch: "Main Branch", department: "Reception", archivedOn: "2026-03-01", responses: 812, questions: 9, sections: 2 },
  { id: 2, name: "Legacy NPS Counter Survey", code: "ARC-002", type: "NPS", branch: "City Center", department: "Customer Service", archivedOn: "2026-02-14", responses: 1420, questions: 7, sections: 2 },
  { id: 3, name: "Service Exit Feedback", code: "ARC-003", type: "CUSTOM", branch: "West Office", department: "Support", archivedOn: "2026-01-22", responses: 694, questions: 11, sections: 3 },
  { id: 4, name: "Billing Experience Survey", code: "ARC-004", type: "CES", branch: "East Office", department: "Billing", archivedOn: "2025-12-19", responses: 955, questions: 8, sections: 2 },
];

export default function ArchivedSurveyPage() {
  const [view, setView] = useState<"table" | "cards">("table");

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Back Link */}
        <div className="mb-4">
          <Link to="/survey" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Survey
          </Link>
        </div>
        <div className="rounded-[28px] bg-gradient-to-r from-slate-950 to-slate-700 text-white p-7 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm text-slate-300 mb-2">Survey Archive</div>
              <h1 className="text-3xl font-bold tracking-tight">Archived Surveys</h1>
              <p className="text-slate-300 mt-2 max-w-3xl">
                Keep older or inactive surveys out of the active library while still allowing review, restore, or permanent deletion when needed.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                <RotateCcw className="h-4 w-4" /> Bulk Restore
              </button>
              <Link to="/survey" className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                <Archive className="h-4 w-4" /> Active Library
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Archived Surveys", "24"],
            ["Total Archived Responses", "9,842"],
            ["Restorable", "18"],
            ["Oldest Archive", "2025"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <div className="text-sm font-medium text-slate-500">{label}</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Browse archived surveys</h2>
            <p className="text-slate-500 mt-1">Search old surveys, review archive details, and restore the right survey back into the active library.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search className="h-4 w-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none" placeholder="Search archived survey name or code" />
            </div>
            <select className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none">
              <option>All Types</option>
              <option>CSAT</option>
              <option>NPS</option>
              <option>CES</option>
              <option>Custom</option>
            </select>
            <select className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none">
              <option>All Branches</option>
              <option>Main Branch</option>
              <option>City Center</option>
            </select>
            <select className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none">
              <option>Archive Date</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Older</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button onClick={() => setView("table")} className={`rounded-full px-4 py-2 text-sm font-semibold border ${view === "table" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}>
                Table View
              </button>
              <button onClick={() => setView("cards")} className={`rounded-full px-4 py-2 text-sm font-semibold border ${view === "cards" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}>
                Card View
              </button>
            </div>
            <div className="text-sm text-slate-500">Showing <span className="font-bold text-slate-800">{archivedSurveys.length}</span> archived surveys</div>
          </div>

          {view === "table" ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-4">Survey</th>
                    <th className="text-left px-4 py-4">Type</th>
                    <th className="text-left px-4 py-4">Branch / Dept</th>
                    <th className="text-left px-4 py-4">Archived On</th>
                    <th className="text-left px-4 py-4">Responses</th>
                    <th className="text-left px-4 py-4">Structure</th>
                    <th className="text-left px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedSurveys.map((survey) => (
                    <tr key={survey.id} className="border-t border-slate-100 bg-white">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{survey.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{survey.code}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-bold">{survey.type}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>{survey.branch}</div>
                        <div className="text-xs text-slate-500 mt-1">{survey.department}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center gap-2 text-slate-700"><CalendarDays className="h-4 w-4" /> {survey.archivedOn}</div>
                      </td>
                      <td className="px-4 py-4 font-semibold">{survey.responses.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <div>{survey.sections} sections</div>
                        <div className="text-xs text-slate-500 mt-1">{survey.questions} questions</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/survey/view/${survey.id}`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> View</Link>
                          <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5" /> Restore</button>
                          <button className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-xs font-semibold inline-flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {archivedSurveys.map((survey) => (
                <div key={survey.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-bold text-slate-900">{survey.name}</div>
                      <div className="text-sm text-slate-500 mt-1">{survey.code}</div>
                    </div>
                    <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-bold">Archived</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-bold">{survey.type}</span>
                    <span className="rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-bold">{survey.branch}</span>
                    <span className="rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 text-xs font-bold">{survey.department}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] font-bold uppercase text-slate-500">Responses</div><div className="text-lg font-bold mt-1">{survey.responses}</div></div>
                    <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] font-bold uppercase text-slate-500">Sections</div><div className="text-lg font-bold mt-1">{survey.sections}</div></div>
                    <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] font-bold uppercase text-slate-500">Questions</div><div className="text-lg font-bold mt-1">{survey.questions}</div></div>
                    <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] font-bold uppercase text-slate-500">Archived</div><div className="text-sm font-bold mt-1">{survey.archivedOn}</div></div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link to={`/survey/view/${survey.id}`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> View</Link>
                    <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold inline-flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5" /> Restore</button>
                    <button className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-xs font-semibold inline-flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
