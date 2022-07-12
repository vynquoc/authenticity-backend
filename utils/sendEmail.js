const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')

let transporter = nodemailer.createTransport({
    service: 'gmail.com',
    secure: false,
    auth: {
        user: process.env.EMAIL || 'authenticity.market@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'fireblood1'
    }
})
transporter.use('compile', hbs({
    viewEngine:  {
        extName: ".handlebars",
        partialsDir: path.resolve(__dirname, "emailViews"),
        defaultLayout: false,
      },
      viewPath: path.resolve(__dirname, "emailViews"),
    extName: ".handlebars"
}))




module.exports = (to, subject, template, context) => {
    let mailOptions = {
        from: 'authenticity.market@gmail.com',
        to: to,
        subject: subject,
        template: template,
        context: context
    }
    transporter.sendMail(mailOptions).then((res) => console.log(res)).catch(err => console.log(err))
}