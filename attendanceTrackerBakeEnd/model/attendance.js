const { Schema, model } = require("mongoose");

const attendanceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    // Date-only value stored as a "YYYY-MM-DD" string. Keeping it as a string
    // (instead of a Date) makes it timezone-safe: the day the student picked is
    // exactly the day we store, with no UTC/midnight drift. These strings also
    // sort lexicographically == chronologically, so range queries still work.
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "slots",
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "subjects",
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, date: 1, slotId: 1 }, { unique: true });
// Supports the delete-subject cascade: Attendance.deleteMany({ userId, subjectId }).
attendanceSchema.index({ userId: 1, subjectId: 1 });

const Attendance = model("attendance", attendanceSchema);

module.exports = Attendance;
