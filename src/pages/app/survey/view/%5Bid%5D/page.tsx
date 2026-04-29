import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
const API = `${import.meta.env.VITE_SURVEY_API_URL}api/get_survey_by_id.php`;
export default function SurveyDetailPage() {
  const params = useParams();
  const id = params.id || "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}?id=${encodeURIComponent(id)}`);
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
  if (loading) return <div className="p-6">Loading survey details...</div>;
  if (!data) return <div className="p-6">Survey not found.</div>;
  return (
    <div className="p-6 space-y-6">
      <div className="rounded-3xl bg-white border p-6">
        <div className="text-3xl font-bold">{data.survey.survey_name}</div>
        <div className="text-slate-500 mt-2">
          {data.survey.description || "-"}
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={() =>
              (window.location.href = `/surveys/edit?id=${data.survey.id}`)
            }
          >
            Edit
          </button>
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={() =>
              (window.location.href = `/surveys/publish?id=${data.survey.id}`)
            }
          >
            Publish
          </button>
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={() =>
              (window.location.href = `/surveys/analytics?id=${data.survey.id}`)
            }
          >
            Analytics
          </button>
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={() =>
              (window.location.href = `/surveys/responses?id=${data.survey.id}`)
            }
          >
            Responses
          </button>
        </div>
      </div>
      <div className="rounded-3xl bg-white border p-6">
        <div className="font-bold text-xl">Sections</div>
        <div className="mt-4 space-y-4">
          {(data.sections || []).map((s: any, idx: number) => (
            <div key={s.id} className="rounded-2xl border p-4">
              <div className="font-semibold">
                {idx + 1}. {s.section_title}
              </div>
              <div className="text-sm text-slate-500 mt-2">
                {(s.questions || []).length} questions
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
