const { Schema, model } = require("mongoose");
const mailSender = require("../service/mailSender");

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 900,
  },
});

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Attendance Tracker verification Email",
      `<h2> Please confirm your OTP for Attendance Tracker signup</h2><p>your OTP is valid for 15 mins, Here is your OTP code: ${otp}</p>`
    );
  } catch (error) {
    console.log("Error occurred whiel sending email: ", error);
    throw error;
  }
}

otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

const OtpModel = new model("OTP", otpSchema);

module.exports = OtpModel;
