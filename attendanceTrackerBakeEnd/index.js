require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const mongodbConnection = require("./connection");
const { checkIsAuthentic } = require("./middlewares/authentication");

const authRouter = require("./routes/auth");
const timeTableRouter = require('./routes/timeTable');
const attendanceRouter = require('./routes/attendance');
const summaryRouter = require('./routes/summary');
const otpRouter = require('./routes/otp');

mongodbConnection(process.env.MONGODB_URL);
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use((req, res, next) => {
  try {
    if(req.apiGateway?.event?.body){
        req.body = JSON.parse(req.apiGateway.event.body);
    }
  } catch (error) {
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
