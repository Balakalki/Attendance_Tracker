const Summary = require('../model/summary');

async function handleGetSummary(req, res){
    const userId = req.user?.id;

    if(!userId) return res.status(401).json({message: "unauthorized"});

    const data = await Summary.findOne({userId});

    return res.json({data: {totalClasses: data.totalClasses, attendedClasses: data.attendedClasses, subjects: data.subjects}});
}

module.exports = { handleGetSummary };