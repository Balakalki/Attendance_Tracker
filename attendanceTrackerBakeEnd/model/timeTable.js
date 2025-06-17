const { Schema, model } = require("mongoose");

const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const classSchema = new Schema(
  {
    slotId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'slots'
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'subjects'
    },
  },
  { _id: false }
);

const timeTableSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true,
    },
    classTime: {
      type: Number,
      required: true,
    },
    labTime: {
      type: Number,
      required: true,
    },
    lunchBreak: {
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
    days: {
      Monday: { type: [classSchema], default: [] },
      Tuesday: { type: [classSchema], default: [] },
      Wednesday: { type: [classSchema], default: [] },
      Thursday: { type: [classSchema], default: [] },
      Friday: { type: [classSchema], default: [] },
      Saturday: { type: [classSchema], default: [] },
      Sunday: { type: [classSchema], default: [] },
    },
  },
  { timestamps: true }
);


const timeTable = model("timeTables", timeTableSchema);

module.exports = timeTable;
