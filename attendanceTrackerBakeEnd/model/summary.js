const { Schema, model } = require("mongoose");

const subjectSchema = new Schema({
    subjectId:{
        type: String,
        required: true
    },
    total:{
        type: Number,
        min: 1,
    },
    absent:{
        type: Number,
        default: 0,
        min: 0
    },
    present:{
        type: Number,
        default: 0,
        min: 0
    }
}, {_id: false})
const summarySchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'users',
        unique: true,
        required: true
    },
    totalClasses:{
        type: Number,
        default: 0,
        min: 0
    },
    attendedClasses:{
        type: Number,
        default: 0,
        min: 0
    },
    subjects:{
        type: [subjectSchema],
        default: []
    }

},{timestamps: true});

const Summary = model('summary', summarySchema);

module.exports = Summary;