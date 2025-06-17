const Subject = require('../model/subjects');
const timeTable = require('../model/timeTable');

async function handleGetSummary(req, res){
    const userId = req.user?.id;

    if(!userId) return res.status(401).json({message: "unauthorized"});

    const subjects = await Subject.find({userId}).sort({createdAt: 1});

    const timeTableData = await timeTable.findOne({userId}, {classTime: 1, labTime: 1})

    return res.json({subjects, ...timeTableData?._doc});
}

module.exports = { handleGetSummary };