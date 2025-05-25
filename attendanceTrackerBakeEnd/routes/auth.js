const { Router } = require('express');
const { handleCreateUser, handleAuthenticateUser, checkAtuchFrontEnd } = require('../controller/auth');

const router = Router();

router.post('/signup', handleCreateUser);

router.post('/login', handleAuthenticateUser);

router.get('/check', checkAtuchFrontEnd);

module.exports = router;