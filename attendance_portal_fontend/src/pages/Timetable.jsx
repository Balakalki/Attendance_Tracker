import { useEffect, useState } from "react";
import TimetableConfig from "../components/timetable/TimetableConfig";
import TimetableView from "../components/timetable/TimetableView";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import axios from "axios";

export default function Timetable() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/timetable`,
          { withCredentials: true }
        );
        setTimeout(() => {
          setData(res.data);
          setLoading(false);
        }, 300);
      } catch (err) {
        console.error("error is", err);
        if(err.response.status === 404){
          setError("No timetable found")
        }
        else{
          setError("Failed to load timetable");
        }
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-blue-600 text-xl font-semibold">
          Loading timetable...
        </p>
      </div>
    );
  }
  return (
    <div>
      <Tabs defaultValue="viewTimetable">
        <TabsList>
          <TabsTrigger value="viewTimetable">View Timetable</TabsTrigger>
          <TabsTrigger value="manageTimetable">Add Timetable</TabsTrigger>
        </TabsList>
        <TabsContent value="viewTimetable">
          <TimetableView error = {error} data={data} />
        </TabsContent>
        <TabsContent value="manageTimetable">
          <TimetableConfig initialConfig={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
