const { Schema, model } = require("mongoose");

// total/attended are intentionally NOT stored here. Attendance counts are
// derived from the `attendance` collection (single source of truth) in the
// summary controller, so the two can never drift out of sync.
const subjectsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    type: {
      type: String,
      enum: ["class", "lab"],
      required: true,
    },
  },
  { timestamps: true }
);
subjectsSchema.index({ userId: 1, name: 1 }, { unique: true });

const Subject = model("subjects", subjectsSchema);

module.exports = Subject;
