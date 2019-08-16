const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ResponseCollectionSchema = new Schema({
    interviewID: {type: String, max: 200, required: false},
    candidateID: {type: String, max: 200, required: false},
    completed: {type:Boolean, "default" : false},
    updated: { type: Date, default: Date.now },
    responses: [{ type: Schema.Types.ObjectId, ref: 'Response' }]
});


// Export the model
module.exports = mongoose.model('ResponseCollection', ResponseCollectionSchema);