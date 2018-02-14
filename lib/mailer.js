const nodemailer = require('nodemailer')

module.exports = rejection => {

  nodemailer.createTestAccount((err, account) => {

      const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, 
          auth: {
              user: process.env.USER, 
              pass: process.env.PASS  
          }
      })

      const mailOptions = {
          from: '"jesse.heaslip@gmail.com', 
          to: 'jesse.heaslip@gmail.com', 
          subject: 'app down', 
          text: rejection, 
          html: `<p>${rejection}</p>` 
      };

      transporter.sendMail(mailOptions, (err, info) => {
          if (err) return console.log(err);
          
          console.log('Message sent: %s', info.messageId);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      })
  })
}