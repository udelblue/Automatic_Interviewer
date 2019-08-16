const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let QuestionSchema = new Schema({
    question: {type: String, required: false, trim: true},
    retry_attempts: {type: Number, "default" : 0},
    countdown: {type: Number, "default" : 0},
    duration: {type: Number, "default" : 30},
    question_type: {type: String, required: false, default: "text"},
    response_type: {type: String, required: false, trim: "video"}
});

// Export the model
module.exports = mongoose.model('Question', QuestionSchema);