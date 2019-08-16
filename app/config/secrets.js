module.exports = {
    databaseConfig:{
        database:'mongodb://127.0.0.1:27017/interview',
        secret: 'yoursecret'
      },
    emailConfig: {
        service: 'gmail',
        auth: {
               user: 'test@gmail.com',
               pass: 'password'
           }
      },
    
    googleAnalytics: process.env.GOOGLE_ANALYTICS || ''
}