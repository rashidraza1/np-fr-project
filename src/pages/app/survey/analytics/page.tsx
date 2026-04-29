import { useEffect, useState } from "react";
import { Link,useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
const API = "http://localhost/survey/api/get_survey_analytics.php";
export default function SurveyAnalyticsPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}?survey_id=${encodeURIComponent(id || '')}`);
        const j = await r.json();
        if (!r.ok || !j.success) throw new Error(j.message || "Failed");
        setData(j.data);
      } catch (e: any) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!data) return <div className="p-6">Analytics not found.</div>;
  return (
    <div className="p-6 space-y-6">
        {/* Back Link */}
            <div className="mb-4">
              <Link to="/survey" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Survey
              </Link>
            </div>
      <div className="rounded-3xl bg-white border p-6">
        <div className="text-3xl font-bold">{data.survey.survey_name}</div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Responses", data.totals.total_responses],
          ["Completed", data.totals.completed_responses],
          ["Avg Score", data.totals.average_numeric_score ?? "-"],
          ["Comments", data.totals.total_comments],
        ].map(([l, v]) => (
          <div key={String(l)} className="rounded-2xl bg-white border p-4">
            <div className="text-slate-500">{l}</div>
            <div className="text-2xl font-bold mt-2">{String(v)}</div>
          </div>
        ))}
      </div>
      <div className="rounded-3xl bg-white border p-6">
        <div className="font-bold text-xl">Question breakdown</div>
        <div className="mt-4 space-y-3">
          {(data.question_breakdown || []).map((q: any, idx: number) => (
            <div key={idx} className="rounded-2xl border p-4">
              <div className="font-semibold">{q.question_text}</div>
              <div className="text-sm text-slate-500 mt-1">
                Answers: {q.total_answers}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
