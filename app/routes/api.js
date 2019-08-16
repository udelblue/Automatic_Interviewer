const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const multer  = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const host =process.env.HOST || 'https://localhost:';
const port = process.env.PORT || 3000;
const moment = require('moment');

var Interview = require('../models/interview.model');
var InterviewCollection = require('../models/interviewCollection.model');
var Response = require('../models/response.model');
var ResponseCollection = require('../models/responseCollection.model');
var InterviewResponseCollection = require('../models/interviewResponseCollection.model');
var Candidate = require('../models/candidate.model');
var Question = require('../models/question.model');

//upload file config
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './app/input')
	},
	filename: function(req, file, callback) {
    var fn = req.body.jobID + '-' + req.body.candidateID + '-' + req.body.questionID 
    callback(null, fn + path.extname(file.originalname) + ".mp4")
	}
})
var upload = multer({
  storage: storage
});
//upload file end


// get interview question by index id
router.get('/interview/question',function(req,res){
    var qid = req.query.id; 
    var jid = req.query.jid; 
    var ran = Math.random();
   // var q = { qid: qid , question : " sample question " + ran , question_type : "text" , response_type: "video",  duration: 5};
   // var jid = "5bf6044576873435b41091f8";
    Interview.findById(jid, function (err, i) {
      res.send( i.questions[qid]);
    } );
    
});


// collect response from interview
router.post('/response',  upload.single('f'), function(req,res){
  var file_name = req.body.candidateID + '-' + req.body.questionID 
  var cid = req.body.candidateID;
  var qid = req.body.questionID;
  var jid = req.body.jobID;
  var interview = req.body.currentInterview;
  var question = req.body.currentQuestion;
  var fn = req.body.jobID + '-' + req.body.candidateID + '-' + req.body.questionID 

  var lirc;
  var lrc;
  var ir = new Response(
    {
        interviewID: jid,
        candidateID: cid,
        questionID: qid,
        file_name: fn,
        question: question,
        transcript:""
    }
  );


  InterviewResponseCollection.findOne({ 'interviewID': jid }).then(function(irc){

    if(irc === null){
      res.status(500);
      res.send('Interview Response Collection not found');
    }
    lirc = irc;

  }).then(function(){

 
  ResponseCollection.findOne({ 'interviewID': jid, 'candidateID':cid  }).then(function(rc){
    if(rc === null){
      let rc = new ResponseCollection({ 'interviewID': jid, 'candidateID':cid  })
      rc.save(function(err,rc){
        lrc = rc;
      });
    }
    else{
      lrc = rc;
    }
    
  }).then(function(){

    ir.save(function (err, ir) {
  
      lrc.responses.push(ir._id);
      lrc.save(function (err, lrc) {

        var index = _.find(lirc.responseCollections, function(ch) {
          return ch == lrc._id ;
        });
        if ( index==undefined ) {
          lirc.responseCollections.push(lrc._id);
        }
        
        lirc.save(function(){
          res.status(200);
          res.send('ok');
          //res.end();
        });
      


      })
    }
    
    )

  })
//

  })

});

// stream video response back
router.get('/video', function(req, res) {
  var vid = req.query.vid; 
  var path = ''
  if (vid) {
    path = 'app/input/' + vid + '.mp4'
  }else{
    res.status(404);
    res.send('file not found');
  }
  //console.log(path)
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})


// stream audio response back
router.get('/audio', function(req, res) {
  var vid = req.query.aid; 
  var path = ''
  if (vid) {
    path = 'input/' + vid + '.mp3'
  }else{
    res.status(404);
    res.send('file not found');
  }
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp3',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp3',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}


module.exports = router;