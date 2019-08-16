const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CandidateSchema = new Schema({
    interviewID: {type: String, max: 200, required: false},
    first_name: {type: String, required: false, max: 200, trim: true},
    last_name: {type: String, required: false, max: 200, trim: true},
    finished: { type: Date},
    updated: { type: Date, default: Date.now },
    email: {type: String, required: false, max: 200, trim: true}
});


// Export the model
module.exports = mongoose.model('Candidate', CandidateSchema);