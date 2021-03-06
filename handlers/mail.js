const nodemailer = require('nodemailer')
const pug = require('pug')
const juice = require('juice')
const htmlToText = require('html-to-text')
const promisify = require('es6-promisify')
const moment = require('moment')
const h = require('./../helpers')
// Require:
var postmark = require("postmark");

// // Send an email:
// var client = new postmark.Client("717984bf-8821-4f9f-9317-e06d1c8e3830");


// client.sendEmail({
//   "From": "no-reply@fleetshot.com",
//   "To": "cody@enlinx.com",
//   "Subject": "Test",
//   "TextBody": "Hello from Postmark!"
// });

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options)
  const inlined = juice(html)
  return inlined
}

const generateAttachment = (photos = [], bolId) => {
  const attachments = photos.map(photo => {
    json = {
      filename: photo,
      path: process.env.PHOTO_DIR+bolId+'/'+photo,
      cid: photo.split('.')[0]+'@fleetshot.com'
    }
    return json;
  })
  return attachments
}

exports.sendPDF = async (options) => {
  if (options.customerEmail == '') {
    options.customerEmail = 'bol@fleetshot.com'
  }
  options.attachments = generateAttachment(options.photos, options.bol.id)
  const html = generateHTML(options.filename, options)
  const text = htmlToText.fromString(html)
  const mailOptions = {
    from: process.env.MAIL_SENDER,
    to: options.customerEmail,
    cc: process.env.MAIL_CC,
    bcc: process.env.MAIL_BCC,
    subject: options.subject,
    html,
    attachments: options.attachments,
    text
  };
  const sendMail = promisify(transport.sendMail, transport)
  return sendMail(mailOptions)
}