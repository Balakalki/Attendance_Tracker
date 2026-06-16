const OtpModel = require("../model/otpModel");
const User = require("../model/user");
const { createToken } = require("../service/authentication");

// The front-end (Vercel) and back-end (API Gateway) are on different
// domains, so the auth cookie is cross-site. Browsers only store/send a
// cross-site cookie when it is SameSite=None AND Secure. We detect the
// deployed Lambda via AWS_LAMBDA_FUNCTION_NAME (always set on Lambda, never
// locally) and keep Lax/non-secure for local http://localhost development.
const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const cookieOptions = {
  httpOnly: true,
  secure: isLambda,
  sameSite: isLambda ? "none" : "lax",
  path: "/",
};

async function handleCreateUser(req, res) {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password)
    return req.status(400).json({ error: "all fields are required" });

  try {
    const otpDoc = await OtpModel.findOne({ email });
    if (!otpDoc || !otpDoc.isVerified) {
      return res.status(401).json({ message: "Please validate your email" });
    }
    const newUser = new User({ fullName, email, password });
    newUser.isVerified = true;
    await newUser.save();
    return res.status(201).json({ success: "User created successfully" });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ Error: "email already exists" });
    console.log("Error: while creating user", error);
    return res.status(500).json({ Error: "something went wrong" });
  }
}

async function handleChangePassword(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return req.status(400).json({ error: "all fields are required" });

  try {
    const otpDoc = await OtpModel.findOne({ email });
    if (!otpDoc || !otpDoc.isVerified) {
      return res.status(401).json({ message: "Please validate your email" });
    }
    const UserDoc = await User.findOne({email});
    UserDoc.password = password;
    await UserDoc.save();
    return res.status(201).json({ success: "User created successfully" });
  } catch (error) {
    console.log("Error: while changing password user", error);
    return res.status(500).json({ Error: "something went wrong" });
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
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ message: "Log In successfull" }); // need to use front end home page url here
  } catch (error) {
    console.log("Error: in User Authentication ", error);
    return res.status(400).json({ message: "incorrect email/password" });
  }
}

function handleLogOut(req, res) {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logged out" });
}

async function handleGetUser(req, res) {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "unauthorized" });

  try {
    const userName = await User.findById({ _id: userId }, { fullName: 1 });
    res.json({ message: userName?.fullName });
  } catch (error) {
    console.log("Error: while Logging out ", error);
    res.status(500).json({ Error: "something went wrong" });
  }
}

module.exports = {
  handleCreateUser,
  handleAuthenticateUser,
  handleLogOut,
  handleChangePassword,
  handleGetUser,
};
