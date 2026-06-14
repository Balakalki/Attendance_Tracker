import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CalendarPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Loader from "../components/ui/loader";

const THRESHOLD = 75;

const ZONES = {
  good: { text: "text-emerald-600", ring: "text-emerald-500", bar: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100", label: "On track" },
  warn: { text: "text-amber-600", ring: "text-amber-500", bar: "bg-amber-500", soft: "bg-amber-50 text-amber-700 ring-1 ring-amber-100", label: "Cutting it close" },
  bad: { text: "text-red-600", ring: "text-red-500", bar: "bg-red-500", soft: "bg-red-50 text-red-700 ring-1 ring-red-100", label: "Below safe zone" },
  none: { text: "text-slate-500", ring: "text-slate-300", bar: "bg-slate-300", soft: "bg-slate-100 text-slate-600 ring-1 ring-slate-200", label: "No data" },
};

const zoneOf = (pct, hasData = true) => {
  if (!hasData) return ZONES.none;
  if (pct >= 75) return ZONES.good;
  if (pct >= 65) return ZONES.warn;
  return ZONES.bad;
};

const fmt = (n) => (Number.isInteger(n) ? n : Number(n.toFixed(1)));

// How many classes you can still miss (or must attend) to hold THRESHOLD%.
function bunkInfo(attended, total) {
  if (!total) return null;
  const t = THRESHOLD / 100;
  const pct = (attended / total) * 100;
  if (pct >= THRESHOLD) {
    return { safe: true, n: Math.max(0, Math.floor(attended / t - total)) };
  }
  return { safe: false, n: Math.max(0, Math.ceil((t * total - attended) / (1 - t))) };
}

function Ring({ value, zone }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(value, 0), 100) / 100) * c;
  return (
    <div className="relative grid size-40 place-items-center">
      <svg viewBox="0 0 120 120" className="size-40 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="11" className="text-slate-100" stroke="currentColor" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          className={cn("transition-all duration-700", zone.ring)}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-3xl font-bold tracking-tight", zone.text)}>{value === null ? "—" : `${fmt(value)}%`}</span>
        <span className="text-xs font-medium text-slate-400">attendance</span>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="flex min-h-[140px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={cn("grid size-9 place-items-center rounded-xl", accent)}>
          <Icon className="size-[18px]" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        {sub && <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

function SubjectCard({ sub }) {
  const hasData = sub.total > 0;
  const pct = hasData ? (sub.attended * 100) / sub.total : 0;
  const zone = zoneOf(pct, hasData);
  const info = bunkInfo(sub.attended, sub.total);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{sub.name}</h3>
          <span className="mt-1 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-500">
            {sub.type}
          </span>
        </div>
        <span className={cn("rounded-lg px-2.5 py-1 text-sm font-semibold", zone.soft)}>
          {hasData ? `${fmt(pct)}%` : "No data"}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {hasData ? `${fmt(sub.attended)} / ${fmt(sub.total)} attended` : "Not marked yet"}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={cn("h-full rounded-full transition-all duration-500", zone.bar)} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>

      {info && (
        <p className="text-xs font-medium text-slate-500">
          {info.safe ? (
            <span className="text-emerald-600">Can miss {info.n} more</span>
          ) : (
            <span className="text-red-600">Attend {info.n} more to reach {THRESHOLD}%</span>
          )}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPercent, setTotalPercent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const summary = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/summary`, {
          withCredentials: true,
        });
        const newData = summary?.data;
        let totalClasses = 0;
        let attendedClasses = 0;
        const lab = newData.classTime / newData.labTime;
        newData?.subjects?.forEach((sub) => {
          if (sub.type === "lab") {
            sub.total = sub.total * lab;
            sub.attended = sub.attended * lab;
          }
          totalClasses += sub.total;
          attendedClasses += sub.attended;
        });
        setData({ ...newData, totalClasses, attendedClasses });
        setTotalPercent(totalClasses === 0 ? 0 : (attendedClasses * 100) / totalClasses);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else {
          setError("something went wrong");
        }
      }
      setLoading(false);
    };
    fetchSummary();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p className="text-lg font-semibold text-red-600">{error}</p>
      </div>
    );
  }

  const subjects = data?.subjects ?? [];
  const hasData = data?.totalClasses > 0;
  const overallZone = zoneOf(totalPercent, hasData);
  const missed = (data?.totalClasses ?? 0) - (data?.attendedClasses ?? 0);
  const overallInfo = bunkInfo(data?.attendedClasses ?? 0, data?.totalClasses ?? 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Your attendance at a glance.</p>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium", overallZone.soft)}>
          {hasData && totalPercent >= 75 ? <ShieldCheck className="size-4" /> : <AlertTriangle className="size-4" />}
          {overallZone.label}
        </span>
      </div>

      {/* Hero + stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Ring value={hasData ? totalPercent : 0} zone={overallZone} />
          {overallInfo ? (
            <p className="text-center text-sm text-slate-500">
              {overallInfo.safe ? (
                <>You can miss <span className="font-semibold text-emerald-600">{overallInfo.n}</span> more and stay above {THRESHOLD}%.</>
              ) : (
                <>Attend <span className="font-semibold text-red-600">{overallInfo.n}</span> more to reach {THRESHOLD}%.</>
              )}
            </p>
          ) : (
            <p className="text-center text-sm text-slate-400">Mark some attendance to see your progress.</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
          <StatTile icon={BookOpen} label="Total classes" value={fmt(data?.totalClasses ?? 0)} sub={`Across ${subjects.length} subject${subjects.length === 1 ? "" : "s"}`} accent="bg-violet-50 text-violet-600" />
          <StatTile icon={CheckCircle2} label="Attended" value={fmt(data?.attendedClasses ?? 0)} sub={hasData ? `${fmt(totalPercent)}% of classes` : "—"} accent="bg-emerald-50 text-emerald-600" />
          <StatTile icon={XCircle} label="Missed" value={fmt(missed)} sub={hasData ? `${fmt(100 - totalPercent)}% of classes` : "—"} accent="bg-rose-50 text-rose-600" />
        </div>
      </div>

      {/* Subjects */}
      <div className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <TrendingUp className="size-5 text-violet-600" /> Subject-wise attendance
        </h2>

        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-600">
              <CalendarPlus className="size-6" />
            </div>
            <p className="font-medium text-slate-700">No subjects yet</p>
            <p className="max-w-sm text-sm text-slate-500">
              Set up your timetable and subjects to start tracking attendance.
            </p>
            <Link
              to="/timetable"
              className="mt-1 inline-flex h-9 items-center rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Go to Timetable
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {subjects.map((sub) => (
              <SubjectCard key={sub._id} sub={sub} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
