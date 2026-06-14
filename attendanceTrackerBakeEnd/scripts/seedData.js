/**
 * Seed dummy data for a demo user — a realistic Indian-college 2nd-year CSE
 * timetable + ~6 weeks of attendance history.
 *
 * Usage (from attendanceTrackerBakeEnd/):
 *   node scripts/seedData.js
 *   npm run seed
 *
 * Idempotent: wipes the demo user's timetable/slots/subjects/attendance first,
 * then reseeds. Does NOT touch the user's account/password.
 *
 * Requires MONGODB_URL in .env.
 */
require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../model/user");
const Subject = require("../model/subjects");
const Slots = require("../model/slots");
const timeTable = require("../model/timeTable");
const Attendance = require("../model/attendance");

const EMAIL = "aluribalakalki5@gmail.com";

// ── Timetable configuration (typical Indian college: 50-min periods) ──────────
const CONFIG = {
  startTime: "09:30",
  endTime: "16:45",
  classTime: 50, // single theory period (minutes)
  labTime: 100, // a lab = two consecutive periods
  lunchBreak: { startTime: "13:00", endTime: "13:50" },
};

// ── Subjects (name, type, weekly attendance "present" rate for dummy history) ─
const SUBJECTS = [
  { name: "Data Structures", type: "class", rate: 0.92 },
  { name: "DBMS", type: "class", rate: 0.88 },
  { name: "Operating Systems", type: "class", rate: 0.8 },
  { name: "Computer Organization", type: "class", rate: 0.7 },
  { name: "Discrete Mathematics", type: "class", rate: 0.6 }, // intentionally low → red
  { name: "OOP with Java", type: "class", rate: 0.85 },
  { name: "Data Structures Lab", type: "lab", rate: 0.95 },
  { name: "DBMS Lab", type: "lab", rate: 0.9 },
  { name: "Java Lab", type: "lab", rate: 0.83 },
];

// Weekly grid by slot index (0-based). A lab name repeated in two consecutive
// slots represents a single 2-period lab session. `null` = free period.
const WEEK = {
  Monday: ["Data Structures", "DBMS", "Operating Systems", "Computer Organization", "Data Structures Lab", "Data Structures Lab", "Discrete Mathematics"],
  Tuesday: ["OOP with Java", "Discrete Mathematics", "Data Structures", "DBMS", "Operating Systems", "Computer Organization", "OOP with Java"],
  Wednesday: ["DBMS", "Operating Systems", "DBMS Lab", "DBMS Lab", "Data Structures", "Discrete Mathematics", "OOP with Java"],
  Thursday: ["Computer Organization", "Data Structures", "Discrete Mathematics", "OOP with Java", "Operating Systems", "DBMS", "Computer Organization"],
  Friday: ["Operating Systems", "OOP with Java", "Java Lab", "Java Lab", "Computer Organization", "Data Structures", "DBMS"],
  Saturday: ["Discrete Mathematics", "Data Structures", "DBMS", "Operating Systems", null, null, null],
  Sunday: [null, null, null, null, null, null, null],
};

const WEEKS_OF_HISTORY = 6;

// ── Slot generation: mirrors the frontend TimetableConfig algorithm ──────────
function parseTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
function formatTimeAMPM(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
function generateSlots() {
  const slots = [];
  let current = parseTime(CONFIG.startTime);
  const end = parseTime(CONFIG.endTime);
  const breakStart = parseTime(CONFIG.lunchBreak.startTime);
  const breakEnd = parseTime(CONFIG.lunchBreak.endTime);
  let index = 0;
  while (current < end) {
    const next = new Date(current.getTime() + CONFIG.classTime * 60000);
    if (next > breakStart && current < breakEnd) {
      current = new Date(breakEnd);
      continue;
    }
    if (next <= end) {
      slots.push({ sortId: index, time: `${formatTimeAMPM(current)} - ${formatTimeAMPM(next)}` });
      index++;
    }
    current = next;
  }
  return slots;
}

function fmtDate(d) {
  // Local Y-M-D, matching the "YYYY-MM-DD" strings the app stores.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function run() {
  const url = process.env.MONGODB_URL;
  if (!url) {
    console.error("MONGODB_URL not set. Aborting.");
    process.exit(1);
  }
  await mongoose.connect(url);
  console.log("Connected to", mongoose.connection.name);

  // 1) User (must exist; create as a safety net if not)
  let user = await User.findOne({ email: EMAIL });
  if (!user) {
    user = await User.create({ fullName: "Aluri Bala Kalki", email: EMAIL, password: "123456", isVerified: true });
    console.log("User not found — created demo user.");
  }
  const userId = user._id;
  console.log("Seeding for user:", userId.toString());

  // 2) Clean slate for this user
  await Promise.all([
    timeTable.deleteOne({ userId }),
    Slots.deleteMany({ userId }),
    Subject.deleteMany({ userId }),
    Attendance.deleteMany({ userId }),
  ]);
  console.log("Cleared existing timetable/slots/subjects/attendance.");

  // 3) Subjects
  const subjectDocs = await Subject.insertMany(
    SUBJECTS.map((s) => ({ userId, name: s.name, type: s.type }))
  );
  const subjectByName = {};
  subjectDocs.forEach((d) => (subjectByName[d.name] = d));
  const rateByName = {};
  SUBJECTS.forEach((s) => (rateByName[s.name] = s.rate));
  console.log(`Inserted ${subjectDocs.length} subjects.`);

  // 4) Slots
  const slotDocs = await Slots.insertMany(generateSlots().map((s) => ({ ...s, userId })));
  const slotByIndex = {};
  slotDocs.forEach((d) => (slotByIndex[d.sortId] = d));
  console.log(`Inserted ${slotDocs.length} slots:`, slotDocs.map((s) => s.time).join(" | "));

  // 5) Timetable days grid
  const days = {};
  for (const [dayName, names] of Object.entries(WEEK)) {
    days[dayName] = [];
    names.forEach((name, idx) => {
      if (!name) return;
      const slot = slotByIndex[idx];
      const subject = subjectByName[name];
      if (slot && subject) days[dayName].push({ slotId: slot._id, subjectId: subject._id });
    });
  }
  await timeTable.create({ userId, ...CONFIG, days });
  console.log("Created timetable.");

  // 6) Attendance history (last N weeks, excluding free/Sunday periods)
  const today = new Date();
  const records = [];
  for (let i = 0; i < WEEKS_OF_HISTORY * 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const grid = WEEK[weekday] || [];
    const dateStr = fmtDate(d);
    grid.forEach((name, idx) => {
      if (!name) return;
      const slot = slotByIndex[idx];
      const subject = subjectByName[name];
      if (!slot || !subject) return;
      const present = Math.random() < rateByName[name];
      records.push({
        userId,
        date: dateStr,
        slotId: slot._id,
        subjectId: subject._id,
        status: present ? "Present" : "Absent",
      });
    });
  }
  await Attendance.insertMany(records);
  console.log(`Inserted ${records.length} attendance records across ${WEEKS_OF_HISTORY} weeks.`);

  // 7) Quick per-subject summary (raw counts; dashboard scales labs by classTime/labTime)
  const stats = await Attendance.aggregate([
    { $match: { userId } },
    { $group: { _id: "$subjectId", total: { $sum: 1 }, attended: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } } } },
  ]);
  const labFactor = CONFIG.classTime / CONFIG.labTime;
  console.log("\nPer-subject (scaled like the dashboard):");
  for (const s of subjectDocs) {
    const st = stats.find((x) => String(x._id) === String(s._id)) || { total: 0, attended: 0 };
    const f = s.type === "lab" ? labFactor : 1;
    const total = st.total * f;
    const attended = st.attended * f;
    const pct = total ? ((attended * 100) / total).toFixed(1) : "—";
    console.log(`  ${s.name.padEnd(22)} ${s.type.padEnd(5)} ${attended}/${total}  (${pct}%)`);
  }

  await mongoose.disconnect();
  console.log("\nDone. Log in as", EMAIL, "to see the dashboard.");
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
