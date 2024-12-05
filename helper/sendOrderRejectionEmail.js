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

module.exports = function (orderNum, email, customerName, rejectionReason) {
  // Read the HTML template file
  const htmlPath = path.join(process.cwd(), "html", "orderRejectionTemplate.html");
  let htmlTemplate = fs.readFileSync(htmlPath, "utf-8");

  // Replace placeholders in the HTML with actual data
  htmlTemplate = htmlTemplate.replace("{{orderNum}}", orderNum);
  htmlTemplate = htmlTemplate.replace("{{customerName}}", customerName);
  htmlTemplate = htmlTemplate.replace("{{rejectionReason}}", rejectionReason);

  transporter.sendMail(
    {
      from: process.env.EMAIL_USERNAME, // sender address
      to: email, // recipient's email
      subject: `Your Order #${orderNum} Has Been Rejected`, // Subject line
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
