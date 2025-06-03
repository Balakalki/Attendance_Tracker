const Attendance = require("../model/attendance");
const { startSession } = require("mongoose");
const Summary = require("../model/summary");

async function handlePostAttendance(req, res) {
  const { date, class: newClass } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "unauthorized" });

  // const session = new startSession();
  try {
    const attendanceDoc = await Attendance.findOne({ userId, date });
    const summaryDoc = await Summary.findOne({ userId });

    const statusChange = {
      Present: 1,
      Absent: 0,
    };

    const attended = statusChange[newClass.status];

    const subjectIndex = summaryDoc.subjects.findIndex(
      (sub) => sub.subjectId === newClass.subjectId
    );
    if (!attendanceDoc) {
      const createdAttendance = await Attendance.create({
        userId,
        date,
        classes: [newClass],
      });
      if (subjectIndex !== -1) {
        summaryDoc.subjects[subjectIndex].total += 1;
        summaryDoc.subjects[subjectIndex].present += attended;
        summaryDoc.subjects[subjectIndex].absent += 1 - attended;
      } else {
        summaryDoc.subjects.push({
          subjectId: newClass.subjectId,
          total: 1,
          absent: 1 - attended,
          present: attended,
        });
      }
      summaryDoc.totalClasses += 1;
      summaryDoc.attendedClasses += attended;
      await summaryDoc.save();
      return res.status(201).json({ attendance: createdAttendance });
    } else {
      const existingClassIndex = attendanceDoc.classes.findIndex(
        (cls) => cls.slotId === newClass.slotId
      );
      console.log(existingClassIndex);
      if (existingClassIndex === -1) {
        attendanceDoc.classes.push(newClass);
        await attendanceDoc.save();
        if (subjectIndex !== -1) {
          summaryDoc.subjects[subjectIndex].total += 1;
          summaryDoc.subjects[subjectIndex].present += attended;
          summaryDoc.subjects[subjectIndex].absent += 1 - attended;
        } else {
          summaryDoc.subjects.push({
            subjectId: newClass.subjectId,
            total: 1,
            absent: 1 - attended,
            present: attended,
          });
        }
        summaryDoc.totalClasses += 1;
        await summaryDoc.save();
      } else if (
        attendanceDoc.classes[existingClassIndex].status !== newClass.status
      ) {
        const prev =
          statusChange[attendanceDoc.classes[existingClassIndex].status];
        const next = statusChange[newClass.status];

        attendanceDoc.classes[existingClassIndex].status = newClass.status;
        await attendanceDoc.save();

        summaryDoc.attendedClasses += next - prev;
        summaryDoc.subjects[subjectIndex].present += next - prev;
        summaryDoc.subjects[subjectIndex].absent += prev - next;
        await summaryDoc.save();
        return res.json({ attendance: attendanceDoc });
      }
    }
    return res.json({ attendance: attendanceDoc });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ error: error.message || "Something went wrong" });
  }
}

module.exports = { handlePostAttendance };
