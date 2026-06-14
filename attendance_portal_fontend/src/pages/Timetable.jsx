import { useEffect, useState } from "react";
import TimetableView from "../components/timetable/TimetableView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import axios from "axios";
import ManageTimetable from "../components/timetable/MangageTimetable";
import Loader from "../components/ui/loader";
import { useNavigate } from "react-router-dom";
import { CalendarRange, Settings2 } from "lucide-react";

const triggerClass =
  "gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm";

export default function Timetable() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTimetable = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/timetable`, {
        withCredentials: true,
      });
      setData(res.data);
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/login");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Timetable</h1>
        <p className="mt-1 text-sm text-slate-500">
          View your weekly schedule, configure timings, and assign subjects.
        </p>
      </div>

      <Tabs defaultValue="viewTimetable" className="gap-5">
        <TabsList className="h-11 w-full max-w-sm rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="viewTimetable" className={triggerClass}>
            <CalendarRange className="size-4" /> View
          </TabsTrigger>
          <TabsTrigger value="manageTimetable" className={triggerClass}>
            <Settings2 className="size-4" /> Manage
          </TabsTrigger>
        </TabsList>
        <TabsContent value="viewTimetable">
          <TimetableView data={data} />
        </TabsContent>
        <TabsContent value="manageTimetable">
          <ManageTimetable data={data} onSave={setData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
