const Attendance = require("../model/attendance");
const Slots = require("../model/slots");
const Subject = require("../model/subjects");
const timeTable = require("../model/timeTable");

async function handleConfigTimeTable(req, res) {
  const userId = req.user?.id;

  if (!userId)
    return res.status(401).json({ message: "please log in to add time table" });

  try {
    const { slots, classTime, labTime, startTime, endTime, lunchBreak } =
      req.body;

    await timeTable.deleteOne({ userId });

    const existing = await timeTable.findOne({ userId });
    if (existing) {
      return res.status(409).json({ Error: "time table already exists (conflict)" });
    }

    const timeTableData = await timeTable.create({
      classTime,
      labTime,
      startTime,
      endTime,
      lunchBreak,
      userId,
    });
    await Slots.deleteMany({ userId });
    
    const slotsWithUserId = slots.map((slot) => {
      return { ...slot, userId };
    });

    const slotsData = await Slots.insertMany(slotsWithUserId);
    return res.status(201).json({ timeTableData, slotsData });
  } catch (error) {
    console.log("Error: configuring timetable", error);
    if (error.code === 11000) {
      return res.status(409).json({ Error: "time table already exits" });
    }
    return res.status(500).json({ Error: "something went wrong" });
  }
}

async function handleCreateTimeTable(req, res) {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "aunotherized" });

  const days = req.body?.days;

  if (!days || typeof days !== "object")
    return res.status(400).json({ message: "please provide valid days" });

  try {
    await timeTable.updateOne({ userId }, { $set: { days } });

    return res.json({ message: "timetable updated successfully" });
  } catch (error) {
    console.log("Error: while creataing timetable", error);
    return res.status(500).json({ Error: "something went wrong" });
  }
}

async function handleGetTimeTable(req, res) {
  const userId = req.user?.id;

  if (!userId)
    return res
      .status(401)
      .json({ Error: "please log in to add/get time table" });

  const day = req.query?.day;
  const date = req.query?.date;
  try {
    let projection = {
      lunchBreak: 1,
      startTime: 1,
      endTime: 1,
      classTime: 1,
      labTime: 1,
      _id: 0,
    };

    if (day) {
      projection[`days.${day}`] = 1;
    } else {
      projection["days"] = 1;
    }

    let query = timeTable.findOne({ userId }, projection);
    if (day) {
      query = query.populate(`days.${day}.slotId`, "time createdAt updatedAt");
    }

    const timeTableData = await query.lean();

    if (!timeTableData)
      return res.status(404).json({ message: "No time table found" });

    const [slots, subjects, attendance] = await Promise.all([
      Slots.find({ userId }, { _id: 1, time: 1 }).sort({ sortId: 1 }),
      Subject.find({ userId }),
      Attendance.find({ userId, date }).select("slotId status subjectId -_id"),
    ]);

    return res.status(200).json({ timeTableData, slots, subjects, attendance });
  } catch (error) {
    console.log("Error: while geting timetable ", error);
    return res.status(500).json({ Error: "something went wront" });
  }
}

async function handleAddSubject(req, res) {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "unauthorized" });

  const { name, type } = req.body;

  try {
    const subject = await Subject.create({
      userId,
      name,
      type,
    });
    return res.json(subject);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ Error: "subject already exists" });
    }
    console.log("Error: adding subject ", error);
    return res.status(500).json({ Error: "something went wrong" });
  }
}

async function handleDeleteSubject(req, res) {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "unauthorized" });

  const subjectId = req.params.id;
  if (!subjectId)
    return res.status(400).json({ message: "please provide subject Id" });

  try {
    const subject = await Subject.findOne({ _id: subjectId });

    if (!subject) {
      return res.status(404).json({ Error: "Subject not found" });
    }

    await Subject.findByIdAndDelete(subjectId);

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Construct $pull update object
    const pullUpdate = {};
    for (const day of days) {
      pullUpdate[`days.${day}`] = { subjectId };
    }

    // Update the document
    await timeTable.updateOne({ userId }, { $pull: pullUpdate });

    await Attendance.deleteMany({subjectId});

    return res.json({
      message: "Subject deleted and removed from timetable successfully",
    });
  } catch (error) {
    console.log("Error: while deleting subject ", error);
    return res.status(500).json({ Error: "somethign went wrong" });
  }
}

module.exports = {
  handleCreateTimeTable,
  handleAddSubject,
  handleGetTimeTable,
  handleConfigTimeTable,
  handleDeleteSubject,
};
