import axios from 'axios'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table'
import { useEffect, useState } from 'react';

export default function TimetableView ({data}) {
  // const [data, setData] = useState(null);
  const [error, setError] = useState(null);

    if (error) return <p>{error}</p>;
  if (!data) return <p>Loading...</p>;
  const slots = data.slots
  const days = data.days
  const subjectMap = {}
  data.subjects.forEach(sub => {
    subjectMap[sub.id] = sub.name
  })

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
          {Object.entries(days).map(([day, sessions], rowIndex) => {
            const slotMap = new Array(slots.length).fill(null)
            sessions.forEach(session => {
              slotMap[session.slotId] = subjectMap[session.subjectId] || session.subjectId
            })

            const cells = []
            let i = 0
            while (i < slots.length) {
              if (!slotMap[i]) {
                cells.push(<TableCell key={i}></TableCell>)
                i++
                continue
              }

              const currentSubject = slotMap[i]
              let span = 1
              while (slotMap[i + span] === currentSubject) {
                span++
              }

              cells.push(
                <TableCell key={i} colSpan={span} className="text-center font-medium">
                  {currentSubject}
                </TableCell>
              )
              i += span
            }

            return (
              <TableRow key={rowIndex}>
                <TableCell className="font-semibold">{day}</TableCell>
                {cells}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}