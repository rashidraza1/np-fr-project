import { useEffect, useState } from "react";
import { useNavigate ,useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
const API = "http://localhost/survey/api/get_survey_response_by_id.php";
export default function SingleResponseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  //const surveyId = id || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}?response_id=${encodeURIComponent(id || '')}`);
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
  if (loading) return <div className="p-6">Loading response detail...</div>;
  if (!data) return <div className="p-6">Response not found.</div>;
  return (
    <div className="p-6 space-y-6">
      {/* Back Link */}
      <div className="mb-4">
        {/* <Link to={`/survey/responses/${data.response.survey_id}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Responses
        </Link> */}

        <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Responses
    </button>
      </div>
      <div className="rounded-3xl bg-white border p-6">
        {/* <button
          className="px-4 py-2 rounded-xl border mb-4"
          onClick={() =>
            (window.location.href = `/survey/responses/${surveyId}`)
          }
        >
          Back to Responses
        </button> */}
        <div className="text-3xl font-bold">
          Response {data.response.response_code}
        </div>
        <div className="text-slate-500 mt-2">
          {data.response.respondent_name || "Anonymous"} •{" "}
          {data.response.submitted_at}
        </div>
      </div>
      <div className="rounded-3xl bg-white border p-6">
        <div className="font-bold text-xl">Answers</div>
        <div className="mt-4 space-y-3">
          {(data.answers || []).map((a: any, idx: number) => (
            <div key={idx} className="rounded-2xl border p-4">
              <div className="font-semibold">
                {idx + 1}. {a.question_text}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                Type: {a.question_type}
              </div>
              <div className="mt-2">{a.answer_value || "-"}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl bg-white border p-6">
        <div className="font-bold text-xl">Comment</div>
        <div className="mt-4">
          {data.response.latest_comment || "No comment available."}
        </div>
      </div>
    </div>
  );
}
