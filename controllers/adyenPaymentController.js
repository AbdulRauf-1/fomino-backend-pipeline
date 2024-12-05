require("dotenv").config();
const axios = require("axios");
const {order,user,restaurant,zoneRestaurants,zone,zoneDetails,unit,wallet,Credit,orderItems,R_PLink} = require("../models");
const { v4: uuidv4 } = require("uuid");

const apiKey =
  "AQEyhmfxLY7MYhxFw0m/n3Q5qf3Ve4JKBIdPW21YyXSkmW9OjdSfqGOv8cMc3yb6ZGJ2VbQQwV1bDb7kfNy1WIxIIkxgBw==-VqTivhbxpvY5+2ta4JEVhgUgPY0IKbxnw0NS8stIsHI=-i1iW@z33#+;L7m9K_jx";
const merchantAccount = "SigitechnologiesECOM";
const paymentLinks = "https://checkout-test.adyen.com/v71/paymentLinks";
// Set up the client and service.
// Initialize the Adyen client
const { Client, CheckoutAPI,BalancePlatformAPI } = require("@adyen/api-library");
// Initialize the client object
// For the live environment, additionally include your liveEndpointUrlPrefix.   
const client = new Client({ apiKey: apiKey, environment: "TEST" });             
const checkout = new CheckoutAPI(client);
const balancePlatformAPI = new BalancePlatformAPI(client);
const paymentStore = {};
const ApiResponse = require("../helper/ApiResponse");

async function paymentByDropIn(req, res) {
//   await addTipBeforeCapture('H6K2LTW28CKN2S65', 6500000);
  const idempotencyKey = uuidv4();
  const {
    selectedPaymentMethod,
    recurringDetailReference,
    storeCard,
    orderId,
    isCredit
  } = req.body;
  let orderData = await order.findOne({
    where: {
      id: orderId
    },
    include: [{
      model: user,
      attributes: ['id', 'email', 'userName', 'firstName', 'lastName'],
      include: {
        model: Credit
      }
    }, {
      model: restaurant
    }, {
      model: orderItems,
      include: {
        model: R_PLink,
        attributes: ['name']
      },
      attributes: ['quantity', 'unitPrice']
    }]
  });
  console.log(orderData)
  let total = parseFloat(orderData?.total);
  let userCredits = await Credit.findOne({
    where: {
      userId: orderData?.userId
    }
  });
  if (orderData.credits && parseInt(orderData.credits) > 0) {
    if (orderData?.user?.Credit) {
      total = parseFloat(total) - parseFloat(orderData?.user?.Credit?.point);
    }
    // userCredits.point = 0;
    // await userCredits.save();
  }
  const lineItems = orderData.orderItems.map(item => ({
    quantity: item.quantity,
    amountIncludingTax: parseFloat(item.unitPrice) * 100, // Convert to cents/paisa if necessary
    description: item.R_PLink.name
  }));
  let zoneData = await zoneRestaurants.findOne({
    where: {
      restaurantId: orderData?.restaurantId
    },
    include: {
      model: zone,
      include: {
        model: zoneDetails,
        include: {
          model: unit,
          as: "currencyUnit"
        }
      }
    }
  });
  const shopperReference = orderData?.user?.email; // Replace with a unique shopper ID from your database
  try {
    // Retrieve stored payment methods
    const storedPaymentMethods = await retrieveStoredPaymentMethods(shopperReference);
    // const orderRef = uuidv4();
    const orderRef = orderId;
    // Construct the payment session request payload
    const payload = {
      amount: {
        currency: zoneData?.zone?.zoneDetail?.currencyUnit?.symbol,
        value: parseFloat(total)*100
      }, // Example amount
      reference: orderRef,
      merchantAccount: merchantAccount, // Replace with your merchant account
      returnUrl: `https://backend.fomino.ch/success`,
      countryCode: "NL",
      shopperLocale: "nl-NL",
      shopperReference: shopperReference,
        //  captureDelayHours: 0,
      recurringProcessingModel: "CardOnFile", // Specify the recurring processing model
      storePaymentMethod: storeCard ? true : false, // Ensure the payment method is stored based on checkbox
      lineItems: lineItems,
      
    };
    // Add payment method details if a recurringDetailReference is provided
    if (recurringDetailReference) {
      payload.paymentMethod = {
        type: "scheme",
        storedPaymentMethodId: recurringDetailReference,
      };
    }

    const response = await axios.post('https://checkout-test.adyen.com/v71/sessions', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey, // Replace with your API key
        'Idempotency-Key': idempotencyKey,
      }
    });
    // Save transaction details or update payment status as needed
    paymentStore[orderRef] = {
      amount: {
        currency: zoneData?.zone?.zoneDetail?.currencyUnit?.symbol,
        value: parseFloat(total)*100
      }, // Note: Value should match the amount specified in the request
      paymentRef: orderRef,
      status: "Pending",
    };
    // Attach the selected payment method to the session response
    res.json({
      sessionData: response.data,
      selectedPaymentMethod,
      total: total,
      storedPaymentMethods,
      orderData: orderData,
      currency: zoneData?.zone?.zoneDetail?.currencyUnit?.symbol,
      idempotencyKey: idempotencyKey
    });
  } catch (err) {
    if (err.response) {}
    res.status(err.response?.status || 500).json(err.response?.data || {
      message: err.message
    });
  }
}

async function getPaymentMethods(req, res) {
  let obj = {
    merchantAccount: merchantAccount,
    countryCode: "NL",
    amount: {
      currency: "EUR",
      value: 1000,
    },
    channel: "Web"
  };
  try {
    const idempotencyKey = uuidv4();
    let apiUrl = "https://checkout-test.adyen.com/v71/paymentMethods";
    const response = await axios.post(apiUrl, obj, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": apiKey,
        "Idempotency-Key": idempotencyKey,
      },
    });
    // return res.json(response?.data)
    let list = [];
    // return res.json(response?.data)
    for(const method of response?.data?.paymentMethods){
        if(method.type != "klarna_paynow" && method.type != "klarna_account" && method.type != "paysafecard" && method.type != "klarna" && method.type != "ideal"){
            list.push({
                 name: method.name,
                 type: method.type,
            })
        }
    }
    let respp = ApiResponse("1","Payment methods","",{simplifiedPaymentMethods:list});
    return res.json(respp);
  } catch (error) {
    let respp = ApiResponse("0",error.message,"Error",{});
    return res.json(respp);
  }
}
async function retrieveStoredPaymentMethods(shopperReference) {
  const apiUrl =
    "https://pal-test.adyen.com/pal/servlet/Recurring/v71/listRecurringDetails";

  const requestData = {
    merchantAccount: merchantAccount,
    recurring: {
      contract: "RECURRING",
    },
    shopperReference: shopperReference,
  };

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
    });

    // console.log("Stored Payment Methods:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error retrieving stored payment methods:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

async function adyenPaymentbyCard(req, res) {
  const idempotencyKey = uuidv4();
  const shopperReference = "5096"; // Unique reference for the shopper
  // Retrieve stored payment methods (optional for verification, not used in payment link creation)
  let storedPaymentMethods;
  try {
    storedPaymentMethods = await retrieveStoredPaymentMethods(shopperReference);
    // console.log("Stored Payment Methods:", storedPaymentMethods);
  } catch (error) {
    console.error("Error retrieving stored payment methods:", error);
    // Proceed without blocking if retrieval fails
  }

  const paymentLinkData = {
    amount: {
      currency: "USD",
      value: 1000,
    },
    reference: "023842342",
    returnUrl: "https://your-company.com/...",
    merchantAccount: merchantAccount,
    description: "Payment for order #123122313",
    expiresAt: new Date(
      new Date().getTime() + 24 * 60 * 60 * 1000
    ).toISOString(), // Link expires in 24 hours
    countryCode: "US",
    shopperEmail: "tufailkhan5096@gmail.com",
    shopperLocale: "en-US",
    allowedPaymentMethods: [], // Optional, include only if you want to restrict payment methods
    blockedPaymentMethods: [], // Optional
    reusable: false, // Optional, set to true if the link can be reused
    storePaymentMethodMode: "enabled", // Store the payment method
    recurringProcessingModel: "CardOnFile", // Recurring processing model
    shopperReference: shopperReference, // Add shopper reference
  };

  try {
    const response = await axios.post(paymentLinks, paymentLinkData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": apiKey,
        "Idempotency-Key": idempotencyKey,
      },
    });

    // console.log("Payment Link Response:", response.data);
    return res.json(response.data);
  } catch (error) {
    console.error(
      "Payment Link Error:",
      error.response ? error.response.data : error.message
    );
    return res.status(500).json({ error: error.message });
  }
}

async function paymentWithStoredCard(req, res) {
  const idempotencyKey = uuidv4();
  const {
    storedPaymentMethodId,
    cvc,
    orderId
  } = req.body;
//   console.log("Request Body:", req.body); // Log the request body
  let orderData = await order.findOne({
    where: {
      id: orderId
    },
    include: [{
      model: user,
      attributes: ['id', 'email']
    }, {
      model: restaurant
    }]
  });
  const shopperReference = orderData?.user?.email; // Use the shopperReference from your stored payment methods
  try {
    const orderRef = uuidv4();
    const payload = {
      amount: {
        currency: "USD",
        value: parseInt(orderData?.total) * 100
      }, // Example amount
      reference: orderRef,
      merchantAccount: merchantAccount, // Replace with your merchant account
      returnUrl: `http://localhost:3000/`,
      countryCode: "NL",
      shopperLocale: "nl-NL",
      shopperReference: shopperReference,
      recurringProcessingModel: "CardOnFile", // Specify the recurring processing model
      paymentMethod: {
        type: "scheme",
        storedPaymentMethodId: storedPaymentMethodId,
        cvc: cvc,
      },
      lineItems: [{
        quantity: 1,
        amountIncludingTax: 5000,
        description: "Sunglasses"
      }, {
        quantity: 1,
        amountIncludingTax: 5000,
        description: "Headphones"
      }, ],
    };
    // console.log("Request payload:", JSON.stringify(payload, null, 2)); // Log the payload
    // Make the request to Adyen API
    const response = await axios.post('https://checkout-test.adyen.com/v71/payments', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey, // Replace with your API key
        'Idempotency-Key': idempotencyKey,
      }
    });
    
    if (response.data.resultCode === 'Authorised') {
    //   console.log("Payment Response:", response.data);
      let check = await wallet.findOne({
        where: {
          orderId: orderId
        }
      });
      if (check) {
        check.transactionId = response.data.pspReference;
        check.reference = response.data.merchantReference;
        await check.save();
      } else {
        let wall = new wallet();
        wall.paymentType = "Card";
        wall.amount = orderData.total;
        wall.at = Date.now();
        wall.orderId = orderId;
        wall.restaurantId = orderData.restaurantId;
        wall.userId = orderData.userId;
        wall.transactionId = response.data.pspReference;
        wall.reference = response.data.merchantReference;
        await wall.save();
      }
      return res.json({
        status: true,
        message: "Payment successful",
        data: response.data,
        transactionId: response.data.pspReference
      });
    } else {
      return res.json({
        status: false,
        message: response.data.refusalReason || "Payment not authorised",
        data: response.data
      });
    }
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.response?.data?.errorCode}`);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
    }
    return res.status(err.response?.status || 500).json({
      status: false,
      message: err.response?.data?.message || err.message
    });
  }
}

async function refundPayment(orderId) {
  const idempotencyKey = uuidv4();

  try {
    // Retrieve order data, including payment and user details
    let orderData = await order.findOne({
      where: { id: orderId },
      include: [
        { model: user, attributes: ['id', 'email'] },
        { model: restaurant }
      ]
    });
    if (!orderData) {
      throw new Error("Order not found");
    }
    // Check if the order has a related wallet entry with a transaction ID
    let walletData = await wallet.findOne({ where: { orderId: orderId } });
    if (!walletData || !walletData.transactionId) {
      throw new Error("Transaction ID not found for this order");
    }

    const transactionId = walletData.transactionId;
    const refundAmount = parseInt(orderData.total) * 100; // Convert to minor units (e.g., cents)
    // Construct the refund request payload
    const payload = {
      reference: `refund-${uuidv4()}`, // Unique reference for the refund
      merchantAccount: merchantAccount,
    };
    // Make the request to Adyen API for refund
    const response = await axios.post(`https://checkout-test.adyen.com/v71/payments/${transactionId}/cancels`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey, // Replace with your API key
        'Idempotency-Key': idempotencyKey,
      }
    });
    // console.log(response)
    if (response.data.status === 'received') {
      // Update wallet entry with refund information
      walletData.reference = response.data.reference;
      await walletData.save();

      return { status: true, message: "Refund successful", data: response.data, refundTransactionId: response.data.pspReference };
    } else {
      return { status: false, message: response.data.refusalReason || "Refund not successful", data: response.data };
    }
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.response?.data?.errorCode}`);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
    }
    return { status: false, message: err.response?.data?.message || err.message };
  }
}

module.exports = {
  adyenPaymentbyCard,
  paymentByDropIn,
  getPaymentMethods,
  paymentWithStoredCard,
  refundPayment
};
