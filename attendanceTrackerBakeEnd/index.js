require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// const mongodbConnection = require("./connection");
const { checkIsAuthentic } = require("./middlewares/authentication");

const authRouter = require("./routes/auth");
const timeTableRouter = require('./routes/timeTable');
const attendanceRouter = require('./routes/attendance');
const summaryRouter = require('./routes/summary');
const otpRouter = require('./routes/otp');

// mongodbConnection(process.env.MONGODB_URL);
const app = express();

// Allowlist of front-end origins permitted to call this API. Set the
// ALLOWED_ORIGINS env var to a comma-separated list, e.g.
// "http://localhost:5173,https://your-app.vercel.app". Falls back to the
// local dev origin so nothing breaks when the var is unset.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header => non-browser caller (curl, health checks,
      // server-to-server). Allow those through.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use((req, res, next) => {
  try {
    if(req.apiGateway?.event?.body){
        req.body = JSON.parse(req.apiGateway.event.body);
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(400).json({ error: "Invalid base64 body" });
  }
  next();
});
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.use(checkIsAuthentic);

app.use("/api/auth", authRouter);

app.use("/api/timetable/", timeTableRouter);

app.use("/api/attendance", attendanceRouter);

app.use("/api/summary", summaryRouter);

app.use("/api/otp", otpRouter);

module.exports = app;
