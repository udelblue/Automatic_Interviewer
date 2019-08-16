const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let InterviewResponseSchema = new Schema({
    interviewID: {type: String, required: false },
    candidateID: {type: String, required: false },
    questionID : {type: String, required: false },
    transcript: {type: String, required: false , trim: true},
    updated: { type: Date, default: Date.now },
    duration: {type: Number, required: false},
    file_name: {type: String, required: false}
    
    // binary:  Buffer
});


// Export the model
module.exports = mongoose.model('Response', InterviewResponseSchema);