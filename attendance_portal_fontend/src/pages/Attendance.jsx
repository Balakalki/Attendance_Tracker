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
import { toast } from "sonner";
import Loader from "../components/ui/loader";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

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
        const newDay = selectedDate.toLocaleDateString("en-us", {
          weekday: "long",
        });
        setDay(newDay);
        const formatedDate = selectedDate.toISOString().split("T")[0];
        const dataFromServer = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/api/timetable?day=${newDay}&date=${formatedDate}`,
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
      data.attendance.forEach(att => {
        initialSubjects[att.slotId] = att.subjectId;
      });
      setSelectedSubjects(initialSubjects);
    }
  }, [data, day]);

  const handleSave = async (slotId, subjectId) => {
    const formatedDate = selectedDate.toISOString().split("T")[0];
    const subjectName = data.subjects.find((sub) => sub._id === subjectId);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/attendance`,
        {
          date: formatedDate,
          class: {
            slotId,
            subjectId: subjectId,
            status: attendanceStatus[slotId] || "Absent",
          },
        },
        { withCredentials: true }
      );
      if (res.status === 200 || res.status === 201) {
        toast.success(
          `Marked ${attendanceStatus[slotId] ?? "Absent"} for ${
            subjectName?.name
          }`
        );
      }
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-md">
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>
      {data?.timeTableData?.days?.[day]?.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.slots?.map((slot) => {
            return (
              <Card key={slot._id}>
                <CardHeader>
                  <CardTitle>{slot.time}</CardTitle>
                </CardHeader>
                <CardContent className={'flex flex-col gap-4'}>
                  <div className="flex flex-col gap-4">
                    <Label>Subject</Label>
                    <Select
                      value={selectedSubjects[slot._id] || ""}
                      onValueChange={(val) => {
                        setSelectedSubjects((prev) => ({
                          ...prev,
                          [slot._id]: val,
                        }));
                      }}
                    >
                      <SelectTrigger className="w-full">
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
                  <div className="flex flex-col gap-4">
                    <RadioGroup
                      value={attendanceStatus[slot._id] || "Absent"}
                      onValueChange={(val) =>
                        setAttendanceStatus((prev) => ({
                          ...prev,
                          [slot._id]: val,
                        }))
                      }
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
                      onClick={() => handleSave(slot._id, selectedSubjects[slot._id])}
                    >
                      Mark Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p>No classes today</p>
      )}
    </div>
  );
}
