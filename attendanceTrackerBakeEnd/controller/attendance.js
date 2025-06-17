const Attendance = require("../model/attendance");
const Subject = require("../model/subjects");

async function handlePostAttendance(req, res) {
  const { date, class: newClass } = req.body;
  const {slotId, subjectId, status} = newClass;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "unauthorized" });

  try {
    const [attendanceDoc, subjectDocs] = await Promise.all([
      Attendance.findOne({ userId, date, slotId }),
      Subject.findById(subjectId),
    ]);

    const statusChange = {
      Present: 1,
      Absent: 0,
    };

    const attended = statusChange[status];

    if (!attendanceDoc) {
      const createdAttendance = await Attendance.create({
        userId,
        date,
        slotId,
        subjectId,
        status,
      });

      subjectDocs.total += 1;
      subjectDocs.attended += attended;

      await subjectDocs.save();
      return res.status(201).json({ attendance: createdAttendance });
    } else {
      if (attendanceDoc.subjectId !== subjectId) {
        const prevSubject = await Subject.findById(attendanceDoc.subjectId);

        if(prevSubject.total > 0) prevSubject.total -= 1;

        if(prevSubject.attended > 0) prevSubject.attended -= statusChange[attendanceDoc.status];

        subjectDocs.total += 1;
        subjectDocs.attended += attended;

        if (attendanceDoc.status !== status) {
          attendanceDoc.status = status;
        }

        attendanceDoc.subjectId = subjectId;
        await prevSubject.save();
      } else if (attendanceDoc.status !== status) {
        subjectDocs.attended += attended - statusChange[attendanceDoc.status];
        attendanceDoc.status = status;
      }
      attendanceDoc.save();
      await subjectDocs.save();
      return res.json({ attendance: attendanceDoc });
    }
  } catch (error) {
    console.error("Error: while posting attendance ",error);
    return res
      .status(400)
      .json({ error:"Something went wrong" });
  }
}

module.exports = { handlePostAttendance };
