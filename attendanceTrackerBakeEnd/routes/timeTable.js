const { Router } = require('express');
const { handleCreateTimeTable, handleGetTimeTable, handleUpdateTimeTable } = require('../controller/timeTable');

const router = Router();

router.post('/', handleCreateTimeTable);

router.get('/', handleGetTimeTable);

router.put('/', handleUpdateTimeTable);

module.exports = router;