import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SubjectSelector from "./SubjectSelector";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AttendanceForm = ({ schedule, existingRecord, date }) => {
  const subject = getSubjectById(
    existingRecord?.modifiedSubjectId || schedule.subjectId
  );
  const timeSlot = getTimeSlotById(schedule.timeSlotId);

  const [isPresent, setIsPresent] = React.useState(
    existingRecord?.present ?? false
  );
  const [selectedSubjectId, setSelectedSubjectId] = React.useState(
    existingRecord?.modifiedSubjectId || schedule.subjectId
  );

  const handleAttendanceChange = (checked) => {
    setIsPresent(checked);
    
    if (existingRecord) {
      updateAttendance.mutate(
        { recordId: existingRecord.id, present: checked },
        {
          onSuccess: () => {
            toast.success(`Marked ${checked ? "present" : "absent"} for ${subject?.name}`);
          },
          onError: () => {
            toast.error("Failed to update attendance status");
            setIsPresent(existingRecord.present);
          },
        }
      );
    } else {
      
    }
  };

  const handleSubjectChange = (value) => {
    setSelectedSubjectId(value);
    
    if (existingRecord) {
      changeSubject.mutate(
        { recordId: existingRecord.id, subjectId: value },
        {
          onSuccess: () => {
            toast.success(`Changed subject to ${getSubjectById(value)?.name}`);
          },
          onError: () => {
            toast.error("Failed to change subject");
            setSelectedSubjectId(existingRecord.modifiedSubjectId || schedule.subjectId);
          },
        }
      );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">
          {timeSlot?.startTime} - {timeSlot?.endTime}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <SubjectSelector
              value={selectedSubjectId}
              onChange={handleSubjectChange}
            />
            {existingRecord?.modifiedSubjectId && (
              <p className="text-xs text-muted-foreground italic">
                Original subject: {getSubjectById(schedule.subjectId)?.name}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor={`attendance-${schedule.id}`} className="font-medium">
              Mark as Present
            </Label>
            <Switch
              id={`attendance-${schedule.id}`}
              checked={isPresent}
              onCheckedChange={handleAttendanceChange}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span>Status:</span>
            <span
              className={
                isPresent
                  ? "text-green-600 font-medium"
                  : "text-red-600 font-medium"
              }
            >
              {isPresent ? "Present" : "Absent"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;