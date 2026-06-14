import { CalendarCheck, CalendarDays, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: CalendarDays,
    title: "Build your weekly timetable",
    desc: "Set periods, labs and breaks in minutes.",
  },
  {
    icon: CheckCircle2,
    title: "Mark attendance in seconds",
    desc: "Day-by-day, with classes and labs weighted right.",
  },
  {
    icon: TrendingUp,
    title: "Know your safe zone",
    desc: "Live percentage with 75% and 65% alerts.",
  },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 lg:grid lg:grid-cols-2">
      {/* ── Brand panel (desktop) ───────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:22px_22px]" />

        <div className="relative flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <CalendarCheck className="size-6" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Attendance Tracker</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight">
            Stay above the line, effortlessly.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-violet-100">
            Plan your weekly timetable, mark attendance in seconds, and always know exactly
            how many classes you can afford to miss.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <f.icon className="size-[18px]" />
                </div>
                <div>
                  <p className="font-medium">{f.title}</p>
                  <p className="text-sm text-violet-200">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-sm text-violet-200">
          <div className="flex -space-x-2">
            {["bg-pink-300", "bg-amber-300", "bg-emerald-300"].map((c, i) => (
              <span key={i} className={cn("size-7 rounded-full ring-2 ring-violet-600", c)} />
            ))}
          </div>
          <span>Loved by students who hate spreadsheets.</span>
        </div>
      </div>

      {/* ── Form panel ──────────────────────────────────────── */}
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-xl bg-violet-600 text-white">
              <CalendarCheck className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              Attendance Tracker
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
              {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
            </div>
            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}
