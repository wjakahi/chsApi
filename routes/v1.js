const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const config = require("../config.json");

// future option
// var pool = mysql.createPool({
//   host: config.host,
//   user: config.user,
//   password: config.password,
//   database: config.database,
// });

// SMTP setup
const transport = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.security,
});

/* GET root. */
router.get("/", function(req, res, next) {
  res.send("v1 root");
});

router.post("/emailRelay", async function(req, res, next) {
  // save to db

  // title = "title of the response page";
  // message = "message to display in response screen";
  // returnUrl = "link to go 'back'"
  // emailTo = ""
  // emailCc = ""
  // emailSubject = ""

  const pageTitle = req.body.pageTitle ? req.body.title : "Thank You";
  const pageMessage = req.body.pageMessage ? req.body.message : "";
  const returnUrl = req.body.returnUrl ? req.body.returnUrl : "https://intranet.chsli.org";
  const emailTo = "";
  const emailCc = "";
  const emailSubject = "";

  let message = "";

  message = `
  <html>
  <header><title>${pageTitle}</title></header>
  <body>
  <h1>${pageTitle}</h1>
  <p>${pageMessage}</p>
  `;
  for (entry in req.body) {
    if (entry != "title" && entry != "message" && entry != "returnUrl") {
      message += `<div>${entry} - ${req.body[entry]}</div>`;
    }
  }
  message += `
    <p><a href="${returnUrl}">Back</a></p>
    </body>
  </html> 
  `;

  try {
    const emailResponse = await sendEmail(emailTo, emailCc, emailSubject, message);

    res.write(message);
    res.end();
  } catch (e) {
    console.log("e - ", e);
    message = `
    <html>
    <header><title>${pageTitle}</title></header>
    <body>
    <h1>Error</h1>
    <p>Error: ${e.error}</p>
    
    Please go <button onclick="javascript:window.history.back();">back</button> to try again.
    `;
  }

  res.write(message);
  res.end();
  // res.send("v1 posted");
});

module.exports = router;

function sendEmail(to, subject, body) {
  return new Promise((res, rej) => {
    const message = {
      from: "no-reply@chsli.org", // Sender address
      to: to, // List of recipients
      subject: subject, // Subject line
      html: body,
    };

    transport.sendMail(message, function(err, info) {
      if (err) {
        console.log(err);
        rej({ status: "error", error: err });
      } else {
        res({ status: "success" });
      }
    });
  });
}
