const mongoose = require("mongoose");
const Attendance = require("../model/attendance");
const Subject = require("../model/subjects");
const timeTable = require("../model/timeTable");

async function handleGetSummary(req, res) {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "unauthorized" });

  try {
    const [subjects, timeTableData, stats] = await Promise.all([
      Subject.find({ userId }).sort({ createdAt: 1 }).lean(),
      timeTable
        .findOne({ userId }, { classTime: 1, labTime: 1, _id: 0 })
        .lean(),
      // Derive per-subject counts straight from the attendance records.
      Attendance.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$subjectId",
            total: { $sum: 1 },
            attended: {
              $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const statsBySubject = {};
    for (const s of stats) statsBySubject[String(s._id)] = s;

    const subjectsWithStats = subjects.map((sub) => {
      const st = statsBySubject[String(sub._id)];
      return { ...sub, total: st?.total || 0, attended: st?.attended || 0 };
    });

    return res.json({ subjects: subjectsWithStats, ...timeTableData });
  } catch (error) {
    console.error("Error: while building summary ", error);
    return res.status(500).json({ Error: "something went wrong" });
  }
}

module.exports = { handleGetSummary };
