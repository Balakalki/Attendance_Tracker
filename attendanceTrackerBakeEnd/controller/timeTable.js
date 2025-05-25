const timeTable = require("../model/timeTable");

async function handleCreateTimeTable(req, res) {
  const userId = req.user?.id;

  if (!userId)
    return res.status(401).json({ message: "please log in to add time table" });

  try {
    const newTimeTable = new timeTable({ ...req.body, userId });
    await newTimeTable.save();
    return res.status(201).json({ message: "time table created successfully" });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(409).json({ Error: "time table already exits"});
    }
    return res.status(500).json({ Error: error.message });
  }
}

async function handleGetTimeTable(req, res){
    const userId = req.user?.id;

    if(!userId) return res.status(401).json({Error: "please log in to add/get time table"});

    try{
        const time_table = await timeTable.findOne({userId});

        if(!time_table) return res.status(404).json({message: "No time table found"});

        return res.status(200).json(time_table.days);
    }catch(error){
        res.status(500).json({Error: error.message});
    }
}

module.exports = { handleCreateTimeTable, handleGetTimeTable };
