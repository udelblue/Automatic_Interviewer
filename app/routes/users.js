const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const emailer = require('../utilities/email');


// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res){
  res.render('pages/_register', {title: 'Register'});
});

// Register Proccess
router.post('/register', function(req, res){
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('firstname', 'First name is required').notEmpty();
  req.checkBody('lastname', 'Last name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('pages/_register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      firstname:firstname,
      lastname:lastname,
      email:email,
      role:"User",
      username:username,
      password:password
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {

            let mail = {
              to: newUser.email, // list of receivers
              subject: 'Registered User', // Subject line
              data : {username: newUser.username , name: newUser.firstname , email: newUser.email},
              template : "register"
          };
          emailer.send(mail).then(()=> {
            req.flash('success','You are now registered and can log in');
            res.redirect('/users/login');
          });

            
          }
        });
      });
    });
  }
});

//reset get
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {

     res.render('pages/_reset-password', {
     User: req.user, token: req.params.token , title: 'Reset password'
    });
  });
});

//reset post
router.post('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('back');
    }

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(req.body.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        user.password = hash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
    //console.log('password' + user.password  + 'and the user is' + user)
    user.save().then(function(){
      let mail = {
        to: user.email, // list of receivers
        subject: 'Password Changed', // Subject line
        data : {username: user.username , name: user.firstname , email: user.email},
        template : "password_changed"
    };
    emailer.send(mail).then(()=> {
      req.flash('success', 'Your password has been updated.');
      res.redirect('/users/login');
    });
    })
  })
  })
})
});


// forgot password get
router.get('/forgot', function(req, res) {
  res.render('pages/_forgot-password', {title: 'Forgot password'});
});

//generate reset token
async function genToken(){
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};


// forgot password post
router.post('/forgot', function(req, res) {

  const email = req.body.email;
  genToken().then(function(t){
  User.findOne({ email: email }, function(err, u1) {
    if (!u1) {
      req.flash('error', 'No account with that email address exists.');
      return res.redirect('/users/forgot');
    }

    u1.resetPasswordToken = t;
    u1.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    u1.save().then(function(err) {

      let mail = {
        to: u1.email, // list of receivers
        subject: 'Password Reset', // Subject line
        data : {username: u1.username , name: u1.firstname , email: u1.email , hash: u1.resetPasswordToken },
        template : "password_reset"
    };
    emailer.send(mail).then(()=> {
      req.flash('info', 'An email was sent to your email account.');
      res.redirect('/users/login');
    });



    });
  });

})
});





// reset password
router.post('/password', ensureAuthenticated, function(req, res, next){
  req.assert('password', 'Password must be at least 6 characters long.').len(6);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(req.redirect.failure);
  }

  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(req.body.password, salt, function(err, hash){
      if(err){
        console.log(err);
      }
      user.password = hash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
  //console.log('password' + user.password  + 'and the user is' + user)
  user.save().then(function(){
    let mail = {
      to: user.email, // list of receivers
      subject: 'Password Changed', // Subject line
      data : {username: user.username , name: user.firstname , email: user.email},
      template : "password_changed"
  };
  emailer.send(mail).then(()=> {
    req.flash('success', 'Your password has been updated.');
    res.redirect(req.redirect.success);
  });
  })
})
})



}
);



// profile
router.get('/profile', ensureAuthenticated, function(req, res) {
  //console.dir(req.user);
  res.render('pages/_profile', {title: 'Profile', user:req.user});
});

router.post('/profile', ensureAuthenticated, function(req, res) {
  //update user profile
  req.flash('light', 'Profile Updated.');
  res.redirect('/users/profile');
});

// Login Form
router.get('/login', function(req, res){
 res.render('pages/_login', { title: 'Login' });
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/interview/list',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', ensureAuthenticated, function(req, res){
  req.logout();
  req.flash('info', 'You are logged out');
  res.redirect('/users/login');
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
