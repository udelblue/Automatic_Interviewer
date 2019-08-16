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

const config = require('../config/secrets');

// Bring in User Model
let User = require('../models/user');


async function toArray(dataPlan){
  let plans = [];
  Object.keys(dataPlan).forEach(function (item) {
    let ob = dataPlan[item];
    plans.push(ob); 
  });
  return plans;
}

router.get('/settings', ensureAuthenticated , async function(req,res){
  var stripePubKey = config.stripeOptions.stripePubKey;
  var plans = await toArray(config.stripeOptions.planData);
    res.render('pages/_account_settings', {title: 'Settings', stripePubKey: stripePubKey, last4:null, plans: plans, user_plan: req.user.stripe.plan,  carderror:null, cardformerror:null});
});


router.post('/plan', function(req, res, next){
  var plan = req.body.plan;
  var cardnum = req.body.card-num;
  var cardmonth  = req.body.card-month;
  var cardyear  = req.body.card-year;
  var cardcvc  = req.body.card-cvc;
  //req.user.stripe.customerId;
  var stripeToken  = "";

  if(plan){
    plan = plan.toLowerCase();
  }

  if(req.user.stripe.plan == plan){
    req.flash('info', 'The selected plan is the same as the current plan.');
    return res.redirect(req.redirect.success);
  }

  if(req.body.stripeToken){
    stripeToken = req.user.stripe.customerId;
  }

  if(!req.user.stripe.last4 && !req.body.stripeToken){
    req.flash('errors', 'Please add a card to your account before choosing a plan.');
    return res.redirect(req.redirect.failure);
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.setPlan(plan, stripeToken, function (err) {
      var msg;

      if (err) {
        if(err.code && err.code == 'card_declined'){
          msg = 'Your card was declined. Please provide a valid card.';
        } else if(err && err.message) {
          msg = err.message;
        } else {
          msg = 'An unexpected error occurred.';
        }

        req.flash('errors',  msg);
        return res.redirect(req.redirect.failure);
      }
      req.flash('success', 'Plan has been updated.' );
      res.redirect(req.redirect.success);
    });
  });

});


//test
router.post('/test',function(req, res, next){
  var stripeToken = req.body.stripeToken;
  console.log(stripeToken);
  req.flash('success','Token success.' );
  res.redirect('/account/settings');
});

router.post('/billing',function(req, res, next){
  var stripeToken = req.body.stripeToken;

  if(!stripeToken){
    req.flash('errors', 'Please provide a valid card.' );
    return res.redirect(req.redirect.failure);
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.setCard(stripeToken, function (err) {
      if (err) {
        if(err.code && err.code == 'card_declined'){
          req.flash('errors', 'Your card was declined. Please provide a valid card.' );
          return res.redirect(req.redirect.failure);
        }
        req.flash('errors','An unexpected error occurred.' );
        return res.redirect(req.redirect.failure);
      }
      req.flash('success','Billing has been updated.' );
      res.redirect(req.redirect.success);
    });
  });
});


router.post('/delete', function(req, res, next){
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.remove(function (err, user) {
      if (err) return next(err);
      user.cancelStripe(function(err){
        if (err) return next(err);

        req.logout();
        req.flash('info',  'Your account has been deleted.');
        res.redirect('/account/settings');
      });
    });
  });
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('info', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;