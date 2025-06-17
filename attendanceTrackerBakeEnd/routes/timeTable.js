const { Router } = require('express');
const { handleCreateTimeTable, handleGetTimeTable, handleConfigTimeTable, handleAddSubject, handleDeleteSubject } = require('../controller/timeTable');

const router = Router();

router.post('/', handleConfigTimeTable);

router.get('/', handleGetTimeTable);

router.put('/', handleCreateTimeTable);

router.post('/subject', handleAddSubject);
router.delete('/subject/:id', handleDeleteSubject);

module.exports = router;