const { Router } = require('express');
const { handleCreateTimeTable, handleGetTimeTable } = require('../controller/timeTable');

const router = Router();

router.post('/', handleCreateTimeTable);

router.get('/', handleGetTimeTable);

module.exports = router;