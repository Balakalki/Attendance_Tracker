import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import axios from "axios";
import { Input } from "../ui/input";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";
import { useEffect } from "react";

export default function TimetableEdit({ configData, onSave }) {
  const [subject, setSubject] = useState("");
  const [subjectType, setSubjectType] = useState("class");
  const [config, setConfig] = useState(configData);
  if (!config) {
    return <p className="text-center mt-10">No timetable data available</p>;
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

      toast.success("subject Added");
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
      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/timetable`,
        { days: config.timeTableData.days },
        { withCredentials: true }
      );
      onSave(config);
      toast.success("timetable updated successfully");
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

      const newConfig = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/timetable`,
        { withCredentials: true }
      );
      setConfig(newConfig.data);
      onSave(newConfig.data);
      toast.success("subject Deleted");
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.Error}`);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit / Create Timetable</CardTitle>
      </CardHeader>
      <CardContent className={"bg-slate-100 pb-4"}>
        <div className="w-full max-w-md mx-auto my-6 space-y-4 px-4">
          <h2 className="text-lg font-semibold text-gray-800">Subjects</h2>

          {config.subjects?.map((sub) => (
            <div
              key={sub._id}
              className="flex items-center justify-between border rounded-xl px-4 py-3 shadow-sm bg-gray-100"
            >
              <div>
                <div className="text-gray-900 font-medium">{sub.name}</div>
                <div className="text-sm text-gray-500 capitalize">
                  {sub.type}
                </div>
              </div>
              <button
                onClick={() => handleDelete(sub._id)}
                className="text-red-500 text-sm font-semibold hover:text-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))}
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
            <Select value={subjectType} onValueChange={setSubjectType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="lab">Lab</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addSubject} className={""}>
              Add Subject
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              {config?.slots?.map((slot, index) => (
                <TableHead key={index}>{slot.time}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(config.timeTableData?.days)?.map(
              ([day, session], indexd) => (
                <TableRow key={indexd}>
                  <TableCell>{day}</TableCell>
                  {config?.slots?.map((slot, indexs) => (
                    <TableCell key={indexs}>
                      <Select
                        value={
                          config.timeTableData.days[day]?.find(
                            (entry) => entry.slotId === slot._id
                          )?.subjectId || ""
                        }
                        onValueChange={(value) => {
                          setConfig((prevConfig) => {
                            const prevDaySessions =
                              prevConfig.timeTableData.days[day] || [];
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
                              updatedDaySessions.push({
                                slotId: slot._id,
                                subjectId: value,
                              });
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="__none"
                            className="text-gray-500 italic"
                          >
                            None
                          </SelectItem>
                          {config?.subjects?.map((subject) => (
                            <SelectItem key={subject._id} value={subject._id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  ))}
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
        <Button className={"mt-4"} onClick={handleSave}>
          Add Timetable
        </Button>
      </CardContent>
    </Card>
  );
}
