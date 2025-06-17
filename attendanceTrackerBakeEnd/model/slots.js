const { Schema, model } = require("mongoose");

const slotSchema = new Schema({
    time:{
        type: String,
        required: true,
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    sortId:{
        type: Number,
        required: true,
    }
}, {timestamps: true});

slotSchema.index({time: 1, userId: 1, sortId: 1}, {unique: true});
const Slots = model('slots', slotSchema);

module.exports = Slots;