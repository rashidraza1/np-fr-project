import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
const GET_API = "http://localhost/survey/api/get_survey_by_id.php";
const SAVE_API = "http://localhost/survey/api/update_survey_publish.php";
export default function SurveyPublishManagerPage() {
  const { id } = useParams();
  //const id = sp.get("id") || "";
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [form, setForm] = useState<any>({
    status: "draft",
    start_date: "",
    end_date: "",
    publish_web: false,
    publish_qr: false,
    publish_kiosk: false,
    publish_email: false,
  });
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${GET_API}?id=${encodeURIComponent(id || '')}`);
        const j = await r.json();
        if (!r.ok || !j.success) throw new Error(j.message || "Failed");
        setTitle(j.data.survey.survey_name);
        setForm({
          status: j.data.survey.status,
          start_date: j.data.survey.start_date || "",
          end_date: j.data.survey.end_date || "",
          publish_web: !!j.data.publish_settings.publish_web,
          publish_qr: !!j.data.publish_settings.publish_qr,
          publish_kiosk: !!j.data.publish_settings.publish_kiosk,
          publish_email: !!j.data.publish_settings.publish_email,
        });
      } catch (e: any) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
  async function save(status?: string) {
    try {
      const r = await fetch(SAVE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey_id: Number(id),
          ...form,
          status: status || form.status,
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.message || "Failed");
      alert(j.message || "Updated");
      setForm((p: any) => ({ ...p, status: status || p.status }));
    } catch (e: any) {
      alert(e.message);
    }
  }
  if (loading) return <div className="p-6">Loading publish manager...</div>;
  return (
    <div className="p-6 space-y-6">
        {/* Back Link */}
            <div className="mb-4">
              <Link to="/survey" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Survey
              </Link>
            </div>
      <div className="rounded-3xl bg-white border p-6">
        <div className="text-3xl font-bold">{title}</div>
        <div className="mt-4 flex gap-2">
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={() => save("published")}
          >
            Publish
          </button>
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={() => save("paused")}
          >
            Pause
          </button>
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={() => save("draft")}
          >
            Save Draft
          </button>
        </div>
      </div>
      <div className="rounded-3xl bg-white border p-6 grid gap-4 md:grid-cols-2">
        <div>
          <label>Status</label>
          <select
            className="w-full border rounded-xl p-3 mt-2"
            value={form.status}
            onChange={(e) =>
              setForm((p: any) => ({ ...p, status: e.target.value }))
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        <div>
          <label>Start Date</label>
          <input
            type="date"
            className="w-full border rounded-xl p-3 mt-2"
            value={form.start_date}
            onChange={(e) =>
              setForm((p: any) => ({ ...p, start_date: e.target.value }))
            }
          />
        </div>
        <div>
          <label>End Date</label>
          <input
            type="date"
            className="w-full border rounded-xl p-3 mt-2"
            value={form.end_date}
            onChange={(e) =>
              setForm((p: any) => ({ ...p, end_date: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          {["publish_web", "publish_qr", "publish_kiosk", "publish_email"].map(
            (k) => (
              <label key={k} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form[k]}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, [k]: e.target.checked }))
                  }
                />{" "}
                {k}
              </label>
            )
          )}
        </div>
      </div>
    </div>
  );
}
