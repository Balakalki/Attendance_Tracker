import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { toast } from "sonner";
import { Plus, X, BookOpen, FlaskConical, Save, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15";

export default function TimetableEdit({ configData, onSave }) {
  const [subject, setSubject] = useState("");
  const [subjectType, setSubjectType] = useState("class");
  const [config, setConfig] = useState(configData);

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <SlidersHorizontal className="size-6" />
        </div>
        <p className="font-medium text-slate-700">No timetable configured</p>
        <p className="max-w-sm text-sm text-slate-500">
          Set your period timings under the <span className="font-medium text-violet-600">Timings</span> tab first.
        </p>
      </div>
    );
  }

  const addSubject = async () => {
    try {
      const newSubject = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/timetable/subject`,
        { name: subject, type: subjectType },
        { withCredentials: true }
      );
      const newConfig = {
        ...config,
        subjects: [...(config?.subjects || []), newSubject.data],
      };
      setConfig(newConfig);
      setSubject("");
      setSubjectType("class");
      onSave(newConfig);
      toast.success("Subject added");
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error.response?.data?.Error}`);
    }
  };

  const handleSave = async () => {
    if (!config.slots.length > 0) {
      toast.error("Please configure the timetable first");
      return;
    }
    if (config.subjects.length == 0) {
      toast.info("Please add subjects");
    }
    try {
      await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/timetable`,
        { days: config.timeTableData.days },
        { withCredentials: true }
      );
      onSave(config);
      toast.success("Timetable updated successfully");
    } catch (error) {
      toast.error(`Error: ${error.response.data.message}`);
    }
  };

  const handleDelete = async (subjectId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/api/timetable/subject/${subjectId}`,
        { withCredentials: true }
      );
      const newConfig = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/timetable`, {
        withCredentials: true,
      });
      setConfig(newConfig.data);
      onSave(newConfig.data);
      toast.success("Subject deleted");
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.Error}`);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Subjects */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900">Subjects</h3>
        <p className="mt-1 text-sm text-slate-500">
          Add the subjects and labs you attend. Labs are counted differently.
        </p>

        {config.subjects?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {config.subjects.map((sub) => (
              <span
                key={sub._id}
                className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-1.5 text-sm"
              >
                {sub.type === "lab" ? (
                  <FlaskConical className="size-3.5 text-amber-500" />
                ) : (
                  <BookOpen className="size-3.5 text-violet-500" />
                )}
                <span className="font-medium text-slate-700">{sub.name}</span>
                <span className="text-xs capitalize text-slate-400">{sub.type}</span>
                <button
                  onClick={() => handleDelete(sub._id)}
                  className="grid size-6 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete ${sub.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Subject name"
            value={subject}
            className={cn(inputClass, "sm:flex-1")}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && subject.trim()) addSubject();
            }}
          />
          <Select value={subjectType} onValueChange={setSubjectType}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 sm:w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class">Class</SelectItem>
              <SelectItem value="lab">Lab</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={addSubject}
            disabled={!subject.trim()}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition-colors hover:bg-violet-700 disabled:opacity-50"
          >
            <Plus className="size-4" /> Add
          </button>
        </div>
      </div>

      {/* Weekly assignment grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900">Weekly grid</h3>
        <p className="mt-1 text-sm text-slate-500">
          Assign a subject to each period. For labs, pick the same subject in consecutive slots.
        </p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Day
                </th>
                {config?.slots?.map((slot, index) => (
                  <th
                    key={index}
                    className="border-l border-slate-100 px-3 py-3 text-center text-xs font-medium text-slate-500"
                  >
                    {slot.time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(config.timeTableData?.days)?.map(([day, session], indexd) => (
                <tr key={indexd} className="even:bg-slate-50/40">
                  <td className="border-t border-slate-100 px-4 py-2 font-semibold text-slate-700">
                    {day}
                  </td>
                  {config?.slots?.map((slot, indexs) => (
                    <td key={indexs} className="border-l border-t border-slate-100 px-2 py-2">
                      <Select
                        value={
                          config.timeTableData.days[day]?.find(
                            (entry) => entry.slotId === slot._id
                          )?.subjectId || ""
                        }
                        onValueChange={(value) => {
                          setConfig((prevConfig) => {
                            const prevDaySessions = prevConfig.timeTableData.days[day] || [];
                            const existingIndex = prevDaySessions.findIndex(
                              (entry) => entry.slotId === slot._id
                            );
                            let updatedDaySessions = [...prevDaySessions];
                            if (existingIndex !== -1) {
                              if (value === "__none") {
                                updatedDaySessions.splice(existingIndex, 1);
                              } else {
                                updatedDaySessions[existingIndex] = {
                                  ...updatedDaySessions[existingIndex],
                                  subjectId: value,
                                };
                              }
                            } else if (value !== "__none") {
                              updatedDaySessions.push({ slotId: slot._id, subjectId: value });
                            }
                            return {
                              ...prevConfig,
                              timeTableData: {
                                ...prevConfig.timeTableData,
                                days: {
                                  ...prevConfig.timeTableData.days,
                                  [day]: updatedDaySessions,
                                },
                              },
                            };
                          });
                        }}
                      >
                        <SelectTrigger className="h-9 min-w-[120px] rounded-lg border-slate-200 text-xs">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none" className="italic text-slate-500">
                            None
                          </SelectItem>
                          {config?.subjects?.map((subject) => (
                            <SelectItem key={subject._id} value={subject._id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleSave}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition-colors hover:bg-violet-700"
        >
          <Save className="size-4" /> Save timetable
        </button>
      </div>
    </div>
  );
}
