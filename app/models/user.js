const mongoose = require('mongoose');


// User Schema
var UserSchema = mongoose.Schema({
  firstname:{
    type: String,
    required: true
  },
  lastname:{
    type: String,
    required: true
  },

  email:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  role:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  resetPasswordToken:{
    type: String
  },
  resetPasswordExpires:{
    type: Date
  }


});



const User = module.exports = mongoose.model('User', UserSchema);
