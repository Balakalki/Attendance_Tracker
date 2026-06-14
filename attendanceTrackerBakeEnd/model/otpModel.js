const { Schema, model } = require("mongoose");

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // bcrypt hash of the 6-digit code — never the plaintext OTP.
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
    expires: 900, // record auto-deletes 15 min after (re)issue
  },
});

const OtpModel = model("OTP", otpSchema);

module.exports = OtpModel;
