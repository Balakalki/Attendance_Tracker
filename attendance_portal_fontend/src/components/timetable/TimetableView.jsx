import { CalendarRange } from "lucide-react";

export default function TimetableView({ data }) {
  if (!data || !data.slots || !data.timeTableData) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <CalendarRange className="size-6" />
        </div>
        <p className="font-medium text-slate-700">No timetable yet</p>
        <p className="max-w-sm text-sm text-slate-500">
          Head to <span className="font-medium text-violet-600">Manage</span> to set your timings
          and assign subjects.
        </p>
      </div>
    );
  }

  const slots = data.slots;

  const slotMap = Object.fromEntries((data?.slots || []).map((slot) => [slot._id, slot]));
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Day
              </th>
              {slots.map((slot, index) => (
                <th
                  key={index}
                  className="border-l border-slate-100 px-3 py-3 text-center text-xs font-medium text-slate-500"
                >
                  {slot.time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(enrichedDays).map(([day, sessions], rowIndex) => {
              const rowMap = new Array(slots.length).fill(null);
              sessions.forEach((session) => {
                const slotIndex = slots.findIndex((slot) => slot._id === session.slotId);
                if (slotIndex !== -1) {
                  rowMap[slotIndex] = session.subject?.name || session.subjectId;
                }
              });

              const cells = [];
              let i = 0;
              while (i < slots.length) {
                if (!rowMap[i]) {
                  cells.push(
                    <td key={i} className="border-l border-t border-slate-100 px-3 py-3" />
                  );
                  i++;
                  continue;
                }
                const currentSubject = rowMap[i];
                let span = 1;
                while (rowMap[i + span] === currentSubject) span++;
                cells.push(
                  <td
                    key={i}
                    colSpan={span}
                    className="border-l border-t border-slate-100 px-3 py-3 text-center"
                  >
                    <span className="inline-flex items-center rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
                      {currentSubject}
                    </span>
                  </td>
                );
                i += span;
              }

              return (
                <tr key={rowIndex} className="even:bg-slate-50/40">
                  <td className="sticky left-0 z-10 border-t border-slate-100 bg-white px-4 py-3 font-semibold text-slate-700">
                    {day}
                  </td>
                  {cells}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
