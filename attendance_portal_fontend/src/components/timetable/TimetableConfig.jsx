import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import axios from "axios";
import { Clock, Coffee, Save } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15";

const TimetableConfig = ({ onSave, initialConfig }) => {
  const [config, setConfig] = useState(
    initialConfig?.timeTableData || {
      classTime: 45,
      labTime: 60,
      startTime: "09:30",
      endTime: "16:45",
      lunchBreak: { startTime: "13:15", endTime: "14:30" },
      slots: [],
    }
  );

  function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  function formatTimeAMPM(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  const handleConfigSave = async () => {
    if (!config.startTime || !config.endTime) {
      toast.error("Please set start and end times");
      return;
    }

    const slots = [];
    const classTime = config.classTime;

    let current = parseTime(config.startTime);
    const end = parseTime(config.endTime);
    const breakStart = parseTime(config.lunchBreak.startTime);
    const breakEnd = parseTime(config.lunchBreak.endTime);
    let index = 0;
    while (current < end) {
      const next = new Date(current.getTime() + classTime * 60000);
      if (next > breakStart && current < breakEnd) {
        current = new Date(breakEnd);
        continue;
      }
      if (next <= end) {
        slots.push({
          sortId: index,
          time: `${formatTimeAMPM(current)} - ${formatTimeAMPM(next)}`,
        });
        index++;
      }
      current = next;
    }
    const updatedConfig = { ...config, slots };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/timetable`,
        updatedConfig,
        { withCredentials: true }
      );
      const newConfig = { ...config, slots: res.data.slotsData };
      toast.success(res.data.message);
      onSave({
        ...initialConfig,
        timeTableData: res.data.timeTableData,
        slots: res.data.slotsData,
      });
      setConfig(newConfig);
    } catch (error) {
      toast.error(error.response?.data?.Error || "Could not save configuration");
    }
  };

  const Field = ({ label, children }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );

  const CLASS_OPTIONS = [45, 50, 55, 60];
  const LAB_OPTIONS = [50, 60, 90, 100, 120];

  const durationSelect = (value, onChange, options) => (
    <Select value={value?.toString()} onValueChange={(v) => onChange(parseInt(v))}>
      <SelectTrigger className="h-11 w-full rounded-xl border-slate-200">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options.map((m) => (
          <SelectItem key={m} value={m.toString()}>
            {m} minutes
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <Clock className="size-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Period timings</h3>
          <p className="text-sm text-slate-500">
            Set durations and day timings — slots are generated automatically.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Class duration">
            {durationSelect(config.classTime, (v) => setConfig({ ...config, classTime: v }), CLASS_OPTIONS)}
          </Field>
          <Field label="Lab duration">
            {durationSelect(config.labTime, (v) => setConfig({ ...config, labTime: v }), LAB_OPTIONS)}
          </Field>
          <Field label="Start time">
            <input
              type="time"
              className={inputClass}
              value={config.startTime}
              onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
            />
          </Field>
          <Field label="End time">
            <input
              type="time"
              className={inputClass}
              value={config.endTime}
              onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
            />
          </Field>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Coffee className="size-4 text-amber-500" /> Lunch break
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-md">
            <Field label="Starts">
              <input
                type="time"
                className={inputClass}
                value={config.lunchBreak.startTime}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    lunchBreak: { ...config.lunchBreak, startTime: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Ends">
              <input
                type="time"
                className={inputClass}
                value={config.lunchBreak.endTime}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    lunchBreak: { ...config.lunchBreak, endTime: e.target.value },
                  })
                }
              />
            </Field>
          </div>
        </div>

        <button
          onClick={handleConfigSave}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition-colors hover:bg-violet-700"
        >
          <Save className="size-4" /> Save configuration
        </button>
      </div>
    </div>
  );
};

export default TimetableConfig;
