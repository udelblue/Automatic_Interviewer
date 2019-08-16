const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let InterviewSchema = new Schema({
    owner: {type: String, required: false, max: 200, trim: true},
    name: {type: String, required: false, max: 200, trim: true},
    start_time: {type: Number, "default" : 0},
    updated: { type: Date, default: Date.now },
    questions : { type : Array , "default" : [] }
});


// Export the model
module.exports = mongoose.model('Interview', InterviewSchema);