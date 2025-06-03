import { useEffect, useState } from "react";
import TimetableConfig from "../components/timetable/TimetableConfig";
import TimetableView from "../components/timetable/TimetableView";
import { Tabs, TabsList, TabsTrigger, TabsContent} from "../components/ui/tabs";
import axios from "axios";

export default function Timetable(){
    const [data, setData] = useState(null);
    useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/timetable`,{withCredentials: true});
        setData(res.data);
      } catch (err) {
        console.error('error is', err);
        setError('Failed to load timetable');
      }
    };

    fetchTimetable();
  }, []);
    return(
        <div>
            <Tabs defaultValue="viewTimetable">
                <TabsList>
                    <TabsTrigger value = "viewTimetable">View Timetable</TabsTrigger>
                    <TabsTrigger value = "manageTimetable">Manage Timetable</TabsTrigger>
                </TabsList>
                <TabsContent value = "viewTimetable"><TimetableView data={data}/></TabsContent>
                <TabsContent value = "manageTimetable">
                    <TimetableConfig initialConfig={data}/>
                </TabsContent>
            </Tabs>
        </div>
    )
}