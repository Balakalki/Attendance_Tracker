import { useEffect, useState } from "react";
import TimetableView from "../components/timetable/TimetableView";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import axios from "axios";
import ManageTimetable from "../components/timetable/MangageTimetable";
import Loader from "../components/ui/loader";
import { useNavigate } from "react-router-dom";

export default function Timetable() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchTimetable = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/timetable`,
        { withCredentials: true }
      );
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
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }
  return (
    <div>
      <Tabs defaultValue="viewTimetable">
        <TabsList>
          <TabsTrigger value="viewTimetable">View Timetable</TabsTrigger>
          <TabsTrigger value="manageTimetable">Manage Timetable</TabsTrigger>
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
