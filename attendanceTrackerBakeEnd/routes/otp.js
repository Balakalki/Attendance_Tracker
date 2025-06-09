const Router = require("express");
const { handleGenerateOTP, handleVerifyOTP } = require("../controller/otp");

const router = Router();

router.post('/', handleGenerateOTP);

router.post('/verify', handleVerifyOTP);

module.exports = router;