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

module.exports = function (email, orderData) {
  // Read the HTML template file
  const htmlPath = path.join(process.cwd(), "html", "orderConfirmationTemplate.html");
  let htmlTemplate = fs.readFileSync(htmlPath, "utf-8");

  // Replace placeholders in the HTML with actual data
  const customerName = `${orderData.user.firstName} ${orderData.user.lastName}`;
  htmlTemplate = htmlTemplate.replace("{{orderNum}}", orderData.orderNum);
  htmlTemplate = htmlTemplate.replace("{{customerName}}", customerName);
  htmlTemplate = htmlTemplate.replace("{{orderDate}}", new Date(orderData.scheduleDate).toLocaleDateString());

  // Prepare order items table rows
  let orderItemsHTML = "";
  orderData.orderItems.forEach(item => {
    orderItemsHTML += `
      <tr>
        <td>${item.R_PLink.name}</td>
        <td>€ ${item.unitPrice}</td>
        <td>x${item.quantity}</td>
        <td>€ ${item.total}</td>
      </tr>
    `;
    
    // Add-ons if any
    if (item.orderAddOns && item.orderAddOns.length) {
      item.orderAddOns.forEach(addOn => {
        orderItemsHTML += `
          <tr class="sub-item">
            <td>${addOn.addOn.name}</td>
            <td></td>
            <td></td>
            <td>+€ ${addOn.total}</td>
          </tr>
        `;
      });
    }
  });

  // Add delivery fee as a separate row
  orderItemsHTML += `
    <tr class="special-row">
      <td>Delivery Fee</td>
      <td></td>
      <td></td>
      <td>€ ${(orderData.total - orderData.subTotal).toFixed(2)}</td>
    </tr>
  `;

  // Replace order items and total in the HTML
  htmlTemplate = htmlTemplate.replace("{{orderItems}}", orderItemsHTML);
  htmlTemplate = htmlTemplate.replace("{{total}}", `€ ${orderData.total}`);

  // Send the email
  transporter.sendMail(
    {
      from: process.env.EMAIL_USERNAME, // sender address
      to: email, // recipient's email
      subject: `Your Order #${orderData.orderNum} Has Been confirmed`, // Subject line
      html: htmlTemplate, // HTML body
    },
    function (error, info) {
      if (error) {
        console.log(error);
      } else {
          console.log("******************************8")
        console.log(info);
      }
    }
  );
};
