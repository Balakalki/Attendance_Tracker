const { Schema, model } = require("mongoose");

const attendanceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    date: {
      type: Date,
      required: true,
    },
    slotId: {
      type: String,
      required: true,
      ref: 'slots',
    },
    subjectId: {
      type: String,
      required: true,
      ref: 'subjects'
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, date: 1, slotId: 1 }, { unique: true });

const Attendance = model("attendance", attendanceSchema);

module.exports = Attendance;