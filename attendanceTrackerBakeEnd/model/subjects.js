const { Schema, model } = require("mongoose");

const subjectsSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    total: {
        type: Number,
        min: 0,
        default: 0
    },
    attended: {
        type: Number,
        min: 0,
        default: 0,
    },
    type:{
        type: String,
        enum: ["class", "lab"],
        required: true
    }
});
subjectsSchema.index({ userId: 1, name: 1 }, { unique: true });

const Subject = model('subjects', subjectsSchema);

module.exports = Subject;