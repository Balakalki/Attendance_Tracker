import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "../components//ui/select";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import DatePicker from "../components/ui/DatePicker";

export default function Attendance() {
  const [data, setData] = useState();
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [day, setDay] = useState(
    selectedDate.toLocaleDateString("en-us", { weekday: "long" })
  );

  useEffect(() => {
    const getData = async () => {
        const newDay = selectedDate.toLocaleDateString("en-us", {
            weekday: "long",
        });
        setDay(newDay);
      const dataFromServer = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/timetable?day=${newDay}`,
        { withCredentials: true }
      );
      setData(dataFromServer.data);
    };
    getData();
  }, [selectedDate]);

  const handleSave = async (slotId, subjectId) => {
    const formatedDate = selectedDate.toISOString().split("T")[0];
    const res = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/attendance`,
      {
        date: formatedDate,
        class: {
          slotId,
          subjectId,
          status: attendanceStatus[slotId] || "Absent",
        },
      },{withCredentials: true}
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-md">
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.days?.[day]?.map((section) => {
          const slot = data?.slots.find((slot) => slot.id == section?.slotId);
          const subject = data?.subjects.find(
            (sub) => sub.id == section.subjectId
          );
          return (
            <Card key={section.slotId}>
              <CardHeader>
                <CardTitle>{slot?.time}</CardTitle>
              </CardHeader>
              <CardContent className={"flex flex-col gap-4"}>
                <div className="flex flex-col gap-4">
                  <Label>Subject</Label>
                  <Select value={subject.id}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-4">
                  <RadioGroup
                    value={ attendanceStatus[slot?.id] || "Absent"}
                    onValueChange={(val) => setAttendanceStatus(prev => ({...prev, [slot?.id]: val}))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Absent" id="Absent" />
                      <Label htmlFor="Absent">Absent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Present" id="Present" />
                      <Label htmlFor="Present">Present</Label>
                    </div>
                  </RadioGroup>
                  <Button
                    onClick={() =>
                      handleSave(section.slotId, section.subjectId)
                    }
                  >
                    Mark Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
