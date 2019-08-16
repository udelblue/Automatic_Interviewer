const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const multer  = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const host =process.env.HOST || 'https://localhost:';
const port = process.env.PORT || 3000;
const moment = require('moment');
const emailer = require('../utilities/email');

var Interview = require('../models/interview.model');
var InterviewCollection = require('../models/interviewCollection.model');
var Response = require('../models/response.model');
var ResponseCollection = require('../models/responseCollection.model');
var InterviewResponseCollection = require('../models/interviewResponseCollection.model');
var Candidate = require('../models/candidate.model');
var Question = require('../models/question.model');


router.get('/', function(req, res) {
  res.render('pages/_index', {title: 'Home'});
 //res.redirect('/interview/list')
});

router.get('/sun',function(req,res){
  var json = '/static/profile.json';
  var profile = '/static/profile_photo.jpg';
  res.render('pages/_sun', {title: 'Sunchart', json:json, profile:profile});
});

router.get('/audio',function(req,res){
  res.render('pages/audio_test', {title: 'audio'});
});

router.get('/price',function(req,res){
  res.render('pages/_pricing-cards', {title: 'Price'});
});

router.get('/empty',function(req,res){
  res.render('pages/empty', {title: 'Empty'});
});

router.get('/detect',function(req,res){
  res.render('pages/detect', {title: 'Empty'});
});

// contact
router.get('/test',function(req,res){
  res.render('pages/test', {title: 'test'});
});

router.post('/test',  function(req, res, next){
  req.assert('username', 'Username must be at least 6 characters long.').len(6);
  req.assert('password', 'Password must be at least 6 characters long.').len(6);
  var errors = req.validationErrors();
  if (errors) {
    var errorsmsg = [];
    errors.forEach(function(error){ errorsmsg.push(error.msg);} );
    req.flash('info', errorsmsg);
    return res.redirect('/test');
  }else{
    req.flash('success', 'Successful.');
    res.redirect('/test');

  }


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