import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function TimetableView({ data }) {

  if (!data || !data.slots || !data.timeTableData) {
    return <p className="text-center mt-10">No timetable data available</p>;
  }
  
  const slots = data.slots;
  
  const slotMap = Object.fromEntries(
    (data?.slots || [])?.map((slot) => [slot._id, slot])
  );
  const subjectMap = Object.fromEntries(
    (data?.subjects || []).map((subject) => [subject._id, subject])
  );
  
  const enrichedDays = {};
  
  for (const [dayName, entries] of Object.entries(data.timeTableData?.days || [])) {
    enrichedDays[dayName] = entries.map((entry) => ({
      slotId: entry.slotId,
      slot: slotMap[entry.slotId] || null,
      subjectId: entry.subjectId ?? null,
      subject: entry.subjectId ? subjectMap[entry.subjectId] || null : null,
    }));
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            {slots.map((slot, index) => (
              <TableHead key={index}>{slot.time}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(enrichedDays).map(([day, sessions], rowIndex) => {
            const slotMap = new Array(slots.length).fill(null);

            // Map each session to its actual slot index
            sessions.forEach((session) => {
              const slotIndex = slots.findIndex(
                (slot) => slot._id === session.slotId
              );
              if (slotIndex !== -1) {
                slotMap[slotIndex] = session.subject?.name || session.subjectId;
              }
            });

            const cells = [];
            let i = 0;
            while (i < slots.length) {
              if (!slotMap[i]) {
                cells.push(<TableCell key={i}></TableCell>);
                i++;
                continue;
              }

              const currentSubject = slotMap[i];
              let span = 1;
              while (slotMap[i + span] === currentSubject) {
                span++;
              }

              cells.push(
                <TableCell
                  key={i}
                  colSpan={span}
                  className="text-center font-medium"
                >
                  {currentSubject}
                </TableCell>
              );
              i += span;
            }

            return (
              <TableRow key={rowIndex}>
                <TableCell className="font-semibold">{day}</TableCell>
                {cells}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
