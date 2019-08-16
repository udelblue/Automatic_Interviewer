const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
var multer  = require('multer');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
const host = process.env.HOST || 'https://localhost:';
const port = process.env.PORT || 3000;
var moment = require('moment');



var Interview = require('../models/interview.model');
var InterviewCollection = require('../models/interviewCollection.model');
var Response = require('../models/response.model');
var ResponseCollection = require('../models/responseCollection.model');
var InterviewResponseCollection = require('../models/interviewResponseCollection.model');
var Candidate = require('../models/candidate.model');
var Question = require('../models/question.model');

//list of responses for a interview
router.get('/interview/:id',  function(req, res) {
  //candidiate interview collection id
  var id = req.params.id
  if(id === null){
    res.render('pages/_interview_response_list' , { responses: {} , interviewID: "" , moment: moment, title:"Response List"});
  }else{

  InterviewResponseCollection.findOne({ 'interviewID': id }).populate('responseCollections').populate('interview').exec().then(function(irc){
    
    if(typeof irc  === 'undefined' | irc === null){
      res.render('pages/_interview_response_list' , { responses: []   , interview:{},  moment: moment, title:"Response List"} );
    }
    else{   
      res.render('pages/_interview_response_list' , {  responses: irc.responseCollections ,interview:irc.interview ,  moment: moment, title:"Response List"} );}
    })
 } 
});
router.get('/interview/:id/:cid', function(req, res) {
  //interview  and candidate id
  var jid = req.params.id
  var cid = req.params.cid
  var counter = 1;
 var interview = {};
  var candidate = {};
  var response_collection = {};

  Candidate.findOne({ '_id': cid  }).then(function(can){
    if(can){
      candidate = can;
    }
  }).then(function(){  
  Interview.findOne({ '_id': jid  }).then(function(inte){
    if(!inte){
      res.render('pages/_interview_response' , {questions:[], interview:interview, candidate:candidate, moment: moment, title:"Response" } );
    }
    else{
      interview = inte;
    }
 }).then(function(){  

ResponseCollection.findOne({ 'interviewID': jid , 'candidateID': cid  }).populate('responses').exec().then(function(rc){
    if(!rc){
      res.render('pages/_interview_response' , {questions:[], interview:inter, candidate:candidate, moment: moment, title:"Response" } );
    }else{
      response_collection = rc;
    }

  }).then(function(){  
  var q = [];
  var timestamp;
  //questions
  if(interview.questions.length > 0){
    interview.questions.forEach(id => {
      var vname = jid  + '-' + cid + '-' + counter;
      // responses
      if(typeof response_collection !== 'undefined' | response_collection  !== null){
        timestamp = response_collection.responses[(counter - 1)].updated
        if(typeof timestamp === 'undefined'){
          var date = new Date();
          date.getTime();
        }
      }
      counter ++;
      var vpath = host + port + '/api/video?vid=' + vname;
      var vtime = id.duration +  " seconds";
      var nq = {id:id, link:"/public/response/detail?cid=" + cid + "&qid=" + id, question: id.question , path:vpath , response_date:timestamp , duration:vtime, transcript:" "  }
      q.push(nq);
    });
}

res.render('pages/_interview_response' , {questions:q, interview:interview, candidate:candidate,  moment: moment, title:"Response" } );
  
 })
})
})
  
});

router.get('/personality/:id', function(req, res) {
  //candidiate interview collection id
  var id = req.params.id
  var json = '/static/profile.json';
  var profile = '/static/profile_photo.jpg';
  res.render('pages/_sun', {title: 'Sunchart', json:json, profile:profile});
});

router.get('/metrics/:id', function(req, res) {
  //candidiate interview collection id
  var id = req.params.id
  res.render('pages/interview_response_metrics' , {title:"Metrics"} );
});


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

// https://tone-analyzer-demo.ng.bluemix.net/

/*

Tone response example

{
  "document_tone": {
    "tones": [
      {
        "score": 0.575803,
        "tone_id": "sadness",
        "tone_name": "Sadness"
      },
      {
        "score": 0.867377,
        "tone_id": "tentative",
        "tone_name": "Tentative"
      }
    ]
  }
}

*/


/*

Tones
Anger

Likelihood of writer being perceived as angry. Low value indicates unlikely to be perceived as angry. High value indicates very likely to be perceived as angry.
Fear

Likelihood of writer being perceived as scared. Low value indicates unlikely to be perceived as fearful. High value, very likely to be perceived as scared.
Joy

Joy or happiness has shades of enjoyment, satisfaction and pleasure. There is a sense of well-being, inner peace, love, safety and contentment.
Sadness

Likelihood of writer being perceived as sad. Low value, unlikely to be perceived as sad. High value very likely to be perceived as sad.
0.58
Analytical

A writer's reasoning and analytical attitude about things. Higher value, more likely to be perceived as intellectual, rational, systematic, emotionless, or impersonal.
Confident

A writer's degree of certainty. Higher value, more likely to be perceived as assured, collected, hopeful, or egotistical.
Tentative

A writer's degree of inhibition. Higher value, more likely to be perceived as questionable, doubtful, limited, or debatable.
0.87
3 

*/