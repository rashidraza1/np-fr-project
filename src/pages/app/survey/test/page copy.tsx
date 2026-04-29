import { Link } from "react-router-dom";
import { ArrowLeft, Send, Link2, QrCode, Globe, ShieldCheck, CalendarDays, PauseCircle, PlayCircle, LockKeyhole, Mail, MonitorSmartphone, CheckCircle2 } from "lucide-react";

const channels = [
  { name: "Web Link", icon: Globe, enabled: true },
  { name: "QR Code", icon: QrCode, enabled: true },
  { name: "Kiosk", icon: MonitorSmartphone, enabled: true },
  { name: "Email Invite", icon: Mail, enabled: false },
];

export default function SurveyPublishManagerPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Back Link */}
        <div className="mb-4">
          <Link to="/survey/view/1" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Survey View
          </Link>
        </div>
        <div className="rounded-[28px] bg-gradient-to-r from-slate-950 to-blue-700 text-white p-7 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm text-blue-100 mb-2">Survey Publish Manager</div>
              <h1 className="text-3xl font-bold tracking-tight">Customer Satisfaction Survey Publish Settings</h1>
              <p className="text-blue-100 mt-2 max-w-3xl">
                Manage the live status, access controls, channels, publish period, and respondent-facing assets for this survey from one clean operations page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                <PauseCircle className="h-4 w-4" /> Pause Survey
              </button>
              <button className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                <PlayCircle className="h-4 w-4" /> Resume
              </button>
              <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                <Send className="h-4 w-4" /> Publish Now
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Current Status", "Published"],
            ["Access Mode", "Anonymous"],
            ["Active Channels", "3"],
            ["Readiness", "92%"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
              <div className="text-sm font-medium text-slate-500">{label}</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Publish status & timing</h2>
            <p className="text-slate-500 mt-1">Control whether the survey is live and define when it should run.</p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mt-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <select className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none">
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Paused</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Access Mode</label>
                <select className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none">
                  <option>Anonymous</option>
                  <option>Login Required</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Start Date</label>
                <input type="date" defaultValue="2026-04-01" className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">End Date</label>
                <input type="date" defaultValue="2026-05-31" className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none" />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 inline-flex gap-3 items-start">
                <CalendarDays className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase text-slate-500">Publish Window</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">01 Apr 2026 – 31 May 2026</div>
                  <div className="text-sm text-slate-500 mt-1">Survey is currently active</div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 inline-flex gap-3 items-start">
                <ShieldCheck className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase text-slate-500">Response Policy</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">Anonymous Allowed</div>
                  <div className="text-sm text-slate-500 mt-1">Multiple responses disabled</div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 inline-flex gap-3 items-start">
                <LockKeyhole className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase text-slate-500">Authentication</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">Login Not Required</div>
                  <div className="text-sm text-slate-500 mt-1">Open survey access</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Channel management</h2>
            <p className="text-slate-500 mt-1">Choose where and how the survey will be available to respondents.</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.name} className="rounded-[22px] border border-slate-200 p-5 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 inline-flex">
                          <Icon className="h-5 w-5 text-slate-700" />
                        </div>
                        <div className="mt-4 text-lg font-bold text-slate-900">{channel.name}</div>
                        <div className="text-sm text-slate-500 mt-1">{channel.enabled ? "Currently enabled" : "Currently disabled"}</div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold border ${channel.enabled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
                        {channel.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Respondent assets</h2>
              <p className="text-slate-500 mt-1">Link and QR assets used for respondent access.</p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-xs font-bold uppercase text-slate-500">Survey Link</div>
                  <div className="mt-2 inline-flex items-center gap-2 text-slate-900 font-semibold break-all">
                    <Link2 className="h-4 w-4" /> https://survey.local/csat-001
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 h-[220px] flex items-center justify-center text-slate-500">
                  QR Preview Area
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-950 text-white p-6 shadow-xl">
              <h2 className="text-2xl font-bold">Launch panel</h2>
              <p className="text-slate-300 mt-1">Final readiness and action controls before going live.</p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="text-xs font-bold uppercase text-slate-300">Readiness</div>
                  <div className="mt-2 text-3xl font-bold">92%</div>
                  <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[92%] bg-emerald-400 rounded-full" />
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-200 space-y-2">
                  <div className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Basic details completed</div>
                  <div className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Survey structure completed</div>
                  <div className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> At least one channel enabled</div>
                  <div className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Publish dates configured</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                    <Send className="h-4 w-4" /> Publish Now
                  </button>
                  <button className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                    <PauseCircle className="h-4 w-4" /> Pause
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
