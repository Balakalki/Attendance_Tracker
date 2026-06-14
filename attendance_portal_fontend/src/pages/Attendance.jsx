import axios from "axios";
import { useEffect, useState } from "react";
import { addDays, format, isToday } from "date-fns";
import {
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarX2,
  BadgeCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import DatePicker from "../components/ui/DatePicker";
import { toast } from "sonner";
import Loader from "../components/ui/loader";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Attendance() {
  const [data, setData] = useState();
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [day, setDay] = useState(
    selectedDate.toLocaleDateString("en-us", { weekday: "long" })
  );

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const newDay = selectedDate.toLocaleDateString("en-us", { weekday: "long" });
        setDay(newDay);
        const formatedDate = selectedDate.toISOString().split("T")[0];
        const dataFromServer = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/timetable?day=${newDay}&date=${formatedDate}`,
          { withCredentials: true }
        );
        setData(dataFromServer.data);
        const newStatus = {};
        dataFromServer?.data?.attendance?.forEach((att) => {
          newStatus[att.slotId] = att.status;
        });
        setAttendanceStatus(newStatus);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
        toast.error(`Error: ${error?.response?.data?.Error}`);
      }
      setIsLoading(false);
    };
    getData();
  }, [selectedDate]);

  useEffect(() => {
    if (data?.slots && data?.timeTableData?.days?.[day]) {
      const initialSubjects = {};
      data.timeTableData.days[day].forEach((session) => {
        const slotIndex = data.slots.findIndex(
          (slot) => slot._id === session.slotId?._id
        );
        if (slotIndex !== -1) {
          initialSubjects[session.slotId?._id] =
            session.subjectId || session.subject?._id;
        }
      });
      data.attendance.forEach((att) => {
        initialSubjects[att.slotId] = att.subjectId;
      });
      setSelectedSubjects(initialSubjects);
    }
  }, [data, day]);

  const handleSave = async (slotId, subjectId) => {
    if (!subjectId) {
      toast.error("Please select a subject first");
      return;
    }
    const formatedDate = selectedDate.toISOString().split("T")[0];
    const subjectName = data.subjects.find((sub) => sub._id === subjectId);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/attendance`,
        {
          date: formatedDate,
          class: { slotId, subjectId, status: attendanceStatus[slotId] || "Absent" },
        },
        { withCredentials: true }
      );
      if (res.status === 200 || res.status === 201) {
        toast.success(
          `Marked ${attendanceStatus[slotId] ?? "Absent"} for ${subjectName?.name}`
        );
      }
    } catch {
      toast.error("Could not save attendance");
    }
  };

  const setStatus = (slotId, value) =>
    setAttendanceStatus((prev) => ({ ...prev, [slotId]: value }));

  const scheduled = data?.timeTableData?.days?.[day] || [];
  const hasClasses = scheduled.length > 0;
  const markedSlots = new Set((data?.attendance || []).map((a) => a.slotId));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mark Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select a date, then mark each period as present or absent.
        </p>
      </div>

      {/* Date navigator */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate((d) => addDays(d, -1))}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            aria-label="Previous day"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="w-full sm:w-64">
            <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
          </div>
          <button
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            aria-label="Next day"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
            {day}
          </span>
          {isToday(selectedDate) ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              Today
            </span>
          ) : (
            <button
              onClick={() => setSelectedDate(new Date())}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Jump to today
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader />
        </div>
      ) : hasClasses ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.slots?.map((slot) => {
            const status = attendanceStatus[slot._id] || "Absent";
            const isMarked = markedSlots.has(slot._id);
            return (
              <div
                key={slot._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Clock className="size-4 text-violet-600" />
                    {slot.time}
                  </span>
                  {isMarked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <BadgeCheck className="size-3" /> Saved
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500">Subject</Label>
                  <Select
                    value={selectedSubjects[slot._id] || ""}
                    onValueChange={(val) =>
                      setSelectedSubjects((prev) => ({ ...prev, [slot._id]: val }))
                    }
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-slate-200">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.subjects.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Present / Absent segmented toggle */}
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setStatus(slot._id, "Present")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
                      status === "Present"
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Check className="size-4" /> Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(slot._id, "Absent")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
                      status === "Absent"
                        ? "bg-white text-red-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <X className="size-4" /> Absent
                  </button>
                </div>

                <button
                  onClick={() => handleSave(slot._id, selectedSubjects[slot._id])}
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition-colors hover:bg-violet-700"
                >
                  {isMarked ? "Update attendance" : "Mark attendance"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <CalendarX2 className="size-6" />
          </div>
          <p className="font-medium text-slate-700">No classes on {day}</p>
          <p className="max-w-sm text-sm text-slate-500">
            There&rsquo;s nothing scheduled for this day. Pick another date or set it up in your timetable.
          </p>
        </div>
      )}
    </div>
  );
}
