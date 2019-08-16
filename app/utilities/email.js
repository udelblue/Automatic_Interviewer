'use strict';
var fs = require("fs");
var path = require('path');
var nodemailer = require("nodemailer");
var ejs = require("ejs");
var template_properties = require("../config/template_properties");
var config = require("../config/secrets");

async function send (mail) {
 var input = Object.assign( template_properties, mail.data);
 let transporter = nodemailer.createTransport(config.emailConfig);   
 var parentDir = path.normalize(__dirname+"/..");


ejs.renderFile(parentDir + "/views/mail/"+ mail.template +".ejs", input , function (err, data) {
    if (err) {
        console.log(err);
        // log error
    } else {
        var mainOptions = {
            from:  template_properties.from_email,
            to: mail.to,
            subject: mail.subject,
            html: data
        };
       // console.log("html data ======================>", mainOptions.html);
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
               // console.log('Message sent: ' + info.response);
            }
        });
    }
    
    });


};


async function old_send (mail) {
    // Generate test SMTP service account from ethereal.email
   // Only needed if you don't have a real mail account for testing
   
       // create reusable transporter object using the default SMTP transport
       let transporter = nodemailer.createTransport({
           service: 'gmail',
           auth: {
                  user: 'cdsommers@gmail.com',
                  pass: 'Kate#8181'
              }
       });
   
       // send mail with defined transport object
           transporter.sendMail(mail, (error, info) => {
           if (error) {
               return console.log(error);
           }
           console.log('Message sent: %s', info.messageId);
           // Preview only available when sending through an Ethereal account
           console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
           return info.messageId;
           // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
           // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
       });
   
       
   };
   
   




async function send_test (mail){
     console.log(mail);
     return "123456789";
};


module.exports = {
    send_test: send_test,
    send: send
};

 
/*
    // setup email data with unicode symbols
    let mail = {
        from: 'cdsommers@gmail.com', // sender address
        to: 'cdsommers@gmail.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello world?</b>' // html body
    };
send(mail)

*/

