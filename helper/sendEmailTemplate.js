const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Defining the account for sending email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // use TLS
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = function (otp, email) {
  // Read the HTML template file
   const htmlPath = path.join(process.cwd(), "html", "otpTemplate.html");
   let htmlTemplate = fs.readFileSync(htmlPath, "utf-8");

  // Replace placeholder in HTML with actual OTP
   htmlTemplate = htmlTemplate.replace("{{otp}}", otp);

  transporter.sendMail(
    {
      from: process.env.EMAIL_USERNAME, // sender address
      to: email, // list of receivers
      subject: `OTP for Fomino`, // Subject line
      html: htmlTemplate, // HTML body
    },
    function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log(info);
      }
    }
  );
};
