const { Schema, model } = require("mongoose");

// const subjectsSchema = new mongoose.Schema(
//   {
//     total: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     present: {
//       type: Number,
//       required: true,
//       min: 0,
//       validate: {
//         validator: function (value) {
//           return value <= this.total;
//         },
//         message: "Present count cannot be greater than total classes.",
//       },
//     },
//     absent: {
//       type: Number,
//       required: true,
//       min: 0,
//       validate: {
//         validator: function (value) {
//           return value <= this.total;
//         },
//         message: "Absent count cannot be greater than total classes.",
//       },
//     },
//   },
//   { _id: false }
// );

const classesSchema = new Schema(
  {
    slotId: {
      type: String,
      required: true,
    },
    subjectId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
    },
  },
  { _id: false }
);

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
    classes: {
      type: [classesSchema],
      default: [],
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = model("attendance", attendanceSchema);

module.exports = Attendance;