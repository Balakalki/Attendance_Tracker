const bcrypt = require("bcryptjs");
const OtpModel = require("../model/otpModel");
const mailSender = require("../service/mailSender");

const OTP_ROUNDS = 10;

async function sendVerificationEmail(email, otp) {
  try {
    await mailSender(
      email,
      "Attendance Tracker verification Email",
      `<h2> Please confirm your OTP for Attendance Tracker signup</h2><p>your OTP is valid for 15 mins, Here is your OTP code: ${otp}</p>`
    );
  } catch (error) {
    console.log("Error occurred whiel sending email: ", error);
    throw error;
  }
}

async function handleGenerateOTP(req, res) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Please provide email" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const otpHash = await bcrypt.hash(otp, OTP_ROUNDS);

    // Upsert: re-requesting an OTP replaces the previous one and restarts the
    // 15-min TTL instead of failing with a duplicate-key error.
    await OtpModel.findOneAndUpdate(
      { email },
      { email, otp: otpHash, isVerified: false, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendVerificationEmail(email, otp);

    return res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.log("Error: while generating OTP", err);
    res.status(500).json({ message: "something went wrong" });
  }
}

async function handleVerifyOTP(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "please enter email and otp" });

  try {
    const otpModelDoc = await OtpModel.findOne({ email });

    if (!otpModelDoc) {
      return res
        .status(400)
        .json({ message: "OTP expired or not found, please request a new one" });
    }

    const isMatch = await bcrypt.compare(otp, otpModelDoc.otp);
    if (isMatch) {
      otpModelDoc.isVerified = true;
      await otpModelDoc.save();
      return res.json({ message: "otp verified successfully" });
    } else {
      return res.status(400).json({ message: "invalid OTP" });
    }
  } catch (error) {
    console.log("Error: while verifying OTP ", error);
    return res.status(500).json({ message: "something went wront" });
  }
}

module.exports = { handleGenerateOTP, handleVerifyOTP };
