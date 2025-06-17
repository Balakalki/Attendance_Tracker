const OtpModel = require("../model/otpModel");
const mailSender = require("../service/mailSender");

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

async function handleGenerateOTP(req, res) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Please provide email" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  try {
    await OtpModel.create({
      email,
      otp,
    });

    await sendVerificationEmail(email, otp);

    return res.json({message: "OTP sent successfully"})
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ Error: "OTP has already been sent. Please check your email."});
    }
    console.log("Error: while generating OTP",err);
    res.status(500).json({message: "something went wrong"});
  }
}

async function handleVerifyOTP(req, res){
    const { email, otp } = req.body;

    if(!email || !otp) return res.status(400).json({message: "please enter email and otp"});

    try{
        const otpModelDoc = await OtpModel.findOne({email});
        if(otpModelDoc.otp === otp){
            otpModelDoc.isVerified = true;
            await otpModelDoc.save();
           return res.json({message: "otp verified successfully"});
        }else{
            return res.status(400).json({message: "invalid OTP"});
        }
    }catch(error){
      console.log("Error: while verifying OTP ", error);
        return res.status(500).json({message: "something went wront"});
    }
}
module.exports = { handleGenerateOTP, handleVerifyOTP };