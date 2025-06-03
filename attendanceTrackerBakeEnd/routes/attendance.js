const { Router } = require('express');
const { handlePostAttendance } = require('../controller/attendance');


const router = Router();

router.post('/', handlePostAttendance)

module.exports = router;