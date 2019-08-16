
const express = require('express');
const router = express.Router();

router.get('/401',function(req,res){
  res.render('pages/401', {title: '401'});
});
router.get('/403',function(req,res){
  res.render('pages/403', {title: '403'});
});

router.get('/404',function(req,res){
  res.render('pages/404', {title: '404'});
});

router.get('/500',function(req,res){
  res.render('pages/500', {title: '500'});
});

router.get('/503',function(req,res){
  res.render('pages/503', {title: '503'});
});

module.exports = router;