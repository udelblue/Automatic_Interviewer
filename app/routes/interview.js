const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const multer  = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const emailer = require('../utilities/email')
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

//invite get 
router.get('/invite/:id',function(req,res){
  var id = req.params.id; 
  var cand = [];
  Candidate.find( { interviewID: id } ).then(function(c){
  res.render('pages/_interview_invite', {title: 'Invite', candidates:cand.concat(c), id: id});
  })
});

//invite post
router.post('/invite/:id',function(req,res){
  var jid = req.params.id; 
  req.checkBody('fname','First name can not be empty.').notEmpty();
  req.checkBody('lname','Last name can not be empty.').notEmpty();
  req.checkBody('email','Email can not be empty.').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    req.flash('info', 'Validation errors');
    res.redirect('/invite/' + jid);
  }else{

  var site_root = host + port;
  var lname = req.body.lname;
  var fname = req.body.fname;
  var email = req.body.email;


  
  let candidate = new Candidate(
    {interviewID:jid, first_name:fname, last_name:lname, email:email}
  );

  var fullname = fname + " " + lname;
  //send email
  candidate.save().then(function(c){
    var complete_site =  site_root + '/interview?cid=' + c._id + '&jid=' + jid;
    var url  = '/interview?cid=' + c._id + '&jid=' + jid;
    //res.redirect('/interview?cid=' + c._id + '&jid=' + jid);

    let mail = {
      to: email, // list of receivers
      subject: 'Interview Invitation', // Subject line
      data : { name: fullname , email: email, url: url},
      template : "invite_interview"
  };
  emailer.send(mail).then(()=> {
    req.flash('success', 'Invitation sent.');
    res.redirect('/interview/list');
  });

  
  })
  }
});



//signin get 
router.get('/signin/:id',function(req,res){
  var id = req.params.id; 
  res.render('pages/_interview_signin', {title: 'Sign In', id: id});
});

//signin post
router.post('/signin/:id',function(req,res){
  var jid = req.params.id; 
  var lname = req.body.lname;
  var fname = req.body.fname;
  var email = req.body.email;
  var cand = {};
  let candidate = new Candidate(
    {interviewID:jid, first_name:fname, last_name:lname, email:email}
  );
  candidate.save().then(function(c){
    cand = c;
    res.redirect('/interview?cid=' + c._id + '&jid=' + jid);
  })



});



//create interview
router.get('/create', ensureAuthenticated, function(req,res){
  res.render('pages/_interview_create', {title: 'Create', interview: {}});
});

//create interview
router.post('/create', ensureAuthenticated, function(req,res){

  var ititle = req.body.interview_title;
  var istarttime =  req.body.interview_start_time;
  var iduration = req.body.interview_duration;
  var questions = [];
  var qs1 = [];
  var qs = qs1.concat(req.body['question[]']);
  var rt = req.body['retry[]'];
  var cd = req.body['countdown[]'];
  var d = req.body['duration[]'];

  

  for (i = 0; i < qs.length; i++) { 
    q = { sort_order:i, question:qs[i] , retry:rt[i] , countdown: cd[i], duration: d[i]};
    questions.push(q);
  }
  
  let iw = new Interview(
    {
        owner: req.user.username,
        name:  ititle,
        start_time: istarttime,
        duration: iduration,
        questions: questions
    }
  );

  iw.save(function (err, i) {
      InterviewCollection.findOne({ 'owner': req.user.username }).then(function(ic){
        ic.interviews.push(i._id);
        ic.save(function (err,ic){
          let interResponseCollection = new InterviewResponseCollection(
            {
              interviewID: i._id,
              interview : i._id,
              owner: req.user.username
            }
          );
          interResponseCollection.save(function (err, ir) {
            if (err) {
              res.status(500)
              res.send(err);
            }
            res.status(200)
            res.send({});
          })
        }
        )
        })
    })
});

// delete an interview get
router.get('/delete/:id', ensureAuthenticated, function(req,res){
  var id = req.params.id; 
  Interview.findOneAndRemove({_id : id}, function (err, i) {
    if (err) return res.status(500).send(err)
    return res.redirect('../list');
  } );
});


// edit an interview get
router.get('/edit/:id', ensureAuthenticated , function(req,res){
    var id = req.params.id; 
    Interview.findById(id, function (err, i) {
      if (err) return res.status(500).send(err)

      return res.render('pages/_interview_edit', {interview:i, title:"Edit"});
    } );
});

// edit an interview post
router.post('/edit/:id', ensureAuthenticated, function(req,res){
  
  var id = req.params.id; 
  var ititle = req.body.interview_title;
  var istarttime =  req.body.interview_start_time;
  var iduration = req.body.interview_duration;
  var questions = [];
  var qs = req.body['question[]'];
  var rt = req.body['retry[]'];
  var cd = req.body['countdown[]'];
  var d = req.body['duration[]'];
  
  for (i = 0; i < qs.length; i++) { 
    q = { sort_order:i, question:qs[i] , retry:rt[i] , countdown: cd[i], duration: d[i]};
    questions.push(q);
  }
  
  Interview.findById(id, function (err, i) {
    if (err) return res.status(500).send(err)
    i.name =   ititle;
    i.start_time = istarttime,
    i.duration = iduration;
    i.questions = questions;
    i.save();
    
  } ).then(function(err, i){

    res.send({});
  });

});

//list of all my interviews
router.get('/list', ensureAuthenticated, function(req,res){ 

  //get owner of InterviewCollection
    var site_root = host + port;

    InterviewCollection.findOne({ 'owner': req.user.username }).populate('interviews').exec().then(function(ic){
      var interviews = {};
      if(ic === null){
      var ic = new  InterviewCollection({owner: req.user.username});
      ic.save(function (err,collection){
        res.render('pages/_interview_list' , { site_root:site_root, interviews: interviews,  moment: moment, title:"List"} );
      })
      }else{
        res.render('pages/_interview_list' , {site_root:site_root, interviews: ic.interviews,  moment: moment, title:"List"} );
      }
    
  })
})

// get interview check 
router.get('/check',function(req,res){
  var cid = req.query.cid; 
  var jid = req.query.jid; 
  if (!jid){res.redirect("/unable" )}
  if (!cid){res.redirect("/signin/" + jid)}
    var root_url = host + port;
    var url  = '/interview?cid=' + cid + '&jid=' + jid;
    res.render('pages/_interview_check' , {root_url:root_url, url:url, title: "Precheck"} );
 
});



// get interview 
router.get('/',function(req,res){
  var cid = req.query.cid; 
  var jid = req.query.jid; 
  if (!jid){res.redirect("/unable" )}
  if (!cid){res.redirect("/signin/" + jid)}

  Interview.findOne({ '_id': jid }).then(function(interview){

  res.render('pages/_interview' , {interview: interview, candidate:{"_id":cid}, title: "Interview"} );
  });

});


//unable to process
router.get('/unable',function(req,res){
  var backurl =req.header('Referer') || '/';
  var mic = req.query.mic; 
  var cam = req.query.cam;
  var messages = []
  if(mic !== null & mic === false)
  {
    messages.push(" Microphone is not available or enabled.");
  }
  if(cam !== null & cam === false)
  {
    messages.push(" Camera is not available or enabled.");
  }
  res.render('pages/_interview_unable' , {title: 'Unable', messages:messages , backurl:backurl} );
});

//finished interview page
router.get('/finished',function(req,res){
  var cid = req.query.cid; 
  var jid = req.query.jid; 
  //console.log("cid : " + cid + " jid : " + jid)

  //send email
  /*
  Candidate.findOne({ _id: cid }).then(function(c){
    let mail = {
      from: 'cdsommers@gmail.com', // sender address
      to: c.email, // list of receivers
      subject: 'Completed ✔', // Subject line
     // text: 'Site: ' , // plain text body
      html: '<b>Thank you</b>' // html body
  };
  
  var id =  emailer.send_test(mail);
  res.render('pages/_interview_finished' ,  {title: 'Finished', message:'Interview is finished.'} );
  })
  */




  
 Candidate.findOne({ _id: cid }).then(function(c){
  if(c)
  {

    c.finished = Date.now();
    c.save().then(function(c){


    var fullname = c.first_name + " " + c.last_name;
    let mail = {
      to: c.email, // list of receivers
      subject: 'Interview Completed', // Subject line
      data : { name: fullname , email: c.email},
      template : "invite_completed"
    };
    emailer.send(mail).then(()=> {
      res.render('pages/_interview_finished' ,  {title: 'Finished', message:'Interview is finished.'} );
    });

  });

  }else{
      res.render('pages/_interview_finished' ,  {title: 'Finished', message:'Interview is finished.'} );
 
  }

})

//res.render('pages/_interview_finished' ,  {title: 'Finished', message:'Interview is finished.'} );
 

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