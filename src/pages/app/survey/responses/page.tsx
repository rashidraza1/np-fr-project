import { useEffect, useMemo, useState } from "react";
import { Link,useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
const API = "http://localhost/survey/api/list_survey_responses.php";
export default function SurveyResponsesPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
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
  const rows = useMemo(() => {
    if (!data) return [];
    const t = q.toLowerCase().trim();
    if (!t) return data.responses || [];
    return (data.responses || []).filter((r: any) =>
      JSON.stringify(r).toLowerCase().includes(t)
    );
  }, [data, q]);
  if (loading) return <div className="p-6">Loading responses...</div>;
  if (!data) return <div className="p-6">Responses not found.</div>;
  return (
    <div className="p-6 space-y-6">
      {/* Back Link */}
                  <div className="mb-4">
                    <Link to={`/survey/view/${id}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                      <ArrowLeft className="h-4 w-4" /> Back to Survey View
                    </Link>
                  </div>
      <div className="rounded-3xl bg-white border p-6">
        <div className="text-3xl font-bold">{data.survey.survey_name}</div>
        <input
          className="w-full border rounded-xl p-3 mt-4"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search responses"
        />
      </div>
      <div className="rounded-3xl bg-white border p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Respondent</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Score</th>
              <th className="text-left p-3">Submitted</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.response_code}</td>
                <td className="p-3">{r.respondent_name || "Anonymous"}</td>
                <td className="p-3">{r.response_status}</td>
                <td className="p-3">{r.overall_score ?? "-"}</td>
                <td className="p-3">{r.submitted_at}</td>
                <td className="p-3">
                  <button
                    className="px-3 py-2 rounded-xl border"
                    onClick={() =>
                      (window.location.href = `/survey/responses/view/${r.id}`)
                    }
                  >
                    View Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
