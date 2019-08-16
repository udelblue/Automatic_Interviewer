const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let InterviewCollectionSchema = new Schema({
    owner: {type: String, required: false, max: 200, trim: true},
    interviews : [{ type: Schema.Types.ObjectId, ref: 'Interview' }]
});


// Export the model
module.exports = mongoose.model('InterviewCollection', InterviewCollectionSchema);