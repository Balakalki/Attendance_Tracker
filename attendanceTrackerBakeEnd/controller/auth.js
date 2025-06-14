const Summary = require("../model/summary");
const User = require("../model/user");
const { createToken } = require("../service/authentication");

async function handleCreateUser(req, res) {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password)
    return req.status(400).json({ error: "all fields are required" });

  try {

    const newUser = new User({fullName, email, password});
    const newSummary = new Summary({userId: newUser._id});
    
    await newUser.save();
    await newSummary.save();
    return res.status(201).json({ success: "User created successfully" });
    
  } catch (error) {
    return res.status(400).json({message: "email already exists"});
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
      secure: true, // set true when ssl is added
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "Log In successfull" }); // need to use front end home page url here
  } catch (error) {
    return res.status(400).json({ message: "incorrect email/password" });
  }
}

function checkAtuchFrontEnd(req, res) {
  if (!req.user) res.status(200).json({ isAuthentic: false });

  res.status(200).json({ isAuthentic: true });
}

module.exports = {
  handleCreateUser,
  handleAuthenticateUser,
  checkAtuchFrontEnd,
};
