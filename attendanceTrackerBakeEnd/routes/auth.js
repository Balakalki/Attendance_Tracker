const { Router } = require('express');
const { handleCreateUser, handleAuthenticateUser, handleLogOut, handleGetUser } = require('../controller/auth');

const router = Router();

router.post('/signup', handleCreateUser);

router.post('/login', handleAuthenticateUser);

router.post('/logout', handleLogOut);
router.get('/', handleGetUser)

module.exports = router;