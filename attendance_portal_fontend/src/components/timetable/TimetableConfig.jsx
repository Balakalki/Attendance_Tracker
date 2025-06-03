import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "sonner";
import axios from "axios";

const TimetableConfig = ({ onConfigSave, initialConfig }) => {
  const [config, setConfig] = useState(
    initialConfig || {
      classTime: 45,
      labTime: 60,
      startTime: "09:00",
      endTime: "17:00",
      lunchBreak: { startTime: "13:00", endTime: "14:00" },
      slots: [],
      subjects: [],
      days: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
      },
    }
  );
  const [subject, setSubject] = useState("");
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wendsday",
    "Thursday",
    "Friday",
    "Satday",
    "Sunday",
  ];
  // Converts "HH:MM" string to a Date object
  function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Converts a Date object to "hh:mm AM/PM"
  function formatTimeAMPM(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  const days = {
    Monday: [
      { slotId: 0, subjectId: "sub5" },
      { slotId: 2, subjectId: "sub2" },
      { slotId: 6, subjectId: "sub1" },
    ],
    Tuesday: [
      { slotId: 1, subjectId: "sub2" },
      { slotId: 2, subjectId: "sub6" },
    ],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };

  const handleConfigSave = () => {
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

      // Check if current slot overlaps with break
      if (next > breakStart && current < breakEnd) {
        // Skip to end of break
        current = new Date(breakEnd);
        continue;
      }

      if (next <= end) {
        slots.push({
          id: index,
          time: `${formatTimeAMPM(current)} - ${formatTimeAMPM(next)}`,
        });
        index++;
      }

      current = next;
    }
    const updatedConfig = { ...config, slots };
    setConfig(updatedConfig);
  };

  const addSubject = () => {
    setConfig({
      ...config,
      subjects: [
        ...config.subjects,
        { id: config.subjects.length, name: subject },
      ],
    });
    setSubject("");
  };

  const handleSave = async() => {
    if (!config.slots.length > 0) {
      toast.error("Please configure the timetable first");
      return;
    }

    if(config.subjects.length == 0){
      toast.info("Please add subjects");
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/timetable`,
        config,
        { withCredentials: true }
      );
      console.log("res is after post is ", res);
    } catch (error) {
      console.log("error is ", error);
    }
    toast.success("Timetable configuration saved");
    // onConfigSave(config);
  };



  return (
    <Card>
      <CardHeader>
        <CardTitle>Timetable Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="space-y-2">
            <Label>Class Duration (minutes)</Label>
            <Select
              value={config.classTime.toString()}
              onValueChange={(value) =>
                setConfig({ ...config, classTime: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="50">50 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Lab Duration (minutes)</Label>
            <Select
              value={config.labTime?.toString()}
              onValueChange={(value) =>
                setConfig({ ...config, labTime: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="50">50 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input
              type="time"
              value={config.startTime}
              onChange={(e) =>
                setConfig({ ...config, startTime: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>End Time</Label>
            <Input
              type="time"
              value={config.endTime}
              onChange={(e) =>
                setConfig({ ...config, endTime: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label>Luch Break Times</Label>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              type="time"
              placeholder="Start time"
              value={config.lunchBreak.startTime}
              onChange={(e) =>
                setConfig({
                  ...config,
                  lunchBreak: {
                    ...config.lunchBreak,
                    startTime: e.target.value,
                  },
                })
              }
            />
            <Input
              type="time"
              placeholder="End time"
              value={config.lunchBreak.endTime}
              onChange={(e) =>
                setConfig({
                  ...config,
                  lunchBreak: { ...config.lunchBreak, endTime: e.target.value },
                })
              }
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Subjects</Label>
            {config.subjects.map((sub) => {
              return <div key={sub.id}>{sub.name}</div>;
            })}
          </div>
          <div className="space-y-4 md:flex gap-4">
            <Input
              type={"text"}
              placeholder="subject"
              value={subject}
              className={"md:max-w-1/2"}
              onChange={(e) => {
                setSubject(e.target.value);
              }}
            ></Input>
            <Button onClick={addSubject} className={""}>
              Add Subject
            </Button>
          </div>
        </div>
        <Button onClick={handleConfigSave} className="w-full">
          Save Configuration
        </Button>
        {config.slots.length > 0 && <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              {config.slots.map((slot, index) => (
                <TableHead key={index}>{slot.time}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(days).map(([day, session], indexd) => (
              <TableRow key={indexd}>
                <TableCell>{day}</TableCell>
                {config.slots.map((slot, indexs) => (
                  <TableCell key={indexs}>
                    <Select onValueChange={(value) => {setConfig({...config, days:{...config.days, day: config.days[day].push({slotId: indexs, subjectId: value})}})}}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.subjects.map((subject, index) => (
                          <SelectItem key={index} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>}
        <Button onClick = {handleSave}>
          Add Timetable
        </Button>
      </CardContent>
    </Card>
  );
};

export default TimetableConfig;
