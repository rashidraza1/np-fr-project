import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, MessageSquareText, TrendingUp, PieChart, CalendarDays, Building2, Filter, Download, Eye } from "lucide-react";

const questionBreakdown = [
  { question: "Service satisfaction", score: "4.6 / 5", responses: 3420 },
  { question: "Staff behaviour", score: "4.4 / 5", responses: 3392 },
  { question: "Waiting time", score: "3.9 / 5", responses: 3318 },
  { question: "Overall recommendation", score: "4.5 / 5", responses: 3284 },
];

const sentimentTags = [
  "Fast service appreciated",
  "Waiting time needs improvement",
  "Staff politeness praised",
  "More counters requested",
  "Clearer guidance needed",
];

export default function SurveyAnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="mb-4">
          <Link to="/survey/view/1" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to View
          </Link>
        </div>
        <div className="rounded-[28px] bg-gradient-to-r from-slate-950 to-blue-700 text-white p-7 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

            <div>
              <div className="text-sm text-blue-100 mb-2">Survey Analytics</div>
              <h1 className="text-3xl font-bold tracking-tight">Customer Satisfaction Survey Analytics</h1>
              <p className="text-blue-100 mt-2 max-w-3xl">
                Detailed performance analysis for this survey, including response trends, question-level scores, score distribution, and feedback themes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </button>
              <Link to={`/survey/responses/1`} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                <Eye className="h-4 w-4" /> Responses
              </Link>
              <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Responses", "3,420"],
            ["Average Score", "4.6"],
            ["Completion Rate", "92%"],
            ["Comments", "1,280"],
            ["Low Scores", "183"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <div className="text-sm font-medium text-slate-500">{label}</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Performance trend</h2>
                <p className="text-slate-500 mt-1">Response growth and score movement over the selected period.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <div className="rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-slate-700 font-semibold inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Last 30 Days
                </div>
                <div className="rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-slate-700 font-semibold inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Main Branch
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 h-[300px] flex items-center justify-center text-slate-500">
                Trend chart area
              </div>
              <div className="rounded-[24px] border border-slate-200 p-5 bg-white">
                <h3 className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" /> Trend insights
                </h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    Response volume increased by 14% compared to the previous period.
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    Average score dipped slightly on waiting-time related answers.
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    Comment submissions rose with low-score responses in the last week.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Question breakdown
              </h2>
              <p className="text-slate-500 mt-1">Question-wise average score and participation level.</p>
              <div className="mt-5 space-y-4">
                {questionBreakdown.map((item) => (
                  <div key={item.question} className="rounded-[22px] border border-slate-200 p-5 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-bold text-slate-900">{item.question}</div>
                        <div className="text-sm text-slate-500 mt-1">Responses: {item.responses.toLocaleString()}</div>
                      </div>
                      <div className="rounded-full bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-bold text-blue-700">
                        {item.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2">
                  <PieChart className="h-5 w-5" /> Score distribution
                </h2>
                <p className="text-slate-500 mt-1">Distribution of high, medium, and low ratings.</p>
                <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 h-[250px] flex items-center justify-center text-slate-500">
                  Score distribution chart
                </div>
              </div>

              <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 inline-flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5" /> Feedback themes
                </h2>
                <p className="text-slate-500 mt-1">Most common patterns appearing in comments.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {sentimentTags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
