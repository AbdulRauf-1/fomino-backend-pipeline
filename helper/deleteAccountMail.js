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

module.exports = function (email, customerName, otp) {
  // Read the HTML template file
  const htmlPath = path.join(process.cwd(), "html", "deleteAccountTemplate.html");
  let htmlTemplate = fs.readFileSync(htmlPath, "utf-8");

  // Replace placeholders in the HTML with actual data
  htmlTemplate = htmlTemplate.replace("{{customerName}}", customerName);
  htmlTemplate = htmlTemplate.replace("{{otp}}", otp);

  transporter.sendMail(
    {
      from: process.env.EMAIL_USERNAME, // sender address
      to: email, // recipient's email
      subject: `Delete Account OTP`, // Subject line
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
