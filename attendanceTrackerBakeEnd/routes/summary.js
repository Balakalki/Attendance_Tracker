const { Router } = require('express');
const { handleGetSummary } = require('../controller/summary');

const router = Router();

router.get('/', handleGetSummary);

module.exports = router;