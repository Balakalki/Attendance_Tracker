const { Schema, model } = require("mongoose");

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
    default: Date.now,
    expires: 900,
  },
});

const OtpModel = new model("OTP", otpSchema);

module.exports = OtpModel;
