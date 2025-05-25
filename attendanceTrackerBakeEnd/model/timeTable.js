const { Schema, model } = require("mongoose");

const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const classSchema = new Schema({
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return timeFormatRegex.test(v);
      },
      message: props => `${props.value} is not a valid time in HH:mm format!`
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return timeFormatRegex.test(v);
      },
      message: props => `${props.value} is not a valid time in HH:mm format!`
    }
  },
  subject: {
    type: String,
    required: true,
  },
});

const timeTableSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
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

classSchema.pre('validate', function(next) {
  const [startHour, startMinute] = this.startTime.split(':').map(Number);
  const [endHour, endMinute] = this.endTime.split(':').map(Number);

  if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
    return next(new Error('endTime must be after startTime'));
  }

  next();
});


const timeTable = model('timeTables', timeTableSchema);

module.exports = timeTable;