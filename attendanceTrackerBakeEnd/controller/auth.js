const OtpModel = require("../model/otpModel");
const Summary = require("../model/summary");
const User = require("../model/user");
const { createToken } = require("../service/authentication");

async function handleCreateUser(req, res) {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password)
    return req.status(400).json({ error: "all fields are required" });

  try {
    const otpDoc = await OtpModel.findOne({email});
    if(!otpDoc || !otpDoc.isVerified){
      return res.status(401).json({message: "Please validate your email"});
    }
    const newUser = new User({fullName, email, password});
    const newSummary = new Summary({userId: newUser._id});
    newUser.isVerified = true;
    await newUser.save();
    await newSummary.save();
    return res.status(201).json({ success: "User created successfully" });
    
  } catch (error) {
    if(error.code === 11000)
      return res.status(400).json({Error: "email already exists"});
    console.log("Error: ", error);
    return res.status(500).json({Error: "Something went wrong"});
  }

}

async function handleAuthenticateUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "all fields are required" });

  try {
    const user = await User.matchPassword(email, password);
    const token = createToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, //make true for deployment
      sameSite: "Lax", // make None for deployment
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "Log In successfull" }); // need to use front end home page url here
  } catch (error) {
    return res.status(400).json({ message: "incorrect email/password" });
  }
}


function handleLogOut(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,         // make true for deployment
    sameSite: "Lax",       // make None for deployment
    path: "/",             
  });
  res.status(200).json({ message: 'Logged out' });
};

module.exports = {
  handleCreateUser,
  handleAuthenticateUser,
  handleLogOut,
};
