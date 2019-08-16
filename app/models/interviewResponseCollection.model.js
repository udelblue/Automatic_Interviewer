const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let InterviewResponseCollectionSchema = new Schema({
    owner: {type: String, required: false, max: 200, trim: true},
    public: {type:Boolean, "default" : true},
    interviewID: {type: String, max: 200, required: false},
    interview : { type: Schema.Types.ObjectId, ref: 'Interview' },
    responseCollections : [{ type: Schema.Types.ObjectId, ref: 'ResponseCollection' }]
});


// Export the model
module.exports = mongoose.model('InterviewResponseCollection',  InterviewResponseCollectionSchema);