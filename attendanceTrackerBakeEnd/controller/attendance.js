const Attendance = require("../model/attendance");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function handlePostAttendance(req, res) {
  const { date, class: newClass } = req.body;
  const { slotId, subjectId, status } = newClass || {};
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "unauthorized" });

  if (!date || !DATE_RE.test(date))
    return res.status(400).json({ error: "date must be in YYYY-MM-DD format" });

  if (!slotId || !subjectId || !status)
    return res
      .status(400)
      .json({ error: "slotId, subjectId and status are required" });

  try {
    // One record per (user, date, slot). Upsert handles both "mark" and
    // "change subject/status" in a single atomic write. Counts are derived
    // from these records on read, so there are no counters to keep in sync.
    const attendance = await Attendance.findOneAndUpdate(
      { userId, date, slotId },
      { userId, date, slotId, subjectId, status },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ attendance });
  } catch (error) {
    console.error("Error: while posting attendance ", error);
    return res.status(400).json({ error: "Something went wrong" });
  }
}

module.exports = { handlePostAttendance };
