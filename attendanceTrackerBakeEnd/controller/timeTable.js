const Summary = require("../model/summary");
const timeTable = require("../model/timeTable");

async function handleCreateTimeTable(req, res) {
  const userId = req.user?.id;

  if (!userId)
    return res.status(401).json({ message: "please log in to add time table" });

  try {
    const timeTableData = { ...req.body, userId };
    // const summary = await Summary.findOne({ userId });
    const summarySubjects = timeTableData.subjects.map((sub) => ({
      subjectId: sub.id,
      subjectName: sub.name,
      total: 0,
      present: 0,
      absent: 0,
    }));
    await timeTable.findOneAndUpdate(
      { userId },
      timeTableData,
      {
        new: true,
        upsert: true,
        overwrite: true,
      }
    );
    await Summary.findOneAndUpdate(
      { userId },
      { $set: { subjects: summarySubjects } },
      { upsert: true }
    );
    return res.status(201).json({ message: "time table created successfully" });
  } catch (error) {
    console.log("Error: ", error);
    if (error.code === 11000) {
      return res.status(409).json({ Error: "time table already exits" });
    }
    return res.status(500).json({ Error: error.message });
  }
}

async function handleGetTimeTable(req, res) {
  const userId = req.user?.id;

  if (!userId)
    return res
      .status(401)
      .json({ Error: "please log in to add/get time table" });

  const day = req.query?.day;
  try {
    let projection = null;

    if (day) {
      projection = {
        [`days.${day}`]: 1,
        slots: 1,
        subjects: 1,
      };
    }
    const time_table = await timeTable.findOne({ userId }, projection);

    if (!time_table)
      return res.status(404).json({ message: "No time table found" });

    return res.status(200).json(time_table);
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
}

async function handleUpdateTimeTable(req, res) {
  const userId = req.user?.id;
  res.json({ message: `Hello this is from update route ${userId}` });
}
module.exports = {
  handleCreateTimeTable,
  handleGetTimeTable,
  handleUpdateTimeTable,
};
