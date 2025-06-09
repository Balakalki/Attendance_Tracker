const { Router } = require('express');
const { handleCreateUser, handleAuthenticateUser, handleLogOut } = require('../controller/auth');

const router = Router();

router.post('/signup', handleCreateUser);

router.post('/login', handleAuthenticateUser);

router.post('/logout', handleLogOut);

module.exports = router;