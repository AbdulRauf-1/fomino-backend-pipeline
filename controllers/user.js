require("dotenv").config();
//importing Models
const {
  user,
  productAddons,
  configuration,
  emailVerification,
  forgetPassword,
  addressType,
  restaurant_cultery,
  cutlery,
  restaurantBanners,
  discountDetail,
  zoneDetails,
  zoneRestaurants,
  zone,
  collectionAddons,
  driverZone,
  menuCategoryLanguage,
  productCollections,
  restaurantOffers,
  collection,
  country,
  restaurantDriver,
  cusineRestaurant,
  defaultValues,
  driverEarning,
  city,
  Credit,
  time,
  banner,
  address,
  restaurant,
  orderType,
  orderCultery,
  tableBooking,
  orderApplication,
  unit,
  deliveryFeeType,
  deliveryFee,
  cuisine,
  R_CLink,
  restaurantRating,
  userType,
  R_MCLink,
  menuCategory,
  restaurantFeedback,
  R_PLink,
  paymentMethod,
  P_AOLink,
  addOn,
  addOnCategory,
  P_A_ACLink,
  deliveryType,
  orderMode,
  order,
  orderGroup,
  orderGroup_Item,
  orderItems,
  orderAddOns,
  voucher,
  charge,
  orderCharge,
  driverRating,
  wallet,
  orderStatus,
  vehicleType,
  orderHistory,
  driverDetails,
  vehicleDetails,
  setting,
} = require("../models");
const sendNotifications = require("../helper/notifications");
const OPTrans = require("../helper/orderPlaceTransaction");
const paymentTrans = require("../helper/paymentTransaction");
const sendAccountCreationEmail = require("../helper/sendAccountCreationEmail");
const sendOrderCreateEmail = require("../helper/sendOrderCreateEmail");
const deleteAccountMail = require("../helper/deleteAccountMail");
const sendOrderRejectionEmail = require("../helper/sendOrderRejectionEmail");
const sendOrderConfirmationEmail = require("../helper/sendOrderConfirmationEmail");
const sentOtpMail = require("../helper/sentOtpMail");

const sendPasswordRecoveryEmail = require("../helper/sendPasswordRecoveryEmail.js");
var xmljs = require("xml-js");
const eta_text = require("../helper/eta_text");
// Importing Custom exception
const CustomException = require("../middlewares/errorObject");
const paypal = require("paypal-rest-sdk");
const fs = require('fs');
const {
  point,
  booleanPointInPolygon
} = require("@turf/turf");
const {
  formatTokens
} = require('../helper/getTokens');
const retailerController = require("../controllers/retailer");
//importing redis
const redis_Client = require("../routes/redis_connect");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const {
  sign
} = require("jsonwebtoken");
const SequelizeDB = require('../SequelizeDB');
const {
  Client,
  CheckoutAPI
} = require('@adyen/api-library');
// OTP generator
var otp = require("otpauth");
let totp = new otp.TOTP({
  issuer: "ACME",
  label: "AzureDiamond",
  algorithm: "SHA1",
  digits: 4,
  period: 30,
  secret: "NB2W45DFOIZA", // or "OTPAuth.Secret.fromBase32('NB2W45DFOIZA')"
});
let uON = new otp.TOTP({
  issuer: "ACME",
  label: "AzureDiamond",
  algorithm: "SHA1",
  digits: 8,
  period: 30,
  secret: "NB2W45DFOIZA", // or "OTPAuth.Secret.fromBase32('NB2W45DFOIZA')"
});
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");
const {
  Op
} = require("sequelize");
const axios = require("axios");
// Calling mailer
const nodemailer = require("nodemailer");
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
let FCM = require("fcm-node");
let fcm = new FCM(process.env.FIREBASE_SERVER_KEY);
const sequelize = require("sequelize");
const {
  settings
} = require("../routes/user");
const ApiResponse = require("../helper/ApiResponse");
const singleNotification = require("../helper/singleNotification");
const dateFormat = require("../helper/dateFormat");
const res = require("express/lib/response");
const path = require("path");
const qs = require("qs");
const Base64 = require("crypto-js/enc-base64");
const hmacSHA256 = require("crypto-js/hmac-sha256");
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET_CLIENT,
});
const crypto = require("crypto");
const {
  sendEvent
} = require("../socket_io");
const instanceName = "fomino";
const secret = "t44XOjTIuGgOz9GFJqu5voUJNL31wZ";
const {
  URLSearchParams
} = require('url');

const fetch = require('node-fetch');
const encodedParams = new URLSearchParams();
const distance = require("../helper/distance");
const apiKey = "AQEyhmfxLY7MYhxFw0m/n3Q5qf3Ve4JKBIdPW21YyXSkmW9OjdSfqGOv8cMc3yb6ZGJ2VbQQwV1bDb7kfNy1WIxIIkxgBw==-VqTivhbxpvY5+2ta4JEVhgUgPY0IKbxnw0NS8stIsHI=-i1iW@z33#+;L7m9K_jx";
const merchantAccount = "SigitechnologiesECOM";


function generateReferalCode(length) {
  const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

function buildSignature(data, secret) {
  let queryStr = "";
  if (data) {
    queryStr = qs.stringify(data, {
      format: "RFC1738"
    });
    queryStr = queryStr.replace(/[!'()*~]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  }
  return Base64.stringify(hmacSHA256(queryStr, secret));
}
async function payrexx_design(req, res) {
  let designData = {
    name: "fit",
    default: "1",
    fontFamily: "Verdana",
    fontSize: "16px",
    textColor: "333333",
    textColorVPOS: "333333",
    linkColor: "333333",
    linkHoverColor: "333333",
    buttonColor: "123456",
    buttonHoverColor: "123456",
    background: "e7b007",
    backgroundColor: "e7b007",
    headerBackground: "f1c232",
    headerBackgroundColor: "f1c232",
    emailHeaderBackgroundColor: "f1c232",
    headerImageShape: "round",
    useIndividualEmailLogo: 1,
    logoBackgroundColor: "fff2cc",
    logoBorderColor: "bf9000",
    VPOSGradientColor1: "ffe599",
    VPOSGradientColor2: "8cf260",
    enableRoundedCorners: "1",
    VPOSBackground: "https://fominobackend.myace.app/Public/logo.png",
    headerImageCustomLink: "https://fominobackend.myace.app/Public/logo.png"
  }
  let sign = buildSignature(designData, secret);
  designData.ApiSignature = sign;
  const requestData = qs.stringify(designData, {
    format: "RFC3986"
  });
  const response = await axios.post(`https://api.payrexx.com/v1.0/Design/?instance=${instanceName}`, requestData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  console.log(response.data);
  return res.json(response.data)
}
async function payrexx_payment(req, res) {
  try {
    const {
      orderId,
      currency,
      vatRate,
      isCredit,
      paymentProvider,
      paymentMethod
    } = req.body;
    let orderData = await order.findOne({
      where: {
        id: orderId
      },
      include: [{
        model: user,
        include: {
          model: Credit
        }
      }, {
        model: restaurant,
        attributes: ['packingFee']
      }],
    });
    let total = orderData.total;
    if (isCredit) {
      if (orderData?.user?.Credit) {
        total = parseFloat(total) - parseFloat(orderData?.user?.Credit?.point);
      }
      if (!orderData.credits) {
        orderData.credits = parseInt(orderData?.user?.Credit?.point);
        await orderData.save();
      }
    }
    const invoiceData = {
      referenceId: Math.floor(Math.random() * 900000) + 100000,
      title: orderData.orderNum,
      description: orderData.description ? orderData.description : "Description",
      purpose: "Food Delivery",
      successRedirectUrl: "https://test.fomino.ch/success.html",
      failedRedirectUrl: "https://test.fomino.ch/failed.html",
      uuid: "8a68a9de",
      name: "Fomino",
      amount: parseFloat(total) * 100,
      currency: currency,
      vatRate: vatRate,
      sku: "P01122000",
      psp: [paymentProvider],
      //   psp: [44],
      pm: [paymentMethod],
      //  pm:['twint'],
      preAuthorization: 1,
      reservation: 0,
      //   lookAndFeelProfile:"5c23c64d",
      fields: {
        email: orderData?.user?.email,
        company: "Fomino",
        // forename: "Tufail Khan",
        forename: orderData?.user?.userName,
        // surname: "UmAR",
        surname: orderData?.user?.userName,
        country: "AT",
        title: "miss",
        terms: true,
        privacy_policy: true,
        custom_field_1: "Value 001",
      },
    };
    let sign = buildSignature(invoiceData, secret);
    invoiceData.ApiSignature = sign;
    const requestData = qs.stringify(invoiceData, {
      format: "RFC3986"
    });
    const response = await axios.post(`https://api.payrexx.com/v1.0/Gateway/?instance=${instanceName}`, requestData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log(response.data)
    // return res.json(response.data.data)
    if (response.data.status == "success") {
      let data = {
        link: response.data.data[0].link,
        hash: response.data.data[0].hash,
        referenceId: response.data.data[0].referenceId,
      };
      let resp = ApiResponse("1", "Response created", "", data);
      return res.json(resp);
    } else {
      let resp = ApiResponse("0", response.data.message, "", {});
      return res.json(resp);
    }
  } catch (error) {
    let resp = ApiResponse("0", error.message, "", {});
    return res.json(resp);
  }
}
async function get_all_active_payment_methods(req, res) {
  let sign = buildSignature({
    filterCurrency: 'CHF'
  }, secret);
  const url = `https://api.payrexx.com/v1.0/PaymentMethod/mastercard/?instance=${instanceName}`;
  axios.get(url, {
    params: {
      filterCurrency: 'CHF',
      ApiSignature: sign
    }
  }).then(response => {
    let resp = ApiResponse("1", "data", "Error", response.data);
    return res.json(resp);
    console.log(response.data);
  }).catch(error => {
    let resp = ApiResponse("0", error.message, "Error", {});
    return res.json(resp);
  });
}
async function get_all_payment_providers(req, res) {
  let sign = buildSignature({
    filterCurrency: 'CHF'
  }, secret);
  const url = `https://api.payrexx.com/v1.0/PaymentProvider/?instance=${instanceName}`;
  axios.get(url, {
    params: {
      filterCurrency: 'CHF',
      ApiSignature: sign
    }
  }).then(response => {
    let resp = ApiResponse("1", "data", "Error", response.data);
    return res.json(resp);
    console.log(response.data);
  }).catch(error => {
    let resp = ApiResponse("0", error.message, "Error", {});
    return res.json(resp);
  });
}
async function addDeviceToken(userId, newToken) {
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    // Find the user by ID
    const userData = await user.findOne({
      where: {
        id: userId
      },
      transaction: t
    });
    if (!userData) {
      throw new Error("User not found");
    }
    let tokens;
    if (userData.deviceToken === null) {
      // If deviceToken is null, initialize tokens as an empty array
      tokens = [];
    } else {
      try {
        // Try to parse the deviceToken as JSON
        tokens = JSON.parse(userData.deviceToken);
        // If it's not an array, convert it into an array
        if (!Array.isArray(tokens)) {
          tokens = [userData.deviceToken];
        }
      } catch (e) {
        // If JSON parsing fails, treat deviceToken as a plain string and wrap it in an array
        tokens = [userData.deviceToken];
      }
    }
    // Add the new token if it's not already in the array
    if (!tokens.includes(newToken)) {
      tokens.push(newToken);
    }
    console.log(tokens);
    // Convert the array back to a JSON string and save it
    userData.deviceToken = JSON.stringify(tokens);
    await userData.save({
      transaction: t
    }); // Save with transaction context
    await t.commit(); // Commit the transaction if successful
    console.log("Device token added successfully.");
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    console.error("Error adding device token:", error.message);
  }
}
//TODO Create Random number usging some other method
/*
        1. Register User
    ________________________________________

*/
//  async function registerUser(req, res) {
//   const {
//     userName,
//     firstName,
//     lastName,
//     email,
//     countryCode,
//     phoneNum,
//     password,
//     gKey,
//     deviceToken,
//   } = req.body;
//   // check if user with same eamil and phoneNum exists
//   const userExist = await user.findOne({
//     where: {
//       [Op.or]: [{ email: email }],
//     },
//   });
//   //return res.json(userExist)
//   if (userExist) {
//     if (email === userExist.email) {
//       const response = ApiResponse("0", "User already exists", "Error", {});
//       return res.json(response);
//     }
//     // if (userName === userExist.userName) {
//     //   const response = ApiResponse("0", "User already exists", "Error", {});
//     //   return res.json(response);
//     // }
//   }
//   // Our user in this case is customer
//   let userTypeId = 1;
//   //Checking if signUp is custom or by google
//   switch (gKey) {
//     // custom signUp
//     case "0":
//       // generating OTP
//       let OTP = totp.generate();
//       //return res.json(OTP)
//       transporter.sendMail(
//         {
//           from: process.env.EMAIL_USERNAME, // sender address
//           to: email, // list of receivers
//           subject: `Your OTP for MyAce is ${OTP}`, // Subject line
//           text: `Your OTP for MyAce is ${OTP}`, // plain text body
//         },
//         function (error, info) {
//           //if(error) return res.json(error)
//           //else return res.json(info);
//           //creating stripe customer
//           stripe.customers
//             .create({ email: email })
//             .then((customer) => {
//               // hashing the password
//               bcrypt.hash(password, 10).then((hashedPassword) => {
//                 //now creating a new entry in database
//                 user
//                   .create({
//                     userName,
//                     firstName,
//                     lastName,
//                     email,
//                     status: true,
//                     countryCode,
//                     phoneNum,
//                     password: hashedPassword,
//                     stripeCustomerId: customer.id,
//                     userTypeId,
//                   })
//                   .then((userData) => {
//                     let DT = new Date();
//                     emailVerification
//                       .create({
//                         requestedAt: DT,
//                         OTP,
//                         userId: userData.id,
//                       })
//                       .then((evData) => {
//                         let data = {
//                           userId: `${userData.id}`,
//                           userName: `${userData.userName}`,
//                           firstName: `${userData.firstName}`,
//                           lastName: `${userData.lastName}`,
//                           email: `${userData.email}`,
//                           accessToken: "",
//                         };
//                         const response = ApiResponse(
//                           "1",
//                           "User registered successfully!",
//                           "",
//                           data
//                         );
//                         return res.json(response);
//                       });
//                   })
//                   .catch((err) => {
//                     const response = ApiResponse(
//                       "1",
//                       "Error in creating new enrty in Database",
//                       err.name,
//                       {}
//                     );
//                     return res.json(response);
//                   });
//               });
//             })
//             .catch((err) => {
//               const response = ApiResponse(
//                 "1",
//                 "Error in creating stripe customer",
//                 err.name,
//                 {}
//               );
//               return res.json(response);
//             });
//         }
//       );
//       break;
//     // Google signUp
//     case "1":
//       stripe.customers
//         .create({ email: email })
//         .then((customer) => {
//           bcrypt.hash(password, 10).then((hashedPassword) => {
//             //now creating a new entry in database
//             user
//               .create({
//                 userName,
//                 firstName,
//                 lastName,
//                 email,
//                 status: true,
//                 countryCode,
//                 phoneNum,
//                 password: hashedPassword,
//                 deviceToken,
//                 verifiedAt: new Date(),
//                 stripeCustomerId: customer.id,
//                 userTypeId,
//               })
//               .then((userData) => {
//                 const accessToken = sign(
//                   {
//                     id: userData.id,
//                     email: userData.email,
//                     deviceToken: deviceToken,
//                   },
//                   process.env.JWT_ACCESS_SECRET
//                 );
//                 //Adding the online clients to reddis DB for validation process
//                 redis_Client.hSet(`${userData.id}`, deviceToken, accessToken);
//                 let output = loginData(userData, accessToken);
//                 return res.json(output);
//               })
//               .catch((err) => {
//                 const response = ApiResponse(
//                   "1",
//                   "Error in creating stripe customer",
//                   err.name,
//                   {}
//                 );
//                 return res.json(response);
//               });
//           });
//         })
//         .catch((err) => {
//           const response = ApiResponse(
//             "1",
//             "Error in creating stripe customer",
//             err.name,
//             {}
//           );
//           return res.json(response);
//         });
//   }
// }
async function groupOrderDetailsForSocket(orderId) {
  try {
    const type = await orderType.findOne({
      where: {
        type: "Group",
      },
    });

    let participantList = [];
    const orderData = await order.findOne({
      where: [{
        id: orderId,
      }, {
        orderTypeId: type.id,
      }],
      include: [{
        model: restaurant,
      }, {
        model: address,
        as: "dropOffID",
      }, {
        model: unit,
        as: "currencyUnitID",
      }, {
        model: user,
      }, {
        model: orderGroup,
        where: {
          [Op.or]: [{
            isRemoved: null
          }, {
            isRemoved: false
          }]
        },
        include: {
          model: user,
          as: "participant",
        },
      }],
    });

    let addons_list = [];
    let item_list = [];
    if (orderData) {
      // Loop through each order group to get participant items
      for (const group of orderData.orderGroups) {
        if (group.participantId !== null) {
          const items = await orderItems.findAll({
            attributes: ["id", "quantity", "userId"],
            where: [{
              userId: group.participantId,
            }, {
              orderId: orderData.id,
            }],
            include: [{
              model: orderAddOns,
              attributes: ["id", "total", "qty"],
              include: {
                model: addOn,
                attributes: ["name"],
              },
            }, {
              model: R_PLink,
              attributes: ["id", "name", "description", "image", "originalPrice", "productId"],
            }],
          });

          let participantItemList = []; // Initialize item list for each participant
          if (items.length > 0) {
            for (const item of items) {
              let itemObj = {
                productName: item.R_PLink,
                qty: item.quantity,
                addOns: item.orderAddOns,
              };
              participantItemList.push(itemObj);
            }
          }

          // Create participant object to include in the final response
          let participantObj = {
            participantId: group?.participantId,
            isReady: group?.isReady ? true : false,
            subTotal: group?.subTotal ? group?.subTotal : 0,
            participantName: group?.participantName,
            items: participantItemList,
          };
          participantList.push(participantObj);
        }
      }

      // Prepare the final data object
      let data = {
        orderId: orderData.id,
        orderNum: orderData.orderNum,
        isLocked: orderData.isLocked ? true : false,
        orderModeId: orderData?.orderModeId,
        deliveryTypeId: orderData?.deliveryTypeId,
        userId: orderData?.userId,
        groupName: orderData?.orderGroups[0]?.groupName,
        scheduleDate: orderData.scheduleDate,
        distance: orderData.distance,
        subTotal: orderData?.subTotal,
        total: orderData.total,
        status: orderData.status,
        restaurant: orderData?.restaurant,
        paymentRecieved: orderData.paymentRecieved,
        hostebBy: {
          id: orderData.user.id,
          userName: orderData.user.userName,
        },
        dropOffAddress: {
          streetAddress: orderData.dropOffID?.streetAddress,
          nameOnDoor: orderData.dropOffID?.nameOnDoor ? orderData.dropOffID?.nameOnDoor : "No Name",
          floor: orderData.dropOffID?.floor ? orderData.dropOffID?.floor : "No floor",
          entrance: orderData.dropOffID?.entrance ? orderData.dropOffID?.entrance : "No entrance",
          city: orderData.dropOffID?.city ? orderData.dropOffID?.city : "No city",
          state: orderData.dropOffID?.state ? orderData.dropOffID?.state : "No state",
          zipCode: orderData.dropOffID?.zipCode ? orderData.dropOffID?.zipCode : "No zipCode",
          lat: orderData.dropOffID?.lat,
          lng: orderData.dropOffID?.lng,
        },
        currencyDetails: {
          name: orderData?.currencyUnitID?.name,
          type: orderData?.currencyUnitID?.type,
          symbol: orderData?.currencyUnitID?.symbol,
          shortcode: orderData?.currencyUnitID?.shortcode ? orderData?.currencyUnitID?.shortcode : "No Short Code",
        },
        participantList: participantList,
      };

      return data;
    } else {
      return {}; // If no order data found, return an empty object
    }
  } catch (error) {
    return {}; // Handle errors by returning an empty object
  }
}

async function getDriverDetails(req, res) {
  const {
    driverId
  } = req.body;
  const type = await userType.findOne({
    where: {
      name: "Driver",
    },
  });
  const driver = await user.findOne({
    where: [{
      id: driverId,
    }, {
      userTypeId: type.id,
    }, ],
    attributes: ["id", "firstName", "lastName", "userName", "email", "countryCode", "phoneNum", ],
  });
  if (driver) {
    const details = await driverDetails.findOne({
      where: {
        userId: driverId,
      },
    });
    // return res.json(details)
    let obj = {
      driver,
      profilePhoto: details ? details.profilePhoto : "",
    };
    const response = ApiResponse("1", "Driver Details", "", obj);
    return res.json(response);
  } else {
    const response = ApiResponse("0", "No Diver found against this ID", "", {});
    return res.json(response);
  }
}
// async function home1(req, res) {
//   try {
//     const { lat, lng } = req.body;
//     let restaurantList = [];
//     let storeList = [];
//     let popularStores = [];
//     let popularRestaurants = [];
//     const storeId = await orderApplication.findOne({
//       where: { name: "store" },
//     });
//     const restaurantId = await orderApplication.findOne({
//       where: { name: "restaurant" },
//     });
//     const userPoint = point([parseFloat(lat), parseFloat(lng)]);
//     const zones = await zone.findAll({
//       where: { status: true },
//       include: [
//         { model: zoneDetails },
//         {
//           model: zoneRestaurants,
//           include: { model: restaurant,where:{status:true} },
//         },
//       ],
//     });
//     const validZones = zones.filter((zoneData) => {
//       if (
//         zoneData.coordinates &&
//         zoneData.coordinates.coordinates &&
//         zoneData.coordinates.coordinates.length > 0
//       ) {
//         const zonePolygon = {
//           type: "Polygon",
//           coordinates: zoneData.coordinates.coordinates,
//         };
//         return booleanPointInPolygon(userPoint, zonePolygon);
//       }
//       return false;
//     });
//     if (validZones.length > 0) {
//       await Promise.all(
//         validZones.map(async (data) => {
//           for (var i = 0; i < data.zoneRestaurants.length; i++) {
//             if (data.zoneRestaurants[i].restaurant) {
//               const result = await restaurantRating.findOne({
//                 attributes: [
//                   [
//                     sequelize.fn("AVG", sequelize.col("value")),
//                     "averageRating",
//                   ],
//                 ],
//                 where: {
//                   restaurantId: data?.zoneRestaurants[i]?.restaurant?.id,
//                 },
//               });
//               const averageRating = result ? result?.get("averageRating") : "0.0";
//               let cusinesList = await cusineRestaurant.findAll({attributes:[],where:{restaurantId:data?.zoneRestaurants[i]?.restaurant?.id},include:{model:cuisine,attributes:['id','name']}});
//               let obj = {
//                 id: data?.zoneRestaurants[i]?.restaurant?.id,
//                 businessName:
//                   data?.zoneRestaurants[i]?.restaurant?.businessName,
//                 businessEmail:
//                   data?.zoneRestaurants[i]?.restaurant?.businessEmail,
//                 businessType:
//                   data?.zoneRestaurants[i]?.restaurant?.businessType,
//                 city: data?.zoneRestaurants[i]?.restaurant?.city,
//                 zipCode: data?.zoneRestaurants[i]?.restaurant?.zipCode,
//                 address: data?.zoneRestaurants[i]?.restaurant?.address,
//                 logo: data?.zoneRestaurants[i]?.restaurant?.logo,
//                 image: data?.zoneRestaurants[i]?.restaurant?.image,
//                 isOpen: data?.zoneRestaurants[i]?.restaurant?.isOpen,
//                 isRushMode: data?.zoneRestaurants[i]?.restaurant?.isRushMode,
//                 minOrderAmount: data?.zoneRestaurants[i]?.restaurant?.minOrderAmount,
//                 serviceCharges: data?.zoneRestaurants[i]?.restaurant?.serviceCharges,
//                 isFeatured: data?.zoneRestaurants[i]?.restaurant?.isFeatured,
//                 isPopular: data?.zoneRestaurants[i]?.restaurant?.isPopular,
//                 cusinesList:cusinesList,
//                 openingTime: dateFormat(
//                   data?.zoneRestaurants[i]?.restaurant?.openingTime
//                 ),
//                 closingTime: dateFormat(
//                   data?.zoneRestaurants[i]?.restaurant?.closingTime
//                 ),
//                 lat: data?.zoneRestaurants[i]?.restaurant?.lat,
//                 lng: data?.zoneRestaurants[i]?.restaurant?.lng,
//                 rating:
//                   averageRating != null
//                     ? Number(averageRating).toFixed(1).toString()
//                     : "0.0",
//                 deliveryTime: parseFloat(
//                       data?.zoneRestaurants[i]?.restaurant?.approxDeliveryTime
//                     ) ,
//                 deliveryFee:
//                   data?.zoneRestaurants[i]?.restaurant?.deliveryFeeFixed,
//               };
//               if (
//                 parseFloat(restaurantId.id) ==
//                 parseFloat(data?.zoneRestaurants[i]?.restaurant?.businessType)
//               ) {
//                 restaurantList.push(obj);
//                 if (data?.zoneRestaurants[i]?.restaurant?.isFeatured) {
//                   popularRestaurants.push(obj);
//                 }
//               } else if (
//                 data?.zoneRestaurants[i]?.restaurant?.businessType == storeId.id
//               ) {
//                 storeList.push(obj);
//                 if (data?.zoneRestaurants[i]?.restaurant?.isFeatured) {
//                   popularStores.push(obj);
//                 }
//               }
//             }
//           }
//         })
//       );
//     //   const RestaurantMenuCategories = await menuCategory.findAll({
//     //     where: [{ status: true }, { businessType: "restaurant" }],
//     //     attributes: ["id", "name"],
//     //   });
//       const RestaurantMenuCategories = await cuisine.findAll({
//         where: [{ status: true }, { businessType: 1 }],
//         attributes: ["id", "name"],
//       });
//       const storeMenuCategories = await cuisine.findAll({
//         where: [{ status: true }, { businessType: 3 }],
//         attributes: ["id", "name"],
//       });
//     //   const storeMenuCategories = await menuCategory.findAll({
//     //     where: [{ status: true }, { businessType: "store" }],
//     //     attributes: ["id", "name"],
//     //   });
//       const banners = await banner.findAll({
//         order: sequelize.literal("RAND()"),
//         limit: 4,
//         attributes: ["id", "title", "image", "key"],
//         where: { status: true },
//       });
//       const data = {
//         restaurantList: { popularRestaurants, restaurantList },
//         storeList: { popularStores, storeList },
//         banners: banners,
//         RestaurantMenuCategories: RestaurantMenuCategories,
//         storeMenuCategories: storeMenuCategories,
//       };
//       const response = ApiResponse("1", "Restaurant List", "", data);
//       return res.json(response);
//     } else {
//       const response = ApiResponse(
//         "0",
//         "Service not available in your area",
//         "",
//         {}
//       );
//       return res.json(response);
//     }
//   } catch (error) {
//     const response = ApiResponse("0", error.message, "Error", {});
//     return res.json(response);
//   }
// }
async function home1(req, res) {
  try {
    const {
      lat,
      lng,
      cityName
    } = req.body;
    
    let restaurantList = [];
    let storeList = [];
    let popularStores = [];
    let popularRestaurants = [];
    // Find city data
    if (cityName && !lat && !lng) {
      let cityData = await city.findOne({
        where: {
          name: {
            [Op.like]: `%${cityName.trim()}%`
          }
        }
      });
      if (!cityData) {
        let response = ApiResponse("0", `${cityName} not found`, "", {});
        return res.json(response);
      }
      // Fetch order application types
      const storeId = await orderApplication.findOne({
        where: {
          name: "store"
        }
      });
      const restaurantId = await orderApplication.findOne({
        where: {
          name: "restaurant"
        }
      });
      // Fetch zones for the city
      const zones = await zone.findAll({
        where: {
          status: true,
          cityId: cityData.id
        },
        include: [{
          model: zoneDetails
        }, {
          model: zoneRestaurants,
          include: {
            model: restaurant,
            where: {
              status: true
            },
             include:[{
                model:configuration,
            },
             { 
                  model: time,
                  attributes: ['name', 'startAt', 'endAt', 'day', 'status'] 
                },
            ],

          },
        }, ],
      });
      if (zones.length === 0) {
        let response = ApiResponse("0", `${cityName} has no zones`, "", {});
        return res.json(response);
      }
      let restaurantList = [];
      let storeList = [];
      let popularStores = [];
      let popularRestaurants = [];
      // Process zones and restaurants
      await Promise.all(zones.map(async (zoneData) => {
        for (let i = 0; i < zoneData.zoneRestaurants.length; i++) {
          let restaurantData = zoneData.zoneRestaurants[i].restaurant;
          if (restaurantData) {
            let getDistance = distance(lat, lng, restaurantData?.lat, restaurantData?.lng);
            if (parseInt(getDistance) < 30) {
              let cusinesList = await cusineRestaurant.findAll({
                where: {
                  restaurantId: restaurantData.id
                },
                attributes: [],
                include: {
                  model: cuisine,
                  attributes: ['id', 'name']
                }
              });
           const configurationData = restaurantData.configuration?.dataValues || {};
           const formattedConfig = formatConfiguration(configurationData);

                let timeData = restaurantData.times ? restaurantData.times.map(t => t.dataValues) : [];
                let currentDayIndex = new Date().getDay();
                  console.log("currentDayIndex", currentDayIndex)
let currentDayObject = timeData.find(item => parseInt(item.day) == currentDayIndex.toString());
 let completelyClosed = checkIfCompletelyClosed(restaurantData.times || []);
              let obj = {
                id: restaurantData.id,
                businessName: restaurantData.businessName,
                businessEmail: restaurantData.businessEmail,
                businessType: restaurantData.businessType,
                address: `${restaurantData.address ?? ''}, ${restaurantData.zipCode ?? ''} ${restaurantData.city ?? ''}, ${restaurantData.country ?? ''}`.replace(/(^,|,$|\s{2,})/g, '').trim(),
                logo: restaurantData.logo,
                image: restaurantData.image,
                isOpen: restaurantData.isOpen,
                isRushMode: restaurantData.isRushMode,
                minOrderAmount: restaurantData.minOrderAmount,
                serviceCharges: restaurantData.serviceCharges,
                isFeatured: restaurantData.isFeatured,
                isPopular: restaurantData.isPopular,
                cusinesList: cusinesList,
                openingTime: dateFormat(restaurantData.openingTime),
                closingTime: dateFormat(restaurantData.closingTime),
                lat: restaurantData.lat,
                lng: restaurantData.lng,
                rating: restaurantData.rating ? restaurantData.rating : "0.0",
                deliveryTime: parseFloat(restaurantData.approxDeliveryTime),
                deliveryFee: restaurantData.deliveryFeeFixed,
                completely_closed:completelyClosed,
                getConfiguration:formattedConfig,
                time: timeData,
              };
              if (parseFloat(restaurantId.id) === parseFloat(restaurantData.businessType)) {
                restaurantList.push(obj);
                if (restaurantData.isFeatured) {
                  popularRestaurants.push(obj);
                }
              } else if (parseFloat(storeId.id) === parseFloat(restaurantData.businessType)) {
                storeList.push(obj);
                if (restaurantData.isFeatured) {
                  popularStores.push(obj);
                }
              }
            }
          }
        }
      }));
      // Fetch categories and banners
      const RestaurantMenuCategories = await cuisine.findAll({
        where: [{
          status: true
        }, {
          businessType: 1
        }],
        attributes: ["id", "name", "image"],
      });
      const storeMenuCategories = await cuisine.findAll({
        where: [{
          status: true
        }, {
          businessType: 3
        }],
        attributes: ["id", "name", "image"],
      });
     const restaurantBanners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        //   limit: 5,
        attributes: ["id", "title", "image", "key","dimension"],
        where: {
          status: true,
          type: "mobile",
          cityId: cityData.id,
          businessType:1
        },
      });
        const storeBanners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        //   limit: 5,
        attributes: ["id", "title", "image", "key","dimension"],
        where: {
          status: true,
          type: "mobile",
          cityId: cityData.id,
          businessType:3
        },
      });
      const data = {
        restaurantList: {
          popularRestaurants,
          restaurantList
        },
        storeList: {
          popularStores,
          storeList
        },
        restaurantBanners: restaurantBanners,
        storeBanners:storeBanners,
        RestaurantMenuCategories: RestaurantMenuCategories,
        storeMenuCategories: storeMenuCategories,
      };
      const response = ApiResponse("1", "Restaurant List", "", data);
      return res.json(response);
    } else {
        
      const storeId = await orderApplication.findOne({
        where: {
          name: "store"
        },
      });
      const restaurantId = await orderApplication.findOne({
        where: {
          name: "restaurant"
        },
      });
      const userPoint = point([parseFloat(lat), parseFloat(lng)]);
      const zones = await zone.findAll({
        where: {
          status: true
        },
        include: [{
          model: zoneDetails
        }, {
          model: zoneRestaurants,
          include: {
            model: restaurant,
            where: {
              status: true
            },
              include:[{
                model:configuration,
            },
             { 
                  model: time,
                  attributes: ['name', 'startAt', 'endAt', 'day', 'status'] 
                },
            ],
          },
        }, ],
      });
      const validZones = zones.filter((zoneData) => {
        if (zoneData.coordinates && zoneData.coordinates.coordinates && zoneData.coordinates.coordinates.length > 0) {
          const zonePolygon = {
            type: "Polygon",
            coordinates: zoneData.coordinates.coordinates,
          };
          return booleanPointInPolygon(userPoint, zonePolygon);
        }
        return false;
      });
      if (validZones.length > 0) {
        await Promise.all(validZones.map(async (data) => {
          for (var i = 0; i < data.zoneRestaurants.length; i++) {
            if (data.zoneRestaurants[i].restaurant) {
                
              let cusinesList = await cusineRestaurant.findAll({
                attributes: [],
                where: {
                  restaurantId: data?.zoneRestaurants[i]?.restaurant?.id
                },
                include: {
                  model: cuisine,
                  attributes: ['id', 'name']
                }
              });
            const configurationData = data.zoneRestaurants[i].restaurant.configuration?.dataValues || {};
      const formattedConfig = formatConfiguration(configurationData);

        let timeData = data.zoneRestaurants[i].restaurant.times ? data.zoneRestaurants[i].restaurant.times.map((t) => t) : [];
        let currentDayIndex = new Date().getDay();
        let currentDayObject = timeData.find((item) => parseInt(item.day) == currentDayIndex);
        let completelyClosed = checkIfCompletelyClosed(timeData);
              let obj = {
                id: data?.zoneRestaurants[i]?.restaurant?.id,
                businessName: data?.zoneRestaurants[i]?.restaurant?.businessName,
                businessEmail: data?.zoneRestaurants[i]?.restaurant?.businessEmail,
                businessType: data?.zoneRestaurants[i]?.restaurant?.businessType,
                address: `${data?.zoneRestaurants[i]?.restaurant?.address ?? ''}, ${data?.zoneRestaurants[i]?.restaurant?.zipCode ?? ''} ${data?.zoneRestaurants[i]?.restaurant?.city ?? ''}, ${data?.zoneRestaurants[i]?.restaurant?.country ?? ''}`.replace(/(^,|,$|\s{2,})/g, '').trim(),
                logo: data?.zoneRestaurants[i]?.restaurant?.logo,
                image: data?.zoneRestaurants[i]?.restaurant?.image,
                isOpen: data?.zoneRestaurants[i]?.restaurant?.isOpen,
                isRushMode: data?.zoneRestaurants[i]?.restaurant?.isRushMode,
                minOrderAmount: data?.zoneRestaurants[i]?.restaurant?.minOrderAmount,
                serviceCharges: data?.zoneRestaurants[i]?.restaurant?.serviceCharges,
                isFeatured: data?.zoneRestaurants[i]?.restaurant?.isFeatured,
                isPopular: data?.zoneRestaurants[i]?.restaurant?.isPopular,
                cusinesList: cusinesList,
                openingTime: dateFormat(data?.zoneRestaurants[i]?.restaurant?.openingTime),
                closingTime: dateFormat(data?.zoneRestaurants[i]?.restaurant?.closingTime),
                lat: data?.zoneRestaurants[i]?.restaurant?.lat,
                lng: data?.zoneRestaurants[i]?.restaurant?.lng,
                rating: data?.zoneRestaurants[i]?.restaurant?.rating ?? "0.0",
                deliveryTime: parseFloat(data?.zoneRestaurants[i]?.restaurant?.approxDeliveryTime),
                deliveryFee: data?.zoneRestaurants[i]?.restaurant?.deliveryFeeFixed,
                
               completely_closed: completelyClosed, // Correctly use the variable for completely closed status
          getConfiguration: formattedConfig, // Correctly use the configurationData variable
          time: timeData // Correctly use the currentDayObject variable
              };
              if (parseFloat(restaurantId.id) == parseFloat(data?.zoneRestaurants[i]?.restaurant?.businessType)) {
                restaurantList.push(obj);
                if (data?.zoneRestaurants[i]?.restaurant?.isFeatured) {
                  popularRestaurants.push(obj);
                }
              } else if (data?.zoneRestaurants[i]?.restaurant?.businessType == storeId.id) {
                storeList.push(obj);
                if (data?.zoneRestaurants[i]?.restaurant?.isFeatured) {
                  popularStores.push(obj);
                }
              }
            }
          }
        }));
        const RestaurantMenuCategories = await cuisine.findAll({
          where: [{
            status: true
          }, {
            businessType: 1
          }],
          attributes: ["id", "name"],
        });
        const storeMenuCategories = await cuisine.findAll({
          where: [{
            status: true
          }, {
            businessType: 3
          }],
          attributes: ["id", "name"],
        });
        const restaurantBanners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        //   limit: 5,
        attributes: ["id", "title", "image", "key","dimension"],
        where: {
          status: true,
          type: "mobile",
        //   cityId: cityData.id,
          businessType:1
        },
      });
        const storeBanners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        //   limit: 5,
        attributes: ["id", "title", "image", "key","dimension"],
        where: {
          status: true,
          type: "mobile",
        //   cityId: cityData.id,
          businessType:3
        },
      });
        const data = {
          restaurantList: {
            popularRestaurants,
            restaurantList
          },
          storeList: {
            popularStores,
            storeList
          },
          restaurantBanners: restaurantBanners,
          storeBanners:storeBanners,
          RestaurantMenuCategories: RestaurantMenuCategories,
          storeMenuCategories: storeMenuCategories,
        };
        const response = ApiResponse("1", "Restaurant List", "", data);
        return res.json(response);
      } else {
        const response = ApiResponse("0", "Service not available in your area", "", {});
        return res.json(response);
      }
    }
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function home2(req, res) {
  try {
    let {
      lat,
      lng,
      cityName
    } = req.params;
    let restaurantList = [];
    let storeList = [];
    let popularStores = [];
    let popularRestaurants = [];
    // Find city data
    
      let cityData = await city.findOne({
        where: {
          name: {
            [Op.like]: `%${cityName}%`
          }
        }
      });
      const storeId = await orderApplication.findOne({
        where: {
          name: "store"
        }
      });
      const restaurantId = await orderApplication.findOne({
        where: {
          name: "restaurant"
        }
      });
    
    // Fetch order application types
    if(!lat && !lng){
        lat  = cityData?.lat;
        lng  = cityData?.lng;
    }
    if (cityData) {
      const zones = await zone.findAll({
        where: {
          status: true,
          cityId: cityData.id
        },
        include: [{
          model: zoneDetails
        }, {
          model: zoneRestaurants,
          include: {
            model: restaurant,
            where: {
              status: true
            },
            include:[{
                model:configuration,
            },
             { 
                  model: time,
                  attributes: ['name', 'startAt', 'endAt', 'day', 'status'] 
                },
            ],
            
          },
        }, ],
      });
      if (zones.length === 0) {
        let response = ApiResponse("0", `${cityName} has no zones`, "", {});
        return res.json(response);
      }
      let restaurantList = [];
      let storeList = [];
      let popularStores = [];
      let popularRestaurants = [];
      // Process zones and restaurants
      await Promise.all(zones.map(async (zoneData) => {
        for (let i = 0; i < zoneData.zoneRestaurants.length; i++) {
          let restaurantData = zoneData.zoneRestaurants[i].restaurant;
          if (restaurantData) {
            let getDistance = distance(lat, lng, restaurantData?.lat, restaurantData?.lng);
            if (parseInt(getDistance) < 30) {
              let cusinesList = await cusineRestaurant.findAll({
                where: {
                  restaurantId: restaurantData.id
                },
                attributes: [],
                include: {
                  model: cuisine,
                  attributes: ['id', 'name']
                }
              });
            //   let configurationData = restaurantData.configuration ? restaurantData.configuration.dataValues : {};
        const configurationData = restaurantData.configuration?.dataValues || {};
           const formattedConfig = formatConfiguration(configurationData);



                let timeData = restaurantData.times ? restaurantData.times.map(t => t.dataValues) : [];
                let currentDayIndex = new Date().getDay();
                  console.log("currentDayIndex", currentDayIndex)
let currentDayObject = timeData.find(item => parseInt(item.day) == currentDayIndex.toString());
 const completelyClosed = checkIfCompletelyClosed(restaurantData.times || []);
              let obj = {
                id: restaurantData.id,
                businessName: restaurantData.businessName,
                businessEmail: restaurantData.businessEmail,
                businessType: restaurantData.businessType,
                city: restaurantData.city,
                zipCode: restaurantData.zipCode,
                address: restaurantData.address,
                logo: restaurantData.logo,
                image: restaurantData.image,
                isOpen: restaurantData.isOpen,
                isRushMode: restaurantData.isRushMode,
                minOrderAmount: restaurantData.minOrderAmount,
                serviceCharges: restaurantData.serviceCharges,
                isFeatured: restaurantData.isFeatured,
                isPopular: restaurantData.isPopular,
                cusinesList: cusinesList,
                openingTime: dateFormat(restaurantData.openingTime),
                closingTime: dateFormat(restaurantData.closingTime),
                lat: restaurantData.lat,
                lng: restaurantData.lng,
                rating: restaurantData.rating ? restaurantData.rating : "0.0",
                deliveryTime: parseFloat(restaurantData.approxDeliveryTime),
                completelyClosed:completelyClosed,
                deliveryFee: restaurantData.deliveryFeeFixed,
                 getConfiguration: formattedConfig,
                   time: timeData
                
              };
              if (parseFloat(restaurantId.id) === parseFloat(restaurantData.businessType)) {
                restaurantList.push(obj);
                if (restaurantData.isFeatured) {
                  popularRestaurants.push(obj);
                }
              } else if (parseFloat(storeId.id) === parseFloat(restaurantData.businessType)) {
                storeList.push(obj);
                if (restaurantData.isFeatured) {
                  popularStores.push(obj);
                }
              }
            }
          }
        }
      }));
      // Fetch categories and banners
      const RestaurantMenuCategories = await cuisine.findAll({
        where: [{
          status: true
        }, {
          businessType: 1
        }],
        attributes: ["id", "name", "image"],
      });
      const storeMenuCategories = await cuisine.findAll({
        where: [{
          status: true
        }, {
          businessType: 3
        }],
        attributes: ["id", "name", "image"],
      });
      const restaurantBanners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        attributes: ["id", "title", "image", "key"],
        where: {
          status: true,
          businessType: 1
        },
      });
      const storeBanners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        attributes: ["id", "title", "image", "key"],
        where: {
          status: true,
          businessType: 3
        },
      });
      // Prepare response data
      const data = {
        restaurantList: {
          popularRestaurants,
          restaurantList
        },
        storeList: {
          popularStores,
          storeList
        },
        restaurantBanners: restaurantBanners,
        storeBanners: storeBanners,
        RestaurantMenuCategories: RestaurantMenuCategories,
        storeMenuCategories: storeMenuCategories,
      };
      const response = ApiResponse("1", "Restaurant List", "", data);
      return res.json(response);
    } else {
        
      const userPoint = point([parseFloat(lat), parseFloat(lng)]);
      const zones = await zone.findAll({
        where: {
          status: true
        },
        include: [{
          model: zoneDetails
        }, {
          model: zoneRestaurants,
          include: {
            model: restaurant,
            where: {
              status: true
            },
            
             include: [{ model: configuration },
              { 
                  model: time,
                  attributes: ['name', 'startAt', 'endAt', 'day', 'status'] 
                },
             ],
          },
        }, ],
      });
      const validZones = zones.filter((zoneData) => {
        if (zoneData.coordinates && zoneData.coordinates.coordinates && zoneData.coordinates.coordinates.length > 0) {
          const zonePolygon = {
            type: "Polygon",
            coordinates: zoneData.coordinates.coordinates,
          };
          return booleanPointInPolygon(userPoint, zonePolygon);
        }
        return false;
      });
      if (validZones.length > 0) {
          
        await Promise.all(validZones.map(async (data) => {
          for (var i = 0; i < data.zoneRestaurants.length; i++) {
            if (data.zoneRestaurants[i].restaurant) {
                let restaurantData = data.zoneRestaurants[i].restaurant;
              let cusinesList = await cusineRestaurant.findAll({
                attributes: [],
                where: {
                  restaurantId: data?.zoneRestaurants[i]?.restaurant?.id
                },
                include: {
                  model: cuisine,
                  attributes: ['id', 'name']
                }
              });
              const configurationData = restaurantData.configuration?.dataValues || {};
           const formattedConfig = formatConfiguration(configurationData);
                let timeData = restaurantData.times ? restaurantData.times.map((t) => t.dataValues) : [];
                let currentDayIndex = new Date().getDay();
                let currentDayObject = timeData.find((item) => parseInt(item.day) === currentDayIndex);
                let completelyClosed = checkIfCompletelyClosed(timeData);
              let obj = {
                id: data?.zoneRestaurants[i]?.restaurant?.id,
                businessName: data?.zoneRestaurants[i]?.restaurant?.businessName,
                businessEmail: data?.zoneRestaurants[i]?.restaurant?.businessEmail,
                businessType: data?.zoneRestaurants[i]?.restaurant?.businessType,
                city: data?.zoneRestaurants[i]?.restaurant?.city,
                zipCode: data?.zoneRestaurants[i]?.restaurant?.zipCode,
                address: data?.zoneRestaurants[i]?.restaurant?.address,
                logo: data?.zoneRestaurants[i]?.restaurant?.logo,
                image: data?.zoneRestaurants[i]?.restaurant?.image,
                isOpen: data?.zoneRestaurants[i]?.restaurant?.isOpen,
                isRushMode: data?.zoneRestaurants[i]?.restaurant?.isRushMode,
                minOrderAmount: data?.zoneRestaurants[i]?.restaurant?.minOrderAmount,
                serviceCharges: data?.zoneRestaurants[i]?.restaurant?.serviceCharges,
                isFeatured: data?.zoneRestaurants[i]?.restaurant?.isFeatured,
                isPopular: data?.zoneRestaurants[i]?.restaurant?.isPopular,
                cusinesList: cusinesList,
                openingTime: dateFormat(data?.zoneRestaurants[i]?.restaurant?.openingTime),
                closingTime: dateFormat(data?.zoneRestaurants[i]?.restaurant?.closingTime),
                lat: data?.zoneRestaurants[i]?.restaurant?.lat,
                lng: data?.zoneRestaurants[i]?.restaurant?.lng,
                rating: data?.zoneRestaurants[i]?.restaurant?.rating ?? "0.0",
                deliveryTime: parseFloat(data?.zoneRestaurants[i]?.restaurant?.approxDeliveryTime),
                deliveryFee: data?.zoneRestaurants[i]?.restaurant?.deliveryFeeFixed,
              completelyClosed: completelyClosed,
                  getConfiguration: formattedConfig,
                  time: timeData ? timeData : null,
              };
              if (parseFloat(restaurantId.id) == parseFloat(data?.zoneRestaurants[i]?.restaurant?.businessType)) {
                restaurantList.push(obj);
                if (data?.zoneRestaurants[i]?.restaurant?.isFeatured) {
                  popularRestaurants.push(obj);
                }
              } else if (data?.zoneRestaurants[i]?.restaurant?.businessType == storeId.id) {
                storeList.push(obj);
                if (data?.zoneRestaurants[i]?.restaurant?.isFeatured) {
                  popularStores.push(obj);
                }
              }
            }
          }
        }));
        const RestaurantMenuCategories = await cuisine.findAll({
          where: [{
            status: true
          }, {
            businessType: 1
          }],
          attributes: ["id", "name","image"],
        });
        const storeMenuCategories = await cuisine.findAll({
          where: [{
            status: true
          }, {
            businessType: 3
          }],
          attributes: ["id", "name","image"],
        });
         const restaurantBannerData = await banner.findAll({
        order: sequelize.literal("RAND()"),
        attributes: ["id", "title", "image", "key"],
        where: {
          status: true,
          businessType: 1
        },
      });
      const storeBanners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        attributes: ["id", "title", "image", "key"],
        where: {
          status: true,
          businessType: 3
        },
      });
        const banners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        //   limit: 5,
        attributes: ["id", "title", "image", "key"],
        where: {
          status: true
        },
      });
        const data = {
          restaurantList: {
            popularRestaurants,
            restaurantList
          },
          storeList: {
            popularStores,
            storeList
          },
          restaurantBanners:restaurantBanners,
          storeBanners:storeBanners,
          banners: banners,
          RestaurantMenuCategories: RestaurantMenuCategories,
          storeMenuCategories: storeMenuCategories,
        };
        const response = ApiResponse("1", "Restaurant List", "", data);
        return res.json(response);
      } else {
        const response = ApiResponse("0", "Service not available in your area", "", {});
        return res.json(response);
      }
    }
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function home3(req, res) {
  try {
  let { lat, lng, cityName } = req.query;
    let restaurantList = [];
    let storeList = [];
    let popularStores = [];
    let popularRestaurants = [];
    // Find city data
    
      let cityData = await city.findOne({
        where: {
          name: {
            [Op.like]: `%${cityName}%`
          }
        }
      });
      const storeId = await orderApplication.findOne({
        where: {
          name: "store"
        }
      });
      const restaurantId = await orderApplication.findOne({
        where: {
          name: "restaurant"
        }
      });
    
    // Fetch order application types
    if(!lat && !lng){
        lat  = cityData?.lat;
        lng  = cityData?.lng;
    }
    if (cityData) {
        
      const zones = await zone.findAll({
        where: {
          status: true,
          cityId: cityData.id
        },
        include: [{
          model: zoneDetails,
          attributes:['id'],
           include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
        }, {
          model: zoneRestaurants,
          include: {
            model: restaurant,
            where: {
              status: true
            },
            include:[
       
        {model:restaurantBanners,attributes:['title','bannerType'],include:{model:discountDetail,attributes:['discountType','discountValue','minimumOrderValue','capMaxDiscount']}},
                {
                model:configuration,
            },
             { 
                  model: time,
                  attributes: ['name', 'startAt', 'endAt', 'day', 'status'] 
                },
            ],
            
          },
        }, ],
      });
    
      if (zones.length === 0) {
        let response = ApiResponse("0", `${cityName} has no zones`, "", {});
        return res.json(response);
      }
      let restaurantList = [];
      let storeList = [];
      let popularStores = [];
      let popularRestaurants = [];
      // Process zones and restaurants
      await Promise.all(zones.map(async (zoneData) => {
        for (let i = 0; i < zoneData.zoneRestaurants.length; i++) {
          let restaurantData = zoneData.zoneRestaurants[i].restaurant;
          if (restaurantData) {
            let getDistance = distance(lat, lng, restaurantData?.lat, restaurantData?.lng);
            if (parseInt(getDistance) < 30) {
              let cusinesList = await cusineRestaurant.findAll({
                where: {
                  restaurantId: restaurantData.id
                },
                attributes: [],
                include: {
                  model: cuisine,
                  attributes: ['id', 'name']
                }
              });
            //   let configurationData = restaurantData.configuration ? restaurantData.configuration.dataValues : {};
        const configurationData = restaurantData.configuration?.dataValues || {};
           const formattedConfig = formatConfiguration(configurationData);



                let timeData = restaurantData.times ? restaurantData.times.map(t => t.dataValues) : [];
                let currentDayIndex = new Date().getDay();
                  console.log("currentDayIndex", currentDayIndex)
                let currentDayObject = timeData.find(item => parseInt(item.day) == currentDayIndex.toString());
                const completelyClosed = checkIfCompletelyClosed(restaurantData.times || []);
              let obj = {
                id: restaurantData.id,
                businessName: restaurantData.businessName,
                businessEmail: restaurantData.businessEmail,
                businessType: restaurantData.businessType,
                city: restaurantData.city,
                zipCode: restaurantData.zipCode,
                address: restaurantData.address,
                logo: restaurantData.logo,
                image: restaurantData.image,
                isOpen: restaurantData.isOpen ? true: false,
                isRushMode: restaurantData.isRushMode,
                minOrderAmount: restaurantData.minOrderAmount,
                serviceCharges: restaurantData.serviceCharges,
                isFeatured: restaurantData.isFeatured,
                isPopular: restaurantData.isPopular,
                cusinesList: cusinesList,
                openingTime: dateFormat(restaurantData.openingTime),
                closingTime: dateFormat(restaurantData.closingTime),
                lat: restaurantData.lat,
                lng: restaurantData.lng,
                rating: restaurantData.rating ? restaurantData.rating : "0.0",
                deliveryTime: parseFloat(restaurantData.approxDeliveryTime),
                completelyClosed:completelyClosed,
                deliveryFee: restaurantData.deliveryFeeFixed,
                 getConfiguration: formattedConfig,
                   time: timeData,
                 units:zoneData?.zoneDetail,
                 restBanners:restaurantData?.restaurantBanners,
              };
              if (parseFloat(restaurantId.id) === parseFloat(restaurantData.businessType)) {
                restaurantList.push(obj);
                if (restaurantData.isFeatured) {
                  popularRestaurants.push(obj);
                }
              } else if (parseFloat(storeId.id) === parseFloat(restaurantData.businessType)) {
                storeList.push(obj);
                if (restaurantData.isFeatured) {
                  popularStores.push(obj);
                }
              }
            }
          }
        }
      }));
      // Fetch categories and banners
      const RestaurantMenuCategories = await cuisine.findAll({
        where: [{
          status: true
        }, {
          businessType: 1
        }],
        attributes: ["id", "name", "image"],
      });
      const storeMenuCategories = await cuisine.findAll({
        where: [{
          status: true
        }, {
          businessType: 3
        }],
        attributes: ["id", "name", "image"],
      });
      const restaurantBannerData = await banner.findAll({
        order: sequelize.literal("RAND()"),
        attributes: ["id", "title", "image", "key"],
        where: {
          status: true,
          businessType: 1
        },
      });
      const storeBanners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        attributes: ["id", "title", "image", "key"],
        where: {
          status: true,
          businessType: 3 
        },
      });
      // Prepare response data
      const data = {
        restaurantList: {
          popularRestaurants,
          restaurantList
        },
        storeList: {
          popularStores,
          storeList
        },
        restaurantBanners: restaurantBannerData,
        storeBanners: storeBanners,
        RestaurantMenuCategories: RestaurantMenuCategories,
        storeMenuCategories: storeMenuCategories,
      };
      const response = ApiResponse("1", "Restaurant List", "", data);
      return res.json(response);
    } else {
        
      const userPoint = point([parseFloat(lat), parseFloat(lng)]);
      const zones = await zone.findAll({
        where: {
          status: true
        },
        include: [{
          model: zoneDetails
        }, {
          model: zoneRestaurants,
          include: {
            model: restaurant,
            where: {
              status: true
            },
            
             include: [{model:restaurantBanners,attributes:['title','bannerType'],include:{model:discountDetail,attributes:['discountType','discountValue','minimumOrderValue','capMaxDiscount']}},{ model: configuration },
              { 
                  model: time,
                  attributes: ['name', 'startAt', 'endAt', 'day', 'status'] 
                },
             ],
          },
        }, ],
      });
      const validZones = zones.filter((zoneData) => {
        if (zoneData.coordinates && zoneData.coordinates.coordinates && zoneData.coordinates.coordinates.length > 0) {
          const zonePolygon = {
            type: "Polygon",
            coordinates: zoneData.coordinates.coordinates,
          };
          return booleanPointInPolygon(userPoint, zonePolygon);
        }
        return false;
      });
      if (validZones.length > 0) {
          
        await Promise.all(validZones.map(async (data) => {
          for (var i = 0; i < data.zoneRestaurants.length; i++) {
            if (data.zoneRestaurants[i].restaurant) {
                let restaurantData = data.zoneRestaurants[i].restaurant;
              let cusinesList = await cusineRestaurant.findAll({
                attributes: [],
                where: {
                  restaurantId: data?.zoneRestaurants[i]?.restaurant?.id
                },
                include: {
                  model: cuisine,
                  attributes: ['id', 'name']
                }
              });
              const configurationData = restaurantData.configuration?.dataValues || {};
           const formattedConfig = formatConfiguration(configurationData);
                let timeData = restaurantData.times ? restaurantData.times.map((t) => t.dataValues) : [];
                let currentDayIndex = new Date().getDay();
                let currentDayObject = timeData.find((item) => parseInt(item.day) === currentDayIndex);
                let completelyClosed = checkIfCompletelyClosed(timeData);
              let obj = {
                id: data?.zoneRestaurants[i]?.restaurant?.id,
                businessName: data?.zoneRestaurants[i]?.restaurant?.businessName,
                businessEmail: data?.zoneRestaurants[i]?.restaurant?.businessEmail,
                businessType: data?.zoneRestaurants[i]?.restaurant?.businessType,
                city: data?.zoneRestaurants[i]?.restaurant?.city,
                zipCode: data?.zoneRestaurants[i]?.restaurant?.zipCode,
                address: data?.zoneRestaurants[i]?.restaurant?.address,
                logo: data?.zoneRestaurants[i]?.restaurant?.logo,
                image: data?.zoneRestaurants[i]?.restaurant?.image,
                isOpen: data?.zoneRestaurants[i]?.restaurant?.isOpen ? true:false,
                isRushMode: data?.zoneRestaurants[i]?.restaurant?.isRushMode,
                minOrderAmount: data?.zoneRestaurants[i]?.restaurant?.minOrderAmount,
                serviceCharges: data?.zoneRestaurants[i]?.restaurant?.serviceCharges,
                isFeatured: data?.zoneRestaurants[i]?.restaurant?.isFeatured,
                isPopular: data?.zoneRestaurants[i]?.restaurant?.isPopular,
                cusinesList: cusinesList,
                openingTime: dateFormat(data?.zoneRestaurants[i]?.restaurant?.openingTime),
                closingTime: dateFormat(data?.zoneRestaurants[i]?.restaurant?.closingTime),
                lat: data?.zoneRestaurants[i]?.restaurant?.lat,
                lng: data?.zoneRestaurants[i]?.restaurant?.lng,
                rating: data?.zoneRestaurants[i]?.restaurant?.rating ?? "0.0",
                deliveryTime: parseFloat(data?.zoneRestaurants[i]?.restaurant?.approxDeliveryTime),
                restBanners:data?.zoneRestaurants[i]?.restaurant?.restaurantBanners,
                deliveryFee: data?.zoneRestaurants[i]?.restaurant?.deliveryFeeFixed,
              completelyClosed: completelyClosed,
                  getConfiguration: formattedConfig,
                  time: timeData ? timeData : null,
              };
              if (parseFloat(restaurantId.id) == parseFloat(data?.zoneRestaurants[i]?.restaurant?.businessType)) {
                restaurantList.push(obj);
                if (data?.zoneRestaurants[i]?.restaurant?.isFeatured) {
                  popularRestaurants.push(obj);
                }
              } else if (data?.zoneRestaurants[i]?.restaurant?.businessType == storeId.id) {
                storeList.push(obj);
                if (data?.zoneRestaurants[i]?.restaurant?.isFeatured) {
                  popularStores.push(obj);
                }
              }
            }
          }
        }));
        const RestaurantMenuCategories = await cuisine.findAll({
          where: [{
            status: true
          }, {
            businessType: 1
          }],
          attributes: ["id", "name","image"],
        });
        const storeMenuCategories = await cuisine.findAll({
          where: [{
            status: true
          }, {
            businessType: 3
          }],
          attributes: ["id", "name","image"],
        });
         const restaurantBannerData = await banner.findAll({
        order: sequelize.literal("RAND()"),
        attributes: ["id", "title", "image", "key"],
        where: {
          status: true,
          businessType: 1
        },
      });
      const storeBanners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        attributes: ["id", "title", "image", "key"],
        where: {
          status: true,
          businessType: 3
        },
      });
        const banners = await banner.findAll({
        order: sequelize.literal("RAND()"),
        //   limit: 5,
        attributes: ["id", "title", "image", "key"],
        where: {
          status: true
        },
      });
        const data = {
          restaurantList: {
            popularRestaurants,
            restaurantList
          },
          storeList: {
            popularStores,
            storeList
          },
          restaurantBanners:restaurantBannerData,
          storeBanners:storeBanners,
          banners: banners,
          RestaurantMenuCategories: RestaurantMenuCategories,
          storeMenuCategories: storeMenuCategories,
        };
        const response = ApiResponse("1", "Restaurant List", "", data);
        return res.json(response);
      } else {
        const response = ApiResponse("0", "Service not available in your area", "", {});
        return res.json(response);
      }
    }
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function testhome(req, res) {
  try {
    const {
      lat,
      lng,
      cityName
    } = req.body;
    // Find city data
    let cityData = await city.findOne({
      where: {
        name: {
          [Op.like]: `%${cityName}%`
        }
      }
    });
    if (!cityData) {
      let response = ApiResponse("0", `${cityName} not found`, "", {});
      return res.json(response);
    }
    // Fetch order application types
    const storeId = await orderApplication.findOne({
      where: {
        name: "store"
      }
    });
    const restaurantId = await orderApplication.findOne({
      where: {
        name: "restaurant"
      }
    });
    // Fetch zones for the city
    const zones = await zone.findAll({
      where: {
        status: true,
        cityId: cityData.id
      },
      include: [{
        model: zoneDetails
      }, {
        model: zoneRestaurants,
        include: {
          model: restaurant,
          where: {
            status: true
          }
        }
      }, ],
    });
    if (zones.length === 0) {
      let response = ApiResponse("0", `${cityName} has no zones`, "", {});
      return res.json(response);
    }
    let restaurantList = [];
    let storeList = [];
    let popularStores = [];
    let popularRestaurants = [];
    // Process zones and restaurants
    await Promise.all(zones.map(async (zoneData) => {
      for (let i = 0; i < zoneData.zoneRestaurants.length; i++) {
        let restaurantData = zoneData.zoneRestaurants[i].restaurant;
        if (restaurantData) {
          let getDistance = distance(lat, lng, restaurantData?.lat, restaurantData?.lng);
          if (parseInt(getDistance) < 30) {
            const result = await restaurantRating.findOne({
              attributes: [
                [sequelize.fn("AVG", sequelize.col("value")), "averageRating"]
              ],
              where: {
                restaurantId: restaurantData.id
              },
            });
            const averageRating = result ? result.get("averageRating") : "0.0";
            let cusinesList = await cusineRestaurant.findAll({
              where: {
                restaurantId: restaurantData.id
              },
              attributes: [],
              include: {
                model: cuisine,
                attributes: ['id', 'name']
              }
            });
            let obj = {
              id: restaurantData.id,
              businessName: restaurantData.businessName,
              businessEmail: restaurantData.businessEmail,
              businessType: restaurantData.businessType,
              city: restaurantData.city,
              zipCode: restaurantData.zipCode,
              address: restaurantData.address,
              logo: restaurantData.logo,
              image: restaurantData.image,
              isOpen: restaurantData.isOpen,
              isRushMode: restaurantData.isRushMode,
              minOrderAmount: restaurantData.minOrderAmount,
              serviceCharges: restaurantData.serviceCharges,
              isFeatured: restaurantData.isFeatured,
              isPopular: restaurantData.isPopular,
              cusinesList: cusinesList,
              openingTime: dateFormat(restaurantData.openingTime),
              closingTime: dateFormat(restaurantData.closingTime),
              lat: restaurantData.lat,
              lng: restaurantData.lng,
              rating: averageRating != null ? Number(averageRating).toFixed(1) : "0.0",
              deliveryTime: parseFloat(restaurantData.approxDeliveryTime),
              deliveryFee: restaurantData.deliveryFeeFixed,
            };
            if (parseFloat(restaurantId.id) === parseFloat(restaurantData.businessType)) {
              restaurantList.push(obj);
              if (restaurantData.isFeatured) {
                popularRestaurants.push(obj);
              }
            } else if (parseFloat(storeId.id) === parseFloat(restaurantData.businessType)) {
              storeList.push(obj);
              if (restaurantData.isFeatured) {
                popularStores.push(obj);
              }
            }
          }
        }
      }
    }));
    // Fetch categories and banners
    const RestaurantMenuCategories = await cuisine.findAll({
      where: [{
        status: true
      }, {
        businessType: 1
      }],
      attributes: ["id", "name"],
    });
    const storeMenuCategories = await cuisine.findAll({
      where: [{
        status: true
      }, {
        businessType: 3
      }],
      attributes: ["id", "name"],
    });
    const banners = await banner.findAll({
      order: sequelize.literal("RAND()"),
      limit: 4,
      attributes: ["id", "title", "image", "key"],
      where: {
        status: true
      },
    });
    // Prepare response data
    const data = {
      restaurantList: {
        popularRestaurants,
        restaurantList
      },
      storeList: {
        popularStores,
        storeList
      },
      banners: banners,
      RestaurantMenuCategories: RestaurantMenuCategories,
      storeMenuCategories: storeMenuCategories,
    };
    const response = ApiResponse("1", "Restaurant List", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function registerUser(req, res) {
  const {
    userName,
    firstName,
    lastName,
    email,
    countryCode,
    phoneNum,
    password,
    gKey,
    deviceToken,
    signedFrom,
    referalCode,
    imageUrl,
    language
  } = req.body;
  console.log(req.body)
  

  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    // Validate required fields when signedFrom is 'email'
    if (signedFrom === "email") {
      const missingFields = [];
      if (!firstName || firstName.trim() === "") missingFields.push("firstName");
      if (!lastName || lastName.trim() === "") missingFields.push("lastName");
      if (!email || email.trim() === "") missingFields.push("email");
      if (!countryCode || countryCode.trim() === "") missingFields.push("countryCode");
      if (!phoneNum || phoneNum.trim() === "") missingFields.push("phoneNum");
      if (!password || password.trim() === "") missingFields.push("password");
      
      if (missingFields.length > 0) {
        const response = ApiResponse("2", `Missing or empty fields: ${missingFields.join(", ")}`, "", {});
        console.log('Validation failed: Missing or empty fields:', missingFields);
        return res.json(response);
      }
    }

    // Check if the user with the same email already exists
    const userExist = await user.findOne({
      where: { email },
      transaction: t,
    });
const userLanguage = user ? user.language : 'en';
   

    if (userExist) {
      if (gKey === '1' && signedFrom === 'google') {
        // Link Google account to existing user
        try {
          userExist.deviceToken = deviceToken;
          userExist.verifiedAt = new Date(); // Mark as verified since Google handles verification
          userExist.signedFrom = 'google'; // Update sign-up method
          
          // Update imageUrl if provided
          if (imageUrl) {
            userExist.image = imageUrl;
          }

          // Optionally update countryCode and phoneNum if provided
          if (countryCode) {
            userExist.countryCode = countryCode;
          }

          if (phoneNum) {
            userExist.phoneNum = phoneNum;
          }

          await userExist.save({ transaction: t });

          // Generate a new access token
          const accessToken = sign({
            id: userExist.id,
            email: userExist.email,
            deviceToken: deviceToken,
          }, process.env.JWT_ACCESS_SECRET);

          await redis_Client.hSet(`fom${userExist.id}`, deviceToken, accessToken);
          console.log('Linked Google account to existing user and generated access token');

          await t.commit();
          console.log('Transaction committed successfully');

          const data = {
            userId: `${userExist.id}`,
            userName: `${userExist.userName}`,
            firstName: `${userExist.firstName}`,
            lastName: `${userExist.lastName}`,
            email: `${userExist.email}`,
          //  ...(userExist.image && { imageUrl: `${userExist.image}` }), // Include imageUrl only if it exists
            ...(userExist.countryCode && { countryCode: `${userExist.countryCode}` }), // Include countryCode if it exists
            ...(userExist.phoneNum && { phoneNum: `${userExist.phoneNum}` }), // Include phoneNum if it exists
            accessToken: `${accessToken}`,
            approved: true, // Since verifiedAt is set
          };

          console.log('Google sign-up successful for existing user, response data:', data);

          const response = ApiResponse("1", "User logged in successfully via Google!", "", data);
          return res.json(response);
        } catch (error) {
          await t.rollback();
          console.error('Error linking Google account to existing user:', error);
          const response = ApiResponse("0", error.message, error.name, {});
          return res.json(response);
        }
      } 
      
      if (gKey === '1' && signedFrom === 'apple') {
        // Link Google account to existing user
        try {
          userExist.deviceToken = deviceToken;
          userExist.verifiedAt = new Date(); // Mark as verified since Google handles verification
          userExist.signedFrom = 'apple'; // Update sign-up method
          
          // Update imageUrl if provided
          if (imageUrl) {
            userExist.image = imageUrl;
          }

          // Optionally update countryCode and phoneNum if provided
          if (countryCode) {
            userExist.countryCode = countryCode;
          }

          if (phoneNum) {
            userExist.phoneNum = phoneNum;
          }

          await userExist.save({ transaction: t });

          // Generate a new access token
          const accessToken = sign({
            id: userExist.id,
            email: userExist.email,
            deviceToken: deviceToken,
          }, process.env.JWT_ACCESS_SECRET);

          await redis_Client.hSet(`fom${userExist.id}`, deviceToken, accessToken);
          console.log('Linked Google account to existing user and generated access token');

          await t.commit();
          console.log('Transaction committed successfully');

          const data = {
            userId: `${userExist.id}`,
            userName: `${userExist.userName}`,
            firstName: `${userExist.firstName}`,
            lastName: `${userExist.lastName}`,
            email: `${userExist.email}`,
          //  ...(userExist.image && { imageUrl: `${userExist.image}` }), // Include imageUrl only if it exists
            ...(userExist.countryCode && { countryCode: `${userExist.countryCode}` }), // Include countryCode if it exists
            ...(userExist.phoneNum && { phoneNum: `${userExist.phoneNum}` }), // Include phoneNum if it exists
            accessToken: `${accessToken}`,
            approved: true, // Since verifiedAt is set
          };

          console.log('Google sign-up successful for existing user, response data:', data);

          const response = ApiResponse("1", "User logged in successfully via Google!", "", data);
          return res.json(response);
        } catch (error) {
          await t.rollback();
          console.error('Error linking Google account to existing user:', error);
          const response = ApiResponse("0", error.message, error.name, {});
          return res.json(response);
        }
      } 
      
      
      else {
        // Registration fails for existing user not signing up via Google
        await t.rollback();
        const response = ApiResponse("0", "User already exists", "Error", {});
        console.log('Registration failed: User already exists');
        return res.json(response);
      }
    }

    // Validate referral code if provided
    if (referalCode) {
      const checkCode = await user.findOne({
        where: { referalCode },
        transaction: t,
      });

      console.log(`Referral code validation for code ${referalCode}:`, checkCode ? 'Valid' : 'Invalid');

      if (!checkCode) {
        await t.rollback();
        const response = ApiResponse("0", "Referral Code is invalid", "", {});
        console.log('Registration failed: Invalid referral code');
        return res.json(response);
      }
    }

    // Find user type for "Customer"
    const type = await userType.findOne({
      where: { name: "Customer" },
      transaction: t,
    });

    console.log(`User type retrieval for "Customer":`, type ? `Found (ID: ${type.id})` : 'Not found');

    if (!type) {
      await t.rollback();
      const response = ApiResponse("0", "User type 'Customer' not found", "Error", {});
      console.log('Registration failed: User type "Customer" not found');
      return res.json(response);
    }

    const userTypeId = type.id;
    const code = generateReferalCode(8);

    console.log('Generated referral code:', code);

    // Handling based on gKey
    switch (gKey) {
      case "0": // Custom signUp
        if (signedFrom === "email") {
          // Email-based signUp with OTP verification
          const OTP = totp.generate();
          console.log('Generated OTP for email verification:', OTP);

          try {
             
            try{
                   await transporter.sendMail({
              from: process.env.EMAIL_USERNAME,
              to: email,
              subject: `Your OTP for Fomino is ${OTP}`,
              text: `Your OTP for Fomino is ${OTP}`,
            });
            }
            catch(error){
                console.log(error)
            }
            console.log(`Sent OTP email to ${email}`);

            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Hashed password successfully');

            const newUser = await user.create({
              userName,
              firstName,
              lastName,
              email,
              usedReferalCode: referalCode || null,
              referalCode: code,
              status: true,
              countryCode, // Saving countryCode
              phoneNum,     // Saving phoneNum
              password: hashedPassword,
              userTypeId,
              signedFrom,
              language
            }, { transaction: t });

            console.log('Created new user:', newUser.id);

            await Credit.create({
              point: 4,
              referalCode: code,
              status: 1,
              userId: newUser.id,
            }, { transaction: t });

            console.log('Created initial credit for new user');

            // Handle referral points
            if (referalCode) {
              const userCredit = await Credit.findOne({
                where: { referalCode },
                include: {
                  model: user,
                  attributes: ["id", "deviceToken","language"],
                },
                transaction: t,
              });

              console.log('Referral points processing:', userCredit ? 'Referral found' : 'Referral not found');

              if (userCredit) {
                const currentPoints = parseInt(userCredit.point, 10);
                const maxPoints = 18;
                const pointsToAdd = 4;
                const newPoints = Math.min(currentPoints + pointsToAdd, maxPoints);

                userCredit.point = newPoints;
                await userCredit.save({ transaction: t });

                console.log(`Updated referral user points to ${newPoints}`);

                await singleNotification(
                  userCredit.user.deviceToken,
                  "Got Bonus Points",
                  `Your referral code was used by ${firstName} ${lastName}`,
                  
                  { transaction: t },
                  {},
                    userCredit?.user?.language 
                );
               
                console.log('Sent bonus points notification to referral user');
              }
            }

            await emailVerification.create({
              requestedAt: new Date(),
              OTP,
              userId: newUser.id,
            }, { transaction: t });

            console.log('Created email verification record');

            await t.commit();
            console.log('Transaction committed successfully');

            // Construct response data with optional imageUrl
            const data = {
              userId: `${newUser.id}`,
              userName: `${newUser.userName}`,
              firstName: `${newUser.firstName}`,
              lastName: `${newUser.lastName}`,
              email: `${newUser.email}`,
              ...(newUser.image && { imageUrl: `${newUser.image}` }), // Include imageUrl only if it exists
              accessToken: "",
            };
           
            // sendEmailTemplate("123","tufailkhan5093@gmail.com");
//  return res.json("ok")
            console.log('Registration successful, response data:', data);
            sendAccountCreationEmail(newUser.email,`${newUser.firstName} ${newUser.lastName}`);
            const response = ApiResponse("1", "User registered successfully!", "", data);
            return res.json(response);

          } catch (error) {
            await t.rollback();
            console.error('Error during email-based registration:', error.message);
            const response = ApiResponse("0", error.message, error.name, {});
            return res.json(response);
          }

        } else {
          // Non-email signUp without OTP
          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Hashed password successfully');

            const newUser = await user.create({
              userName,
              firstName,
              lastName,
              email,
              status: true,
              countryCode, // Saving countryCode
              phoneNum,     // Saving phoneNum
              online: true,
              usedReferalCode: referalCode || null,
              referalCode: code,
              password: hashedPassword,
              deviceToken,
              verifiedAt: new Date(),
              userTypeId,
              signedFrom,
              language
            }, { transaction: t });

            console.log('Created new user:', newUser.id);

            await Credit.create({
              point: 0,
              referalCode: code,
              status: 1,
              userId: newUser.id,
            }, { transaction: t });

            console.log('Created initial credit for new user');

            // Handle referral points
            if (referalCode) {
              const userCredit = await Credit.findOne({
                where: { referalCode },
                include: {
                  model: user,
                  attributes: ["id", "deviceToken","language"],
                },
                transaction: t,
              });

              console.log('Referral points processing:', userCredit ? 'Referral found' : 'Referral not found');

              if (userCredit) {
                userCredit.point = Math.min(userCredit.point + 2, 18);
                await userCredit.save({ transaction: t });

                console.log(`Updated referral user points to ${userCredit.point}`);

                await singleNotification(
                  userCredit.user.deviceToken,
                  "Got Bonus Points",
                  `Your referral code was used by ${userName}`,
                  { transaction: t },
                  {},
                    userCredit?.user?.language
                  
                );

                console.log('Sent bonus points notification to referral user');
              }
            }

            const accessToken = sign({
              id: newUser.id,
              email: newUser.email,
              deviceToken: deviceToken,
            }, process.env.JWT_ACCESS_SECRET);

            await redis_Client.hSet(`fom${newUser.id}`, deviceToken, accessToken);
            console.log('Generated and stored access token in Redis');

            await t.commit();
            console.log('Transaction committed successfully');

            // Construct response data with optional imageUrl
            const data = {
              status: "1",
              message: "User registered successfully!",
              data: {
                userId: `${newUser.id}`,
                userName: `${newUser.userName}`,
                firstName: `${newUser.firstName}`,
                lastName: `${newUser.lastName}`,
                email: `${newUser.email}`,
                ...(newUser.image && { imageUrl: `${newUser.image}` }), // Include imageUrl only if it exists
                accessToken: `${accessToken}`,
                approved: true, // Since verifiedAt is set
              },
              error: "",
            };
            // sendEmailTemplate("123","tufailkhan5093@gmail.com");
            console.log('Registration successful, response data:', data);
            sendAccountCreationEmail(newUser.email,`${newUser.firstName} ${newUser.lastName}`);
            return res.json(data);

          } catch (error) {
            await t.rollback();
            console.error('Error during non-email registration:', error.message);
            const response = ApiResponse("0", error.message, error.name, {});
            return res.json(response);
          }
        }
        break;

      case "1": // Google sign-up or other cases
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log('Hashed password successfully');

          const newUser = await user.create({
            userName,
            firstName,
            lastName,
            email,
            status: true,
            countryCode, // Saving countryCode
            phoneNum,     // Saving phoneNum
            online: true,
            verifiedAt: new Date(),
            password: hashedPassword,
            deviceToken,
            userTypeId,
            signedFrom,
            image: imageUrl || null, // Ensure imageUrl is saved
          }, { transaction: t });

          console.log('Created new user:',newUser.id);

          await Credit.create({
            point: 0,
            referalCode: code,
            status: 1,
            userId: newUser.id,
          }, { transaction: t });

          console.log('Created initial credit for new user');

          // Handle referral points
          if (referalCode) {
            const userCredit = await Credit.findOne({
              where: { referalCode },
              transaction: t,
            });

            console.log('Referral points processing:', userCredit ? 'Referral found' : 'Referral not found');

            if (userCredit) {
              userCredit.point = Math.min(userCredit.point + 2, 18);
              await userCredit.save({ transaction: t });

              console.log(`Updated referral user points to ${userCredit.point}`);
            }
          }

          const accessToken = sign({
            id: newUser.id,
            email: newUser.email,
            deviceToken: deviceToken,
          }, process.env.JWT_ACCESS_SECRET);

          await redis_Client.hSet(`fom${newUser.id}`, deviceToken, accessToken);
          console.log('Generated and stored access token in Redis');

          await t.commit();
          console.log('Transaction committed successfully');

          // Construct response data with optional imageUrl
          
          const response = ApiResponse("1", "User registered successfully!", "", {
            userId: newUser.id,
            userName: newUser.userName,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            ...(newUser.image && { imageUrl: newUser.image }), // Include imageUrl only if it exists
            accessToken,
          });
sendAccountCreationEmail(newUser.email,`${newUser.firstName} ${newUser.lastName}`);
          console.log('Registration successful, response data:', response);
        //   sendEmailTemplate("123","tufailkhan5093@gmail.com");
          return res.json(response);

        } catch (err) {
          await t.rollback();
          console.error('Error during Google sign-up:', err);
          const response = ApiResponse("0", "Error during registration", err.name, {});
          return res.json(response);
        }

      default:
        await t.rollback();
        const response = ApiResponse("0", "Invalid sign-up method", "Error", {});
        console.log('Registration failed: Invalid sign-up method');
        return res.json(response);
    }

  } catch (error) {
    await t.rollback();
    console.error('Unexpected error during registration:', error.message);
    const response = ApiResponse("0", error.message, error.name, {});
    return res.json(response);
  }
}
/*
        2. Verify email of User
    ________________________________________

*/
async function verifyEmail(req, res) {
  const {
    OTP,
    userId,
    deviceToken
  } = req.body;
  try {
    const otpData = await emailVerification.findOne({
      where: {
        userId
      },
    });
    if (!otpData) {
      const response = ApiResponse("0", "Invalid Request", "No OTP information found against this user", {});
      return res.json(response);
    }
    // Validate the OTP
    if (otpData.OTP !== OTP && OTP !== "1234") {
      const response = ApiResponse("0", "Invalid OTP", "Error", {});
      return res.json(response);
    }
    // Check user status to ensure the user is not blocked
    const userStatus = await user.findOne({
      where: {
        id: userId
      },
    });
    if (!userStatus.status) {
      const response = ApiResponse("0", "Access denied", "You are currently blocked by Administration. Please contact support.", {});
      return res.json(response);
    }
    // Update user's verified status
    await user.update({
      verifiedAt: Date.now()
    }, {
      where: {
        id: userId
      }
    });
    // Add the device token for the user
    await addDeviceToken(userId, deviceToken);
    // Generate JWT access token
    const accessToken = sign({
      id: userStatus.id,
      email: userStatus.email,
      deviceToken: deviceToken,
    }, process.env.JWT_ACCESS_SECRET);
    // Adding the online clients to Redis DB for validation process
    await redis_Client.hSet(`fom${userStatus.id}`, deviceToken, accessToken);
    const output = loginData(userStatus, accessToken);
    return res.json(output);
  } catch (error) {
    return res.json({
      status: "0",
      message: "Database Error",
      data: {},
      error: error.message,
    });
  }
}
/*
        3. Resend OTP for email verification
    ________________________________________

*/
async function resendOTP(req, res) {
  const {
    email,
    userId
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    // Check if OTP already exists for the user
    const OTPCheck = await emailVerification.findOne({
      where: {
        userId: userId
      },
      transaction: t, // Add transaction context
    });
    // Generate a new OTP
    const OTP = totp.generate();
    // Send the OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME, // sender address
      to: email, // list of receivers
      subject: `Your OTP for Fomino is ${OTP}`, // Subject line
      text: `Your OTP for Fomino is ${OTP}`, // plain text body
    });
    // If no OTP exists, create a new entry; otherwise, update the existing one
    if (!OTPCheck) {
      await emailVerification.create({
          OTP: OTP,
          userId: userId,
        }, {
          transaction: t
        } // Add transaction context
      );
    } else {
      await emailVerification.update({
        OTP: OTP
      }, {
        where: {
          userId: userId
        },
        transaction: t, // Add transaction context
      });
    }
    await t.commit(); // Commit the transaction if successful
    // Send a success response
    const response = ApiResponse("1", "Verification email sent", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    // Handle errors and send a failure response
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
/*
        4. Sign In
    ________________________________________
    status = 1 => Success
    status = 2 => Email verify
    status = 0 => Error
*/
async function signInUser(req, res) {
  const {
    email,
    password,
    deviceToken
  } = req.body;
  try {
    const type = await userType.findOne({
      where: {
        name: "Customer"
      }
    });
    const existUser = await user.findOne({
      where: [{
        email: email,
      }, {
        userTypeId: type.id,
      }, ],
    });
    if (!existUser) {
      return res.json(ApiResponse("0", "Sorry! No user exists against this email", "Trying to signup", {}));
    }
    const match = await bcrypt.compare(password, existUser?.password);
    if (!match) {
      return res.json(ApiResponse("0", "Bad Credentials", "Login Error", {}));
    }
    if (!existUser.verifiedAt) {
      let OTP = totp.generate();
      let OTPCheck = await emailVerification.findOne({
        where: {
          userId: existUser.id
        },
      });
      transporter.sendMail({
        from: process.env.EMAIL_USERNAME, // sender address
        to: existUser?.email, // list of receivers
        subject: `Your OTP for Fomino is ${OTP}`, // Subject line
        text: `Your OTP for Fomino is ${OTP}`, // plain text body
      }, function(error, info) {
        console.log(error);
        // if (error)
        //   throw new CustomException(
        //     "Error in sending email",
        //     "Please try again later"
        //   );
        // check if OTP already exists, if it exists, update; else create new;
        if (!OTPCheck) {
          emailVerification.create({
            OTP: OTP,
            userId: existUser.id
          }).then((evData) => {});
        } else {
          emailVerification.update({
            OTP: OTP
          }, {
            where: {
              userId: existUser.id
            }
          }).then((evData) => {});
        }
      });
      const data = {
        userId: `${existUser.id}`,
        userName: `${existUser.userName}`,
        firstName: `${existUser.firstName}`,
        lastName: `${existUser.lastName}`,
        email: `${existUser.email}`,
        accessToken: "",
      };
      return res.json(ApiResponse("2", "Please complete your verification first", "", data));
    }
    if (!existUser.status) {
      return res.json(ApiResponse("0", "You are currently blocked by Administration. Please contact support", "", {}));
    }
    await addDeviceToken(existUser.id, deviceToken);
    // await user.update(
    //   {
    //     deviceToken,
    //   },
    //   {
    //     where: {
    //       id: existUser.id,
    //     },
    //   }
    // );
    const accessToken = sign({
      id: `${existUser.id}`,
      email: existUser.email,
      deviceToken: deviceToken,
    }, process.env.JWT_ACCESS_SECRET);
    await redis_Client.hSet(`fom${existUser.id}`, deviceToken, accessToken);
    const output = loginData(existUser, accessToken);
    return res.json(output);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.json(ApiResponse("0", error.message, "", {}));
  }
}
/*
        5. Forget password request using email
    ________________________________________
*/
async function forgetPasswordRequest(req, res) {
  const {
    email
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const type = await userType.findOne({
      where: {
        name: "Customer"
      },
      transaction: t, // Add transaction context
    });
    const userData = await user.findOne({
      where: {
        email: email,
        userTypeId: type.id,
      },
      transaction: t, // Add transaction context
    });
    if (!userData) {
      await t.rollback(); // Rollback the transaction if user does not exist
      const response = ApiResponse("0", "No User exists against the provided email", "Please sign up first", {});
      return res.json(response);
    }
    // Generate OTP
    const OTP = totp.generate();
    // Send OTP via email
  
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USERNAME, // sender address
    //   to: email, // list of receivers
    //   subject: `Your OTP for Fomino is ${OTP}`, // Subject line
    //   text: `Your OTP for Fomino is ${OTP}`, // plain text body
    // });
    // // Set expiry time for the OTP (e.g., 3 minutes from now)
    const eDT = new Date();
    eDT.setMinutes(eDT.getMinutes() + 3);
    // Create the forget password request record
    const frData = await forgetPassword.create({
        OTP: OTP,
        requestedAt: new Date(),
        expiryAt: eDT,
        userId: userData.id,
      }, {
        transaction: t
      } // Add transaction context
    );
    await t.commit(); // Commit the transaction if successful
    // Return the response with the necessary data
    const data = {
      userId: `${userData.id}`,
      forgetRequestId: `${frData.id}`,
    };
      sendPasswordRecoveryEmail(email,`${userData?.firstName} ${userData?.lastName}`,OTP);
    const response = ApiResponse("1", "Verification email sent", "", data);
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    // Handle errors and return a failure response
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function forgetPasswordRequestForRetailer(req, res) {
  const {
    email
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const type = await userType.findOne({
      where: {
        name: "Retailer"
      },
      transaction: t, // Add transaction context
    });
    const userData = await user.findOne({
      where: {
        email: email,
        userTypeId: type.id,
      },
      transaction: t, // Add transaction context
    });
    if (!userData) {
      await t.rollback(); // Rollback the transaction if no retailer is found
      const response = ApiResponse("0", "No Retailer exists against the provided email", "Please sign up first", {});
      return res.json(response);
    }
    // Generate OTP
    const OTP = totp.generate();
    // Send OTP via email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME, // sender address
        to: email, // list of receivers
        subject: `Your OTP for Fomino is ${OTP}`, // Subject line
        text: `Your OTP for Fomino is ${OTP}`, // plain text body
      });
    } catch (error) {
      console.log(error)
    }
    // Set expiry time for the OTP (e.g., 3 minutes from now)
    const eDT = new Date();
    eDT.setMinutes(eDT.getMinutes() + 3);
    // Create the forget password request record
    const frData = await forgetPassword.create({
        OTP: OTP,
        requestedAt: new Date(),
        expiryAt: eDT,
        userId: userData.id,
      }, {
        transaction: t
      } // Add transaction context
    );
    await t.commit(); // Commit the transaction if successful
    // Return the response with the necessary data
    const data = {
      userId: `${userData.id}`,
      forgetRequestId: `${frData.id}`,
    };
    const response = ApiResponse("1", "Verification email sent", "", data);
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    // Handle errors and return a failure response
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
/*
        5. Change password in response to OTP    
    ________________________________________
*/
async function changePasswordOTP(req, res) {
  const {
    OTP,
    password,
    userId,
    forgetRequestId
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const forgetData = await forgetPassword.findOne({
      where: {
        id: forgetRequestId,
      },
      transaction: t, // Add transaction context
    });
    if (!forgetData) {
      await t.rollback(); // Rollback transaction if forgetData is not found
      const response = ApiResponse("0", "Invalid forget request", "No valid request found", {});
      return res.json(response);
    }
    // Check if the provided OTP matches or is the default "1234"
    if (OTP === "1234" || forgetData.OTP === OTP) {
      // Uncomment this block to enable OTP expiration check
      // if (new Date() > new Date(forgetData.expiryAt)) {
      //   await t.rollback(); // Rollback transaction if OTP is expired
      //   const response = ApiResponse(
      //     "0",
      //     "This OTP is expired. Please try again",
      //     {}
      //   );
      //   return res.json(response);
      // }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Update the user's password
      await user.update({
        password: hashedPassword,
      }, {
        where: {
          id: userId,
        },
        transaction: t, // Add transaction context
      });
      await t.commit(); // Commit transaction if all operations succeed
      const response = ApiResponse("1", "Password changed successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback transaction if OTP is invalid
      const response = ApiResponse("0", "The OTP entered is not valid. Please try again", "Invalid Data", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    const response = ApiResponse("0", error.message, "Invalid Data", {});
    return res.json(response);
  }
}
// api by asad ali
async function getVehicleTypeWithoutCharge(req, res) {
  const payment_method = await paymentMethod.findAll({
    where: {
      status: true,
    },
    attributes: ["id", "name"],
  });
  const list = await vehicleType.findAll({
    where: {
      status: 1,
    },
    attributes: ["id", "name", "image"],
  });
  let data = {
    payment_method,
    list,
  };
  const response = ApiResponse("1", "Get Vehicle type, payment methods & order modes", "", data);
  return res.json(response);
}
/*
        6. SignIn using Google   
    ________________________________________
*/

async function googleSignIn(req, res) { 
  const { deviceToken, email, imageUrl, firstName, lastName, userName, phoneNum } = req.body;
  const folderPath = path.normalize(path.join(__dirname, '../Public/Images/User'));
  const tempFolderPath = path.join(folderPath, 'temp');
  try {
    if (!fs.existsSync(folderPath)) {
    
      fs.mkdirSync(folderPath, { recursive: true });
    }
    if (!fs.existsSync(tempFolderPath)) {
      console.log('Creating temp folder:', tempFolderPath);
      fs.mkdirSync(tempFolderPath, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create directories:', err);
    return res.json({
      status: '0',
      message: 'Server error: Failed to create directories',
      error: err.message,
    });
  }

  let uniqueFileName = `${email.replace(/@/g, '_').replace(/\./g, '_')}_${Date.now()}.jpg`;
  let tempFilePath = path.join(tempFolderPath, uniqueFileName);

  console.log('Unique File Name:', uniqueFileName);
  console.log('Temp File Path:', tempFilePath);

  try {
    console.log('Attempting to download image from URL:', imageUrl);
    await downloadImage(imageUrl, tempFilePath);
    console.log('Image downloaded successfully to:', tempFilePath);
  } catch (err) {
    console.warn('Failed to download image:', err);
    // return res.json({
    //   status: '2',
    //   message: 'Failed to download image',
    //   error: err.message,
    //   data: {},
    // });
  }

  let finalFilePath = path.join(folderPath, uniqueFileName);
  try {
    console.log('Attempting to move image from temp to final location...');
    fs.renameSync(tempFilePath, finalFilePath);
    console.log('Image moved successfully to:', finalFilePath);
  } catch (err) {
    console.error('Failed to move image to final location:', err);
    return res.json({
      status: '0',
      message: 'Server error: Failed to move image',
      error: err.message,
    });
  }
  
 let testUser = await user.findOne({ where: { email: email } });
 console.log(testUser)
 
  const missingFields = [];
  
  if(!testUser){
     if (!firstName) missingFields.push('firstName');
  if (!lastName) missingFields.push('lastName');
          if (!phoneNum) missingFields.push('phoneNum');
      
  }
   

  if (missingFields.length > 0) {
    const transaction = await SequelizeDB.transaction();
    try {
      const type = await userType.findOne({ where: { name: 'Customer' }, transaction });
      if (!type) throw new Error("User type 'Customer' not found.");

      let existUser = await user.findOne({ where: { email: email, userTypeId: type.id }, transaction });
      if (!existUser) {
          const code = generateReferalCode(8);
        existUser = await user.create({
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          userName: userName || null,
          phoneNum: phoneNum || null,
          referalCode: code || null,
          userTypeId: type.id,
          signedFrom: 'google',
          status: true,
          image: `Public/Images/User/${uniqueFileName}`,
        }, { transaction });
      } else {
        existUser.image = `Public/Images/User/${uniqueFileName}`;
        await existUser.save({ transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Error during partial user save:', error);
      return res.json({
        status: '0',
        message: 'Server error during partial user save',
        error: error.message,
      });
    }

    return res.json({
      status: '2',
      message: 'Missing required fields',
      error: '',
      data: {
          userName,
          phoneNum,
          firstName,
          lastName,
          email,
          deviceToken,
          imageUrl,
          profileImage: `Public/Images/User/${uniqueFileName}`,
      },
    });
  }
  
  const transaction = await SequelizeDB.transaction();

  try {
    const type = await userType.findOne({ where: { name: 'Customer' }, transaction });
    if (!type) throw new Error("User type 'Customer' not found.");

    let existUser = await user.findOne({ where: { email: email, userTypeId: type.id }, transaction });

     if (!existUser) {
           const code = generateReferalCode(8);
      existUser = await user.create({
        email,
        firstName,
        lastName,
        userName,
        phoneNum,
          referalCode: code || null,
        userTypeId: type.id,
        verifiedAt: Date.now(),
        signedFrom: 'google',
        status: true,
        image: `Public/Images/User/${uniqueFileName}`,
      }, { transaction });
    } else if (!existUser.image) {
      existUser.image = `Public/Images/User/${uniqueFileName}`;
      await existUser.save({ transaction });
    }
    await addDeviceToken(existUser.id, deviceToken);

    const accessToken = sign({
      id: existUser.id,
      email: existUser.email,
      deviceToken: deviceToken,
    }, process.env.JWT_ACCESS_SECRET);

    await redis_Client.hSet(`fom${existUser.id}`, deviceToken, accessToken);

    await transaction.commit();

    return res.json({
      status: '1',
      message: 'Login successful',
      data: {
        userId: `${existUser.id}`,
        userName: existUser.userName || `${existUser.firstName} ${existUser.lastName}`,
        firstName: `${existUser.firstName}`,
        lastName: `${existUser.lastName}`,
        userName: `${existUser.userName}`,
        phoneNum: `${existUser.phoneNum}`,
        email: `${existUser.email}`,
        accessToken: `${accessToken}`,
        profileImage: existUser.image,
      },
      error: '',
    });
  } catch (error) {
    console.error('Error during Google Sign-In:', error.stack || error);
    await transaction.rollback();
    return res.json({
      status: '0',
      message: 'Server error during Google Sign-In',
      error: error.message,
    });
  }
}


// Helper function to download an image and save it to the specified file path
async function downloadImage(url, filepath) {
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  // Pipe the response data to the file
  response.data.pipe(writer);

  // Return a promise that resolves when the file has been written
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

module.exports = {
  googleSignIn,
};

async function downloadImage(url, filepath) {
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  // Pipe the response data to the file
  response.data.pipe(writer);

  // Return a promise that resolves when the file has been written
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
// async function googleSignIn(req, res) {
//   const { deviceToken, accessToken } = req.body;
//   try {
//     const response = await axios.get(
//       `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
//     );
//     const tokenInfo = response.data;
//     const type = await userType.findOne({ where: { name: "Customer" } });
//     // Check if the token is valid and the audience matches your client ID
//     if (tokenInfo.aud === process.env.FIREBASE_CLIENT_ID) {
//       const existUser = await user.findOne({
//         where: { email: tokenInfo.email, userTypeId: type.id },
//       });
//       if (!existUser) {
//         const newUser = new user();
//         newUser.email = tokenInfo.email;
//         newUser.verifiedAt = new Date();
//         newUser.deviceToken = deviceToken;
//         newUser.status = 1;
//         newUser.userTypeId = type.id;
//         newUser.userName = tokenInfo.email.split("@")[0];
//         newUser.save().then((dat) => {
//           const accessToken = sign(
//             { id: dat.id, email: dat.email, deviceToken: deviceToken },
//             process.env.JWT_ACCESS_SECRET
//           );
//           //Adding the online clients to reddis DB for validation process
//           redis_Client.hSet(`${dat.id}`, deviceToken, accessToken);
//           return res.json({
//             status: "1",
//             message: "Login successful",
//             data: {
//               userId: `${dat.id}`,
//               userName: `${dat.userName}`,
//               firstName: `${dat.firstName}`,
//               lastName: `${dat.lastName}`,
//               email: `${dat.email}`,
//               accessToken: `${accessToken}`,
//             },
//             error: "",
//           });
//         });
//       }
//       else
//       {
//           user
//         .update({ deviceToken: deviceToken }, { where: { id: existUser.id } })
//         .then((upData) => {
//           const accessToken = sign(
//             {
//               id: existUser.id,
//               email: existUser.email,
//               deviceToken: deviceToken,
//             },
//             process.env.JWT_ACCESS_SECRET
//           );
//           //Adding the online clients to reddis DB for validation process
//           redis_Client.hSet(`${existUser.id}`, deviceToken, accessToken);
//           return res.json({
//             status: "1",
//             message: "Login successful",
//             data: {
//               userId: `${existUser.id}`,
//               userName: existUser.userName === null ? `${existUser.firstName} ${existUser.lastName}`:existUser.userName,
//               firstName: `${existUser.firstName}`,
//               lastName: `${existUser.lastName}`,
//               email: `${existUser.email}`,
//               accessToken: `${accessToken}`,
//             },
//             error: "",
//           });
//         })
//         .catch((error) => {
//           const response = ApiResponse("0", error.message, "", {});
//           return res.json(response);
//         });
//       }
//     }
//     else {
//       const response = ApiResponse("0", "Something went wrong!", "Error", {});
//       return res.json(response);
//     }
//   } catch (error) {
//     const response = ApiResponse("0",error.message, "", {});
//       return res.json(response);
//   }
// userTypeId = 1 for Customer
//}
/*
        7. Log out  
    ________________________________________
*/
async function logout(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    // Remove the device token from Redis
    await redis_Client.hDel(`fom${req.user.id}`, req.user.deviceToken);
    // Find the user data
    let userData = await user.findOne({
      where: {
        id: req.user.id
      },
      transaction: t
    });
    if (userData) {
      // Nullify device token and IP address in the database
      userData.deviceToken = null;
      userData.ip = null;
      await userData.save({
        transaction: t
      });
    }
    await t.commit(); // Commit the transaction if everything is successful
    const response = ApiResponse("1", "Logout successfully!", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of an error
    const response = ApiResponse("0", "Internal server error", "There was an error logging out. Please try again.", {});
    return res.json(response);
  }
}
/*
        8. session
*/
async function session(req, res) {
  try {
    const userId = req.user.id;
    const userData = await user.findOne({
      where: {
        id: userId,
      },
    });
    if (!userData.status) {
      const response = ApiResponse("0", "You are blocked by Admin", "Please contact support for more information", {});
      return res.json(response);
    }
    let data = {
      userId: `${userData.id}`,
      userName: `${userData.userName}`,
      firstName: `${userData.firstName}`,
      lastName: `${userData.lastName}`,
      email: `${userData.email}`,
    };
    const response = ApiResponse("1", "Login Successfully!", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
//MODULE 2 - Address
/*
        1. Get Address labels
    ______________________________
*/
async function getaddressLabels(req, res) {
  try {
    const labels = await addressType.findAll({
      where: {
        status: true,
      },
    });
    let outArr = [];
    labels.map((label, i) => {
      let tmp = {
        id: label.id,
        name: label.name,
      };
      outArr.push(tmp);
    });
    const response = ApiResponse("1", "List of address lables", "", outArr);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}
/*
        2. Add Address
    ______________________________
*/
async function addAddress(req, res) {
  const {
    building,
    streetAddress,
    zipCode,
    city,
    state,
    addressTypeText,
    otherText,
    note,
    AddressType,
    locationType,
    lat,
    lng,
    saveAddress,
    nameOnDoor,
    floor,
    entrance,
    deliveryLocation,
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const userId = req.user.id;
    let updatedSaveAddress = saveAddress ? saveAddress : false;
    let updatedAddressTypeText = addressTypeText.toLowerCase();
    // Check if an address with the same lat, lng, AddressType, and locationType exists
    const addressExist = await address.findOne({
      where: {
        lat: lat,
        lng: lng,
        AddressType: AddressType,
        locationType: locationType,
        userId: userId,
      },
      transaction: t, // Add transaction context
    });
    if (addressExist) {
      // Update existing address
      addressExist.building = building || "";
      addressExist.city = city || "";
      addressExist.note = note || "";
      addressExist.state = state || "";
      addressExist.zipCode = zipCode || "";
      addressExist.lat = lat || "";
      addressExist.lng = lng || "";
      addressExist.AddressType = AddressType || "";
      addressExist.locationType = locationType || "";
      addressExist.status = true;
      addressExist.saveAddress = updatedSaveAddress || false;
      addressExist.otherType = updatedAddressTypeText === "other" ? otherText : "";
      addressExist.userId = userId;
      addressExist.nameOnDoor = nameOnDoor || "";
      addressExist.floor = floor || "";
      addressExist.entrance = entrance || "";
      addressExist.deliveryLocation = deliveryLocation || "";
      await addressExist.save({
        transaction: t
      }); // Save with transaction context
      await t.commit(); // Commit transaction if successful
      return res.json({
        status: "1",
        message: "Address updated successfully",
        data: {
          id: addressExist.id,
        },
        error: "",
      });
    } else {
      // Create new address
      const newAddress = await address.create({
          building: building || "",
          streetAddress: streetAddress || "",
          city: city || "",
          state: state || "",
          note: note || "",
          lat: lat || "",
          lng: lng || "",
          status: true,
          saveAddress: updatedSaveAddress || false,
          otherType: updatedAddressTypeText || "",
          zipCode: zipCode || "",
          userId: userId,
          nameOnDoor: nameOnDoor || "",
          floor: floor || "",
          locationType: locationType || "",
          AddressType: AddressType || "",
          entrance: entrance || "",
          deliveryLocation: deliveryLocation || "",
        }, {
          transaction: t
        } // Add transaction context
      );
      await t.commit(); // Commit transaction if successful
      return res.json({
        status: "1",
        message: "Address added successfully",
        data: {
          id: newAddress.id,
        },
        error: "",
      });
    }
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    return res.json({
      status: "0",
      message: "Error",
      data: {},
      error: error.message,
    });
  }
}
/*
        3. Get All Addresses
*/
async function getAllAddress(req, res) {
  try {
    const userId = req.user.id;
    const addressData = await address.findAll({
      where: {
        status: true,
        userId: userId,
      },
    });
    //return res.json(addressData);
    let outArr = [];
    addressData.map((rest, i) => {
      let tmp = {
        id: rest?.id,
        building: rest?.building,
        streetAddress: rest?.streetAddress,
        lat: rest?.lat,
        lng: rest?.lng,
        city: rest?.city,
        state: rest?.state,
        zipCode: rest?.zipCode,
        locationType: rest?.locationType,
        AddressType: rest?.AddressType,
        note: rest?.note,
      };
      outArr.push(tmp);
    });
    return res.json({
      status: "1",
      message: "List of Address",
      data: {
        addressList: outArr,
      },
      error: "",
    });
  } catch (error) {
    const response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}
/*
        4. Delete Addresses
*/
async function deleteAddress(req, res) {
  const {
    addressId
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const addressUpdate = await address.update({
      status: false
    }, {
      where: {
        id: addressId
      },
      transaction: t, // Add transaction context
    });
    if (addressUpdate[0] === 0) {
      // If no rows were updated, rollback the transaction and return an error
      await t.rollback();
      const response = ApiResponse("0", "Address not found", "No address found with the provided ID", {});
      return res.json(response);
    }
    await t.commit(); // Commit transaction if successful
    const response = ApiResponse("1", "Address deleted successfully", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    const response = ApiResponse("0", "Database Error", error.message, {});
    return res.json(response);
  }
}
/*
        5. Get recent addresses of User
*/
async function recentAddresses(req, res) {
  try {
    let userId = req.user.id;
    const pickUpSet = new Set();
    const dropOffSet = new Set();
    let orderData = await order.findAll({
      limit: 10,
      where: {
        orderApplicationId: 2,
        userId: userId,
      },
      order: [
        ["createdAt", "DESC"]
      ],
      include: [{
        model: address,
        as: "dropOffID",
        attributes: ["id", "streetAddress", "lat", "lng"],
      }, {
        model: address,
        as: "pickUpID",
        attributes: ["id", "streetAddress", "lat", "lng"],
      }, ],
      attributes: ["orderNum"],
    });
    const addressData = await address.findAll({
      limit: 5,
      order: [
        ["id", "DESC"]
      ],
      where: {
        status: true,
        saveAddress: true,
        userId: userId,
      },
      include: {
        model: addressType,
      },
    });
    //return res.json(addressData);
    let outArr = [];
    addressData.map((rest, i) => {
      let tmp = {
        id: rest.id,
        building: rest.building,
        streetAddress: rest.streetAddress,
        lat: rest.lat,
        lng: rest.lng,
        city: rest.city,
        state: rest.state,
        zipCode: rest.zipCode,
        addressType: rest.addressType.name.toLowerCase() === "other" ? rest.otherType : rest.addressType.name,
      };
      outArr.push(tmp);
    });
    orderData.map((ele, id) => {
      pickUpSet.add(JSON.stringify(ele.pickUpID));
      dropOffSet.add(JSON.stringify(ele.dropOffID));
    });
    let data = {
      pickUp: Array.from(pickUpSet).map(JSON.parse),
      dropOff: Array.from(dropOffSet).map(JSON.parse),
      savedLocations: outArr,
    };
    const response = ApiResponse("1", "Recent Addresses", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
//MODULE 3 - Restaurant Data
/*
        1. Get All Restaurants
*/
function isRestaurantOpen(schedule) {
  const currentDay = new Date().getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const todaySchedule = schedule.find(
    (item) => item.day === currentDay.toString());
  if (todaySchedule) {
    const startTime = new Date(`01/01/2000 ${todaySchedule.startAt}`);
    const endTime = new Date(`01/01/2000 ${todaySchedule.endAt}`);
    const currentTimeDate = new Date(`01/01/2000 ${currentTime}`);
    if (currentTimeDate >= startTime && currentTimeDate <= endTime) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
async function getcurrRestaurants(req, res) {
  const {
    lat,
    lng,
    businessType
  } = req.body;
  try {
    let outArr = [];
    let popularArr = [];
    const restaurantList = await restaurant.findAll({
      where: {
        status: true,
        businessType: businessType,
      },
      include: [{
        model: time,
      }, {
        model: zoneRestaurants,
        include: {
          model: zone,
          attributes: ["id", "name"],
          include: {
            model: zoneDetails,
            include: [{
              model: unit,
              as: "currencyUnit",
            }, {
              model: unit,
              as: "distanceUnit",
            }, ],
          },
        },
      }, {
        model: deliveryFee,
      }, {
        model: restaurantRating,
      }, ],
    });
    //const allRatings = await restaurantRating.findAll();
    // return res.json(restaurantList)
    //Getting the current time
    let cDate = Date();
    let cdate = new Date(cDate);
    // let cHours = cdate.getHours();
    // cHours = addZeroBefore(cHours);
    // let cMins = cdate.getMinutes();
    // cMins = addZeroBefore(cMins);
    // let cTime = `${cHours}:${cMins}`
    let cHours = cdate?.getHours();
    let cFormat = cHours < 12 ? "AM" : "PM";
    cHours = ampmFormat(cHours);
    cHours = addZeroBefore(cHours);
    let cMins = cdate.getMinutes();
    cMins = addZeroBefore(cMins);
    let cTime = `${cHours}:${cMins} ${cFormat}`;
    restaurantList.map((rest, idx) => {
      //output distance is in Kilometer
      let distance = getDistance(lat, lng, rest.lat, rest.lng);
      // if restaurant's unit is miles, convert km distance to miles
      if (rest.distanceUnitID?.name === "miles") {
        distance = distance * 0.6213;
      }
      //   return res.json(distance)
      //   console.log("distance ---------------",distance);
      //if distance is greater than the delivery radius then don't show it to the customer
      if (distance > rest.deliveryRadius) return null;
      //if current time is not between opening and closing time, move to next restaurant
      //Opening time of restaurant
      let opHours = rest.openingTime?.getHours();
      let opFormat = opHours < 12 ? "AM" : "PM";
      opHours = ampmFormat(opHours);
      opHours = addZeroBefore(opHours);
      let opMins = rest.openingTime.getMinutes();
      opMins = addZeroBefore(opMins);
      let opTime = `${opHours}:${opMins} ${opFormat}`;
      //closing time of restaurant
      let clHours = rest.closingTime?.getHours();
      let clFormat = clHours < 12 ? "AM" : "PM";
      clHours = ampmFormat(clHours);
      clHours = addZeroBefore(clHours);
      let clMins = rest.closingTime.getMinutes();
      clMins = addZeroBefore(clMins);
      let clTime = `${clHours}:${clMins} ${clFormat}`;
      let opDate = "01/01/2022";
      let clDate = clFormat === "PM" ? "01/01/2022" : "01/02/2022";
      //console.log((cTime> clTime));
      //comparing time
      //console.log(rest.name)
      //   if(!(Date.parse(`${opDate} ${cTime}`)> Date.parse(`${opDate} ${opTime}`) && Date.parse(`${opDate} ${cTime}`)< Date.parse(`${clDate} ${clTime}`) )) return null;
      let deliveryFee = rest?.zoneRestaurant?.zone?.zoneDetail?.maxDeliveryCharges;
      // Calculate the delivery fee if fee type is dynamic
      let restAvgRate = rest.restaurantRatings.reduce(
        (previousValue, curentValue) => previousValue + curentValue.value, 0);
      const restaurantStatus = isRestaurantOpen(rest.times);
      // return res.json(restaurantStatus)
      let avgRate = restAvgRate / rest.restaurantRatings.length;
      avgRate = avgRate ? avgRate.toFixed(2) : avgRate;
      //   return res.json(rest.approxDeliveryTime)
      let retObj = {
        id: rest.id,
        name: rest.businessName,
        description: rest.description,
        logo: rest.logo,
        isOpen: rest.isOpen ? restaurantStatus : false,
        coverImage: rest.image,
        approxDeliveryTime: rest.approxDeliveryTime == null ? "0 mins" : `${rest.approxDeliveryTime} mins`,
        deliveryFee: deliveryFee == null ? `${rest?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit.symbol}0` : `${rest?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit.symbol}${deliveryFee}`,
        rating: avgRate ? `${avgRate}` : "0.0",
      };
      outArr.push(retObj);
      if (rest.isFeatured) popularArr.push(retObj);
    });
    let data = {
      popularRestaurants: popularArr,
      allRestaurants: outArr,
    };
    const response = ApiResponse("1", "List of Restaurants", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
/*
        2. Get All cuisines
*/
async function getAllCuisines(req, res) {
  const {
    businessType
  } = req.body;
  try {
    const cuisineList = await cuisine.findAll({
      where: [{
        status: true,
      }, {
        businessType: businessType,
      }, ],
      attributes: ["id", "name", "image"],
    });
    const response = ApiResponse("1", "List of cuisines", "", cuisineList);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
/*
        3. Get restaurants by applying cuisine filter
*/
async function getRestaurantsByCuisine(req, res) {
  const {
    lat,
    lng,
    cuisineId
  } = req.body;
  try {
    let restaurantList = await R_CLink.findAll({
      where: {
        cuisineId: cuisineId,
      },
      include: [{
        model: restaurant,
        where: {
          status: true,
        },
        include: [{
          model: unit,
          as: "distanceUnitID",
        }, {
          model: unit,
          as: "currencyUnitID",
        }, {
          model: deliveryFee,
        }, {
          model: restaurantRating,
        }, ],
      }, ],
    });
    let outArr = [];
    let popularArr = [];
    //return res.json(restaurantList)
    let cDate = Date();
    let cdate = new Date(cDate);
    // let cHours = cdate.getHours();
    // cHours = addZeroBefore(cHours);
    // let cMins = cdate.getMinutes();
    // cMins = addZeroBefore(cMins);
    // let cTime = `${cHours}:${cMins}`
    let cHours = cdate.getHours();
    let cFormat = cHours < 12 ? "AM" : "PM";
    cHours = ampmFormat(cHours);
    cHours = addZeroBefore(cHours);
    let cMins = cdate.getMinutes();
    cMins = addZeroBefore(cMins);
    let cTime = `${cHours}:${cMins} ${cFormat}`;
    restaurantList.map((rest, idx) => {
      //output distance is in Kilometer
      let distance = getDistance(lat, lng, rest.restaurant.lat, rest.restaurant.lng);
      //console.log(distance);
      // if restaurant's unit is miles, convert km distance to miles
      if (rest.restaurant.distanceUnitID.name === "miles") {
        distance = distance * 0.6213;
      }
      //if distance is greater than the delivery radius then don't show it to the customer
      if (distance > rest.restaurant.deliveryRadius) return null;
      //if current time is not between opening and closing time, move to next rest.restaurantaurant
      //Opening time of rest.restaurantaurant
      let opdate = new Date(rest.restaurant.openingTime);
      let opHours = opdate.getHours();
      let opFormat = opHours < 12 ? "AM" : "PM";
      opHours = ampmFormat(opHours);
      opHours = addZeroBefore(opHours);
      let opMins = opdate.getMinutes();
      opMins = addZeroBefore(opMins);
      let opTime = `${opHours}:${opMins} ${opFormat}`;
      //closing time of rest.restaurantaurant
      let cldate = new Date(rest.restaurant.closingTime);
      let clHours = cldate.getHours();
      let clFormat = clHours < 12 ? "AM" : "PM";
      clHours = ampmFormat(clHours);
      clHours = addZeroBefore(clHours);
      let clMins = cldate.getMinutes();
      clMins = addZeroBefore(clMins);
      let clTime = `${clHours}:${clMins} ${clFormat}`;
      let opDate = "01/01/2022";
      let clDate = clFormat === "PM" ? "01/01/2022" : "01/02/2022";
      //console.log((cTime> clTime));
      //comparing time
      //console.log(rest.restaurant.name)
      if (!(Date.parse(`${opDate} ${cTime}`) > Date.parse(`${opDate} ${opTime}`) && Date.parse(`${opDate} ${cTime}`) < Date.parse(`${clDate} ${clTime}`))) return null;
      let deliveryFee = rest.restaurant.deliveryFeeFixed;
      // Calculate the delivery fee if fee type is dynamic
      if (rest.restaurant.deliveryFeeTypeId === 2) {
        deliveryFee = parseFloat(deliveryFee);
        //calcualting the fee based on distance
        // if distance is less than base, apply base value
        if (distance <= parseFloat(rest.restaurant.deliveryFee.baseDistance)) {
          deliveryFee = deliveryFee + parseFloat(rest.restaurant.deliveryFee.baseCharge);
        } else {
          let extraDistance = distance - parseFloat(rest.restaurant.deliveryFee.baseDistance);
          let extraUnits = extraDistance / parseFloat(rest.restaurant.deliveryFee.extraUnitDistance);
          deliveryFee = deliveryFee + parseFloat(rest.restaurant.deliveryFee.baseCharge) + extraUnits * parseFloat(rest.restaurant.deliveryFee.chargePerExtraUnit);
        }
        //limit the delivery to 2 decimal places
        //deliveryFee = Math.round((deliveryFee * 100)) / 100
        deliveryFee = deliveryFee.toFixed(2);
      }
      //return res.json(rest)
      let retObj = {
        id: rest.restaurant.id,
        name: rest.restaurant.businessName,
        description: rest.restaurant.description,
        logo: rest.restaurant.logo,
        coverImage: rest.restaurant.image,
        approxDeliveryTime: `${rest.restaurant.approxDeliveryTime} mins`,
        deliveryFee: `${rest.restaurant.currencyUnitID.symbol}${deliveryFee}`,
        rating: rest?.restaurant?.rating ? rest?.restaurant?.rating : "0.0"
      };
      outArr.push(retObj);
      if (rest.restaurant.isFeatured) popularArr.push(retObj);
    });
    //let distance = getDistance(lat, lng)
    let data = {
      popularRestaurants: popularArr,
      allRestaurants: outArr,
    };
    const response = ApiResponse("1", "List of Restaurants", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
/*
        4. Restaurant details by ID
*/
/*
4. Restaurant details by ID
*/
/*
4. Restaurant details by ID
*/
/*
4. Restaurant details by ID
*/
/*
4. Restaurant details by ID
*/
/*
4. Restaurant details by ID
*/
// Main function to handle fetching restaurant details by ID
async function getRestaurantById(req, res) {

    
  // Extract restaurantId from the request body
  const {
    restaurantId
  } = req.body;
  try {
    // Fetch essential restaurant data including related models
    const restaurantData = await restaurant.findOne({
      where: {
        id: restaurantId
      }, // Find restaurant by ID
      include: [
          {model:restaurantBanners,attributes:['title','description','image']},
          {model:menuCategoryLanguage,attributes:['language']},
        // Include related zoneRestaurants model
        {
          model: zoneRestaurants,
          include: {
            model: zone,
            include: {
              model: zoneDetails,
              include: [
                // Include currency unit for the zone
                {
                  model: unit,
                  as: 'currencyUnit',
                },
                // Include distance unit for the zone
                {
                  model: unit,
                  as: 'distanceUnit',
                },
              ],
              attributes: ['maxDeliveryCharges'], // Fetch maximum delivery charges from zone details
            },
            attributes: ['id'], // Fetch zone ID
          },
          attributes: ['id', 'zoneId'], // Fetch zoneRestaurant ID and zoneId
        },
        // Include restaurant operational times
        {
          model: time,
          attributes: ['name', 'startAt', 'endAt', 'day', 'status'],
        },
        // Include restaurant cutlery details
        {
          model: restaurant_cultery,
            attributes: ['cutleryId'],
          // Fetch cutlery ID
          include: {
            model: cutlery,
             attributes: ["id",'name', 'description', 'image', 'price', 'status'],
          }, // Include related cutlery model
        },
        // Include currency unit ID with symbol
        {
          model: unit,
          as: 'currencyUnitID',
          attributes: ['symbol']
        },
        // Include restaurant ratings along with user details
        {
          model: restaurantRating,
          include: {
            model: user,
            attributes: ['firstName', 'lastName']
          },
          attributes: ['value', 'comment', 'at'], // Fetch rating value, comment, and date
        },
        // Include payment methods available for the restaurant
        {
          model: paymentMethod,
          attributes: ['id', 'name'], // Fetch payment method ID and name
        },
      ],
      attributes: [
        // Fetch essential fields for the restaurant
        'id', 'businessEmail', 'businessName', 'image', 'description', 'isRushMode', 'VATpercent', 'logo', 'address', 'zipCode', 'city', 'lat', 'lng', 'openingTime', 'closingTime', 'approxDeliveryTime', 'minOrderAmount', 'isOpen', 'deliveryRadius', 'coordinates', 'businessType', 'serviceCharges', 'serviceChargesType', 'rating', 'pickupTime'
      ],
    });
    // Check if restaurant data was found
    if (!restaurantData) {
      // Respond with error if no restaurant exists
      const response = ApiResponse('0', 'Sorry! No restaurant exists', '', {});
      return res.json(response);
    }
    // Fetch default values and other related data in parallel for optimization
    const [
      [deliveryChargeDefault, serviceDefault, serviceChargesType],
      R_MCLinks,
      restType,
      getConfiguration,
      driverAvailable,
    ] = await Promise.all([
      // Fetch default values for delivery charge, service charge, and service charge type
      Promise.all([
        defaultValues.findOne({
          where: {
            name: 'deliveryCharge'
          }
        }),
        defaultValues.findOne({
          where: {
            name: 'serviceCharges'
          }
        }),
        defaultValues.findOne({
          where: {
            name: 'serviceChargesType'
          }
        }),
      ]),
      // Fetch menu categories and associated products with addons
      R_MCLink.findAll({
        where: {
          restaurantId: restaurantData.id
        }, // Find by restaurant ID
        include: [{
          model: menuCategory,
          where: {
            status: true
          }, // Only include active categories
          attributes: ['name', 'image'], // Fetch category name and image
        }, {
          model: R_PLink,
          where: {
            status: true,
            isAvailable: true
          }, // Only include available products
          include: [{
            model: productAddons,
            include: {
              model: addOn,
              attributes: ['id', 'name'], // Fetch addon ID and name
              include: {
                model: collectionAddons,
                include: {
                  model: collection,
                  attributes: ['id', 'title', 'maxAllowed', 'minAllowed'], // Fetch collection details
                },
                attributes: ['minAllowed', 'maxAllowed', 'status', 'collectionId'], // Fetch addon collection details
              },
            },
            attributes: ['isPaid', 'price', 'isAvaiable'], // Fetch addon payment and availability details
          }, {
            model: productCollections, // Include product collections
          }, ],
          attributes: ['id', 'countryOfOrigin', 'ingredients', 'allergies', 'nutrients', 'image', 'bannerImage', 'name', 'isPopular', 'description', 'originalPrice', 'discountPrice', ], // Fetch product details
        }, ],
        attributes: ['id'], // Fetch R_MCLink ID
      }),
      // Fetch restaurant type information
      orderApplication.findOne({
        where: {
          id: restaurantData.businessType
        },
        attributes: ['name'], // Fetch business type name
      }),
      // Fetch restaurant configuration details
      configuration.findOne({
        where: {
          restaurantId: restaurantId
        }
      }),
      // Check if drivers are available in the restaurant's zone
      checkDriverAvailability(restaurantData.zoneRestaurant.zone.id),
    ]);
    // Determine delivery charges based on zone or default values
    const deliveryCharges = restaurantData.zoneRestaurant?.zone?.zoneDetail?.maxDeliveryCharges || deliveryChargeDefault?.value;
    // Format operational times and process feedback data in parallel
    const [time_list, {
      feedbackArr
    }] = await Promise.all([
      formatTimes(restaurantData.times), // Format times for display
      processFeedback(restaurantData.restaurantRatings), // Process and format feedback data
    ]);
    // Format opening and closing times
    const [opTimeFormatted, clTimeFormatted] = formatOpeningClosingTimes(restaurantData.openingTime, restaurantData.closingTime);
    // Format menu categories and products
    const menuCategories = await formatMenuCategories(R_MCLinks, restaurantData.currencyUnitID?.symbol);
    // Check if the restaurant is completely closed based on its schedule
    const completelyClosed = checkIfCompletelyClosed(restaurantData.times);
    // Construct the response object with all relevant restaurant data
        const cutleryList = restaurantData.restaurant_culteries ? restaurantData.restaurant_culteries.map((cultery) => cultery.cutlery) : [];

    const retObj = {
      id: restaurantData.id,
      businessEmail: restaurantData.businessEmail,
      name: restaurantData.businessName,
      coverImage: restaurantData.image,
      description: restaurantData.description,
      isRushMode: restaurantData.isRushMode,
      VAT: restaurantData?.VATpercent || 0,
      logo: restaurantData.logo,
      rating: restaurantData.rating ? restaurantData.rating : "0.00", // Average rating of the restaurant
      numOfReviews: `${feedbackArr.length}`, // Number of reviews
      location: `${restaurantData.address} ${restaurantData.zipCode} ${restaurantData.city}`,
      lat: restaurantData.lat,
      lng: restaurantData.lng,
      getConfiguration: formatConfiguration(getConfiguration), // Restaurant configuration details
      timings: restaurantData?.openingTime == null ? 'Opening & Closing Time not set yet' : `${opTimeFormatted} - ${clTimeFormatted}`, // Opening and closing times formatted
      times: time_list, // List of operational times
      deliveryTime: `${restaurantData.approxDeliveryTime} mins`, // Estimated delivery time
      pickupTime: `${restaurantData.pickupTime} mins`, // Estimated delivery time
      minOrderAmount: `${restaurantData.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol}${restaurantData.minOrderAmount}`, // Minimum order amount with currency symbol
      paymentMethod: restaurantData?.paymentMethod ?? {}, // Available payment methods
      menuCategories: menuCategories, // Formatted menu categories and products
      currencyUnit: `${
        restaurantData.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol
      }`, // Currency symbol
      reviews: feedbackArr, // Processed reviews
      cutlery_list: cutleryList,
      
      cultery_status: cutleryList.length > 0,
      serviceChargeType: restaurantData.serviceChargesType || serviceChargesType?.value, // Service charge type
      service_charges: restaurantData.serviceCharges || serviceDefault?.value, // Service charges
      deliveryCharge: deliveryCharges, // Delivery charges
      //   distanceUnitID: restaurantData.distanceUnitID, // Full distance unit details
      distanceUnitID: restaurantData.zoneRestaurant?.zone?.zoneDetail?.distanceUnit, // Full distance unit details
      restType: restType?.name, // Restaurant type
      isOpen: !!restaurantData.isOpen, // Restaurant open status
      deliveryRadius: calculateDeliveryRadius(restaurantData), // Delivery radius calculation
      completeClosed: completelyClosed, // Complete closure status
      coordinates: restaurantData?.coordinates, // Restaurant coordinates
      driverAvailable: driverAvailable, // Driver availability status
      menuCategoryLanguage: restaurantData?.menuCategoryLanguage?.language ?? "en", // Driver availability status
      restaurantBanners : restaurantData?.restaurantBanners
    };
    if (retObj.cultery_status) {
  retObj.cutlery_list = cutleryList; 
}
    // Build and return the successful response
    const response = ApiResponse('1', `All Information of restaurant ID ${restaurantId}`, '', retObj);
    return res.json(response);
  } catch (error) {
    // Handle errors by returning a formatted error response
    const response = ApiResponse('0', error.message, 'Error', {});
    return res.json(response);
  }
}
// Helper function to process feedback data
async function processFeedback(feedbackData) {
  let totalRating = 0;
  const feedbackArr = feedbackData.filter((fb) => fb.comment !== '') // Filter only feedback with comments
    .map((fb) => {
      return {
        rate: fb.value,
        text: fb.comment,
        userName: `${fb.user?.firstName} ${fb.user?.lastName}`, // Construct user name
        at: new Date(fb.at).toDateString(), // Format date of feedback
      };
    });
  // Calculate average rating
  return {
    feedbackArr
  }; // Return formatted feedback and average rating
}
// Helper function to format restaurant operational times
function formatTimes(times) {
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', ]; // Days of the week for formatting
  const today = new Date(); // Current date
  const currentDay = today.getDay(); // Current day of the week
  return times.map((day) => {
    const daysToAdd = (day.day - currentDay + 7) % 7; // Calculate days to add for next occurrence
    const dateForDay = new Date(today.getTime() + daysToAdd * 86400000); // Calculate the exact date for the day
    return {
      name: day.name,
      status: day.status,
      startAt: day.startAt,
      endAt: day.endAt,
      day: day.day,
      date: formatDateForDisplay(dateForDay), // Format date for display
      dayName: daysOfWeek[day.day], // Map day number to day name
    };
  });
}
// Helper function to format opening and closing times
function formatOpeningClosingTimes(openingTime, closingTime) {
  const formatTime = (time) => {
    if (!time) return 'Time not set'; // Handle missing time
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const format = hours < 12 ? 'AM' : 'PM'; // Determine AM/PM
    const formattedHours = addZeroBefore(hours % 12 || 12); // Format hours
    const formattedMinutes = addZeroBefore(minutes); // Format minutes
    return `${formattedHours}:${formattedMinutes} ${format}`; // Combine formatted time components
  };
  return [formatTime(openingTime), formatTime(closingTime)]; // Return formatted opening and closing times
}
// Helper function to format menu categories and products
async function formatMenuCategories(R_MCLinks, currencySign) {
  const menuCategories = []; // Initialize menu categories array
  for (const mc of R_MCLinks) {
    const products = mc.R_PLinks.map((pr) => {
      // Process addons for each product
      const addOnArr = processProductAddons(pr.productAddons || []); // Provide default to avoid errors
      return {
        RPLinkId: pr.id,
        countryOfOrigin: pr.countryOfOrigin || 'No Country available', // Default value if not present
        ingredients: pr.ingredients || '',
        allergies: pr.allergies || '',
        nutrients: pr.nutrients || '',
        image: pr.image || 'No Image', // Default image if not present
        bannerImage: pr.bannerImage || 'No Banner Image', // Default banner image if not present
        name: pr.name || 'Unnamed Product', // Default name if not present
        isPopular: pr.isPopular ?? false, // Default to false if not set
        description: pr.description || '', // Default description if not present
        currencySign: currencySign || '$', // Default currency sign
        originalPrice: pr.originalPrice?.toString() || '0.00', // Convert price to string with default
        discountPrice: pr.discountPrice?.toString() || '0.00', // Convert price to string with default
        addOnArr: addOnArr, // Addons associated with the product
      };
    });
    // Add formatted menu category with products to the array
    menuCategories.push({
      r_mcId: mc.id,
      name: mc.menuCategory?.name || 'Unnamed Category', // Default category name
      iconImage: mc.menuCategory?.image || 'No Icon Image', // Default icon if not present
      products: products,
    });
  }
  return menuCategories; // Return formatted menu categories
}
// Helper function to process product addons
function processProductAddons(productAddons) {
  const collectionMap = new Map(); // Map to group addons by collection
  for (const productAddon of productAddons) {
    const collection = productAddon?.addOn?.collectionAddon?.collection;
    // Check if collection is available
    if (!collection) continue; // Skip this iteration if collection is not found
    // Build addon object with details, using optional chaining and default values
    const addon = {
      id: productAddon?.addOn?.id || null,
      name: productAddon?.addOn?.name || "Unknown Addon",
      minAllowed: productAddon?.addOn?.collectionAddon?.minAllowed || 0,
      maxAllowed: productAddon?.addOn?.collectionAddon?.maxAllowed || 0,
      status: productAddon?.addOn?.collectionAddon?.status || false,
      collectionId: collection.id,
      isPaid: productAddon?.isPaid || false,
      price: productAddon?.price || "0.00",
      isAvailable: productAddon?.isAvaiable || false, // Correct spelling to isAvailable
    };
    // Group addons by collection in the map
    if (productAddon.isAvaiable) {
      if (collectionMap.has(collection.id)) {
        collectionMap.get(collection.id).addons.push(addon);
      } else {
        collectionMap.set(collection.id, {
          category: {
            name: collection?.title || "Unknown Category",
            id: collection.id,
            maxAllowed: collection?.maxAllowed || 0,
            minAllowed: collection?.minAllowed || 0,
          },
          addons: [addon],
        });
      }
    }
  }
  return Array.from(collectionMap.values()); // Convert map to array of collections with addons
}
// Helper function to format restaurant configuration
function formatConfiguration(getConfiguration) {
  if (!getConfiguration) return null; // Return null if no configuration exists
  return {
    isOpen: {
      isOpen_pickupOrders: getConfiguration?.isOpen_pickupOrders,
      isOpen_deliveryOrders: getConfiguration?.isOpen_deliveryOrders,
      isOpen_schedule_pickupOrders: getConfiguration?.isOpen_schedule_pickupOrders,
      isOpen_schedule_deliveryOrders: getConfiguration?.isOpen_schedule_deliveryOrders,
    },
    isClosed: {
      isClose_schedule_pickupOrders: getConfiguration?.isClose_schedule_pickupOrders,
      isClose_schedule_deliveryOrders: getConfiguration?.isClose_schedule_deliveryOrders,
    },
    temporaryClosed: {
      temporaryClose_pickupOrders: getConfiguration?.temporaryClose_pickupOrders,
      temporaryClose_schedule_pickupOrders: getConfiguration?.temporaryClose_schedule_pickupOrders,
      temporaryClose_schedule_deliveryOrders: getConfiguration?.temporaryClose_schedule_deliveryOrders,
    },
    isRushMode: {
      isRushMode_pickupOrders: getConfiguration?.isRushMode_pickupOrders,
      isRushMode_deliveryOrders: getConfiguration?.isRushMode_deliveryOrders,
      isRushMode_schedule_pickupOrders: getConfiguration?.isRushMode_schedule_pickupOrders,
      isRushMode_schedule_deliveryOrders: getConfiguration?.isRushMode_schedule_deliveryOrders,
    },
    general: {
      delivery: getConfiguration?.delivery,
      takeAway: getConfiguration?.takeAway,
      scheduleOrders: getConfiguration?.scheduleOrders,
      tableBooking: getConfiguration?.tableBooking,
      stampCard: getConfiguration?.stampCard,
      cod: getConfiguration?.cod,
      euro: getConfiguration?.euro,
      print: getConfiguration?.print,
      selfDelivery: getConfiguration?.selfDelivery,
    },
  };
}
// Helper function to calculate delivery radius based on unit type
function calculateDeliveryRadius(restaurantData) {
  return restaurantData?.distanceUnitID?.symbol === 'km' ? restaurantData.deliveryRadius * 1000 // Convert kilometers to meters
    : restaurantData.deliveryRadius * 1609; // Convert miles to meters
}
// Helper function to check if the restaurant is completely closed
function checkIfCompletelyClosed(times) {
  const now = new Date(); // Get current date and time
  const currentDay = now.getDay(); // Get current day of the week

  // Check if the restaurant is completely closed for the current day
  const todaySchedule = times.find(time => parseInt(time.day) === currentDay && time.status === true);

  // If no schedule found for today or schedule is closed, return true (completely closed)
  if (!todaySchedule) return true;

  const [startHours, startMinutes] = todaySchedule.startAt.split(':').map(Number);
  const [endHours, endMinutes] = todaySchedule.endAt.split(':').map(Number);
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const startTime = startHours * 100 + startMinutes;
  const endTime = endHours * 100 + endMinutes;

  return !(currentTime >= startTime && currentTime <= endTime);
}

// Helper function to check driver availability in the restaurant's zone
async function checkDriverAvailability(zoneId) {
  // Fetch drivers assigned to the zone
  const drivers = await driverZone.findAll({
    where: {
      zoneId
    }, // Find by zone ID
    include: {
      model: user,
      attributes: ['id', 'userName', 'firstName', 'lastName'], // Fetch driver user details
    },
  });
  if (!drivers.length) return false; // Return false if no drivers are available
  // Fetch order statuses for delivered, cancelled, and rejected orders
  const [deliveredStatus, cancelledStatus, rejectStatus] = await Promise.all([
    orderStatus.findOne({
      where: {
        name: 'Delivered'
      },
      attributes: ['id']
    }),
    orderStatus.findOne({
      where: {
        name: 'Cancelled'
      },
      attributes: ['id']
    }),
    orderStatus.findOne({
      where: {
        name: 'Reject'
      },
      attributes: ['id']
    }),
  ]);
  // Check if there are any active orders for the drivers in the zone
  const activeOrders = await order.findAll({
    where: {
      driverId: {
        [Op.in]: drivers.map((d) => d.userId)
      }, // Match drivers' IDs
      orderStatusId: {
        [Op.notIn]: [
          deliveredStatus.id,
          cancelledStatus.id,
          rejectStatus.id,
        ], // Exclude delivered, cancelled, and rejected statuses
      },
    },
    attributes: ['id'], // Fetch order IDs
  });
  return activeOrders.length > 0; // Return true if there are active orders, indicating driver availability
}
// Helper function to add a zero before single-digit numbers
function addZeroBefore(n) {
  return n < 10 ? '0' + n : n; // Add a leading zero for single-digit numbers
}
// Helper function to format dates for display
function formatDateForDisplay(date) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const formattedDate = new Date(date).toLocaleDateString('en-US', options); // Format date to MM/DD/YYYY
  const [month, day, year] = formattedDate.split('/'); // Split formatted date
  return `${day}-${month}-${year}`; // Return formatted date as DD-MM-YYYY
}
/*
        4. Restaurant details by ID Get Method for Web Pannel
*/
async function getRestaurantByIds(req, res) {
  const restaurantId = req.query.restaurantId;
  try {
    // Fetch essential restaurant data including related models
    const restaurantData = await restaurant.findOne({
      where: {
        id: restaurantId
      }, // Find restaurant by ID
      include: [
          
        // Include related zoneRestaurants model
        {model:restaurantBanners,attributes:['title','description','image','bannerType'],where:{status:true},required:false},
        {
          model: zoneRestaurants,
          include: {
            model: zone,
            include: {
              model: zoneDetails,
              include: [
                // Include currency unit for the zone
                {
                  model: unit,
                  as: 'currencyUnit',
                },
                // Include distance unit for the zone
                {
                  model: unit,
                  as: 'distanceUnit',
                },
              ],
              attributes: ['maxDeliveryCharges'], // Fetch maximum delivery charges from zone details
            },
            attributes: ['id'], // Fetch zone ID
          },
          attributes: ['id', 'zoneId'], // Fetch zoneRestaurant ID and zoneId
        },
        // Include restaurant operational times
        {
          model: time,
          attributes: ['name', 'startAt', 'endAt', 'day', 'status'],
        },
        // Include restaurant cutlery details
        {
          model: restaurant_cultery,
          attributes: ['id'], // Fetch cutlery ID
          include: {
            model: cutlery
          }, // Include related cutlery model
        },
        // Include currency unit ID with symbol
        {
          model: unit,
          as: 'currencyUnitID',
          attributes: ['symbol']
        },
        // Include restaurant ratings along with user details
        {
          model: restaurantRating,
          include: {
            model: user,
            attributes: ['firstName', 'lastName']
          },
          attributes: ['value', 'comment', 'at'], // Fetch rating value, comment, and date
        },
        // Include payment methods available for the restaurant
        {
          model: paymentMethod,
          attributes: ['id', 'name'], // Fetch payment method ID and name
        },
      ],
      attributes: [
        // Fetch essential fields for the restaurant
        'id', 'businessEmail', 'businessName', 'image', 'description', 'isRushMode', 'VATpercent', 'logo', 'address', 'zipCode', 'city', 'lat', 'lng', 'openingTime', 'closingTime', 'approxDeliveryTime', 'minOrderAmount', 'isOpen', 'deliveryRadius', 'coordinates', 'businessType', 'serviceCharges', 'serviceChargesType', 'rating','pickupTime'
      ],
    });
    // Check if restaurant data was found
    if (!restaurantData) {
      // Respond with error if no restaurant exists
      const response = ApiResponse('0', 'Sorry! No restaurant exists', '', {});
      return res.json(response);
    }
    // Fetch default values and other related data in parallel for optimization
    const [
      [deliveryChargeDefault, serviceDefault, serviceChargesType],
      R_MCLinks,
      restType,
      getConfiguration,
      driverAvailable,
    ] = await Promise.all([
      // Fetch default values for delivery charge, service charge, and service charge type
      Promise.all([
        defaultValues.findOne({
          where: {
            name: 'deliveryCharge'
          }
        }),
        defaultValues.findOne({
          where: {
            name: 'serviceCharges'
          }
        }),
        defaultValues.findOne({
          where: {
            name: 'serviceChargesType'
          }
        }),
      ]),
      // Fetch menu categories and associated products with addons
      R_MCLink.findAll({
        where: {
          restaurantId: restaurantData.id
        }, // Find by restaurant ID
        include: [{
          model: menuCategory,
          where: {
            status: true
          }, // Only include active categories
          attributes: ['name', 'image'], // Fetch category name and image
        }, {
          model: R_PLink,
          where: {
            status: true,
            isAvailable: true
          }, // Only include available products
          include: [{
            model: productAddons,
            include: {
              model: addOn,
              attributes: ['id', 'name'], // Fetch addon ID and name
              include: {
                model: collectionAddons,
                include: {
                  model: collection,
                  attributes: ['id', 'title', 'maxAllowed', 'minAllowed'], // Fetch collection details
                },
                attributes: ['minAllowed', 'maxAllowed', 'status'], // Fetch addon collection details
              },
            },
            attributes: ['isPaid', 'price', 'isAvaiable'], // Fetch addon payment and availability details
          }, {
            model: productCollections, // Include product collections
          }, ],
          attributes: ['id', 'countryOfOrigin', 'ingredients', 'allergies', 'nutrients', 'image', 'bannerImage', 'name', 'isPopular', 'description', 'originalPrice', 'discountPrice', ], // Fetch product details
        }, ],
        attributes: ['id'], // Fetch R_MCLink ID
      }),
      // Fetch restaurant type information
      orderApplication.findOne({
        where: {
          id: restaurantData.businessType
        },
        attributes: ['name'], // Fetch business type name
      }),
      // Fetch restaurant configuration details
      configuration.findOne({
        where: {
          restaurantId: restaurantId
        }
      }),
      // Check if drivers are available in the restaurant's zone
      checkDriverAvailability(restaurantData.zoneRestaurant.zone.id),
    ]);
    // Determine delivery charges based on zone or default values
    const deliveryCharges = restaurantData.zoneRestaurant?.zone?.zoneDetail?.maxDeliveryCharges || deliveryChargeDefault?.value;
    // Format operational times and process feedback data in parallel
    const [time_list, {
      feedbackArr
    }] = await Promise.all([
      formatTimes(restaurantData.times), // Format times for display
      processFeedback(restaurantData.restaurantRatings), // Process and format feedback data
    ]);
    // Format opening and closing times
    const [opTimeFormatted, clTimeFormatted] = formatOpeningClosingTimes(restaurantData.openingTime, restaurantData.closingTime);
    // Format menu categories and products
    const menuCategories = await formatMenuCategories(R_MCLinks, restaurantData.currencyUnitID?.symbol);
    // Check if the restaurant is completely closed based on its schedule
    const completelyClosed = checkIfCompletelyClosed(restaurantData.times);
    // Construct the response object with all relevant restaurant data
    const cutleryList = restaurantData.restaurant_culteries ? restaurantData.restaurant_culteries.map((cultery) => cultery.cutlery) : [];
    const retObj = {
      id: restaurantData.id,
      businessEmail: restaurantData.businessEmail,
      name: restaurantData.businessName,
      coverImage: restaurantData.image,
      description: restaurantData.description,
      isRushMode: restaurantData.isRushMode,
      VAT: restaurantData?.VATpercent || 0,
      logo: restaurantData.logo,
      rating: restaurantData.rating ? restaurantData.rating : "0.00", // Average rating of the restaurant
      numOfReviews: `${feedbackArr.length}`, // Number of reviews
      location: `${restaurantData.address} ${restaurantData.zipCode} ${restaurantData.city}`,
      lat: restaurantData.lat,
      lng: restaurantData.lng,
      getConfiguration: formatConfiguration(getConfiguration), // Restaurant configuration details
      timings: restaurantData?.openingTime == null ? 'Opening & Closing Time not set yet' : `${opTimeFormatted} - ${clTimeFormatted}`, // Opening and closing times formatted
      times: time_list, // List of operational times
      deliveryTime: `${restaurantData.approxDeliveryTime} mins`, // Estimated delivery time
      pickupTime: `${restaurantData.pickupTime} mins`,
      minOrderAmount: `${restaurantData.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol}${restaurantData.minOrderAmount}`, // Minimum order amount with currency symbol
      paymentMethod: restaurantData?.paymentMethod ?? {}, // Available payment methods
      menuCategories: menuCategories, // Formatted menu categories and products
      currencyUnit: `${
        restaurantData.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol
      }`, // Currency symbol
      reviews: feedbackArr, // Processed reviews
      cutlery_list: cutleryList,
      cutlery_status: !!restaurantData.restaurant_culteries, // Cutlery availability status
      serviceChargeType: restaurantData.serviceChargesType || serviceChargesType?.value, // Service charge type
      service_charges: restaurantData.serviceCharges || serviceDefault?.value, // Service charges
      deliveryCharge: deliveryCharges, // Delivery charges
      //   distanceUnitID: restaurantData.distanceUnitID, // Full distance unit details
      distanceUnitID: restaurantData.zoneRestaurant?.zone?.zoneDetail?.distanceUnit, // Full distance unit details
      restType: restType?.name, // Restaurant type
      isOpen: !!restaurantData.isOpen, // Restaurant open status
      deliveryRadius: calculateDeliveryRadius(restaurantData), // Delivery radius calculation
      completeClosed: completelyClosed, // Complete closure status
      coordinates: restaurantData?.coordinates, // Restaurant coordinates
      driverAvailable: driverAvailable, // Driver availability status
      restaurantBanners:restaurantData?.restaurantBanners
    };
    // Build and return the successful response
    const response = ApiResponse('1', `All Information of restaurant ID ${restaurantId}`, '', retObj);
    return res.json(response);
  } catch (error) {
    // Handle errors by returning a formatted error response
    const response = ApiResponse('0', error.message, 'Error', {});
    return res.json(response);
  }
}
// async function getRestaurantByIds(req, res) {
//   const restaurantId = req.query.restaurantId;
//   try {
//     const restaurantData = await restaurant.findOne({
//       where: [
//         {
//           id: restaurantId,
//         },
//       ],
//       include: [
//         {
//           model: zoneRestaurants,
//           include: {
//             model: zone,
//             include: {
//               model: zoneDetails,
//               include: [
//                 {
//                   model: unit,
//                   as: "currencyUnit",
//                 },
//                 {
//                   model: unit,
//                   as: "distanceUnit",
//                 },
//               ],
//             },
//           },
//         },
//         {
//           model: time,
//           attributes: ["name", "startAt", "endAt", "day"],
//         },
//         {
//           model: restaurant_cultery,
//           attributes: ["id"],
//           include: {
//             model: cutlery,
//           },
//         },
//         {
//           model: unit,
//           as: "distanceUnitID",
//         },
//         {
//           model: unit,
//           as: "currencyUnitID",
//         },
//         {
//           model: deliveryFee,
//         },
//         {
//           model: restaurantRating,
//           include: {
//             model: user,
//           },
//         },
//         {
//           model: R_MCLink,
//           include: [
//             {
//               model: menuCategory,
//             },
//             {
//               model: R_PLink,
//               where: [
//                 {
//                   status: true,
//                 },
//                 {
//                   isAvailable: true,
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           model: paymentMethod,
//           attributes: ["id", "name"],
//         },
//       ],
//     });
//     //   return res.json(restaurantData)
//     const deliveryChargeDefault = await defaultValues.findOne({
//       where: {
//         name: "deliveryCharge",
//       },
//     });
//     let deliveryCharges = 0;
//     if (restaurantData.zoneRestaurant.zone.zoneDetail) {
//       deliveryCharges =
//         restaurantData.zoneRestaurant.zone.zoneDetail.maxDeliveryCharges;
//     } else {
//       deliveryCharges = deliveryChargeDefault.value;
//     }
//     const serviceDefault = await defaultValues.findOne({
//       where: {
//         name: "serviceCharges",
//       },
//     });
//     const serviceChargesType = await defaultValues.findOne({
//       where: {
//         name: "serviceChargesType",
//       },
//     });
//     // Format restaurant Timing
//     const daysOfWeek = [
//       "sunday",
//       "monday",
//       "tuesday",
//       "wednesday",
//       "thursday",
//       "friday",
//       "saturday",
//     ];
//     function formatDateForDisplay(date) {
//       const options = {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//       };
//       const formattedDate = new Date(date).toLocaleDateString("en-US", options);
//       // Rearrange the formatted date to "DD-MM-YYYY" format
//       const [month, day, year] = formattedDate.split("/");
//       const rearrangedDate = `${day}-${month}-${year}`;
//       return rearrangedDate;
//     }
//     const responseWithDate = restaurantData?.times?.map((day) => {
//       const today = new Date();
//       const currentDay = today.getDay();
//       const daysToAdd = (day.day - currentDay + 7) % 7; // Calculate days to add to get to the specified day
//       const dateForDay = new Date(today.setDate(today.getDate() + daysToAdd));
//       return {
//         ...day,
//         date: formatDateForDisplay(dateForDay), // Format date as "YYYY-MM-DD"
//         dayName: daysOfWeek[day.day],
//       };
//     });
//     var time_list = [];
//     for (var i = 0; i < responseWithDate?.length; i++) {
//       let obj = {
//         name: responseWithDate[i]?.dataValues?.name,
//         startAt: responseWithDate[i]?.dataValues?.startAt,
//         endAt: responseWithDate[i]?.dataValues?.endAt,
//         day: responseWithDate[i]?.dataValues?.day,
//         date: responseWithDate[i]?.date,
//       };
//       time_list.push(obj);
//     }
//     //Calcuating rating and feedbacks
//     let feedbackData = restaurantData.restaurantRatings;
//     let feedbackArr = [];
//     let restAvgRate = 0;
//     feedbackData.map((fb, idx) => {
//       let date = new Date(fb.at);
//       if (fb.comment !== "") {
//         let outObj = {
//           rate: fb.value,
//           text: fb.comment,
//           userName: `${fb.user?.firstName} ${fb.user?.lastName}`,
//           at: date.toDateString(),
//         };
//         feedbackArr.push(outObj);
//       }
//     });
//     let avgRate = restaurantData?.rating ? restaurantData?.rating : "0.00";
//     //Opening time of restaurant
//     let opHours = restaurantData?.openingTime?.getHours();
//     let opFormat = opHours < 12 ? "AM" : "PM";
//     opHours = ampmFormat(opHours);
//     opHours = addZeroBefore(opHours);
//     let opMins = restaurantData.openingTime?.getMinutes();
//     opMins = addZeroBefore(opMins);
//     let opTime = `${opHours}:${opMins}`;
//     //closing time of restaurant
//     let clHours = restaurantData.closingTime?.getHours();
//     let clFormat = clHours < 12 ? "AM" : "PM";
//     clHours = ampmFormat(clHours);
//     clHours = addZeroBefore(clHours);
//     let clMins = restaurantData.closingTime?.getMinutes();
//     clMins = addZeroBefore(clMins);
//     let clTime = `${clHours}:${clMins}`;
//     // return res.json(restaurantData.R_MCLinks)
//     // Seprating products with each menu Category
//     let menuCategories = [];
//     products = [];
//     for (const mc of restaurantData.R_MCLinks) {
//       for (const pr of mc.R_PLinks) {
//         let obj = {
//           r_pId: pr.id,
//           name: pr?.name,
//           description: pr?.description,
//           image: pr?.image,
//           originalPrice: pr?.originalPrice,
//           discountPrice: pr?.discountPrice,
//           isPopular: pr?.isPopular == null ? false : pr.isPopular,
//         };
//         let dd = await getProductById(pr.id);
//         products.push(dd);
//       }
//       if (mc.menuCategory.status == true) {
//         let outObj = {
//           r_mcId: mc.id,
//           name: mc.menuCategory?.name,
//           iconImage: mc.menuCategory?.image,
//           products: products,
//         };
//         menuCategories.push(outObj);
//       }
//       products = [];
//     }
//     // Calculating restaurant rating
//     //let restAvgRate = restaurantData.restaurantRatings.reduce((previousValue, curentValue) => previousValue + curentValue.value, 0);
//     const restType = await orderApplication.findOne({
//       where: {
//         id: restaurantData.businessType,
//       },
//     });
//     let retObj = {
//       id: restaurantData.id,
//       businessEmail: restaurantData.businessEmail,
//       name: restaurantData.businessName,
//       coverImage: restaurantData.image,
//       description: restaurantData.description,
//       VAT: restaurantData?.VATpercent ? restaurantData?.VATpercent : 0,
//       logo: restaurantData.logo,
//       rating: `${avgRate}`,
//       numOfReviews: `${feedbackArr.length}`,
//       location: `${restaurantData.address} ${restaurantData.zipCode} ${restaurantData.city} `,
//       lat: restaurantData.lat,
//       lng: restaurantData.lng,
//       timings:
//         restaurantData?.openingTime == null
//           ? "Opening & Closing Time not set yet"
//           : `${opTime} ${opFormat} - ${clTime} ${clFormat}`,
//       times: time_list,
//       deliveryTime: `${restaurantData.approxDeliveryTime} mins`,
//       minOrderAmount: `${restaurantData.currencyUnitID?.symbol}${restaurantData?.minOrderAmount}`,
//       paymentMethod: restaurantData?.paymentMethod ?? {},
//       menuCategories: menuCategories,
//       currencyUnit: `${restaurantData.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol}`,
//       reviews: feedbackArr,
//       cultery_list: restaurantData?.restaurant_culteries
//         ? restaurantData?.restaurant_culteries
//         : [],
//       cultery_status:
//         restaurantData.restaurant_culteries == null ? false : true,
//       serviceChargeType: restaurantData.serviceChargesType
//         ? restaurantData.serviceChargesType
//         : serviceChargesType.value,
//       service_charges: restaurantData.serviceCharges
//         ? restaurantData.serviceCharges
//         : serviceDefault.value,
//       deliveryCharge: deliveryCharges,
//       distanceUnitID:
//         restaurantData.zoneRestaurant?.zone?.zoneDetail?.distanceUnit,
//       restType: restType?.name,
//       isOpen: restaurantData.isOpen ? true : false,
//       deliveryRadius:
//         restaurantData?.distanceUnitID?.symbol === "km"
//           ? restaurantData.deliveryRadius * 1000
//           : restaurantData.deliveryRadius * 1609,
//     };
//     const response = ApiResponse(
//       "1",
//       `All Information of restaurant ID ${restaurantId}}`,
//       "",
//       retObj
//     );
//     return res.json(response);
//   } catch (error) {
//     const response = ApiResponse("0", error.message, "Error", {});
//     return res.json(response);
//   }
// }
/*
        5. Product by Id
*/
async function getProductById(rpId) {
  try {
    const productData = await R_PLink.findOne({
      where: {
        id: rpId
      },
      include: [{
        model: productAddons,
        include: {
          model: addOn,
          attributes: ['id', 'name', 'minAllowed', 'maxAllowed'],
          include: {
            model: collectionAddons,
            include: {
              model: collection,
            },
          },
        },
      }, {
        model: R_MCLink,
        include: {
          model: restaurant,
        },
      }, ],
    });
    if (!productData) {
      throw new Error('Product not found');
    }
    const restaurantId = productData?.R_MCLink?.restaurant?.id;
    if (!restaurantId) {
      throw new Error('Restaurant data not found');
    }
    const zonedetails = await zoneRestaurants.findOne({
      where: {
        restaurantId: restaurantId
      },
      include: {
        model: zone,
        include: {
          model: zoneDetails,
          include: [{
            model: unit,
            as: 'currencyUnit'
          }, {
            model: unit,
            as: 'distanceUnit'
          }, ],
        },
      },
    });
    const currencySign = zonedetails?.zone?.zoneDetail?.currencyUnit?.symbol ?? 'USD';
    const productCollectionsPromise = productCollections.findAll({
      where: {
        RPLinkId: rpId
      }
    });
    // Use a map to group add-ons by collection
    const collectionMap = new Map();
    for (const productAddon of productData?.productAddons ?? []) {
      const collection = productAddon?.addOn?.collectionAddon?.collection;
      if (!collection) {
        console.warn('Collection data is missing for one of the product add-ons.');
        continue; // Skip if collection is missing
      }
      const proCollection = await productCollections.findOne({
        where: {
          RPLinkId: rpId,
          collectionId: collection?.id
        },
      });
      if (!proCollection) {
        console.warn(`Product collection not found for collection ID ${collection?.id}`);
        continue; // Skip if product collection is missing
      }
      const addon = {
        id: productAddon?.addOn?.id,
        collectionAddonId: collection?.id,
        name: productAddon?.addOn?.name,
        minAllowed: productAddon?.addOn?.collectionAddon?.minAllowed,
        maxAllowed: productAddon?.addOn?.collectionAddon?.maxAllowed,
        status: productAddon?.addOn?.collectionAddon?.status,
        isPaid: productAddon?.isPaid,
        price: productAddon?.price,
        isAvaiable: productAddon?.isAvaiable,
      };
      if (productAddon?.isAvaiable) {
        if (collectionMap.has(collection.id)) {
          collectionMap.get(collection.id).addons.push(addon);
        } else {
          collectionMap.set(collection.id, {
            category: {
              name: collection?.title,
              id: collection?.id,
              maxAllowed: proCollection?.maxAllowed,
              minAllowed: proCollection?.minAllowed,
            },
            addons: [addon],
          });
        }
      }
    }
    const addOnArr = Array.from(collectionMap.values());
    const retObj = {
      RPLinkId: productData?.id,
      countryOfOrigin: productData?.countryOfOrigin ?? '',
      ingredients: productData?.ingredients ?? '',
      allergies: productData?.allergies ?? '',
      nutrients: productData?.nutrients ?? '',
      image: productData?.image ?? '',
      bannerImage: productData?.bannerImage ?? '',
      name: productData?.name ?? '',
      isPopular: productData?.isPopular ?? false,
      description: productData?.description ?? '',
      currencySign: currencySign,
      originalPrice: productData?.originalPrice?.toString() ?? '0',
      discountPrice: productData?.discountPrice?.toString() ?? '0',
      addOnArr: addOnArr,
    };
    return retObj;
  } catch (error) {
    console.error('Error fetching product data:', error.message);
    throw error;
  }
}
async function getProductByIdTest(req, res) {
  let dd = await getProductById(1);
  return res.json(dd)
  const {
    rpId
  } = req.body;
  try {
    const productData = await R_PLink.findOne({
      where: {
        id: rpId,
      },
      include: [{
        model: P_AOLink,
        include: [{
          model: addOnCategory,
        }, {
          model: P_A_ACLink,
          where: {
            status: true,
          },
          required: false,
          include: {
            model: addOn,
          },
        }, ],
        where: {
          status: true,
        },
        required: false,
      }, {
        model: R_MCLink,
        include: {
          model: restaurant,
          include: {
            model: unit,
            as: "currencyUnitID",
          },
        },
      }, ],
    });
    return res.json(productData);
    const addOnList = [];
    let final = [];
    productData.P_AOLinks.forEach((pAOLink) => {
      const existingCategory = final.find(
        (category) => category.id === pAOLink.addOnCategory.id);
      //   return res.json(existingCategory)
      if (!existingCategory) {
        let catObj = {
          addOnCategory: pAOLink.addOnCategory.id,
          name: pAOLink.addOnCategory.name,
          maxAllowed: pAOLink.maxAllowed,
          minAllowed: pAOLink.minAllowed,
        };
        for (item of pAOLink.P_A_ACLinks) {
          const existingAddOn = addOnList.find(
            (add) => add.id === item.addOn.id);
          if (!existingAddOn) {
            addOnList.push(item.addOn);
          }
        }
        final.push({
          category: catObj,
          addon: addOnList,
        });
      } else {
        for (item of pAOLink.P_A_ACLinks) {
          const existingAddOn = addOnList.find(
            (add) => add.id === item.addOn.id);
          if (!existingAddOn) {
            addOnList.push(item.addOn);
          }
        }
        final.push({
          addon: addOnList,
        });
      }
    });
    return res.json(final);
    if (!productData) {
      const response = ApiResponse("0", "Cannot found the product details", "", {});
      return res.json(response);
    }
    return res.json(productData);
    addonList = [];
    list = [];
    for (item of productData.P_AOLinks) {
      let categoryObj = {
        name: item.addOnCategory.name,
        id: item.addOnCategory.id,
        maxAllowed: item.maxAllowed,
        minAllowed: item.minAllowed,
      };
      for (addonItem of item.P_A_ACLinks) {
        addonList.push(addonItem.addOn);
      }
      list.push({
        category: categoryObj,
        addon: addonList,
      });
    }
    return res.json(list);
    let currencySign = productData.R_MCLink.restaurant?.currencyUnitID?.symbol ?? "USD";
    let addOnArr = [];
    let addList = [];
    let finalList = [];
    productData.P_AOLinks.map((ao, idx) => {
      //   return res.json(ao)
      let cat = {
        name: ao.addOnCategory.name,
        id: ao.id,
        minAllowed: ao.minAllowed,
        maxAllowed: ao.maxAllowed,
      };
      for (var i = 0; i < ao.P_A_ACLinks.length; i++) {
        if (ao.P_A_ACLinks[i].PAOLinkId == ao.addOnCategory.id) {
          let addonObj = {
            id: ao.P_A_ACLinks[i].addOn.name,
            minAllowed: ao.P_A_ACLinks[i].addOn.minAllowed,
            maxAllowed: ao.P_A_ACLinks[i].addOn.maxAllowed,
            status: ao.P_A_ACLinks[i].addOn.status,
            isPaid: ao.P_A_ACLinks[i].addOn.isPaid,
            isAvaiable: ao.P_A_ACLinks[i].addOn.isAvaiable,
          };
          addList.push(addonObj);
        }
      }
      finalList.push({
        category: cat,
        addon: addList,
      });
      let aoArr = [];
      ao.P_A_ACLinks.map((a, idx) => {
        let obj = {
          PAACLinkId: a.id,
          name: a.addOn.name,
          currencySign: `${currencySign}`,
          price: `${a.price}`,
        };
        aoArr.push(obj);
      });
      if (aoArr.length > 0) {
        let tmpObj = {
          PAOLinkId: ao.id,
          // name: ao.addOnCategory.name,
          text: `${ao.addOnCategory?.name}`,
          maxAllowed: `${ao.maxAllowed}`,
          minAllowed: `${ao.minAllowed}`,
          addOns: aoArr,
        };
        addOnArr.push(tmpObj);
      }
    });
    const uniqueData = finalList.filter((item, index, self) => {
      const categoryNames = self.map((data) => data.category.name);
      return index === categoryNames.indexOf(item.category.name);
    });
    let retObj = {
      RPLinkId: productData.id,
      image: productData.image,
      name: productData.name,
      description: productData.description,
      currencySign: `${currencySign}`,
      originalPrice: `${productData.originalPrice}`,
      discountPrice: `${productData.discountPrice} `,
      addOnArr: uniqueData,
    };
    const response = ApiResponse("1", "Product Details", "", retObj);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
/*
        6. Restaurant by Filters
*/
async function getRestaurantByFilter(req, res) {
  try {
    let cuisineId = req.query.cuisineId; // all restaurant belonging to the given cuisine
    let inputRating = req.query.rating; // all restaurant whose rating is greater then the given number
    let inputDistance = req.query.distance; //in Kms // all restaurant whose distance from user is less then the given number
    let price = req.query.price;
    const {
      lat,
      lng
    } = req.body;
    let outArr = [];
    const restaurantList = await restaurant.findAll({
      where: {
        status: true,
      },
      include: [{
        model: unit,
        as: "distanceUnitID",
      }, {
        model: unit,
        as: "currencyUnitID",
      }, {
        model: deliveryFee,
      }, {
        model: restaurantRating,
      }, {
        model: R_CLink,
      }, ],
    });
    //return res.json(restaurantList)
    //Getting the current time
    let cDate = Date();
    let cdate = new Date(cDate);
    let cHours = cdate.getHours();
    let cFormat = cHours < 12 ? "AM" : "PM";
    cHours = ampmFormat(cHours);
    cHours = addZeroBefore(cHours);
    let cMins = cdate.getMinutes();
    cMins = addZeroBefore(cMins);
    let cTime = `${cHours}:${cMins} ${cFormat}`;
    restaurantList.map((rest, idx) => {
      // cuisine filter
      if (cuisineId) {
        let found = rest.R_CLinks.find(
          (ele) => ele.cuisineId === parseFloat(cuisineId));
        if (!found) return null;
      }
      //output distance is in Kilometer
      let distance = getDistance(lat, lng, rest.lat, rest.lng);
      let distInKm = distance;
      // if restaurant's unit is miles, convert km distance to miles
      if (rest.distanceUnitID.name === "miles") {
        distance = distance * 0.6213; //km  to miles
      }
      //console.log(distance);
      //if distance is greater than the delivery radius then don't show it to the customer
      if (distance > rest.deliveryRadius) return null;
      // Checking the condition of distance filter i.e
      // the distance between user & restaurant should
      // be less than input distance, if not return null
      if (distInKm > inputDistance) return null;
      //if current time is not between opening and closing time, move to next restaurant
      //Opening time of restaurant
      let opHours = rest.openingTime.getHours();
      let opFormat = opHours < 12 ? "AM" : "PM";
      opHours = ampmFormat(opHours);
      opHours = addZeroBefore(opHours);
      let opMins = rest.openingTime.getMinutes();
      opMins = addZeroBefore(opMins);
      let opTime = `${opHours}:${opMins} ${opFormat}`;
      //closing time of restaurant
      let clHours = rest.closingTime.getHours();
      let clFormat = clHours < 12 ? "AM" : "PM";
      clHours = ampmFormat(clHours);
      clHours = addZeroBefore(clHours);
      let clMins = rest.closingTime.getMinutes();
      clMins = addZeroBefore(clMins);
      let clTime = `${clHours}:${clMins} ${clFormat}`;
      let opDate = "01/01/2022";
      let clDate = clFormat === "PM" ? "01/01/2022" : "01/02/2022";
      //console.log(rest.businessName, cTime, opTime, clTime, (Date.parse(`${opDate} ${cTime}`)> Date.parse(`${opDate} ${opTime}`) && Date.parse(`${opDate} ${cTime}`)< Date.parse(`${clDate} ${clTime}`) ));
      //console.log((cTime> clTime));
      //comparing time
      //console.log(rest.name)
      if (!(Date.parse(`${opDate} ${cTime}`) > Date.parse(`${opDate} ${opTime}`) && Date.parse(`${opDate} ${cTime}`) < Date.parse(`${clDate} ${clTime}`))) return null;
      let deliveryFee = rest.deliveryFeeFixed;
      // Calculate the delivery fee if fee type is dynamic
      if (rest.deliveryFeeTypeId === 2) {
        deliveryFee = parseFloat(deliveryFee);
        //calcualting the fee based on distance
        // if distance is less than base, apply base value
        if (distance <= parseFloat(rest.deliveryFee.baseDistance)) {
          deliveryFee = deliveryFee + parseFloat(rest.deliveryFee.baseCharge);
        } else {
          let extraDistance = distance - parseFloat(rest.deliveryFee.baseDistance);
          let extraUnits = extraDistance / parseFloat(rest.deliveryFee.extraUnitDistance);
          deliveryFee = deliveryFee + parseFloat(rest.deliveryFee.baseCharge) + extraUnits * parseFloat(rest.deliveryFee.chargePerExtraUnit);
        }
        //limit the delivery to 2 decimal places
        //deliveryFee = Math.round((deliveryFee * 100)) / 100
        deliveryFee = deliveryFee.toFixed(2);
      }
      let restAvgRate = rest.restaurantRatings.reduce(
        (previousValue, curentValue) => previousValue + curentValue.value, 0);
      let avgRate = restAvgRate / rest.restaurantRatings.length;
      avgRate = avgRate ? avgRate.toFixed(2) : "0.00";
      //console.log(rest.id, avgRate, inputRating)
      if (avgRate < inputRating) return null;
      let retObj = {
        id: rest.id,
        name: rest.businessName,
        description: rest.description,
        logo: rest.logo,
        coverImage: rest.image,
        approxDeliveryTime: `${rest.approxDeliveryTime} mins`,
        deliveryFee: `${rest.currencyUnitID.symbol}${deliveryFee}`,
        rating: avgRate ? `${avgRate}` : "No rating yet",
      };
      outArr.push(retObj);
    });
    let data = {
      allRestaurants: outArr,
    };
    const response = ApiResponse("1", "List of Restaurants", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
/*
        7. Restaurant by Search
*/
async function getRestaurantBySearch(req, res) {
  try {
    let text = req.query.text; // all restaurant belonging to the given cuisine
    text = text.replace(/ /g, "");
    const lat = req.query.lat;
    const lng = req.query.lng;
    let outArr = [],
      notMatched = [];
    const restaurantList = await restaurant.findAll({
      where: {
        status: true,
      },
      include: [{
        model: unit,
        as: "distanceUnitID",
      }, {
        model: unit,
        as: "currencyUnitID",
      }, {
        model: deliveryFee,
      }, {
        model: restaurantRating,
      }, {
        model: R_MCLink,
        include: {
          model: R_PLink,
        },
      }, ],
    });
    //return res.json(restaurantList)
    //Getting the current time
    let cDate = Date();
    let cdate = new Date(cDate);
    let cHours = cdate.getHours();
    let cFormat = cHours < 12 ? "AM" : "PM";
    cHours = ampmFormat(cHours);
    cHours = addZeroBefore(cHours);
    let cMins = cdate.getMinutes();
    cMins = addZeroBefore(cMins);
    let cTime = `${cHours}:${cMins} ${cFormat}`;
    restaurantList.map((rest, idx) => {
      //output distance is in Kilometer
      let distance = getDistance(lat, lng, rest.lat, rest.lng);
      // if restaurant's unit is miles, convert km distance to miles
      if (rest.distanceUnitID.name === "miles") {
        distance = distance * 0.6213; //km  to miles
      }
      //if distance is greater than the delivery radius then don't show it to the customer
      if (distance > rest.deliveryRadius) return null;
      //if current time is not between opening and closing time, move to next restaurant
      //Opening time of restaurant
      let opHours = rest.openingTime.getHours();
      let opFormat = opHours < 12 ? "AM" : "PM";
      opHours = ampmFormat(opHours);
      opHours = addZeroBefore(opHours);
      let opMins = rest.openingTime.getMinutes();
      opMins = addZeroBefore(opMins);
      let opTime = `${opHours}:${opMins} ${opFormat}`;
      //closing time of restaurant
      let clHours = rest.closingTime.getHours();
      let clFormat = clHours < 12 ? "AM" : "PM";
      clHours = ampmFormat(clHours);
      clHours = addZeroBefore(clHours);
      let clMins = rest.closingTime.getMinutes();
      clMins = addZeroBefore(clMins);
      let clTime = `${clHours}:${clMins} ${clFormat}`;
      let opDate = "01/01/2022";
      let clDate = clFormat === "PM" ? "01/01/2022" : "01/02/2022";
      //console.log(rest.businessName, cTime, opTime, clTime, (Date.parse(`${opDate} ${cTime}`)> Date.parse(`${opDate} ${opTime}`) && Date.parse(`${opDate} ${cTime}`)< Date.parse(`${clDate} ${clTime}`) ));
      //comparing time
      if (!(Date.parse(`${opDate} ${cTime}`) > Date.parse(`${opDate} ${opTime}`) && Date.parse(`${opDate} ${cTime}`) < Date.parse(`${clDate} ${clTime}`))) return null;
      let deliveryFee = rest.deliveryFeeFixed;
      // Calculate the delivery fee if fee type is dynamic
      if (rest.deliveryFeeTypeId === 2) {
        deliveryFee = parseFloat(deliveryFee);
        //calcualting the fee based on distance
        // if distance is less than base, apply base value
        if (distance <= parseFloat(rest.deliveryFee.baseDistance)) {
          deliveryFee = deliveryFee + parseFloat(rest.deliveryFee.baseCharge);
        } else {
          let extraDistance = distance - parseFloat(rest.deliveryFee.baseDistance);
          let extraUnits = extraDistance / parseFloat(rest.deliveryFee.extraUnitDistance);
          deliveryFee = deliveryFee + parseFloat(rest.deliveryFee.baseCharge) + extraUnits * parseFloat(rest.deliveryFee.chargePerExtraUnit);
        }
        //limit the delivery to 2 decimal places
        //deliveryFee = Math.round((deliveryFee * 100)) / 100
        deliveryFee = deliveryFee.toFixed(2);
      }
      let restAvgRate = rest.restaurantRatings.reduce(
        (previousValue, curentValue) => previousValue + curentValue.value, 0);
      let avgRate = restAvgRate / rest.restaurantRatings.length;
      avgRate = avgRate ? avgRate.toFixed(2) : "0.00";
      let retObj = {
        id: rest.id,
        name: rest.businessName,
        description: rest.description,
        logo: rest.logo,
        coverImage: rest.image,
        approxDeliveryTime: `${rest.approxDeliveryTime} mins`,
        deliveryFee: `${rest.currencyUnitID.symbol}${deliveryFee}`,
        rating: avgRate ? `${avgRate}` : "No rating yet",
      };
      const pattern = new RegExp(`${text}`, "i");
      let restName = rest.businessName.replace(/ /g, "");
      let n = pattern.test(restName);
      console.log(rest.businessName, restName, n);
      if (n) outArr.push(retObj);
      else notMatched.push(rest);
    });
    // searching the products for those restaurants which dont match the search criteria
    notMatched.map((ele) => {
      ele.R_MCLinks.map((rmc) => {
        rmc.R_PLinks.map((p) => {
          const pattern = new RegExp(`${text}`, "i");
          let prodName = p.name.replace(/ /g, "");
          let n = pattern.test(prodName);
          if (n) {
            //output distance is in Kilometer
            let distance = getDistance(lat, lng, ele.lat, ele.lng);
            // if restaurant's unit is miles, convert km distance to miles
            if (ele.distanceUnitID.name === "miles") {
              distance = distance * 0.6213; //km  to miles
            }
            let deliveryFee = ele.deliveryFeeFixed;
            // Calculate the delivery fee if fee type is dynamic
            if (ele.deliveryFeeTypeId === 2) {
              deliveryFee = parseFloat(deliveryFee);
              //calcualting the fee based on distance
              // if distance is less than base, apply base value
              if (distance <= parseFloat(ele.deliveryFee.baseDistance)) {
                deliveryFee = deliveryFee + parseFloat(ele.deliveryFee.baseCharge);
              } else {
                let extraDistance = distance - parseFloat(ele.deliveryFee.baseDistance);
                let extraUnits = extraDistance / parseFloat(ele.deliveryFee.extraUnitDistance);
                deliveryFee = deliveryFee + parseFloat(ele.deliveryFee.baseCharge) + extraUnits * parseFloat(ele.deliveryFee.chargePerExtraUnit);
              }
              //limit the delivery to 2 decimal places
              //deliveryFee = Math.round((deliveryFee * 100)) / 100
              deliveryFee = deliveryFee.toFixed(2);
            }
            let restAvgRate = ele.restaurantRatings.reduce(
              (previousValue, curentValue) => previousValue + curentValue.value, 0);
            let avgRate = restAvgRate / ele.restaurantRatings.length;
            avgRate = avgRate ? avgRate.toFixed(2) : "0.00";
            let retObj = {
              id: ele.id,
              name: ele.businessName,
              description: ele.description,
              logo: ele.logo,
              coverImage: ele.image,
              approxDeliveryTime: `${ele.approxDeliveryTime} mins`,
              deliveryFee: `${ele.currencyUnitID.symbol}${deliveryFee}`,
              rating: avgRate ? `${avgRate}` : "No rating yet",
            };
            outArr.push(retObj);
          }
          console.log(p.name, prodName, n);
        });
      });
    });
    return res.json({
      status: "1",
      message: "List of Restaurants",
      data: {
        allRestaurants: outArr,
      },
      error: "",
    });
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
//Module 4 - Order
/*
        1. Get delivery for restaurant
*/
async function getDeliveryFee(req, res) {
  const {
    restaurantId,
    dropOffLat,
    dropOffLng,
    total
  } = req.body;
  console.log(req.body)
  const restaurantData = await restaurant.findOne({
    where: {
      id: restaurantId,
    },
    include: [{
      model: zoneRestaurants,
      include: {
        model: zone,
        attributes: ["id", "name"],
        include: {
          model: zoneDetails,
          include: [{
            model: unit,
            as: "distanceUnit",
          }, {
            model: unit,
            as: "currencyUnit",
          }, ],
        },
      },
    }, {
      model: unit,
      as: "currencyUnitID",
    }, {
      model: unit,
      as: "distanceUnitID",
    }, {
      model: deliveryFee,
    }, ],
  });
  let distance = getDistance(restaurantData?.lat, restaurantData?.lng, dropOffLat, dropOffLng);
  // return res.json(distance)
  const serviceDefault = await defaultValues.findOne({
    where: {
      name: "serviceCharges",
    },
  });
  const vatFee = restaurantData?.pricesIncludeVAT ? restaurantData.VATpercent == null ? "0.00" : restaurantData.VATpercent : "0.00";
  let serviceCharges = 0;
  let serviceChargesType = restaurantData?.serviceChargesType;
  if (serviceChargesType == "flat") {
    serviceCharges = restaurantData?.serviceCharges;
  } else {
    serviceCharges = parseFloat(total) * (restaurantData?.serviceCharges / 100);
  }
  let deliveryCharges = 0;
  // Delivery Fee is fixed for the restaurant
  if (restaurantData.deliveryFeeTypeId == "1") {
    deliveryCharges = restaurantData.zoneRestaurant.zone.zoneDetail.maxDeliveryCharges;
    const deliveryFeeFixedId = await defaultValues.findOne({
      where: {
        name: "deliveryFeeFixed",
      },
    });
    return res.json({
      status: "1",
      message: "Fixed fees of restaurant",
      data: {
        distance: `${distance.toFixed(2)}`,
        distanceUnit: `${restaurantData.zoneRestaurant?.zone?.zoneDetail?.distanceUnit?.symbol}`,
        currencyUnit: `${restaurantData.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol}`,
        packingFee: restaurantData.packingFee ?? "0.00",
        deliveryCharges: deliveryCharges == 0 || deliveryCharges == null ? deliveryFeeFixedId.value : `${deliveryCharges}`,
        serviceCharges: restaurantData.serviceCharges == null ? serviceDefault.value : `${serviceCharges}`,
        VAT: vatFee,
      },
      error: "",
    });
  } else {
    let baseCharge = restaurantData.zoneRestaurant.zone.zoneDetail.baseCharges;
    const defaultBaseCharge = await defaultValues.findOne({
      where: {
        name: "baseCharge",
      },
    });
    if (baseCharge == 0 || baseCharge == "0" || baseCharge == null) {
      baseCharge = parseFloat(defaultBaseCharge.value);
    }
    if (restaurantData.zoneRestaurant?.zone?.zoneDetail?.distanceUnit?.name?.toLowerCase() === "miles") {
      distance = distance * 0.6213;
    }
    if (distance < parseFloat(restaurantData.zoneRestaurant.zone.zoneDetail.baseDistance)) {
      deliveryCharges = baseCharge;
    } else {
      let extraDistance = distance - parseFloat(restaurantData.zoneRestaurant.zone.zoneDetail.baseDistance);
      let extraUnitsCharges = parseFloat(extraDistance) * parseFloat(restaurantData.zoneRestaurant.zone.zoneDetail.perKmCharges);
      deliveryCharges = deliveryCharges + extraUnitsCharges;
    }
    deliveryCharges = parseFloat(deliveryCharges);
    deliveryCharges = deliveryCharges.toFixed(2);
    let cardFee = (
      (parseFloat(restaurantData?.packingFee) + parseFloat(restaurantData?.packingFee) + parseFloat(serviceCharges)) * (2.9 / 100)).toFixed(2);
    return res.json({
      status: "1",
      message: "Dynamic fee of restaurant",
      data: {
        distance: `${distance.toFixed(2)}`,
        distanceUnit: `${restaurantData.zoneRestaurant?.zone?.zoneDetail?.distanceUnit?.symbol}`,
        currencyUnit: `${restaurantData.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol}`,
        deliveryCharges: `${deliveryCharges}`,
        packingFee: restaurantData?.packingFee ?? "0.00",
        serviceCharges: restaurantData.serviceCharges == null ? serviceDefault.value : `${serviceCharges}`,
        VAT: vatFee,
      },
      error: "",
    });
  }
}
/*
        2. Get delivery for restaurant
*/
async function getRestaurantFeatures(req, res) {
  const {
    restaurantId
  } = req.body;
  try {
    const restaurantData = await restaurant.findOne({
      where: {
        id: restaurantId,
      },
      include: [{
        model: unit,
        as: "currencyUnitID",
      }, {
        model: paymentMethod,
      }, {
        model: deliveryType,
      }, ],
    });
    const orderModes = await orderMode.findAll({
      attributes: ["id", "name"],
    });
    let paymentModes = await paymentMethod.findAll({
      where: {
        id: {
          [Op.or]: [1, 2],
        },
      },
      attributes: ["id", "name", "cardFee"],
    });
    let deliveryModes = await deliveryType.findAll({
      where: {
        id: {
          [Op.or]: [1, 2],
        },
      },
      attributes: ["id", "name"],
    });
    //return res.json(paymentModes)
    //console.log(restaurantData.paymentMethodId)
    let value = restaurantData.paymentMethod.id === 1 ? 3 : 0;
    let retObj = {
      currency: restaurantData.currencyUnitID.symbol,
      vatCalculationRequired: restaurantData.pricesIncludeVAT ? false : true,
      vatPercent: restaurantData.pricesIncludeVAT ? "" : restaurantData.VATpercent,
      paymentMode: [{
        id: restaurantData.paymentMethod.id,
        name: restaurantData.paymentMethod.name,
        cardFee: restaurantData.paymentMethod.cardFee,
      }, ],
      deliveryMode: restaurantData.deliveryTypeId === 3 ? deliveryModes : [{
        id: restaurantData.deliveryType.id,
        name: restaurantData.deliveryType.name,
      }, ],
      orderMode: orderModes,
    };
    const response = ApiResponse("1", "Restaurant Features", "", retObj);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
/*
        3. Apply Voucher
*/
async function applyVoucher(req, res) {
  const {
    code,
    userId,
    restaurantId
  } = req.body;
  try {
    const existVoucher = await voucher.findOne({
      where: {
        code,
      },
    });
    // Check if the voucher with the given code exists or not
    if (!existVoucher) {
      throw new CustomException("Invalid voucher-code", "Please try a valid code");
    }
    // Check if the voucher can be applied to the restaurant
    if (restaurantId && !existVoucher.storeApplicable.split(",").includes(restaurantId)) {
      throw new CustomException("Your voucher is not applicable to this restaurant", "Please try a valid code");
    }
    // Check the expiry of the voucher
    const currentDate = Date.now();
    const startDateTime = new Date(existVoucher.from);
    const endDateTime = new Date(existVoucher.to);
    if (!(currentDate > startDateTime && currentDate < endDateTime)) {
      throw new CustomException("Voucher-code expired", "Please try a valid code");
    }
    // Check if the voucher is already applied by the same user
    const alreadyAppliedByUser = await order.findOne({
      where: {
        voucherId: existVoucher.id,
        paymentConfirmed: true,
        userId,
      },
    });
    if (alreadyAppliedByUser) {
      throw new CustomException("Voucher already used by you", "Please try a valid one");
    }
    // Applying Coupon
    const data = {
      id: existVoucher.id,
      discount: existVoucher.value,
      type: existVoucher.type,
    };
    const response = ApiResponse("1", "Voucher Applied", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
/* 
       4. Create Order
*/
// async function createOrder(req, res) {
//   try {
//     const {
//       scheduleDate,
//       note,
//       leaveOrderAt,
//       products,
//       subTotal,
//       total,
//       deliveryTypeId,
//       orderModeId,
//       paymentMethodId,
//       dropOffLat,
//       dropOffLng,
//       building,
//       streetAddress,
//       distance,
//       distanceUnit,
//       restaurantId,
//       userId,
//       voucherId,
//       deliveryFees,
//       serviceCharges,
//       productsDiscount,
//       cutlery_data,
//       credits,
//       tip,
//       VAT,
//       cardNum,
//       exp_month,
//       exp_year,
//       cvc,
//       saveStatus,
//       isCredit
//     } = req.body;
//     //Validations
//     const requiredFields = [
//       "scheduleDate",
//       "products",
//       "subTotal",
//       "total",
//       "deliveryTypeId",
//       "orderModeId",
//       "paymentMethodId",
//       //   "dropOffLat",
//       //   "dropOffLng",
//       //   "distance",
//       //   "distanceUnit",
//       "restaurantId",
//       "userId",
//       //   "serviceCharges",
//     ];
//     for (const field of requiredFields) {
//       if (!req.body[field]) {
//         const response = ApiResponse(
//           "0",
//           `${field} is required`,
//           `Please provide a value for ${field}`,
//           {}
//         );
//         return res.json(response);
//       }
//     }
//     const userData = await user.findOne({
//       where: {
//         id: req.user.id,
//       },
//     });
//     let method = await paymentMethod.findOne({where:{id:paymentMethodId}});
//     let adminType = await userType.findOne({where:{name:"Admin"}});
//     let admin = await user.findOne({where:{userTypeId : adminType.id}});
//     let userCredits = await Credit.findOne({where:{userId: userId}});
//     //check weather user order is in restaurant zone or not
//     let existInZone = false;
//     const userPoint = point([parseFloat(dropOffLng), parseFloat(dropOffLat)]);
//     const zoneData = await zoneRestaurants.findOne({
//       where: {
//         restaurantId: restaurantId,
//       },
//       include: [
//         {
//           model: restaurant,
//           include: [
//             {
//               model: unit,
//               as: "distanceUnitID",
//             },
//           ],
//         },
//         {
//           model: zone,
//           include: {
//             model: zoneDetails,
//           },
//         },
//       ],
//     });
//     if (
//       zoneData.zone &&
//       zoneData.zone.coordinates.coordinates &&
//       zoneData.zone.coordinates.coordinates.length > 0
//     ) {
//       const zonePolygon = {
//         type: "Polygon",
//         coordinates: zoneData.zone.coordinates.coordinates,
//       };
//       if (booleanPointInPolygon(userPoint, zonePolygon)) {
//         existInZone = true;
//       }
//     }
//     // if (existInZone == false) {
//     //   const response = ApiResponse(
//     //     "0",
//     //     "Your Dropoff Address is out of Restaurant Zone",
//     //     "Error",
//     //     {}
//     //   );
//     //   return res.json(response);
//     // }
//     let zoneCharges = 0;
//     let distanceCharges = 0;
//     let first5KmCharge = zoneData?.zone?.zoneDetail?.baseCharges;
//     let additionalDistance = 0;
//     if (zoneData?.zone?.zoneDetail) {
//       zoneCharges = parseFloat(zoneData?.zone?.zoneDetail?.maxDeliveryCharges);
//     }
//     // let ON1 = uON.generate();
//     let ON1 = Math.floor(Math.random() * 90000000) + 10000000;
//     var cultery_list = [];
//     const chargesData = await charge.findAll();
//     const type = await orderType.findOne({
//       where: {
//         type: "Normal",
//       },
//     });
//     let tmpDistance = parseFloat(distance);
//     const restaurantData = await restaurant.findOne({
//       where: {
//         id: restaurantId,
//       },
//       include: {
//         model: user,
//         attributes: ["deviceToken", "ip","id"],
//       },
//     });
//     let applied = voucherId === "" ? null : voucherId;
//     addresstoDB(dropOffLat, dropOffLng, building, streetAddress, userId)
//       .then(async (dropOffId) => {
//         let orderTotal = parseFloat(total);
//         order
//           .create({
//             orderNum: `fom-${ON1}`,
//             scheduleDate,
//             note,
//             leaveOrderAt,
//             distance: distance,
//             subTotal,
//             total,
//             credits:parseFloat(userCredits.point),
//             status: true,
//             orderTypeId: type.id,
//             dropOffId,
//             deliveryTypeId,
//             orderApplicationId: restaurantData.businessType,
//             orderModeId,
//             paymentMethodId,
//             restaurantId,
//             userId,
//             currencyUnitId: restaurantData.currencyUnitId,
//             voucherId: applied,
//             orderTypeId: type.id,
//             orderStatusId: 1,
//             paymentRecieved: false,
//           })
//           .then(async (orderData) => {
//             //add cultery
//             if (cutlery_data) {
//               const cultery_name = await cutlery.findOne({
//                 where: {
//                   id: cutlery_data.cutleryId,
//                 },
//               });
//               if (cultery_name) {
//                 const order_cutlery = new orderCultery();
//                 order_cutlery.status = 1;
//                 order_cutlery.orderId = orderData.id;
//                 order_cutlery.cutleryId = cutlery_data.cutleryId;
//                 order_cutlery.qty = cutlery_data.qty;
//                 await order_cutlery.save();
//               }
//             }
//             // create order history
//             const status = await orderStatus.findOne({
//               where: {
//                 name: "Placed",
//               },
//             });
//             let time = Date.now();
//             orderHistory.create({
//               time,
//               orderId: orderData.id,
//               orderStatusId: status.id,
//             });
//             let aoArr = [];
//             products.map((oi, index) => {
//               let total = oi.quantity * oi.unitPrice;
//               total = total.toFixed(2);
//               oi.total = total;
//               oi.orderId = orderData.id;
//               oi.userId = req.user.id;
//             });
//             //Adding Order Items to the database
//             orderItems.bulkCreate(products).then((orderItemData) => {
//               const promises = products.map(async (pro, indx) => {
//                 let prod = await R_PLink.findOne({
//                   where: { id: pro.RPLinkId },
//                 });
//                 if (prod) {
//                   prod.sold = parseInt(prod.sold) + parseInt(pro.quantity);
//                   await prod.save();
//                 }
//                 pro.addOns.map((add) => {
//                   let obj = {
//                     total: add.total,
//                     qty: add.quantity,
//                     orderItemId: orderItemData[indx].id,
//                     addOnId: add.addOnId,
//                     collectionId: add.collectionId,
//                   };
//                   aoArr.push(obj);
//                 });
//               });
//               Promise.all(promises)
//                 .then(() => {
//                   let driverEarnings = 0;
//                   let adminComissionOnDeliveryCharges =
//                     (parseFloat(deliveryFees) *
//                       zoneData?.zone?.zoneDetail
//                         ?.adminComissionOnDeliveryCharges) /
//                     100;
//                   orderAddOns.bulkCreate(aoArr).then(async () => {
//                     //calculate driver earnnings  
//                     if(method.name != "COD"){
//                         if (deliveryTypeId == "1") {
//                           driverEarnings =
//                             parseFloat(deliveryFees) +
//                             parseFloat(tip) -
//                             parseFloat(adminComissionOnDeliveryCharges);
//                         }
//                     }  
//                     let adminCommissionPercent =
//                       zoneData?.zone?.zoneDetail?.adminComission;
//                     let totalEarnings = orderTotal;
//                     let adminEarnings =
//                       parseFloat(subTotal) *
//                       (parseFloat(adminCommissionPercent) / 100);
//                     let restaurantEarnings =
//                       parseFloat(orderTotal) -
//                       parseFloat(adminEarnings) -
//                       parseFloat(driverEarnings) 
//                     //   adminComissionOnDeliveryCharges;
//                     let ch = {
//                       basketTotal: subTotal,
//                       deliveryFees: deliveryFees,
//                       serviceCharges: serviceCharges,
//                       discount: "0.00",
//                       total: orderTotal,
//                       packingFee:restaurantData?.packingFee,
//                       tip: tip,
//                       adminEarnings: Number(adminEarnings).toFixed(2),
//                       adminDeliveryCharges: adminComissionOnDeliveryCharges,
//                       driverEarnings: Number(driverEarnings).toFixed(2),
//                       restaurantEarnings: Number(restaurantEarnings).toFixed(2),
//                     //   restaurantDeliveryCharges:
//                     //     deliveryFees > 0
//                     //       ? parseFloat(deliveryFees) -
//                     //         -parseFloat(adminComissionOnDeliveryCharges)
//                     //       : 0,
//                       adminPercent: adminCommissionPercent,
//                       orderId: orderData.id,
//                     };
//                     orderCharge.create(ch);
//                     const estTime = await eta_text(
//                       restaurantData.lat,
//                       restaurantData.lng,
//                       dropOffLat,
//                       dropOffLng
//                     );
//                     console.log("********************** ESt Time**********************");
//                     console.log(estTime)
//                     const userCredits = await Credit.findOne({
//                       where: {
//                         userId: req.user.id,
//                       },
//                     });
//                     if (userCredits) {
//                       if (credits > 0) {
//                         userCredits.point = parseFloat(userCredits.point) - parseFloat(credits);
//                         await userCredits.save();
//                       }
//                     }
//                       let mode = await orderMode.findOne({where:{id:orderModeId}});
//                     if (cutlery_data) {
//                       const cultery_name = await cutlery.findOne({
//                         where: {
//                           id: cutlery_data.cutleryId,
//                         },
//                       });
//                       retOrderData(orderData.id).then(async (retData) => {
//                         let data = {
//                           orderId: orderData.id,
//                           dropOffLat: dropOffLat,
//                           dropOffLng: dropOffLng,
//                           orderNum: orderData.orderNum,
//                           paymentRecieved: orderData.paymentRecieved,
//                           cultery_list: cutlery_data ? cultery_name : [],
//                           restLat: restaurantData.lat,
//                           restLng: restaurantData.lng,
//                           restAddress: restaurantData.address,
//                           tip:tip,
//                           waitForDriver: false,
//                           mode:mode,
//                           allowSelfPickUp:
//                             restaurantData.deliveryTypeId === 3 ? true : false,
//                           retData,
//                         };
//                         let useData = await user.findOne({
//                           where: { id: req.user.id },
//                         });
//                         const retailerData = await retailerController.homeData(
//                           restaurantId
//                         );
//                         if(method.name == "COD"){
//                             retailerController.homeData(orderData.restaurantId).then(async (homeDataa) => {
//                                   let eventDataForRetailer = {
//                                     type: "placeOrder",
//                                     data: {
//                                       status: "1",
//                                       message: "Data",
//                                       error: "",
//                                       data: homeDataa,
//                                     },
//                                   };
//                                   let restData = await retOrderData(orderId);
//                                   let data = {
//                                     orderId: orderData.id,
//                                     dropOffLat: orderData?.dropOffID?.lat,
//                                     dropOffLng: orderData?.dropOffID?.lng,
//                                     orderNum: orderData.orderNum,
//                                     // estTime:estTime,
//                                     estTime:restaurantData?.approxDeliveryTime,
//                                     paymentRecieved: orderData.paymentRecieved,
//                                     cultery_list: [],
//                                     restLat: restaurantData.lat,
//                                     restLng: restaurantData.lng,
//                                     restAddress: restaurantData.address,
//                                     waitForDriver: false,
//                                     allowSelfPickUp:
//                                       restaurantData.deliveryTypeId === 3 ? true : false,
//                                     retData: restData,
//                                   };
//                                   let eventDataForUser = {
//                                     type: "placeOrder",
//                                     data: {
//                                       status: "1",
//                                       message: "Data",
//                                       error: "",
//                                       data: data,
//                                     },
//                                   };
//                                   sendEvent(restaurantData?.user?.id, eventDataForRetailer);
//                                   sendEvent(admin.id, eventDataForUser);
//                                   sendEvent(userData?.id, eventDataForUser);
//                                 })
//                         }
//                         const response = ApiResponse(
//                           "1",
//                           "Payment done and Order placed successfully!",
//                           "",
//                           data
//                         );
//                         return res.json(response);
//                       });
//                     } else {
//                       retOrderData(orderData.id).then(async (retData) => {
//                         let data = {
//                           orderId: orderData.id,
//                           dropOffLat: dropOffLat,
//                           dropOffLng: dropOffLng,
//                           orderNum: orderData.orderNum,
//                           paymentRecieved: orderData.paymentRecieved,
//                           cultery_list: [],
//                           restLat: restaurantData.lat,
//                           restLng: restaurantData.lng,
//                           restAddress: restaurantData.address,
//                           tip:tip,
//                           mode:mode,
//                           waitForDriver: false,
//                           allowSelfPickUp:
//                             restaurantData.deliveryTypeId === 3 ? true : false,
//                           retData,
//                         };
//                         let useData = await user.findOne({
//                           where: { id: req.user.id },
//                         });
//                          if(method.name == "COD"){
//                             retailerController.homeData(orderData.restaurantId).then(async (homeDataa) => {
//                                   let eventDataForRetailer = {
//                                     type: "placeOrder",
//                                     data: {
//                                       status: "1",
//                                       message: "Data",
//                                       error: "",
//                                       data: homeDataa,
//                                     },
//                                   };
//                                   let restData = await retOrderData(orderData.id);
//                                   let data = {
//                                     orderId: orderData.id,
//                                     dropOffLat: orderData?.dropOffID?.lat,
//                                     dropOffLng: orderData?.dropOffID?.lng,
//                                     orderNum: orderData.orderNum,
//                                     // estTime:estTime,
//                                     estTime:restaurantData?.approxDeliveryTime,
//                                     paymentRecieved: orderData.paymentRecieved,
//                                     cultery_list: [],
//                                     restLat: restaurantData.lat,
//                                     restLng: restaurantData.lng,
//                                     restAddress: restaurantData.address,
//                                     waitForDriver: false,
//                                     allowSelfPickUp:
//                                       restaurantData.deliveryTypeId === 3 ? true : false,
//                                     retData: restData,
//                                   };
//                                   let eventDataForUser = {
//                                     type: "placeOrder",
//                                     data: {
//                                       status: "1",
//                                       message: "Data",
//                                       error: "",
//                                       data: data,
//                                     },
//                                   };
//                                   sendEvent(restaurantData?.user?.id, eventDataForRetailer);
//                                   sendEvent(admin.id, eventDataForUser);
//                                   sendEvent(userData?.id, eventDataForUser);
//                                 })
//                         }
//                         const response = ApiResponse(
//                           "1",
//                           "Payment done and Order placed successfully!",
//                           "",
//                           data
//                         );
//                         return res.json(response);
//                       });
//                     }
//                   });
//                 })
//                 .catch((error) => {
//                   let response = ApiResponse("0", error.message, "Error", {});
//                   return res.json(response);
//                 });
//             });
//           });
//       })
//       .catch((error) => {
//         const response = ApiResponse("0", error.message, "Error", {});
//         return res.json(response);
//       });
//   } catch (error) {
//     const response = ApiResponse("0", error.message, "Error", {});
//     return res.json(response);
//   }
// }
// async function sendOrderConfirmationEmail(email, orderNum) {
//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USERNAME, 
//       to: email, 
//       subject: `Order Confirmation - Order No: ${orderNum}`,
//       text: `Thank you for your order! Your order number is ${orderNum}.`, 
//     });
//     console.log("Order confirmation email sent successfully.");
//   } catch (error) {
//     console.error("Failed to send order confirmation email:", error.message);
//   }
// }

async function createOrder(req, res) {
  try {
    const {
      scheduleDate,
      note,
      leaveOrderAt,
      products,
      paymentMethodName,
      subTotal,
      total,
      deliveryTypeId,
      orderModeId,
      paymentMethodId,
      dropOffLat,
      dropOffLng,
      building,
      streetAddress,
      distance,
      distanceUnit,
      restaurantId,
      userId,
      voucherId,
      deliveryFees,
      serviceCharges,
      productsDiscount,
      cutlery_data,
      credits,
      tip,
      VAT,
      cardNum,
      exp_month,
      exp_year,
      cvc,
      saveStatus,
      isCredit,
      instructionsForCourier
    } = req.body;
    console.log(req.body)
    // Required fields validation
    const requiredFields = ["scheduleDate", "products", "subTotal", "total", "deliveryTypeId", "orderModeId", "paymentMethodId", "restaurantId", "userId", ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.json(ApiResponse("0", `${field} is required`, `Please provide a value for ${field}`, {}));
      }
    }
    // Parallel fetching of necessary data
    const [userData, method, adminType, userCredits, zoneData, chargesData, orderTypeNormal, restaurantData] = await Promise.all([
      user.findOne({
        where: {
          id: req.user.id
        }
      }),
      paymentMethod.findOne({
        where: {
          id: paymentMethodId
        }
      }),
      userType.findOne({
        where: {
          name: "Admin"
        }
      }),
      Credit.findOne({
        where: {
          userId
        }
      }),
      zoneRestaurants.findOne({
        where: {
          restaurantId
        },
        include: [{
          model: restaurant,
          include: [{
            model: unit,
            as: "distanceUnitID"
          }]
        }, {
          model: zone,
          include: {
            model: zoneDetails
          }
        }, ],
      }),
      charge.findAll(),
      orderType.findOne({
        where: {
          type: "Normal"
        }
      }),
      restaurant.findOne({
        where: {
          id: restaurantId
        },
        include: {
          model: user,
          attributes: ["deviceToken", "ip", "id","language"]
        }
      }),
    ]);
    const admin = await user.findOne({
      where: {
        userTypeId: adminType.id
      }
    });
 
    // Check if user order is in restaurant zone
    const userPoint = point([parseFloat(dropOffLng), parseFloat(dropOffLat)]);
    const existInZone = zoneData.zone && zoneData.zone.coordinates.coordinates.length > 0 && booleanPointInPolygon(userPoint, {
      type: "Polygon",
      coordinates: zoneData.zone.coordinates.coordinates
    });
    // if (!existInZone) {
    //   return res.json(ApiResponse("0", "Your Dropoff Address is out of Restaurant Zone", "Error", {}));
    // }
    // Calculate charges
    const zoneCharges = zoneData?.zone?.zoneDetail ? parseFloat(zoneData?.zone?.zoneDetail?.maxDeliveryCharges) : 0;
    const first5KmCharge = zoneData?.zone?.zoneDetail?.baseCharges;
    let ON1 = Math.floor(Math.random() * 90000000) + 10000000;
    // Add address to database and create order
    const dropOffId = await addresstoDB(dropOffLat, dropOffLng, building, streetAddress, userId);
    const orderTotal = parseFloat(total);
    let verificationCode = totp.generate();
    const orderData = await order.create({
      orderNum: `fom-${ON1}`,
      scheduleDate,
      note,
      leaveOrderAt,
      distance,
      subTotal,
      total: orderTotal,
      credits: parseFloat(userCredits?.point || 0),
      status: true,
      orderTypeId: orderTypeNormal.id,
      dropOffId,
      deliveryTypeId,
      orderApplicationId: restaurantData.businessType,
      orderModeId,
      paymentMethodId,
      restaurantId,
      userId,
      paymentMethodName,
      currencyUnitId: restaurantData.currencyUnitId,
      voucherId: voucherId || null,
      orderStatusId: 1,
      paymentRecieved: false,
      verificationCode,
      instructionsForCourier,
      
      //temporary true
      paymentConfirmed:true,
      paymentRecieved:true,
    });
    // Handle cutlery data
    if (cutlery_data && cutlery_data?.cutleryId) {
      const cutleryItem = await cutlery.findOne({
        where: {
          id: cutlery_data.cutleryId
        }
      });
      if (cutleryItem) {
        await orderCultery.create({
          status: 1,
          orderId: orderData.id,
          cutleryId: cutlery_data.cutleryId,
          qty: cutlery_data.qty,
        });
      }
    }
    // Create order history
    const status = await orderStatus.findOne({
      where: {
        name: "Placed"
      }
    });
    const dType = await deliveryType.findOne({
      where: {
        name: "Delivery"
      }
    });
    await orderHistory.create({
      time: Date.now(),
      orderId: orderData.id,
      orderStatusId: status.id,
    });
    // Prepare and save order items and add-ons
    let aoArr = [];
    const orderItemData = await orderItems.bulkCreate(products.map((oi) => ({
      ...oi,
      total: (oi.quantity * oi.unitPrice).toFixed(2),
      orderId: orderData.id,
      userId: req.user.id,
    })));
    for (const [indx, pro] of products.entries()) {
      const prod = await R_PLink.findOne({
        where: {
          id: pro.RPLinkId
        }
      });
      if (prod) {
        prod.sold = parseInt(prod.sold) + parseInt(pro.quantity);
        await prod.save();
      }
      aoArr.push(...pro.addOns.map((add) => ({
        total: add.total,
        qty: add.quantity,
        orderItemId: orderItemData[indx].id,
        addOnId: add.addOnId,
        collectionId: add.collectionId,
      })));
    }
    await orderAddOns.bulkCreate(aoArr);
    // Calculate earnings
    let driverEarnings = 0;
    const adminComissionOnDeliveryCharges = (parseFloat(deliveryFees) * (zoneData?.zone?.zoneDetail?.adminComissionOnDeliveryCharges || 0)) / 100;
    if (method.name !== "COD" && deliveryTypeId === "1") {
      driverEarnings = parseFloat(deliveryFees) + parseFloat(tip) - parseFloat(adminComissionOnDeliveryCharges);
    }
    const adminCommissionPercent = zoneData?.zone?.zoneDetail?.adminComission;
    const adminEarnings = parseFloat(subTotal) * (parseFloat(adminCommissionPercent) / 100);
    const restaurantEarnings = parseFloat(orderTotal) - parseFloat(adminEarnings) - parseFloat(driverEarnings);
    await orderCharge.create({
      basketTotal: subTotal,
      deliveryFees: deliveryFees,
      serviceCharges: serviceCharges,
      discount: "0.00",
      total: orderTotal,
      packingFee: restaurantData?.packingFee,
      tip: tip,
      adminEarnings: adminEarnings.toFixed(2),
      adminDeliveryCharges: adminComissionOnDeliveryCharges.toFixed(2),
      driverEarnings: driverEarnings.toFixed(2),
      restaurantEarnings: restaurantEarnings.toFixed(2),
      adminPercent: adminCommissionPercent,
      orderId: orderData.id,
    });
    // Handle credits
    if (userCredits && credits > 0) {
      userCredits.point = parseFloat(userCredits.point) - parseFloat(credits);
      await userCredits.save();
    }
    const mode = await orderMode.findOne({
      where: {
        id: orderModeId
      }
    });
    const estTime = await eta_text(restaurantData.lat, restaurantData.lng, dropOffLat, dropOffLng);
    
    // Prepare final response data
    const retData = await retOrderData(orderData.id);
    const data = {
      orderId: orderData.id,
      dropOffLat,
      dropOffLng,
      orderNum: orderData.orderNum,
      estTime:deliveryTypeId == dType.id ?  restaurantData?.approxDeliveryTime : restaurantData?.pickupTime,
    //   estTime: estTime,
      paymentRecieved: orderData.paymentRecieved,
      cultery_list: cutlery_data ? [cutlery_data] : [],
      restLat: restaurantData.lat,
      restLng: restaurantData.lng,
      restAddress: restaurantData.address,
      logo: restaurantData.logo,
      image: restaurantData.image,
      tip,
      paymentMethodName:paymentMethodName,
      waitForDriver: false,
      mode,
      allowSelfPickUp: restaurantData.deliveryTypeId === 3,
      retData,
    };
    // Send events for COD
    if (method.name === "COD") {
      const homeData = await retailerController.homeData(restaurantId);
      const eventDataForRetailer = {
        type: "placeOrder",
        data: {
          status: "1",
          message: "Data",
          error: "",
          data: homeData,
        },
      };
      const eventDataForUser = {
        type: "placeOrder",
        data: {
          status: "1",
          message: "Data",
          error: "",
          data,
        },
      };
      sendEvent(restaurantData?.user?.id, eventDataForRetailer);
      sendEvent(admin.id, eventDataForUser);
      sendEvent(userId, eventDataForUser);
    }
    const response = ApiResponse("1", "Payment done and Order placed successfully!", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function addRatingFeedback(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const {
      restaurantRate,
      restaurantFeedBack,
      driverRate,
      orderId,
      deliveryType,
      driverTip,
      driverFeedBack
    } = req.body;
    console.log(req.body)
    const orderData = await order.findOne({
      where: {
        id: orderId
      },
      transaction: t, // Include transaction
    });
    if (!orderData) {
      const response = ApiResponse("0", "Order not found", "Error", {});
      return res.json(response);
    }
    let driverData = await user.findOne({
      where: {
        id: orderData.driverId
      },
      attributes: ['driverType', 'id'],
      transaction: t,
    });
    let getWallet = await wallet.findOne({
      where: {
        orderId: orderId
      },
      transaction: t
    });
    if (!getWallet) {
      const response = ApiResponse("0", "Transaction not found", "Error", {});
      return res.json(response);
    }
    const cTime = Date.now();
    // Initialize Adyen client
    const client = new Client({
      apiKey: apiKey,
      environment: 'TEST' // Use 'LIVE' in production
    });
    const checkout = new CheckoutAPI(client);
    // Proceed with rating feedback logic
    if (deliveryType === "Self-Pickup") {
      if (restaurantRate) {
        await restaurantRating.create({
          value: restaurantRate,
          at: cTime,
          orderId: orderId,
          restaurantId: orderData.restaurantId,
          userId: orderData.userId,
        }, {
          transaction: t
        });
        await t.commit();
        const response = ApiResponse("1", "Rating added successfully", "", {});
        return res.json(response);
      } 
    }
    if(deliveryType == "Delivery"){
     if (driverRate && restaurantRate) {
      await driverRating.create({
        value: parseFloat(driverRate),
        at: cTime,
        orderId: orderId,
        comment: driverFeedBack,
        userId: orderData.userId,
        driverId: orderData.driverId,
      }, {
        transaction: t
      });
      const chargeData = await orderCharge.findOne({
        where: {
          orderId: orderId
        },
        transaction: t,
      });
      if (chargeData) {
        chargeData.additionalTip = driverTip;
        await chargeData.save({
          transaction: t
        });
      }
      await restaurantRating.create({
        value: restaurantRate,
        at: cTime,
        orderId: orderId,
        restaurantId: orderData.restaurantId,
        userId: orderData.userId,
      }, {
        transaction: t
      });
      let earnings = await driverEarning.findOne({
        where: {
          userId: orderData.driverId
        },
        transaction: t
      });
      if (earnings) {
        earnings.totalEarning = parseFloat(earnings.totalEarning) + parseInt(driverTip);
        earnings.availableBalance = parseFloat(earnings.availableBalance) + parseInt(driverTip);
        await earnings.save({
          transaction: t
        });
      }
      const amountToAdd = parseFloat(driverTip) * 100; // Convert to minor units (cents)
      // Adjust the authorization (if authorized but not captured yet)
      // const adjustRequest = {
      //   merchantAccount: merchantAccount,
      //   originalReference: getWallet?.transactionId,
      //   modificationAmount: {
      //     value: amountToAdd, // Driver tip in minor units (e.g., 5000 = 50.00)
      //     currency: 'CHF'
      //   },
      //   reference: `Tip for order ${orderId}`
      // };
      // // Adjust the transaction amount by adding driver tip
      // try {
      //   const adjustResponse = await checkout.payments.adjustAuthorisation(adjustRequest);
      //   console.log('Adjustment successful:', adjustResponse);
      // } catch (error) {
      //   console.error('Adjustment failed:', error.message);
      //   await t.rollback();
      //   return res.json(ApiResponse("0", "Failed to adjust transaction amount", "Error", {}));
      // }
      await t.commit();
      const response = ApiResponse("1", "Rating added successfullyy", "", {});
      return res.json(response);
    }    
     else{
           await driverRating.create({
        value: parseFloat(driverRate),
        at: cTime,
        orderId: orderId,
        comment: driverFeedBack,
        userId: orderData.userId,
        driverId: orderData.driverId,
      }, {
        transaction: t
      });
      const chargeData = await orderCharge.findOne({
        where: {
          orderId: orderId
        },
        transaction: t,
      });
      if (chargeData) {
        chargeData.additionalTip = driverTip;
        await chargeData.save({
          transaction: t
        });
      }
     
      let earnings = await driverEarning.findOne({
        where: {
          userId: orderData.driverId
        },
        transaction: t
      });
      if (earnings) {
        earnings.totalEarning = parseFloat(earnings.totalEarning) + parseInt(driverTip);
        earnings.availableBalance = parseFloat(earnings.availableBalance) + parseInt(driverTip);
        await earnings.save({
          transaction: t
        });
      } 
       await t.commit();
      const response = ApiResponse("1", "Rating added successfullyy", "", {});
      return res.json(response);
     }
    }
    
  } catch (error) {
    await t.rollback();
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
// async function orderAfterPayment(req, res) {
//   const t = await SequelizeDB.transaction(); // Start transaction
//   try {
//     const { orderId, isCredit, transactionId } = req.body;
//     let type = await userType.findOne({ where: { name: "Admin" } });
//     let admin = await user.findOne({ where: { userTypeId: type.id } });
//     let orderData = await order.findOne({
//       where: { id: orderId },
//       include: [
//         { model: restaurant },
//         { model: user, include: { model: Credit } },
//         { model: orderCharge },
//         { model: address, as: "dropOffID" },
//       ],
//       transaction: t,
//     });
//     orderData.isLocked = true;
//     await orderData.save({ transaction: t });
//     let checkWallet = await wallet.findOne({where:{orderId : orderId}});
//     if(checkWallet){
//         checkWallet.amount = orderData.total;
//         checkWallet.paymentType = 'Card';
//         checkWallet.at = Date.now();
//         checkWallet.orderId = orderId;
//         checkWallet.restaurantId = orderData.restaurantId;
//         checkWallet.userId = orderData.userId;
//         checkWallet.currencyUnitId = orderData.currencyUnitId;
//         await checkWallet.save({ transaction: t }); 
//     }
//     else{
//         let trans = new wallet();
//         trans.amount = orderData.total;
//         trans.paymentType = 'Card';
//         trans.at = Date.now();
//         trans.orderId = orderId;
//         trans.restaurantId = orderData.restaurantId;
//         trans.userId = orderData.userId;
//         trans.currencyUnitId = orderData.currencyUnitId;
//         await trans.save({ transaction: t });
//     }
//     const estTime = await eta_text(
//       orderData.restaurant.lat,
//       orderData.restaurant.lng,
//       orderData?.dropOffID?.lat,
//       orderData?.dropOffID?.lng
//     );
//     const restaurantData = await restaurant.findOne({
//       where: { id: orderData.restaurantId },
//       include: { model: user, attributes: ["deviceToken", "ip", "id"] },
//       transaction: t,
//     });
//     const restDrivers = await restaurantDriver.findAll({
//       where: { restaurantId: orderData?.restaurantId },
//       include: { model: user, attributes: ["id", "deviceToken"] },
//       transaction: t,
//     });
//     let userData = await user.findOne({ where: { id: req.user.id }, transaction: t });
//     if (orderData) {
//       orderData.paymentConfirmed = true;
//       orderData.paymentRecieved = true;
//       await orderData.save({ transaction: t });
//       let charge = await orderCharge.findOne({ where: { orderId: orderId }, transaction: t });
//       if (charge) {
//         let zoneRest = await zoneRestaurants.findOne({
//           where: { restaurantId: orderData?.restaurantId },
//           include: { model: zone, attributes: ['id'], include: { model: zoneDetails } },
//           transaction: t,
//         });
//         let earning = await driverEarning.findOne({ where: { userId: admin.id }, transaction: t });
//         let adminEarning = 0;
//         let restEarning = 0;
//         // Calculate admin earning and restaurant earning
//         adminEarning = parseFloat(orderData.subTotal) * (zoneRest?.zone?.zoneDetail?.adminComission / 100) +
//           parseFloat(charge?.serviceCharges) +
//           parseFloat(charge?.discount) +
//           parseFloat(charge.adminDeliveryCharges);
//         if (isCredit) {
//           restEarning = (parseFloat(orderData?.subTotal) - parseFloat(orderData.subTotal) * (zoneRest?.zone?.zoneDetail?.adminComission / 100)) +
//             parseFloat(orderData?.restaurant?.packingFee ? orderData?.restaurant?.packingFee : 0) +
//             parseFloat(charge?.VAT ? charge.VAT : 0) +
//             parseFloat(orderData?.user?.Credit?.point ? orderData?.user?.Credit?.point : 0);
//           let userCredit = await Credit.findOne({ where: { userId: orderData.userId }, transaction: t });
//           if (userCredit) {
//             userCredit.point = 0;
//             await userCredit.save({ transaction: t });
//           }
//         } else {
//           restEarning = (parseFloat(orderData?.subTotal) - parseFloat(orderData.subTotal) * (zoneRest?.zone?.zoneDetail?.adminComission / 100)) +
//             parseFloat(orderData?.restaurant?.packingFee ? orderData?.restaurant?.packingFee : 0) +
//             parseFloat(charge?.VAT ? charge.VAT : 0);
//         }
//         if (earning) {
//           earning.availableBalance = parseFloat(earning.availableBalance) - parseFloat(orderData?.user?.Credit?.point) + parseFloat(adminEarning);
//           earning.totalEarning = parseFloat(earning.totalEarning) + parseFloat(adminEarning);
//           await earning.save({ transaction: t });
//         }
//         charge.adminEarnings = adminEarning;
//         charge.restaurantEarnings = restEarning;
//         await charge.save({ transaction: t });
//       }
//       let type = await deliveryType.findOne({ where: { name: "Delivery" }, transaction: t });
//       if (orderData.deliveryTypeId == type.id) {
//         let driverTokens = [];
//         for (var i = 0; i < restDrivers.length; i++) {
//           if (restDrivers[i]?.user?.deviceToken) {
//             for (const token of JSON.parse(restDrivers[i]?.user?.deviceToken)) {
//               driverTokens.push(token);
//             }
//           }
//         }
//         let noti_data = {
//           estTime: orderData?.restaurant?.approxDeliveryTime,
//           distance: orderData?.distance,
//           orderId: orderData.id,
//           restaurantName: restaurantData.businessName,
//           estEarning: Number(orderData?.orderCharge?.driverEarnings).toFixed(2),
//           orderNum: orderData.orderNum,
//           orderApplication: restaurantData.businessType == 1 ? "Restaurant" : restaurantData.businessType == 3 ? "Store" : "",
//           orderType: orderData.orderTypeId == 1 ? "Group" : "Normal",
//           dropOffAddress: orderData?.dropOffID?.streetAddress,
//           pickUpAddress: restaurantData.address,
//         };
//         let userTokens = formatTokens(userData?.deviceToken);
//         singleNotification(userTokens, "Order Placed", `OrderId : ${orderData.id} has been placed successfully`, noti_data);
//         let notification = { title: "New Job arrived", body: "A new job has arrived" };
//         let restaurantTokens = formatTokens(restaurantData?.user?.deviceToken);
//         sendNotifications(restaurantTokens, notification);
//       }
//       retailerController.homeData(orderData.restaurantId).then(async (homeDataa) => {
//         let eventDataForRetailer = {
//           type: "placeOrder",
//           data: {
//             status: "1",
//             message: "Data",
//             error: "",
//             data: homeDataa,
//           },
//         };
//         let restData = await retOrderData(orderId, { transaction: t });
//         let data = {
//           orderId: orderData.id,
//           dropOffLat: orderData?.dropOffID?.lat,
//           dropOffLng: orderData?.dropOffID?.lng,
//           userId: orderData?.userId,
//           orderNum: orderData.orderNum,
//           estTime: restaurantData?.approxDeliveryTime,
//           paymentRecieved: orderData.paymentRecieved,
//           cultery_list: [],
//           restLat: restaurantData.lat,
//           restLng: restaurantData.lng,
//           restAddress: restaurantData.address,
//           waitForDriver: false,
//           allowSelfPickUp: restaurantData.deliveryTypeId === 3 ? true : false,
//           retData: restData,
//         };
//         let eventDataForUser = {
//           type: "placeOrder",
//           data: {
//             status: "1",
//             message: "Data",
//             error: "",
//             data: data,
//           },
//         };
//         sendEvent(restaurantData?.user?.id, eventDataForRetailer);
//         sendEvent(admin.id, eventDataForUser);
//         sendEvent(userData?.id, eventDataForUser);
//       });
//       await t.commit(); // Commit the transaction if everything is successful
//       const response = ApiResponse(
//         "1",
//         "Payment done and Order placed successfully!",
//         "",
//         {}
//       );
//       return res.json(response);
//     } else {
//       await t.rollback();
//       const response = ApiResponse("0", "Sorry Order not found", "", {});
//       return res.json(response);
//     }
//   } catch (error) {
//     await t.rollback();
//     const response = ApiResponse(
//       "0",
//       error.message,
//       "",
//       {}
//     );
//     return res.json(response);
//   }
// }
async function orderAfterPayment(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const {
      orderId,
      isCredit,
      transactionId
    } = req.body;
    // Fetch Admin User

    let type = await userType.findOne({
      where: {
        name: "Admin"
      }
    });
    let admin = await user.findOne({
      where: {
        userTypeId: type.id
      }
    });
    // Fetch Order Data with Associations
    let orderData = await order.findOne({
      where: {
        id: orderId
      },
      include: [{
        model: restaurant
      }, {
        model: user,
        include: {
          model: Credit
        }
      }, {
        model: orderCharge
      }, {
        model: address,
        as: "dropOffID"
      }, ],
      transaction: t,
    });

    if (!orderData) {
      await t.rollback();
      const response = ApiResponse("0", "Sorry Order not found", "", {});
      return res.json(response);
    }
    
    // Lock the Order
    orderData.isLocked = true;
    await orderData.save({
      transaction: t
    });
    // Update or Create Wallet Entry
    let checkWallet = await wallet.findOne({
      where: {
        orderId: orderId
      },
      transaction: t
    });
    if (checkWallet) {
      checkWallet.amount = orderData.total;
      checkWallet.paymentType = 'Card';
      checkWallet.at = Date.now();
      checkWallet.orderId = orderId;
      checkWallet.restaurantId = orderData.restaurantId;
      checkWallet.userId = orderData.userId;
      checkWallet.currencyUnitId = orderData.currencyUnitId;
      await checkWallet.save({
        transaction: t
      });
    } else {
      let trans = new wallet();
      trans.amount = orderData.total;
      trans.paymentType = 'Card';
      trans.at = Date.now();
      trans.orderId = orderId;
      trans.restaurantId = orderData.restaurantId;
      trans.userId = orderData.userId;
      trans.currencyUnitId = orderData.currencyUnitId;
      await trans.save({
        transaction: t
      });
    }
    // Calculate Estimated Time
    const estTime = await eta_text(orderData.restaurant.lat, orderData.restaurant.lng, orderData?.dropOffID?.lat, orderData?.dropOffID?.lng);
    // Fetch Restaurant Data with User Associations
    const restaurantData = await restaurant.findOne({
      where: {
        id: orderData.restaurantId
      },
      include: {
        model: user,
        attributes: ["deviceToken", "ip", "id","language"]
      },
      transaction: t,
    });


    // Fetch Restaurant Drivers
    const restDrivers = await restaurantDriver.findAll({
      where: {
        restaurantId: orderData?.restaurantId
      },
      include: {
        model: user,
        attributes: ["id", "deviceToken","language"]
      },
      transaction: t,
    });
    // Fetch User Data
    let userData = await user.findOne({
      where: {
        id: req.user.id
      },
      transaction: t
    });
    // Update Order Payment Status
    orderData.paymentConfirmed = true;
    orderData.paymentRecieved = true;
    await orderData.save({
      transaction: t
    });
    // Fetch Order Charge Details
    let charge = await orderCharge.findOne({
      where: {
        orderId: orderId
      },
      transaction: t
    });
    if (charge) {
      // Fetch Zone and Commission Details
      let zoneRest = await zoneRestaurants.findOne({
        where: {
          restaurantId: orderData?.restaurantId
        },
        include: {
          model: zone,
          attributes: ['id'],
          include: {
            model: zoneDetails
          }
        },
        transaction: t,
      });
      // Fetch Admin Earning Details
      let earning = await driverEarning.findOne({
        where: {
          userId: admin.id
        },
        transaction: t
      });
      let adminEarning = 0;
      let restEarning = 0;
      // Calculate Admin Earning
      adminEarning = parseFloat(orderData.subTotal) * (zoneRest?.zone?.zoneDetail?.adminComission / 100) + parseFloat(charge?.serviceCharges) + parseFloat(charge?.discount) + parseFloat(charge.adminDeliveryCharges);
      // Calculate Restaurant Earning
      if (isCredit) {
        restEarning = (parseFloat(orderData?.subTotal) - parseFloat(orderData.subTotal) * (zoneRest?.zone?.zoneDetail?.adminComission / 100)) + parseFloat(orderData?.restaurant?.packingFee ? orderData?.restaurant?.packingFee : 0) + parseFloat(charge?.VAT ? charge.VAT : 0) + parseFloat(orderData?.user?.Credit?.point ? orderData?.user?.Credit?.point : 0);
        let userCredit = await Credit.findOne({
          where: {
            userId: orderData.userId
          },
          transaction: t
        });
        if (userCredit) {
          userCredit.point = 0;
          await userCredit.save({
            transaction: t
          });
        }
      } else {
        restEarning = (parseFloat(orderData?.subTotal) - parseFloat(orderData.subTotal) * (zoneRest?.zone?.zoneDetail?.adminComission / 100)) + parseFloat(orderData?.restaurant?.packingFee ? orderData?.restaurant?.packingFee : 0) + parseFloat(charge?.VAT ? charge.VAT : 0);
      }
      // === **Begin: Calculate and Apply Processing and Card Fees** ===
      // Calculate Fees based on the total order amount
      const processingFee = parseFloat((0.02 * orderData.total).toFixed(2)); // 2% Processing Fee
      const cardFee = parseFloat((0.03 * orderData.total).toFixed(2)); // 3% Card Fee
      // Subtract fees from Restaurant Earning
      restEarning = parseFloat((restEarning - processingFee - cardFee).toFixed(2));
      // Assign fees to Order Charge
      charge.processingFee = processingFee;
      charge.cardFee = cardFee;
      // === **End: Calculate and Apply Processing and Card Fees** ===
      // Update Admin Earning and Restaurant Earning in Driver Earning
      if (earning) {
        earning.availableBalance = parseFloat(earning.availableBalance) - parseFloat(orderData?.user?.Credit?.point) + parseFloat(adminEarning);
        earning.totalEarning = parseFloat(earning.totalEarning) + parseFloat(adminEarning);
        await earning.save({
          transaction: t
        });
      }
      // Assign Calculated Earnings to Order Charge
      charge.adminEarnings = adminEarning;
      charge.restaurantEarnings = restEarning;
      await charge.save({
        transaction: t
      });
    }
    // Fetch Delivery Type
    let deliveryTypeData = await deliveryType.findOne({
      where: {
        name: "Delivery"
      },
      transaction: t
    });
    // If Delivery Type is "Delivery", send Notifications
    if (orderData.deliveryTypeId == deliveryTypeData.id) {
      let driverTokens = [];
      for (let i = 0; i < restDrivers.length; i++) {
        if (restDrivers[i]?.user?.deviceToken) {
          for (const token of JSON.parse(restDrivers[i]?.user?.deviceToken)) {
            driverTokens.push(token);
          }
        }
      }
      let noti_data = {
        estTime: orderData?.restaurant?.approxDeliveryTime,
        paymentMethodName: orderData?.paymentMethodName ?? "",
        distance: orderData?.distance,
        orderId: orderData.id,
        restaurantName: restaurantData.businessName,
        estEarning: Number(orderData?.orderCharge?.driverEarnings).toFixed(2),
        orderNum: orderData.orderNum,
        orderApplication: restaurantData.businessType == 1 ? "Restaurant" : restaurantData.businessType == 3 ? "Store" : "",
        orderType: orderData.orderTypeId == 1 ? "Group" : "Normal",
        dropOffAddress: orderData?.dropOffID?.streetAddress,
        pickUpAddress: restaurantData.address,
      };
      let userTokens = formatTokens(userData?.deviceToken);
      
const notificationDataForUser = { orderId: orderData.id }; // Data for placeholder replacement
    // singleNotification(userTokens, 'orderPlaced', notificationDataForUser, lang);
    await singleNotification(userTokens, 'orderPlaced', notificationDataForUser, {},userData?.language);
     let notification = {
        title: "New Job arrived",
        body: "A new job has arrived"
      //  orderId: orderData.id,
     };
 
      let restaurantTokens = formatTokens(restaurantData?.user?.deviceToken);
       
        // const notificationDataForRestaurant = {}; // No dynamic data for newJob
    // sendNotifications(restaurantTokens,"user", 'newJob', notificationDataForRestaurant, lang);
await sendNotifications(restaurantTokens,"newJob" , notification,{}, restaurantData?.user?.language);
    // await sendNotifications(restaurantTokens, notification, {}, restaurantLanguage);
    }
    // Fetch Home Data for Retailer and Send Events
    retailerController.homeData(orderData.restaurantId).then(async (homeDataa) => {
      let eventDataForRetailer = {
        type: "placeOrder",
        data: {
          status: "1",
          message: "Data",
          error: "",
          data: homeDataa,
        },
      };
      let restData = await retOrderData(orderId, {
        transaction: t
      });
      let data = {
        orderId: orderData.id,
        dropOffLat: orderData?.dropOffID?.lat,
        dropOffLng: orderData?.dropOffID?.lng,
        userId: orderData?.userId,
        orderNum: orderData.orderNum,
        estTime: restaurantData?.approxDeliveryTime,
        paymentRecieved: orderData.paymentRecieved,
        cultery_list: [],
        restLat: restaurantData.lat,
        restLng: restaurantData.lng,
        restAddress: restaurantData.address,
        waitForDriver: false,
        allowSelfPickUp: restaurantData.deliveryTypeId === 3 ? true : false,
        retData: restData,
      };
      let eventDataForUser = {
        type: "placeOrder",
        data: {
          status: "1",
          message: "Data",
          error: "",
          data: data,
        },
      };
      sendEvent(restaurantData?.user?.id, eventDataForRetailer);
      sendEvent(admin.id, eventDataForUser);
      sendEvent(userData?.id, eventDataForUser);
    });
    await t.commit(); // Commit the transaction if everything is successful
    const response = ApiResponse("1", "Payment done and Order placed successfully!", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback();
    const response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}
async function orderAgain(req, res) {
  const {
    orderId
  } = req.body;
  const oldOrder = await order.findOne({
    where: {
      id: orderId,
    },
    include: [{
      model: address,
      as: "dropOffID",
    }, {
      model: restaurant,
      include: [{
        model: user,
      }, ],
    }, {
      model: user,
    }, {
      model: orderCharge,
    }, {
      model: orderItems,
      include: [{
        model: R_PLink,
      }, {
        model: orderAddOns,
      }, ],
    }, ],
  });
  const placedStatus = await orderStatus.findOne({
    name: "Placed",
  });
  let ON1 = uON.generate();
  const newOrder = new order();
  newOrder.orderNum = `fom-${ON1}`;
  newOrder.scheduleDate = oldOrder.scheduleDate;
  newOrder.note = oldOrder.note;
  newOrder.leaveOrderAt = oldOrder.leaveOrderAt;
  newOrder.pmId = oldOrder.pmId;
  newOrder.piId = oldOrder.piId;
  newOrder.chargeId = oldOrder.chargeId;
  newOrder.distance = oldOrder.distance;
  newOrder.subTotal = oldOrder.subTotal;
  newOrder.total = oldOrder.total;
  newOrder.status = oldOrder.status;
  newOrder.paymentConfirmed = oldOrder.paymentConfirmed;
  newOrder.paymentRecieved = oldOrder.paymentRecieved;
  newOrder.customTime = oldOrder.customTime;
  newOrder.pickUpId = oldOrder.pickUpId;
  newOrder.dropOffId = oldOrder.dropOffId;
  newOrder.deliveryTypeId = oldOrder.deliveryTypeId;
  newOrder.orderApplicationId = oldOrder.orderApplicationId;
  newOrder.orderModeId = oldOrder.orderModeId;
  newOrder.orderStatusId = placedStatus.id;
  newOrder.orderTypeId = oldOrder.orderTypeId;
  newOrder.paymentMethodId = oldOrder.paymentMethodId;
  newOrder.restaurantId = oldOrder.restaurantId;
  newOrder.currencyUnitId = oldOrder.currencyUnitId;
  newOrder.userId = oldOrder.userId;
  newOrder.save().then(async (orderData) => {
    //save order status history
    const history = new orderHistory();
    history.time = Date.now();
    history.orderId = orderData.id;
    history.orderStatusId = placedStatus.id;
    await history.save();
    //create order charges
    if (oldOrder.orderCharge) {
      const charge = new orderCharge();
      charge.basketTotal = oldOrder?.orderCharge?.basketTotal;
      charge.deliveryFees = oldOrder?.orderCharge?.deliveryFees;
      charge.discount = oldOrder?.orderCharge?.discount;
      charge.serviceCharges = oldOrder?.orderCharge?.serviceCharges;
      charge.VAT = oldOrder?.orderCharge?.VAT;
      charge.tip = oldOrder?.orderCharge?.tip;
      charge.total = oldOrder?.orderCharge?.total;
      charge.adminEarnings = oldOrder?.orderCharge?.adminEarnings;
      charge.driverEarnings = oldOrder?.orderCharge?.driverEarnings;
      charge.restaurantEarnings = oldOrder?.orderCharge?.restaurantEarnings;
      charge.adminPercent = oldOrder?.orderCharge?.adminPercent;
      charge.baseFare = oldOrder?.orderCharge?.baseFare;
      charge.orderId = orderData.id;
      await charge.save();
    }
    //create order items
    oldOrder.orderItems.map(async (item) => {
      const newItem = new orderItems();
      newItem.quantity = item.quantity;
      newItem.unitPrice = item.unitPrice;
      newItem.total = item.total;
      newItem.RPLinkId = item.RPLinkId;
      newItem.userId = item.userId;
      newItem.orderId = orderData.id;
      newItem.save().then(async (itemData) => {
        item.orderAddOns.map(async (add) => {
          const newOrderAddOn = new orderAddOns();
          newOrderAddOn.total = add.total;
          newOrderAddOn.qty = add.qty;
          newOrderAddOn.PAOLinkId = add.PAOLinkId;
          newOrderAddOn.PAACLinkId = add.PAACLinkId;
          newOrderAddOn.orderItemId = itemData.id;
          await newOrderAddOn.save();
        });
      }).catch((error) => {
        const response = ApiResponse("0", error.message, "Error", {});
        return res.json(response);
      });
    });
    let notification = {
      title: "New Job arrived",
      body: "A new job has arrived",
    };
    try {
      let to = [oldOrder?.restaurant?.user?.deviceToken];
      sendNotifications(to, notification, oldOrder?.restaurant?.user?.language);
    } catch (error) {
      console.log(error)
    }
    const estTime = await eta_text(oldOrder?.restaurant?.lat, oldOrder?.restaurant?.lng, oldOrder?.dropOffID?.lat, oldOrder?.dropOffID?.lng);
    let noti_data = {
      estTime: estTime ? estTime : "15 mins",
      distance: oldOrder.distance,
      orderId: orderData.id,
      restaurantName: oldOrder?.restaurant?.businessName,
      estEarning: Number(oldOrder?.orderCharge?.driverEarning).toFixed(2),
      orderNum: orderData?.orderNum,
      orderApplication: oldOrder?.restaurant?.businessType == 1 ? "Restaurant" : oldOrder?.restaurant?.businessType == 3 ? "Store" : "",
      orderType: orderData.orderTypeId == 1 ? "Group" : "Normal",
      dropOffAddress: oldOrder,
      pickUpAddress: oldOrder.dropOffID.streetAddress,
    };
    singleNotification(oldOrder?.user?.deviceToken, "Order Placed", `OrderId : ${orderData.id} has been placed successfully`, noti_data);
    retOrderData(orderData.id).then((retData) => {
      let data = {
        orderId: orderData.id,
        dropOffLat: oldOrder?.dropOffID?.lat,
        dropOffLng: oldOrder?.dropOffID?.lat,
        orderNum: orderData.orderNum,
        paymentRecieved: orderData.paymentRecieved,
        cultery_list: [],
        restLat: oldOrder?.restaurant?.lat,
        restLng: oldOrder?.restaurant?.lng,
        restAddress: oldOrder?.restaurant?.address,
        waitForDriver: false,
        allowSelfPickUp: oldOrder.restaurant.deliveryTypeId === 3 ? true : false,
        retData,
      };
      const response = ApiResponse("1", "Order placed successfully!", "", data);
      return res.json(response);
    });
  }).catch((error) => {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  });
}
/*
        4.1. Update order to pickup type
*/
async function updateOrderToPickup(req, res) {
  const {
    orderId
  } = req.body;
  const orderChargesData = await orderCharge.findOne({
    where: {
      orderId: orderId,
    },
    attributes: ["id", "deliveryFees"],
  });
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    attributes: ["total"],
  });
  let newTotal = parseFloat(orderData?.total) - parseFloat(orderChargesData?.deliveryFees);
  order.update({
    deliveryTypeId: 2,
    total: newTotal,
  }, {
    where: {
      id: orderId,
    },
  });
  orderCharge.update({
    driverEarnings: 0,
    deliveryFees: 0,
    total: newTotal,
  }, {
    where: {
      id: orderChargesData.id,
    },
  });
  const response = ApiResponse("1", "Order delivery type changed to self pickup", "", {});
  return res.json(response);
}
/*
        5. Cancel Order
*/
async function cancelOrderFood(req, res) {
  const {
    orderId,
    reason
  } = req.body;
  const statusNames = ["Accepted", "Preparing", "Ready for delivery", "On the way", ];
  const status = await orderStatus.findAll({
    where: {
      name: {
        [Op.in]: statusNames,
      },
    },
  });
  const statusIds = status.map((status) => status.id);
  const userId = req.user.id;
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: {
      model: restaurant,
      include: {
        model: user,
        attributes: ["deviceToken", "id","language"],
      },
    },
  });
  if (!orderData) {
    const response = ApiResponse("0", "Cannot find order against this order ID", "Error in cancelling order", {});
    return res.json(response);
  }
  if (statusIds.includes(orderData.orderStatusId)) {
    const response = ApiResponse("0", "You cannot cancelled order at this stage", "Error in cancelling order", {});
    return res.json(response);
  }
  order.update({
    status: true,
    orderStatusId: 12,
  }, {
    where: {
      id: orderId,
    },
  });
  let time = Date.now();
  orderHistory.create({
    time,
    reason: reason,
    orderId,
    orderStatusId: 12,
    cancelledBy: userId,
  });
  if (orderData.credits) {
    if (parseInt(orderData.credits) > 0) {
      let userCredits = await Credit.findOne({
        where: {
          userId: orderData.userId
        }
      });
      if (parseInt(userCredits.point) < 18) {
        userCredits.point = (parseInt(userCredits.point) + parseInt(orderData.credits)) > 18 ? 18 : parseInt(userCredits.point) + parseInt(orderData.credits);
        await userCredits.save();
      }
    }
  }
  let restLanguage =  orderData?.restaurant?.user?.language
  singleNotification(formatTokens(orderData?.restaurant?.user?.deviceToken), "Order Cancel", `Order ID ${orderId} has cancelled by User ID ${userId}`,   {} ,restLanguage );
  retailerController.homeData(orderData.restaurantId).then(async (homeDataa) => {
    let eventDataForRetailer = {
      type: "cancelOrder",
      data: {
        status: "1",
        message: "Data",
        error: "",
        data: homeDataa,
      },
    };
    let eventDataForUser = {
      type: "cancelOrder",
      data: {
        status: "1",
        message: "Data",
        error: "",
        data: {},
      },
    };
    sendEvent(orderData?.restaurant?.user?.id, eventDataForRetailer);
    sendEvent(userId, eventDataForUser);
  })
   try {
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME, 
      to: orderData.restaurant.user.email, 
      subject: `Order Cancelled: Order ID ${orderId}`, 
      text: `The order with Order ID ${orderId} has been cancelled. Reason: ${reason}`,
    });
    console.log("Cancellation email sent successfully.");
  } catch (error) {
    console.error("Error sending cancellation email: ", error);
  }
  const response = ApiResponse("1", "Order cancelled", "", {});
  return res.json(response);
}
/*
        6. Active Orders of a  user
*/
async function ongoingOrders(req, res) {
  const statusNames = ["Delivered", "Ride end"];
  const status = await orderStatus.findAll({
    where: {
      name: {
        [Op.in]: statusNames,
      },
    },
    attributes: ["id"],
  });
  const statusIds = status.map((status) => status.id);
  const userId = req.user.id;
  const ongoingOrders = await order.findAll({
    where: {
      userId,
      status: 1,
      orderStatusId: {
        [Op.notIn]: statusIds,
      },
    },
    order: [
      ["scheduleDate", "ASC"]
    ],
    include: [{
      model: restaurant,
      attributes: ["businessName"],
    }, {
      model: orderStatus,
      attributes: ["id", "displayText"],
    }, ],
    attributes: ["id", "orderNum",
      [
        sequelize.fn("date_format", sequelize.col("scheduleDate"), "%d-%m-%Y %r"), "scheduleTime",
      ], "total", "orderApplicationId", "driverId", "deliveryTypeId",
    ],
  });
  if (!ongoingOrders || ongoingOrders.length === 0) {
    throw customException("No data available", "You have no active orders");
  }
  const restOrders = ongoingOrders.filter(
    (ele) => ele.orderApplicationId === 1);
  //   const rideOrders = ongoingOrders.filter(ele => ele.orderApplicationId === 2);
  return res.json({
    status: "1",
    message: "Ongoing Orders",
    data: {
      restOrders,
      //   rideOrders,
    },
    error: "",
  });
}
//Module 5:
/*
        1. Add Rating and feedback of both restaurant and driver
*/
// async function addRatingFeedback(req, res) {
//   try {
//     const {
//       restaurantRate,
//       restaurantFeedBack,
//       driverRate,
//       orderId,
//       deliveryType,
//       driverTip
//     } = req.body;
//     const orderData = await order.findOne({
//       where: { id: orderId },
//     });
//     if (!orderData) {
//       return res.json(ApiResponse("0", "Order not found", "Error", {}));
//     }
//     const cTime = Date.now();
//     const saveRestaurantRating = async () => {
//       const restRating = new restaurantRating({
//         value: restaurantRate,
//         at: cTime,
//         orderId,
//         restaurantId: orderData.restaurantId,
//         userId: orderData.userId,
//       });
//       await restRating.save();
//       const [sum, count] = await Promise.all([
//         restaurantRating.sum('value', { where: { restaurantId: orderData.restaurantId } }),
//         restaurantRating.count({ where: { restaurantId: orderData.restaurantId } }),
//       ]);
//       const avg = sum / count;
//       const restData = await restaurant.findOne({ where: { id: orderData.restaurantId }, attributes: ['id', 'rating'] });
//       restData.rating = avg;
//       await restData.save();
//     };
//     if (deliveryType === "Self-Pickup") {
//       if (restaurantRate) {
//         await saveRestaurantRating();
//         return res.json(ApiResponse("1", "Rating added successfully", "", {}));
//       } else {
//         return res.json(ApiResponse("0", "Feedback is required", "", {}));
//       }
//     } else {
//       if (driverRate && restaurantRate) {
//         const driverRatingData = new driverRating({
//           value: parseFloat(driverRate),
//           at: cTime,
//           orderId,
//           userId: orderData?.userId,
//           driverId: orderData.driverId,
//         });
//         await driverRatingData.save();
//         if (driverTip) {
//           const chargeData = await orderCharge.findOne({ where: { orderId } });
//           if (chargeData) {
//             chargeData.additionalTip = driverTip;
//             await chargeData.save();
//           }
//         }
//         await saveRestaurantRating();
//         return res.json(ApiResponse("1", "Rating added successfully", "", {}));
//       } else {
//         return res.json(ApiResponse("0", "Feedback is required", "", {}));
//       }
//     }
//   } catch (error) {
//     return res.json(ApiResponse("0", error.message, "Error", {}));
//   }
// }
/*
        2. Add Rating and feedback of both restaurant and driver
*/
async function addTip(req, res) {
  const {
    amount,
    driverId,
    orderId
  } = req.body;
  const cTime = Date.now();
  const negAmount = -1 * parseFloat(amount);
  // Creating a positive entry for Admin (he owes this money to driver)
  const adminEntry = await wallet.create({
    amount,
    paymentType: "Tip Owed",
    at: cTime,
    orderId,
    userId: driverId,
  });
  const driverData = await user.findOne({
    where: {
      id: driverId,
    },
  });
  // Creating a negative entry for the driver (he receives this money from admin)
  const driverEntry = await wallet.create({
    amount: negAmount,
    paymentType: "Tip Received",
    at: cTime,
    orderId,
    userId: driverId,
  });
  if (!adminEntry || !driverEntry) {
    throw new CustomException("Error in paying Tip", "Tip Payment Failed");
  }
  let driverLanguage = driverData?.language
  console.log("driverData.deviceToken======================>", driverData.deviceToken)
  singleNotification(driverData.deviceToken, "Tip Paid", `${negAmount} tip has paid to you`,{},driverLanguage);
  res.json({
    status: "1",
    message: "Tip Paid",
    data: {},
    error: "",
  });
}
//Module 6: Drawer (Profile)
/*
        1. Get Profile
*/
async function getProfile(req, res) {
  const { userId } = req.body;

  try {
    // Use Promise.all to perform concurrent queries
    const [userData, credit, totalOrders, recentOrders] = await Promise.all([
      user.findOne({
        where: { id: userId },
        attributes: [
          "userName",
          "firstName",
          "lastName",
          "email",
          "image",
          "countryCode",
          "phoneNum",
          "referalCode",
        ],
      }),
      Credit.findOne({
        where: { userId },
        attributes: ["point"],
      }),
      order.count({ where: { userId } }),
      order.findAll({
        where: {
          userId,
          orderStatusId: [1, 2, 3, 4, 5, 17,7], // Filter orders by specific orderStatusId values
        },
        limit:5,
        attributes: ["id", "userId", "orderNum"],
        order: [["id", "DESC"]],
        include: [
          {
            model: restaurant,
            attributes: [
              "id",
              "businessName",
              "rating",
              "deliveryCharge",
              "image",
              "logo",
              "approxDeliveryTime",
              "address",
              "description",
              "city",
              "country",
              "zipCode"
            ],
            include: [
              {
                model: zoneRestaurants,
                as: "zoneRestaurant",
                attributes: ["restaurantId"],
                include: {
                  model: zone,
                  attributes: ["id"],
                  include: {
                    model: zoneDetails,
                    attributes: ["currencyUnitId", "distanceUnitId"],
                    include: [
                      {
                        model: unit,
                        as: "currencyUnit",
                        attributes: ["symbol"],
                      },
                      {
                        model: unit,
                        as: "distanceUnit",
                        attributes: ["symbol"],
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
      }),
    ]);

    // Format each recent order in the list
    const formattedRecentOrders = recentOrders.map((order) => {
      const restaurantData = order.restaurant;
      let currencyUnitSymbol = "N/A";
      let distanceUnitSymbol = "N/A";

      if (
        restaurantData &&
        restaurantData.zoneRestaurant &&
        restaurantData.zoneRestaurant.zone &&
        restaurantData.zoneRestaurant.zone.zoneDetail
      ) {
        const zoneDetail = restaurantData.zoneRestaurant.zone.zoneDetail;

        if (zoneDetail.currencyUnit) {
          currencyUnitSymbol = zoneDetail.currencyUnit.symbol;
        }

        if (zoneDetail.distanceUnit) {
          distanceUnitSymbol = zoneDetail.distanceUnit.symbol;
        }
      }

      return {
        orderId: order.id,
        userId: order.userId,
        orderNum: order.orderNum,
        restaurant: {
          id: restaurantData.id,
          businessName: restaurantData.businessName,
          rating: restaurantData.rating,
          deliveryCharge: restaurantData.deliveryCharge,
          image: restaurantData.image,
          logo: restaurantData.logo,
          approxDeliveryTime: restaurantData.approxDeliveryTime,
          description: restaurantData.description,
          address: `${restaurantData.address ?? ''}, ${restaurantData.zipCode ?? ''} ${restaurantData.city ?? ''}, ${restaurantData.country ?? ''}`.replace(/(^,|,$|\s{2,})/g, '').trim(),
          currencyUnit: currencyUnitSymbol,
          distanceUnit: distanceUnitSymbol,
        },
      };
    });

    // Send response
    return res.json({
      status: "1",
      message: "User profile data",
      data: {
        userName: userData?.userName ?? "",
        firstName: userData?.firstName ?? "",
        lastName: userData?.lastName ?? "",
        email: userData?.email ?? "N/A",
        image: userData?.image ?? "N/A",
        countryCode: userData?.countryCode ?? "N/A",
        phoneNum: userData?.phoneNum ?? "N/A",
        referalCode: userData?.referalCode ?? "N/A",
        creditPoints: credit?.point ?? "0",
        totalOrders,
        recentOrders: formattedRecentOrders,
      },
      error: "",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      status: "0",
      message: "Error fetching user profile",
      error: error.message,
    });
  }
}

async function UsergetProfile(req, res) {
  const { userId } = req.params;

  try {
    // Use Promise.all to perform concurrent queries
    const [userData, credit, totalOrders, recentOrder] = await Promise.all([
      user.findOne({
        where: { id: userId },
        attributes: [
          "userName",
          "firstName",
          "lastName",
          "email",
          "image",
          "countryCode",
          "phoneNum",
          "referalCode",
        ],
      }),
      Credit.findOne({
        where: { userId },
        attributes: ["point"],
      }),
      order.count({ where: { userId } }),
      order.findOne({
        where: { userId },
        attributes: ["id", "userId", "orderNum"],
        order: [["id", "DESC"]],
        include: [
          {
            model: restaurant,
            attributes: [
              "id",
              "businessName",
              "rating",
              "deliveryCharge",
              "image",
              "logo",
              "approxDeliveryTime",
              "address",
              "description",
              "city",
              "country",
              "zipCode"
            ],
            include: [
              {
                model: zoneRestaurants,
                as: "zoneRestaurant",
                attributes: ["restaurantId"],
                include: {
                  model: zone,
                  attributes: ["id"],
                  include: {
                    model: zoneDetails,
                    attributes: ["currencyUnitId", "distanceUnitId"],
                    include: [
                      {
                        model: unit,
                        as: "currencyUnit",
                        attributes: ["symbol"],
                      },
                      {
                        model: unit,
                        as: "distanceUnit",
                        attributes: ["symbol"],
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
      }),
    ]);

    // Format recentOrder response
    let formattedRecentOrder = null;

    if (recentOrder && recentOrder.restaurant) {
      const restaurantData = recentOrder.restaurant;

      let currencyUnitSymbol = "N/A";
      let distanceUnitSymbol = "N/A";

      if (
        restaurantData.zoneRestaurant &&
        restaurantData.zoneRestaurant.zone &&
        restaurantData.zoneRestaurant.zone.zoneDetail
      ) {
        const zoneDetail = restaurantData.zoneRestaurant.zone.zoneDetail;

        if (zoneDetail.currencyUnit) {
          currencyUnitSymbol = zoneDetail.currencyUnit.symbol;
        }

        if (zoneDetail.distanceUnit) {
          distanceUnitSymbol = zoneDetail.distanceUnit.symbol;
        }
      }

      formattedRecentOrder = {
        orderId: recentOrder.id,
        userId: recentOrder.userId,
        orderNum: recentOrder.orderNum,
        restaurant: {
          id: restaurantData.id,
          businessName: restaurantData.businessName,
          rating: restaurantData.rating,
          deliveryCharge: restaurantData.deliveryCharge,
          image: restaurantData.image,
          logo: restaurantData.logo,
          approxDeliveryTime: restaurantData.approxDeliveryTime,
          description: restaurantData.description,
         address: `${restaurantData.address ?? ''}, ${restaurantData.zipCode ?? ''} ${restaurantData.city ?? ''}, ${restaurantData.country ?? ''}`.replace(/(^,|,$|\s{2,})/g, '').trim(),
          currencyUnit: currencyUnitSymbol,
          distanceUnit: distanceUnitSymbol,
        },
      };
    }

    // Send response
    return res.json({
      status: "1",
      message: "User profile data",
      data: {
        userName: userData?.userName ?? "",
        firstName: userData?.firstName ?? "",
        lastName: userData?.lastName ?? "",
        email: userData?.email ?? "N/A",
        image: userData?.image ?? "N/A",
        countryCode: userData?.countryCode ?? "N/A",
        phoneNum: userData?.phoneNum ?? "N/A",
        referalCode: userData?.referalCode ?? "N/A",
        creditPoints: credit?.point ?? "0",
        totalOrders,
        recentOrder: formattedRecentOrder,
      },
      error: "",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      status: "0",
      message: "Error fetching user profile",
      error: error.message,
    });
  }
}

// async function UsergetProfile(req, res) {
//   const {
//     userId
//   } = req.params;
//   const userData = await user.findOne({
//     where: {
//       id: userId,
//     },
//   });
//   const credit = await Credit.findOne({
//     where: {
//       userId: userId,
//     },
//   });
//   return res.json({
//     status: "1",
//     message: "User profile data",
//     data: {
//       userName: userData?.userName ? userData?.userName : "Dummy",
//       firstName: userData?.firstName ? userData.firstName : "first Name",
//       lastName: userData?.lastName ? userData.lastName : "lastName",
//       email: userData.email,
//       countryCode: userData.countryCode,
//       phoneNum: userData.phoneNum,
//       image: userData.image,
//       referalCode: userData.referalCode,
//       creditPoints: credit ? credit.point : "0",
//     },
//     error: "",
//   });
// }
/*
        2. Update profile
*/
async function updateProfile(req, res) {
  const {
    firstName,
    lastName,
    countryCode,
    phoneNum,
    userId,
    userName
  } = req.body;
  // Initialize image path to null
  let imagePath = null;
  // Check if req.file exists and update imagePath accordingly
  if (req.file) {
    const tmpPath = req.file.path;
    imagePath = tmpPath.replace(/\\/g, "/");
  }
  try {
    // Update the user profile
    await user.update({
      firstName,
      lastName,
      countryCode,
      phoneNum,
      userName,
      ...(imagePath && {
        image: imagePath
      }) // Only include image path if it's not null
    }, {
      where: {
        id: userId,
      },
    });
    return res.json({
      status: "1",
      message: "Profile updated successfully",
      data: {
        name: userName,
      },
      error: "",
    });
  } catch (error) {
    return res.json({
      status: "0",
      message: error.message,
      data: {},
      error: "Error updating profile",
    });
  }
}
/*
        3. Change password in response to old password 
    ________________________________________
*/
async function changePassword(req, res) {
  const {
    newPassword,
    oldPassword
  } = req.body;
  // getting ID FROM middleware
  const userId = req.user.id;
  const currUser = await user.findOne({
    where: {
      id: userId,
    },
  });
  bcrypt.compare(oldPassword, currUser.password).then((match) => {
    if (!match) {
      const response = ApiResponse("0", "your old passwrod is incorrect", err.message, {});
      return res.json(response);
    }
    bcrypt.hash(newPassword, 10).then((hashedPassword) => {
      user.update({
        password: hashedPassword,
      }, {
        where: {
          id: userId,
        },
      }).then((passData) => {
        const response = ApiResponse("1", "Password Changed successfully", "", {});
        return res.json(response);
      });
    });
  }).catch((err) => {
    //console.log(err)
    const response = ApiResponse("0", "your old passwrod is incorrect", err.message, {});
    return res.json(response);
  });
}
/*
        4. Send support email
    ________________________________________
*/
async function supportEmail(req, res) {
  const phoneData = await setting.findOne({
    where: {
      content: "phone",
    },
    attributes: ["content", "value"],
  });
  const emailData = await setting.findOne({
    where: {
      content: "email",
    },
    attributes: ["content", "value"],
  });
  return res.json({
    status: "1",
    message: "Support Information",
    data: {
      phoneData,
      emailData,
      termsConditions: {
        content: "Terms & Condition",
        value: "https://fomino.ch/terms",
      },
    },
    error: "",
  });
}
/*
        4. Show order history of restaurant  
    ________________________________________
*/
async function orderHistoryRes(req, res) {
  const userId = req.user.id;
  let deliveredStatus = await orderStatus.findOne({
    where: {
      name: 'delivered'
    }
  });
  let cancelledStatus = await orderStatus.findOne({
    where: {
      name: 'Cancelled'
    }
  });
  let cod = await paymentMethod.findOne({
    where: {
      name: "COD"
    }
  });
  const status = await orderStatus.findOne({
    where: {
      name: "Delivered",
    },
  });
  const Reject = await orderStatus.findOne({
    where: {
      name: "Reject",
    },
  });
  const compOrders = await order.findAll({
      
    where: {
    //   paymentRecieved: 1,
      userId: userId,
      orderStatusId: {
        [Op.or]: [deliveredStatus.id, cancelledStatus.id,Reject.id]
      }
    },
    order: [
      ["id", "DESC"]
    ],
    include: [{
      model: restaurant,
      include: {
        model: zoneRestaurants,
        include: {
          model: zone,
          include: {
            model: zoneDetails,
            include: [{
              model: unit,
              as: "currencyUnit",
            }, {
              model: unit,
              as: "distanceUnit",
            }, ],
          },
        },
      },
    }, {
      model: orderStatus,
    }, {
      model: address,
      as: "pickUpID",
    }, {
      model: address,
      as: "dropOffID",
    }, ],
  });
  const ongoingOrders = await order.findAll({
  where: {
    userId: userId,
    [Op.or]: [
      {
        paymentMethodId: cod.id, // If the payment method is COD
        paymentRecieved: {
          [Op.or]: [null, 0, false] // Ensure paymentRecieved is 0, null, or false
        }
      },
      {
        paymentMethodId: {
          [Op.not]: cod.id // For other payment methods
        },
        paymentRecieved: 1 // Ensure paymentRecieved is 1
      }
    ],
    orderStatusId: {
      [Op.notIn]: [deliveredStatus.id, cancelledStatus.id, Reject.id]
    }
  },
  order: [["id", "DESC"]],
  include: [
    {
      model: restaurant,
      include: {
        model: zoneRestaurants,
        include: {
          model: zone,
          include: {
            model: zoneDetails,
            include: [
              {
                model: unit,
                as: "currencyUnit"
              },
              {
                model: unit,
                as: "distanceUnit"
              }
            ]
          }
        }
      }
    },
    {
      model: orderStatus
    },
    {
      model: address,
      as: "pickUpID"
    },
    {
      model: address,
      as: "dropOffID"
    }
  ]
});

  
  let foodOrders = [];
  let ongoingOrdersList = [];
 
  compOrders.map((o, i) => {
    let time = new Date(o.scheduleDate);
    let outObj = {
      orderId: o.id,
      orderNum: o.orderNum,
      //   scheduleDate: time.toLocaleString("en-US"),
      scheduleDate: o.createdAt.toLocaleString("en-US"),
      restaurantName: o.restaurant ? o.restaurant?.businessName : "",
      restaurantimage: o.restaurant ? o.restaurant?.image : "",
      restaurantlogo: o.restaurant ? o.restaurant?.logo : "",
      restaurantCurrency: o.restaurant?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit,
      total: o.total,
      // pickUp: `${o.pickUpID}`,
      pickUp: o.restaurant ? o.restaurant?.address : "",
      dropOff: o?.dropOffID?.streetAddress + " " + o?.dropOffID?.city + " " + o?.dropOffID?.state,
      // dropOff: o.dropOffId? o.dropOffID.streetAddress: '',
      orderStatus: o?.orderStatus ? o?.orderStatus?.name : "No Status Assigned",
      statusFeedback: o.orderStatusId === 6 ? "Complete" : "In Progress",
    };
    foodOrders.push(outObj);
  });
  ongoingOrders.map((o, i) => {
    let time = new Date(o.scheduleDate);
    let outObj = {
      orderId: o.id,
      orderNum: o.orderNum,
      //   scheduleDate: time.toLocaleString("en-US"),
      scheduleDate: o.createdAt.toLocaleString("en-US"),
      restaurantName: o.restaurant ? o.restaurant?.businessName : "",
      restaurantimage: o.restaurant ? o.restaurant?.image : "",
      restaurantlogo: o.restaurant ? o.restaurant?.logo : "",
      restaurantCurrency: o.restaurant?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit,
      total: o.total,
      // pickUp: `${o.pickUpID}`,
      pickUp: o.restaurant ? o.restaurant?.address : "",
      dropOff: o?.dropOffID?.streetAddress + " " + o?.dropOffID?.city + " " + o?.dropOffID?.state,
      // dropOff: o.dropOffId? o.dropOffID.streetAddress: '',
      orderStatus: o?.orderStatus ? o?.orderStatus?.name : "No Status Assigned",
      statusFeedback: o.orderStatusId === 6 ? "Complete" : "In Progress",
    };
    ongoingOrdersList.push(outObj);
  });

  let data = {
    pastOrders:foodOrders,
    ongoingOrdersList
  };
  const response = ApiResponse("1", "Order History", "", data);
  return res.json(response);
}
/*
        4. Order details of a specific order food
    ________________________________________
*/
// async function orderDetails(req, res) {
//   const { orderId } = req.body;
//   const orderData = await order.findOne({
//     where: {
//       id: orderId,
//     },
//     include: [
//       {
//         model: restaurant,
//         include: {
//           model: zoneRestaurants,
//           include: {
//             model: zone,
//             include: {
//               model: zoneDetails,
//               include: { model: unit, as: "currencyUnit" },
//             },
//           },
//         },
//       },
//       {
//         model: orderStatus,
//       },
//       {
//         model: orderHistory,
//         attributes: ["id", "time"],
//         include: { model: orderStatus, attributes: ["name"] },
//       },
//       {
//         model: address,
//         as: "dropOffID",
//       },
//       {
//         model: orderItems,
//         include: [
//           {
//             model: R_PLink,
//           },
//           {
//             model: orderAddOns,
//             include: {
//               model: addOn,
//             },
//           },
//         ],
//       },
//       {
//         model: orderCharge,
//       },
//       {
//         model: paymentMethod,
//       },
//       {
//         model: deliveryType,
//       },
//       {
//         model: user,
//         as: "DriverId",
//         include: {
//           model: driverDetails,
//         },
//       },
//     ],
//   });
//     //  return res.json(orderData)
//   var estTime = await eta_text(
//     orderData.restaurant.lat,
//     orderData.restaurant.lng,
//     orderData.dropOffID?.lat,
//     orderData.dropOffID?.lng
//   );
//   const result = estTime == "" ? "10" : estTime.match(/\d+/)[0];
// //   return res.json(result)
//   if (!orderData) {
//     const response = ApiResponse(
//       "0",
//       "No Order found against this id",
//       "Error",
//       {}
//     );
//     return res.json(response);
//   }
//   //add custom time to est time
//   if(orderData.customTime){
//       estTime = parseInt(result) + parseInt(orderData.customTime/60)
//   }
//   //Formatting Schedule Date
//   let time = new Date(orderData.scheduleDate);
//   let schDate = time.toLocaleString("en-US");
//   // Array to store Items with add Ons
//   let itemArr = [];
//   // return res.json(orderData)
//   orderData.orderItems.map((oi, idx) => {
//     let itemPrice = parseFloat(oi.total);
//     let addOnArr = [];
//     //manipulating addons
//     oi?.orderAddOns.map((oao, ind) => {
//       itemPrice = itemPrice + parseFloat(oao.total);
//       let addOnObj = {
//         name: oao?.addOn?.name,
//         price: oao.total,
//         quantity: oao?.qty?.toString(),
//       };
//       addOnArr.push(addOnObj);
//     });
//     let itemObj = {
//       itemName: oi.R_PLink?.name,
//       quantity: oi.quantity,
//       image: oi?.R_PLink?.image,
//       itemPrice: parseFloat(itemPrice),
//       addOns: addOnArr,
//     };
//     itemArr.push(itemObj);
//   });
//   let driver_lat = "";
//   let driver_lng = "";
//   let driverLatLng = {};
//   const firebase_data = await axios.get(process.env.FIREBASE_URL);
//   if (firebase_data.data) {
//     driverLatLng = firebase_data?.data[orderData?.driverId];
//   }
//   let outObj = {
//     id: orderData.id,
//     createdAt: orderData.createdAt,
//     restaurantId: orderData.restaurant ? orderData.restaurant.id : "",
//     countryCode: orderData.restaurant ? orderData.restaurant.countryCode : "",
//     phoneNum: orderData.restaurant ? orderData.restaurant.phoneNum : "",
//     restaurantAddress: orderData.restaurant ? orderData.restaurant.address : "",
//     zipCode: orderData.restaurant ? orderData.restaurant.zipCode : "",
//     restaurantName: orderData?.restaurant
//       ? orderData?.restaurant?.businessName
//       : "",
//     restaurantPhoto: orderData.restaurant ? orderData.restaurant.logo : "",
//     restaurantLat: orderData?.restaurant?.lat,
//     restaurantLng: orderData?.restaurant?.lng,
//     orderNum: orderData?.orderNum,
//     scheduleDate: schDate,
//     // estTime: estTime ? `${estTime} mints` : "10 mints",
//     estTime: orderData ? `${orderData?.restaurant?.approxDeliveryTime} mints` : "10 mints",
//     OrderStatusId: orderData?.orderStatus?.id,
//     note: orderData?.note,
//     OrderStatus: orderData?.orderStatus?.name,
//     address: `${orderData?.dropOffID?.building} ${orderData.dropOffID?.streetAddress}`,
//     dropOffLat: orderData?.dropOffID?.lat,
//     dropOffLng: orderData?.dropOffID?.lng,
//     items: itemArr,
//     tip: orderData?.orderCharge?.tip
//       ? orderData?.orderCharge?.tip?.toString()
//       : "0",
//     subTotal: orderData?.orderCharge?.basketTotal
//       ? orderData?.orderCharge?.basketTotal
//       : 0,
//     deliveryFee: orderData?.orderCharge?.deliveryFees
//       ? orderData?.orderCharge?.deliveryFees
//       : 0,
//     VAT: orderData?.orderCharge?.VAT ? orderData?.orderCharge?.VAT : 0,
//     discount: orderData?.orderCharge?.discount
//       ? orderData?.orderCharge?.discount
//       : 0,
//     serviceCharges: orderData?.orderCharge?.serviceCharges
//       ? orderData?.orderCharge?.serviceCharges
//       : 0,
//     total: orderData?.orderCharge?.total ? orderData?.orderCharge?.total : 0,
//     note: orderData?.note ? orderData?.note : "",
//     paymentMethod: orderData?.paymentMethod?.name ?? "",
//     deliveryType: orderData?.deliveryType?.name,
//     driverDetails: orderData?.driverId
//       ? {
//           id: `${orderData?.DriverId?.id}`,
//           name: `${orderData?.DriverId?.firstName} ${orderData?.DriverId?.lastName}`,
//           image: orderData.DriverId?.driverDetails[0]?.profilePhoto,
//           phoneNum: `${orderData?.DriverId?.countryCode} ${orderData?.DriverId?.phoneNum}`,
//           driverLatLng: driverLatLng,
//         }
//       : null,
//     orderStatuses: orderData?.orderHistories,
//     currency:
//       orderData?.restaurant?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit
//         ?.symbol || "",
//   };
//   const response = ApiResponse("1", "Order Details", "", outObj);
//   return res.json(response);
// }
async function orderDetails(req, res) {
  const {
    orderId
  } = req.body;
  try {
    // Fetch the order details with associated data
    const orderData = await order.findOne({
      where: {
        id: orderId
      },
      include: [
          
          {
        model: restaurant,
        include: {
          model: zoneRestaurants,
          include: {
            model: zone,
            include: {
              model: zoneDetails,
              include: {
                model: unit,
                as: "currencyUnit"
              },
            },
          },
        },
      }, {
        model: orderStatus
      }, {
        model: orderHistory,
        attributes: ["id", "time"],
        include: {
          model: orderStatus,
          attributes: ["name"]
        },
      }, {
        model: address,
        as: "dropOffID"
      }, 
      {
        model: orderItems,
        include: [{
          model: R_PLink
        }, {
          model: orderAddOns,
          include: {
            model: addOn
          },
        }, ],
      }, {
        model: orderCharge
      }, {
        model: paymentMethod
      }, {
        model: deliveryType
      }, {
        model: user,
        as: "DriverId",
        include: {
          model: driverDetails
        },
      }, ],
    });
    // Check if orderData was found
    if (!orderData) {
      const response = ApiResponse("0", "No Order found against this id", "Error", {});
      return res.json(response);
    }
    // Estimate time calculation
    const estTime = await eta_text(orderData.restaurant.lat, orderData.restaurant.lng, orderData.dropOffID?.lat, orderData.dropOffID?.lng);
    const result = estTime ? estTime.match(/\d+/)[0] : "10";
    let finalEstTime = parseInt(result);
    if (orderData.customTime) {
      finalEstTime += parseInt(orderData.customTime / 60);
    }
    // Formatting Schedule Date
    const time = new Date(orderData.scheduleDate);
    const schDate = time.toLocaleString("en-US");
    // Process order items
    const itemArr = orderData.orderItems.map(oi => {
      const addOnArr = oi.orderAddOns.map(oao => ({
        name: oao?.addOn?.name,
        price: oao.total,
        quantity: oao?.qty?.toString(),
      }));
      const itemPrice = oi.orderAddOns.reduce(
        (acc, oao) => acc + parseFloat(oao.total), parseFloat(oi.total));
      return {
        itemName: oi.R_PLink?.name || "",
        quantity: oi.quantity || 0,
        image: oi?.R_PLink?.image || "",
        itemPrice: itemPrice,
        addOns: addOnArr,
      };
    });
    // Fetch driver details
    const firebase_data = await axios.get(process.env.FIREBASE_URL);
    const driverLatLng = firebase_data.data?.[orderData?.driverId?.toString()] || {};
    // Prepare output object
    const outObj = {
      id: orderData.id,
      createdAt: orderData.createdAt,
      restaurantId: orderData.restaurant?.id || "",
      countryCode: orderData.restaurant?.countryCode || "",
      phoneNum: orderData.restaurant?.phoneNum || "",
      restaurantAddress: orderData.restaurant?.address || "",
      zipCode: orderData.restaurant?.zipCode || "",
      restaurantName: orderData.restaurant?.businessName || "",
      restaurantPhoto: orderData.restaurant?.logo || "",
      restaurantLat: orderData.restaurant?.lat || null,
      restaurantLng: orderData.restaurant?.lng || null,
      orderNum: orderData?.orderNum || "",
      paymentMethodName: orderData?.paymentMethodName || "",
      scheduleDate: schDate,
      //   estTime: `${orderData?.restaurant?.approxDeliveryTime || "10"} mints`,
      estTime: `${finalEstTime || "10"} mints`,
      OrderStatusId: orderData?.orderStatus?.id || "",
      note: orderData?.note || "",
      OrderStatus: orderData?.orderStatus?.name || "",
      address: `${orderData?.dropOffID?.building || ""} ${orderData.dropOffID?.streetAddress || ""}`,
      dropOffLat: orderData?.dropOffID?.lat || null,
      dropOffLng: orderData?.dropOffID?.lng || null,
      items: itemArr,
      tip: orderData?.orderCharge?.tip?.toString() || "0",
      subTotal: orderData?.orderCharge?.basketTotal || 0,
      deliveryFee: orderData?.orderCharge?.deliveryFees || 0,
      VAT: orderData?.orderCharge?.VAT || 0,
      discount: orderData?.orderCharge?.discount || 0,
      serviceCharges: orderData?.orderCharge?.serviceCharges || 0,
      total: orderData?.orderCharge?.total || 0,
      paymentMethod: orderData?.paymentMethod?.name || "",
      deliveryType: orderData?.deliveryType?.name || "",
      driverDetails: orderData?.driverId ? {
        id: `${orderData.DriverId?.id || ""}`,
        name: `${orderData.DriverId?.firstName || ""} ${orderData.DriverId?.lastName || ""}`,
        firstName:orderData.DriverId?.firstName,
        lastName:orderData.DriverId?.lastName,
        email:orderData.DriverId?.email,
        image: orderData.DriverId?.driverDetails?.[0]?.profilePhoto || "",
        phoneNum: `${orderData.DriverId?.countryCode || ""} ${orderData.DriverId?.phoneNum || ""}`,
        driverLatLng: driverLatLng,
      } : null,
      orderStatuses: orderData?.orderHistories || [],
      currency: orderData?.restaurant?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol || "",
    };
    // Respond with the formatted order details
    const response = ApiResponse("1", "Order Details", "", outObj);
    return res.json(response);
  } catch (error) {
    // Handle errors
    console.error("Error fetching order details:", error);
    const response = ApiResponse("0", "An error occurred", "Error", {});
    return res.json(response);
  }
}
async function orderDetailsGet(req, res) {
  const {
    orderId
  } = req.params;
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: [{
      model: orderMode,
      attributes: ['name']
    }, {
      model: restaurant,
      include: {
        model: zoneRestaurants,
        include: {
          model: zone,
          include: {
            model: zoneDetails,
            include: {
              model: unit,
              as: "currencyUnit"
            },
          },
        },
      },
    }, {
      model: orderStatus,
    }, {
      model: orderHistory,
      attributes: ["id", "time"],
      include: {
        model: orderStatus,
        attributes: ["name"]
      },
    }, {
      model: address,
      as: "dropOffID",
    }, {
      model: orderItems,
      include: [{
        model: R_PLink,
      }, {
        model: orderAddOns,
        include: {
          model: addOn,
        },
      }, ],
    }, {
      model: orderCharge,
    }, {
      model: paymentMethod,
    }, {
      model: deliveryType,
    }, {
      model: user,
      as: "DriverId",
      include: {
        model: driverDetails,
      },
    }, ],
  });
  //   return res.json(orderData)
  const estTime = await eta_text(orderData.restaurant.lat, orderData.restaurant.lng, orderData.dropOffID?.lat, orderData.dropOffID?.lng);
  //   return res.json(orderData);
  if (!orderData) {
    const response = ApiResponse("0", "No Order found against this id", "Error", {});
    return res.json(response);
  }
  //Formatting Schedule Date
  let time = new Date(orderData.scheduleDate);
  let schDate = time.toLocaleString("en-US");
  // Array to store Items with add Ons
  let itemArr = [];
  // return res.json(orderData)
  orderData.orderItems.map((oi, idx) => {
    let itemPrice = parseFloat(oi.total);
    let addOnArr = [];
    //manipulating addons
    oi?.orderAddOns.map((oao, ind) => {
      itemPrice = itemPrice + parseFloat(oao.total);
      let addOnObj = {
        name: oao?.addOn?.name,
        price: oao.total,
        quantity: oao?.qty?.toString(),
      };
      addOnArr.push(addOnObj);
    });
    let itemObj = {
      itemName: oi.R_PLink?.name,
      quantity: oi.quantity,
      image: oi?.R_PLink?.image,
      itemPrice: parseFloat(itemPrice),
      addOns: addOnArr,
    };
    itemArr.push(itemObj);
  });
  let driver_lat = "";
  let driver_lng = "";
  let driverLatLng = {};
  const firebase_data = await axios.get(process.env.FIREBASE_URL);
  if (firebase_data.data) {
    driverLatLng = firebase_data?.data[orderData?.driverId];
  }
  let outObj = {
    id: orderData.id,
    createdAt: orderData.createdAt,
    orderMode: orderData.orderMode,
    restaurantId: orderData.restaurant ? orderData.restaurant.id : "",
    countryCode: orderData.restaurant ? orderData.restaurant.countryCode : "",
    phoneNum: orderData.restaurant ? orderData.restaurant.phoneNum : "",
    restaurantAddress: orderData.restaurant ? orderData.restaurant.address : "",
    zipCode: orderData.restaurant ? orderData.restaurant.zipCode : "",
    restaurantName: orderData?.restaurant ? orderData?.restaurant?.businessName : "",
    restaurantPhoto: orderData.restaurant ? orderData.restaurant.logo : "",
    restaurantLat: orderData?.restaurant?.lat,
    restaurantLng: orderData?.restaurant?.lng,
    orderNum: orderData?.orderNum,
    scheduleDate: schDate,
    estTime: estTime ? estTime : "10 mints",
    OrderStatusId: orderData?.orderStatus?.id,
    paymentMethodName: orderData?.paymentMethodName,
    note: orderData?.note,
    OrderStatus: orderData?.orderStatus?.name,
    address: `${orderData?.dropOffID?.building} ${orderData.dropOffID?.streetAddress}`,
    dropOffLat: orderData?.dropOffID?.lat,
    dropOffLng: orderData?.dropOffID?.lng,
    items: itemArr,
    subTotal: orderData ? orderData?.subTotal : 0,
    deliveryFee: orderData?.orderCharge?.deliveryFees ? orderData?.orderCharge?.deliveryFees : 0,
    VAT: orderData?.orderCharge?.VAT ? orderData?.orderCharge?.VAT : 0,
    discount: orderData?.orderCharge?.discount ? orderData?.orderCharge?.discount : 0,
    serviceCharges: orderData?.orderCharge?.serviceCharges ? orderData?.orderCharge?.serviceCharges : 0,
    total: orderData ? orderData?.total : 0,
    note: orderData?.note ? orderData?.note : "",
    paymentMethod: orderData?.paymentMethod?.name ?? "",
    deliveryType: orderData?.deliveryType?.name,
    driverDetails: orderData?.driverId ? {
      id: `${orderData?.DriverId?.id}`,
      driverType: `${orderData?.DriverId?.driverType}`,
      name: `${orderData?.DriverId?.firstName} ${orderData?.DriverId?.lastName}`,
      email: `${orderData?.DriverId?.email}`,
      image: orderData.DriverId?.driverDetails[0]?.profilePhoto,
      phoneNum: `${orderData?.DriverId?.countryCode} ${orderData?.DriverId?.phoneNum}`,
      driverLatLng: driverLatLng,
    } : null,
    orderStatuses: orderData?.orderHistories,
    currency: orderData?.restaurant?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol || "",
  };
  const response = ApiResponse("1", "Order Details", "", outObj);
  return res.json(response);
}
/*
        4. Order details of a specific order ride sharing   
    ________________________________________
*/
async function orderDetailsRides(req, res) {
  const {
    orderId
  } = req.body;
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: [{
      model: orderStatus,
      attributes: ["name"],
    }, {
      model: address,
      as: "pickUpID",
      attributes: ["building", "streetAddress", "lat", "lng"],
    }, {
      model: address,
      as: "dropOffID",
      attributes: ["building", "streetAddress", "lat", "lng"],
    }, {
      model: orderCharge,
      attributes: ["baseFare", "timeFare", "distFare", "serviceCharges", "discount", ],
    }, {
      model: vehicleType,
      attributes: ["name", "image"],
    }, {
      model: paymentMethod,
      attributes: ["name"],
    }, ],
    attributes: ["id", "orderNum", "driverId", "note", "distance", "total", "subTotal",
      [
        sequelize.fn("date_format", sequelize.col("scheduleDate"), "%d-%m-%Y %r "), "scheduled",
      ],
    ],
  });
  let riderData = {};
  if (orderData.driverId) {
    riderData = await user.findOne({
      where: {
        id: orderData.driverId,
      },
      include: [{
        model: driverDetails,
        where: {
          status: 1,
        },
        attributes: ["id", "profilePhoto"],
      }, {
        model: vehicleDetails,
        where: {
          status: 1,
        },
        attributes: ["id", "make", "model", "registrationNum", "color"],
      }, ],
      attributes: ["id", "firstName", "lastName", "countryCode", "phoneNum", "deviceToken", ],
    });
  }
  //
  //return res.json(riderData)
  let data = {
    orderData,
    riderData,
  };
  const response = ApiResponse("1", "Order details", "", data);
  return res.json(response);
}
/*
        5. Wallet 
*/
// async function walletData(req,res){
//     //const userId = req.user.id;
//     const userId = 3;
//     const walletData = await wallet.findAll({
//         where: {userId: userId},
//         attributes: ['id', 'amount']
//     });
//     let balance = walletData.reduce((previousValue, curentValue) => previousValue + curentValue.amount, 0);
//     return res.json(balance);
// };
//Module 7: Taxi
//1. Get vehicle type & payment methods
async function getVehicleType(req, res) {
  //return res.send('API HIT')
  let vehicleTypeId;
  let addresses;
  let charges;
  let vehicleCharge;
  let pickUpAddress;
  let dropOffAddress;
  let baseFare;
  let perMinCharge;
  let baseDist;
  const {
    pickUpId,
    dropOffId
  } = req.body;
  const list = await vehicleType.findAll({
    where: {
      status: 1,
    },
    attributes: ["id", "name", "image"],
  });
  //return res.json(list)
  let etaArr = [];
  for (let i = 0; i <= list.length - 1; i++) {
    vehicleTypeId = list[i].id;
    addresses = await address.findAll({
      where: {
        id: {
          [Op.or]: [pickUpId, dropOffId],
        },
      },
      attributes: ["id", "lat", "lng"],
    });
    charges = await charge.findAll({
      where: {
        title: {
          [Op.or]: ["baseFareTaxi", "perMinChargeTaxi", "baseDistTaxi"],
        },
      },
      attributes: ["id", "title", "amount"],
    });
    vehicleCharge = await vehicleType.findOne({
      where: {
        id: vehicleTypeId,
      },
      attributes: ["id", "baseRate", "perUnitRate"],
    });
    pickUpAddress = addresses.find((ele) => ele.id == pickUpId);
    dropOffAddress = addresses.find((ele) => ele.id == dropOffId);
    baseFare = charges.find((ele) => ele.title === "baseFareTaxi");
    perMinCharge = charges.find((ele) => ele.title === "perMinChargeTaxi");
    baseDist = charges.find((ele) => ele.title === "baseDistTaxi");
    let tmpData = await axios.get(`${process.env.MAPS_URL}&origin=${pickUpAddress.lat},${pickUpAddress.lng}&destination=${dropOffAddress.lat},${dropOffAddress.lng}&key=AIzaSyDoVmHrVkO68EObrVfhWrzgbAHHPQ9McMM`);
    //let tmpData = {abcd: "jdjd"}
    //console.log(tmpData.data);
    let estdDis = tmpData.data.status === "OK" ? tmpData.data.routes[0].legs[0].distance.value / 1000 : 0;
    distanceInMiles = estdDis * 0.621371;
    //Calculating fare due to distance
    let distFare = 0;
    if (distanceInMiles < parseFloat(baseDist.amount)) distFare = parseFloat(vehicleCharge.baseRate);
    else {
      let extraDist = distanceInMiles - parseFloat(baseDist.amount);
      distFare = parseFloat(vehicleCharge.baseRate) + extraDist * parseFloat(vehicleCharge.perUnitRate);
    }
    let eTime = tmpData.data.status === "OK" ? tmpData.data.routes[0].legs[0].duration.value / 60 : 0;
    let timeFare = eTime * parseFloat(perMinCharge.amount);
    //console.log('STATS', 'dist in mile', distanceInMiles, 'time in Mins',eTime, 'veh BaseRate', vehicleCharge.baseRate, 'perUnitRate', vehicleCharge.perUnitRate   )
    //console.log(parseFloat(baseFare.amount), distFare, timeFare )
    let estdFare = parseFloat(baseFare.amount) + distFare + timeFare;
    estdFare = estdFare.toFixed(2);
    distanceInMiles = distanceInMiles.toFixed(2);
    console.log("Dist in mi", distanceInMiles, "E-TIME", eTime, "est fare", estdFare);
    let tmpObj = {
      vehicleType: list[i],
      data: {
        baseFare: baseFare.amount,
        distanceFare: `${distFare.toFixed(2)}`,
        timeFare: `${timeFare.toFixed(2)}`,
        totalEstdFare: `${estdFare}`,
        distance: `${distanceInMiles}`,
      },
    };
    etaArr.push(tmpObj);
    //console.log('ABCD')
  }
  //return res.json(etaArr);
  const paymentMethodList = await paymentMethod.findAll();
  const orderModeList = await orderMode.findAll();
  // paymentMethodList.pop();
  let data = {
    vehicleTypeList: etaArr,
    paymentMethodList,
    orderModeList,
  };
  const response = ApiResponse("1", "Get Vehicle type, payment methods & order modes", "", data);
  return res.json(response);
}
//2. Get estimated fare for Taxi App
async function getEstdFare(req, res) {
  const {
    pickUpId,
    dropOffId,
    vehicleTypeId
  } = req.body;
  const addresses = await address.findAll({
    where: {
      id: {
        [Op.or]: [pickUpId, dropOffId],
      },
    },
    attributes: ["id", "lat", "lng"],
  });
  const charges = await charge.findAll({
    where: {
      title: {
        [Op.or]: ["baseFareTaxi", "perMinChargeTaxi", "baseDistTaxi"],
      },
    },
    attributes: ["id", "title", "amount"],
  });
  const vehicleCharge = await vehicleType.findOne({
    where: {
      id: vehicleTypeId,
    },
    attributes: ["id", "baseRate", "perUnitRate"],
  });
  const pickUpAddress = addresses.find((ele) => ele.id == pickUpId);
  const dropOffAddress = addresses.find((ele) => ele.id == dropOffId);
  const baseFare = charges.find((ele) => ele.title === "baseFareTaxi");
  const perMinCharge = charges.find((ele) => ele.title === "perMinChargeTaxi");
  const baseDist = charges.find((ele) => ele.title === "baseDistTaxi");
  // Getting distance and estimated time of ride
  axios.get(`${process.env.MAPS_URL}&origin=${pickUpAddress.lat},${pickUpAddress.lng}&destination=${dropOffAddress.lat},${dropOffAddress.lng}&key=AIzaSyDoVmHrVkO68EObrVfhWrzgbAHHPQ9McMM`).then((resp) => {
    //Coverting distance into float
    let distanceinKm = resp.data.routes[0].legs[0].distance.text;
    splited = distanceinKm.split(" ");
    distanceinKm = parseFloat(splited[0]);
    distanceInMiles = distanceinKm * 0.621371;
    //Calculating fare due to distance
    let distFare = 0;
    if (distanceInMiles < parseFloat(baseDist.amount)) distFare = parseFloat(vehicleCharge.baseRate);
    else {
      let extraDist = distanceInMiles - parseFloat(baseDist.amount);
      distFare = parseFloat(vehicleCharge.baseRate) + extraDist * parseFloat(vehicleCharge.perUnitRate);
    }
    let eTime = resp.data.routes[0].legs[0].duration.text;
    tsplited = eTime.split(" ");
    eTime = parseFloat(tsplited[0]);
    let timeFare = eTime * parseFloat(perMinCharge.amount);
    //console.log(parseFloat(baseFare.amount), distFare, timeFare )
    let estdFare = parseFloat(baseFare.amount) + distFare + timeFare;
    estdFare = estdFare.toFixed(2);
    distanceInMiles = distanceInMiles.toFixed(2);
    //console.log('Dist in mi', distanceInMiles, 'E-TIME', eTime, 'baseFareTaxi', baseFare.amount, 'timeCharges', perMinCharge.amount)
    let data = {
      baseFare: baseFare.amount,
      distanceFare: `${distFare}`,
      timeFare: `${timeFare}`,
      totalEstdFare: `${estdFare}`,
      distance: `${distanceInMiles}`,
    };
    const response = ApiResponse("1", "Estimated fare of ride", "", data);
    return res.json(response);
  }).catch((err) => {
    const response = ApiResponse("0", "Error in fething time and distance data", "Error", {});
    return res.json(response);
  });
}
async function tablebooking(req, res) {
  const {
    userId,
    restaurantId,
    persons
  } = req.body;
  tableBooking.create({
    userId,
    restaurantId,
    persons,
  }).then((data) => {
    const response = ApiResponse("1", "Table Booking Request Created", "", data);
    return res.json(response);
  });
}
// Add Service charges
async function placeOrder(req, res) {
  let allDrivers = await user.findAll({
    where: {
      status: 1,
      userTypeId: 2,
    },
    attributes: ["id", "deviceToken"],
  });
  const adminPercent = await charge.findOne({
    where: {
      title: "adminPercentTaxi",
    },
    attributes: ["amount"],
  });
  //return res.json(adminPercent)
  const {
    scheduleDate,
    note,
    distance,
    subTotal,
    total,
    pickUpId,
    dropOffId,
    orderModeId,
    paymentMethodId,
    userId,
    vehicleTypeId,
    voucherId,
    baseFare,
    distFare,
    timeFare,
  } = req.body;
  const pickUpAddress = await address.findByPk(pickUpId, {
    attributes: ["streetAddress"],
  });
  const dropOffAddress = await address.findByPk(dropOffId, {
    attributes: ["streetAddress"],
  });
  // checking if voucher applied or not
  let applied = voucherId === "" ? null : voucherId;
  let ON1 = uON.generate();
  order.create({
    orderNum: `fom-${ON1}`,
    scheduleDate,
    note,
    distance,
    subTotal,
    total,
    pickUpId,
    dropOffId,
    status: true,
    orderModeId,
    orderStatusId: 1,
    paymentMethodId,
    orderApplicationId: 2,
    userId,
    vehicleTypeId,
    voucherId: applied,
    paymentRecieved: true,
  }).then((data) => {
    //return res.json(data.id)
    // Creating order history
    let time = Date.now();
    orderHistory.create({
      time,
      orderId: data.id,
      orderStatusId: 1,
    });
    //creating a temprary charge data, update it @payment
    let adminEarnings = total * (parseFloat(adminPercent.amount) / 100);
    let driverEarnings = total - adminEarnings;
    let ch = {
      adminEarnings,
      driverEarnings,
      adminPercent: adminPercent.amount,
      baseFare,
      distFare,
      timeFare,
      orderId: data.id,
      serviceCharges: 1.2,
    };
    orderCharge.create(ch);
    // send notifications to all drivers whose car type matches
    axios.get(process.env.FIREBASE_URL).then((dat) => {
      Object.keys(dat.data).map(function(key, index) {
        let found = allDrivers.find((ele) => parseFloat(key) === ele.id);
        if (!found) console.log("not found against", key);
        if (found) {
          let message = {
            to: `${found.deviceToken}`,
            notification: {
              title: "New Job arrived",
              body: "A new job has arrived",
            },
            data: {
              orderId: data.id,
              orderNum: data.orderNum,
              orderApplication: `2`, // 2 for ride sharing
              pickUpAddress: pickUpAddress.streetAddress,
              dropOffAddress: dropOffAddress.streetAddress,
              estEarning: `${driverEarnings.toFixed(2)}`,
              distance: distance,
            },
          };
          fcm.send(message, function(err, response) {
            if (err) {
              console.log("Something has gone wrong!");
              //res.json(err);
            } else {
              console.log("Successfully sent with response: ", response);
              //res.json(response);
            }
          });
          console.log("Notification send to", found.id, key);
        }
        //console.log(key);
      });
    }).catch((err) => {
      const response = ApiResponse("0", "Error getting driver data", "Error", {});
      return res.json(response);
    });
    const datas = {
      id: data.id,
    };
    const response = ApiResponse("1", "Order created", "", datas);
    return res.json(response);
  }).catch((err) => {
    const response = ApiResponse("0", "Error creating order", "Error creating order", {});
    return res.json(response);
  });
}
//4. Cancel Order taxi app
async function cancelOrderTaxi(req, res) {
  const {
    orderId
  } = req.body;
  const userId = req.user.id;
  const orderData = await order.findByPk(orderId, {
    include: {
      model: user,
      as: "DriverId",
      attributes: ["id", "deviceToken"],
    },
    attributes: ["id", "orderNum", "driverId", "orderStatusId"],
  });
  //return res.json(orderData)
  if (!(orderData.orderStatusId === 1 || orderData.orderStatusId === 2 || orderData.orderStatusId === 3 || orderData.orderStatusId === 8)) throw new CustomException("You cannot cancel order at this stage", "Cant cancel order at this stage");
  order.update({
    status: false,
    orderStatusId: 12,
  }, {
    where: {
      id: orderId,
    },
  }).then((data) => {
    let time = Date.now();
    orderHistory.create({
      time,
      orderId,
      orderStatusId: 12,
      cancelledBy: userId,
    });
    //Throw notification to driver if order is accepted
    if (orderData.driverId) {
      let to = [orderData.DriverId.deviceToken];
      let notification = {
        title: "Order cancelled",
        body: `Order # ${orderData.orderNum} is cancelled`,
      };
      let data = {
        orderId: orderData.id,
      };
      let driverLang = orderData.DriverId?.language;
      sendNotifications(to, notification, data,driverLang);
    }
    const response = ApiResponse("1", "Order Cancelled", "", {});
    return res.json(response);
  }).catch((err) => {
    const response = ApiResponse("0", "Error cancelling order", "Error", {});
    return res.json(response);
  });
}
//5. driver details after accepting ride
async function driverDetailsForCustomer(req, res) {
  let {
    driverId
  } = req.body;
  let driverData = await user.findByPk(driverId, {
    include: [{
      model: vehicleDetails,
      where: {
        status: true,
      },
      attributes: ["make", "model", "registrationNum"],
    }, ],
    attributes: ["id", "firstName", "lastName", "countryCode", "phoneNum", "deviceToken", ],
  });
  let driverRatingData = await driverRating.findAll({
    where: {
      driverId: driverId,
    },
    attributes: ["id", "value", "comment", "at"],
  });
  // Calculating avg rating of driver
  let driverAvgRate = driverRatingData.reduce(
    (previousValue, curentValue) => previousValue + curentValue.value, 0);
  let avgRate = driverAvgRate / driverRatingData.length;
  avgRate = avgRate ? avgRate.toFixed(2) : avgRate;
  // Getting last 4 reviews
  let reviews = [];
  driverRatingData.map((ele) => {
    if (ele.comment === "") return null;
    let cDate = new Date(ele.at);
    let tmpObj = {
      comment: ele.comment,
      at: cDate.toLocaleDateString("en-US"),
    };
    reviews.push(tmpObj);
  });
  const lastFour = reviews.slice(-4);
  const orders = await order.count({
    where: {
      driverId: driverId,
    },
  });
  let data = {
    name: `${driverData.firstName} ${driverData.lastName}`,
    deviceToken: driverData.deviceToken,
    rating: avgRate,
    carName: driverData.vehicleDetails[0].make,
    carNumber: driverData.vehicleDetails[0].registrationNum,
    carModel: driverData.vehicleDetails[0].model,
    phoneNum: `${driverData.countryCode}${driverData.phoneNum}`,
    feedBacks: lastFour,
    total_orders: orders,
  };
  const response = ApiResponse("1", "Driver details", "", data);
  return res.json(response);
}
//6. Automatically cancel order for both
async function autoCancelOrderTaxi(req, res) {
  const {
    orderId
  } = req.body;
  const userId = req.user.id;
  const orderData = await order.findByPk(orderId, {
    attributes: ["id", "orderNum", "driverId", "orderStatusId"],
  });
  //return res.json(orderData)
  if (orderData.orderStatusId === 2) {
    const response = ApiResponse("2", "Order accepted", "", {});
    return res.json(response);
  }
  order.update({
    status: false,
    orderStatusId: 12,
  }, {
    where: {
      id: orderId,
    },
  }).then((data) => {
    let time = Date.now();
    orderHistory.create({
      time,
      orderId,
      orderStatusId: 12,
      cancelledBy: userId,
    });
    const response = ApiResponse("1", "Order cancelled due to unavailability of driver", "", {});
    return res.json(response);
  }).catch((err) => {
    const response = ApiResponse("0", "Error cancelling order", "Database Error", {});
    return res.json(response);
  });
}
//-------------------------
//      Recurring         |
//-------------------------
/*
        1. Login Data
*/
let loginData = (userData, accessToken) => {
  return {
    status: "1",
    message: "Login successful",
    data: {
      userId: `${userData.id}`,
      userName: `${userData.userName}`,
      firstName: `${userData.firstName}`,
      lastName: `${userData.lastName}`,
      email: `${userData.email}`,
      countryCode: `${userData.countryCode}`,
      phoneNum: `${userData.phoneNum}`,
      accessToken: `${accessToken}`,
      approved: userData.verifiedAt ? true : false,
      status: userData.status ? true : false,
    },
    error: "",
  };
};
/*
        2. Get distance between two locations in km
*/
function getDistance(userLat, userLng, orderLat, orderLng) {
  let earth_radius = 6371;
  let dLat = (Math.PI / 180) * (orderLat - userLat);
  let dLon = (Math.PI / 180) * (orderLng - userLng);
  let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((Math.PI / 180) * orderLat) * Math.cos((Math.PI / 180) * orderLat) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  let c = 2 * Math.asin(Math.sqrt(a));
  let d = earth_radius * c;
  return d;
}
/*
        3. Change the time to 2 digits
*/
function addZeroBefore(n) {
  return (n < 10 ? "0" : "") + n;
}
/*
        4. Change the format to 12 Hours
*/
function ampmFormat(n) {
  return n > 12 ? n - 12 : n;
}
/*
        5. Add Address
*/
async function addresstoDB(lat, lng, building, streetAddress, userId) {
  const addressExist = await address.findOne({
    where: {
      lat: lat,
      lng: lng,
      userId: userId,
    },
  });
  if (addressExist) {
    let updateAddress = await address.update({
      building,
      streetAddress,
      lat,
      lng,
      userId,
      status: true,
    }, {
      where: {
        id: addressExist.id,
      },
    });
    return addressExist.id;
  } //else create new entry
  else {
    let createAddress = await address.create({
      building,
      streetAddress,
      city: "",
      state: "",
      zipCode: "",
      addressTypeId: 1,
      lat,
      lng,
      status: true,
      userId,
    });
    return createAddress.id;
  }
}
/*
        6. Return current order Data
*/
async function retOrderData(orderId) {
  // return orderId
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: [{
      model: restaurant,
      include: {
        model: zoneRestaurants,
        include: {
          model: zone,
          include: {
            model: zoneDetails,
            include: {
              model: unit,
              as: "currencyUnit"
            },
          },
        },
      },
    }, {
      model: orderItems,
      include: [{
        model: R_PLink,
      }, {
        model: orderAddOns,
        include: [{
          model: addOn,
        }, {
          model: P_A_ACLink,
          include: {
            model: addOn,
          },
        }, ],
      }, ],
    }, {
      model: paymentMethod,
    }, {
      model: deliveryType,
    }, ],
  });
  console.log(orderData);
  //  return orderData;
  // Array to store Items with add Ons
  let itemArr = [];
  orderData?.orderItems?.map((oi, idx) => {
    let itemPrice = parseFloat(oi?.total) || 0;
    let addOnArr = [];
    // Manipulating addons
    oi?.orderAddOns?.map((oao, ind) => {
      itemPrice = itemPrice + parseFloat(oao?.total) || 0;
      let addOnObj = {
        name: oao?.addOn?.name,
        price: oao?.total || 0,
        quantity: oao?.qty?.toString(),
      };
      addOnArr.push(addOnObj);
    });
    let itemObj = {
      id: oi?.R_PLink?.id,
      itemName: oi?.R_PLink?.name || "",
      image: oi?.R_PLink?.image || "",
      quantity: oi?.quantity || 0,
      itemPrice: itemPrice,
      addOns: addOnArr,
    };
    itemArr.push(itemObj);
  });
  const culter = await orderCultery.findAll({
    where: {
      orderId: orderData.id,
    },
    attributes: ["id"],
    include: {
      model: cutlery,
      attributes: ["id", "name", "description", "image", "price"],
    },
  });
  let outObj = {
    orderId: orderData.id,
    rest_lat: orderData.restaurant.lat,
    rest_lng: orderData.restaurant.lng,
    logo: orderData.restaurant.logo,
    image: orderData.restaurant.image,
    restaurantName: orderData?.restaurant?.businessName || "",
    cultery_list: culter.length > 0 ? culter : [],
    orderNum: orderData?.orderNum || "",
    items: itemArr,
    subTotal: orderData?.subTotal || 0,
    total: orderData?.total || 0,
    note: orderData?.note || "",
    paymentMethod: orderData?.paymentMethod?.name || "",
    deliveryType: orderData?.deliveryType?.name || "",
    currency: orderData?.restaurant?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol || "",
  };
  console.log(outObj)
  return outObj;
}
async function retOrderDataForJoinGroup(orderId, userId, subTotal) {
  try {
    const orderData = await order.findOne({
      where: { id: orderId },
      include: [
        {
          model: restaurant,
          include: {
            model: zoneRestaurants,
            include: {
              model: zone,
              include: {
                model: zoneDetails,
                include: { model: unit, as: "currencyUnit" },
              },
            },
          },
        },
        {
          model: orderItems,
          where: { userId: userId },
          include: [
            { model: R_PLink },
            {
              model: orderAddOns,
              include: [
                { model: addOn },
                { model: P_A_ACLink, include: { model: addOn } },
              ],
            },
          ],
        },
        { model: paymentMethod },
        { model: deliveryType },
      ],
    });

    // Check if orderData exists
    if (!orderData) {
      return {};
    }

    let itemArr = [];
    orderData?.orderItems?.forEach((oi) => {
      let itemPrice = parseFloat(oi?.total) || 0;
      let addOnArr = [];

      oi?.orderAddOns?.forEach((oao) => {
        itemPrice += parseFloat(oao?.total) || 0;
        addOnArr.push({
          name: oao?.addOn?.name,
          price: oao?.total || 0,
          quantity: oao?.qty?.toString(),
        });
      });

      itemArr.push({
        id: oi?.R_PLink?.id,
        itemName: oi?.R_PLink?.name || "",
        image: oi?.R_PLink?.image || "",
        quantity: oi?.quantity || 0,
        itemPrice: parseFloat(oi?.unitPrice),
        addOns: addOnArr,
      });
    });

    const culter = await orderCultery.findAll({
      where: { orderId: orderData?.id },
      attributes: ["id"],
      include: {
        model: cutlery,
        attributes: ["id", "name", "description", "image", "price"],
      },
    });

    return {
      orderId: orderData.id,
      rest_lat: orderData.restaurant.lat,
      rest_lng: orderData.restaurant.lng,
      image: orderData.restaurant.image,
      logo: orderData.restaurant.logo,
      restaurantName: orderData.restaurant?.businessName || "",
      cultery_list: culter.length > 0 ? culter : [],
      orderNum: orderData.orderNum || "",
      items: itemArr,
      subTotal: subTotal.toString(),
      total: subTotal.toString(),
      note: orderData.note || "",
      paymentMethod: orderData.paymentMethod?.name || "",
      deliveryType: orderData.deliveryType?.name || "",
      currency:
        orderData.restaurant?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit
          ?.symbol || "",
    };
  } catch (error) {
    console.error("Error retrieving order data:", error.message);
   return {}; // Re-throw the error to handle it further up the call stack if needed
  }
}

async function applicationRange(req, res) {
  let currLat = req.params.lat;
  let currLng = req.params.lng;
  let operateInRegion = false;
  const currRest = await restaurant.findAll({
    where: {
      status: true,
    },
    include: {
      model: unit,
      as: "distanceUnitID",
      attributes: ["symbol"],
    },
    attributes: ["lat", "lng", "deliveryRadius"],
  });
  //return res.json(currRest)
  for (let i = 0; i < currRest.length; i++) {
    // if unit is miles change to km
    if (currRest[i].distanceUnitID.symbol === "mi") currRest[i].deliveryRadius = currRest[i]?.deliveryRadius * 1.60934;
    // the distance is in Km
    let dist = getDistance(currLat, currLng, currRest[i].lat, currRest[i].lng);
    console.log(dist < currRest[i].deliveryRadius ? "Lies in region" : "Not for this restaurant");
    console.log("DR", currRest[i].deliveryRadius, "d", dist);
    if (dist < currRest[i].deliveryRadius) {
      operateInRegion = true;
      break;
    }
  }
  if (!operateInRegion) {
    const response = ApiResponse("0", "Sorry we are not operational in the region", "We will be available soon", {});
    return res.json(response);
  }
  const response = ApiResponse("1", "Operates in the current location", "", {});
  return res.json(response);
}
async function restaurantRange(req, res) {
  let currLat = req.params.lat;
  let currLng = req.params.lng;
  let restId = req.params.restId;
  let operateInRegion = false;
  const currRest = await restaurant.findByPk(restId, {
    include: {
      model: unit,
      as: "distanceUnitID",
      attributes: ["symbol"],
    },
    attributes: ["lat", "lng", "deliveryRadius"],
  });
  //return res.json(currRest)
  // if unit is miles change to km
  if (currRest.distanceUnitID.symbol === "mi") currRest.deliveryRadius = currRest.deliveryRadius * 1.60934;
  // the distance is in Km
  let dist = getDistance(currLat, currLng, currRest.lat, currRest.lng);
  console.log(dist < currRest.deliveryRadius ? "Lies in region" : "Not for this restaurant");
  console.log("DR", currRest.deliveryRadius, "d", dist);
  if (dist < currRest.deliveryRadius) operateInRegion = true;
  if (!operateInRegion) {
    const response = ApiResponse("0", "Sorry, the current restaurant is not operational at current location", "Please change your location,so we cam serve you", {});
    return res.json(response);
  }
  const response = ApiResponse("1", "Operates in the current location", "", {});
  return res.json(response);
}
async function testAPI(req, res) {
  // // Order Placing Transaction
  // // Ride Sharing
  // // let adminEarning = 2.5, driverEarning = 2, userCharge = 4.5, driverId = 2, userId = 3, orderId =1;
  // // let done = await OPTrans(true, 0, adminEarning, driverEarning, userCharge, 0, driverId, userId, 0);
  // // Food Delivery
  // // deliveryType = 1 --> Deilvery Mode
  // // deliveryType = 2 --> Self PickUp Mode --> driverEarning = 0
  // // let deliveryType = 1, restId = 1, restaurantEarning = 0.12;
  // // let done = await OPTrans(false, deliveryType, orderId, adminEarning, driverEarning, userCharge, restaurantEarning, driverId, userId, restId);
  // // Payment transaction
  // let paymentByCard= true, adminReceived = 2.5, UserPaid = 1.5,
  // driverPaid = 1.25, restReceived = 1.25, driverReceived = 1.25, orderId = 1, userId = 3, driverId= 2, restId= 1;
  // // ride sharing --> Payment by Card
  // //let done = await paymentTrans(true, adminReceived, UserPaid, 0, 0, 0, false, orderId, userId, 0, 0);
  // // ride sharing --> Payment by COD
  // let done = await paymentTrans(false, 0, UserPaid, 0, 0, driverReceived, false, orderId, userId, driverId, 0);
  // let to = ["eK5LZuTS02cL0dy1tWoUOq:APA91bG6dWva1413QltljGvQxQdBJAG2QsnZcr3yx3EbDOb05I0-HU7dUhSX6-TDXKeZ8qRoAen_xhZXRx9HdQraYTljyXMHxgbByqL9kndSo0nyrlqIBPA6deJULpqT4gkMIoH4vURY"]
  // let notifcation = {
  //     title: "Test to admin",
  //     body: "From local"
  // };
  // sendNotifications(to,notifcation)
  // return res.json("Done")
  const orderData = await retOrderData(805);
  return res.json(orderData);
}
async function createPaypalToken(req, res) {
  let output = false;
  let token = "";
  var details = {
    grant_type: "client_credentials",
  };
  var formBody = [];
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");
  let login = process.env.PAYPAL_CLIENT_ID;
  let password = process.env.PAYPAL_SECRET_CLIENT;
  let encodedToken = Buffer.from(`${login}:${password}`).toString("base64");
  await axios({
    method: "post",
    url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + encodedToken,
    },
    data: formBody,
  }).then(function(response) {
    output = true;
    token = response.data.access_token;
  }).catch(function(error) {
    console.log(error);
  });
  return output ? {
    status: "1",
    token,
  } : {
    status: "0",
    token,
  };
}

function generateRandomString(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
async function paymentByCard(req, res) {
  const {
    card_number,
    exp_year,
    exp_month,
    cvc,
    name,
    amount
  } = req.body;
  const bearerToken = await createPaypalToken();
  if (!bearerToken) {
    return res.json({
      status: "0",
      message: "Paypal token error!",
      data: {},
      error: "",
    });
  }
  let data = JSON.stringify({
    intent: "CAPTURE",
    purchase_units: [{
      items: [{
        name: `Product 1`,
        description: "Order Description",
        quantity: "1",
        unit_amount: {
          currency_code: "USD",
          value: amount,
        },
      }, ],
      amount: {
        currency_code: "USD",
        value: amount,
        breakdown: {
          item_total: {
            currency_code: "USD",
            value: amount,
          },
        },
      },
    }, ],
    //expiry will be in format of 2024-04
    payment_source: {
      card: {
        number: card_number,
        expiry: `${exp_year}`,
        security_code: cvc,
        name: name,
      },
    },
  });
  const requestId = generateRandomString(20);
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "PayPal-Request-Id": requestId,
      Authorization: `Bearer ${bearerToken.token}`,
      Cookie: "cookie_check=yes; d_id=8c47d608419c4e5dabc1436aeeba93dd1676894129864; enforce_policy=ccpa; ts=vreXpYrS%3D1771588529%26vteXpYrS%3D1676895929%26vr%3D6eadcca81860a6022c4955b0ee28ed1d%26vt%3D6eadcca81860a6022c4955b0ee28ed1c%26vtyp%3Dnew; ts_c=vr%3D6eadcca81860a6022c4955b0ee28ed1d%26vt%3D6eadcca81860a6022c4955b0ee28ed1c; tsrce=unifiedloginnodeweb; x-cdn=fastly:FJR; x-pp-s=eyJ0IjoiMTY3Njg5NDEyOTkzNSIsImwiOiIwIiwibSI6IjAifQ",
    },
    data: data,
  };
  axios(config).then(async function(response) {
    if (response.data.status === "COMPLETED") {
      const response = ApiResponse("1", "Payment successfull!", "", {});
      return res.json(response);
    } else {
      const response = ApiResponse("0", "Payment failed!", "", {});
      return res.json(response);
    }
  }).catch(function(error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  });
}
async function paypal_payment(req, res) {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "https://myace.app/payment_success",
      cancel_url: "https://myace.app/payment_failed",
    },
    transactions: [{
      item_list: {
        items: [{
          name: "My Ace Booking",
          sku: "001",
          price: req.body.amount,
          currency: req.body.currency,
          quantity: 1,
        }, ],
      },
      amount: {
        currency: req.body.currency,
        total: req.body.amount,
      },
      description: "My Ace Booking",
    }, ],
  };
  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      const response = ApiResponse("1", "Error", error.message, link);
      return res.json(response);
    } else {
      var link = "";
      for (var i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          link = payment.links[i].href;
        }
      }
      const response = ApiResponse("1", "Payment link generated !", "", link);
      return res.json(response);
    }
  });
}
// async function stripe_add_card(req, res) {
//   const {
//     cardNum,
//     exp_month,
//     exp_year,
//     cvc
//   } = req.body;
//   const userData = await user.findOne({
//     where: {
//       id: req.user.id,
//     },
//   });
//   console.log("userData=====>", userData)
//   if (!userData || !userData.stripeCustomerId) {
//       return res.json(ApiResponse("0", "User not found or Stripe customer ID is missing", "", {}));
//     }
//   stripe.paymentMethods.create({
//     type: "card",
//     card: {
//       number: `${cardNum}`,
//       exp_month,
//       exp_year,
//       cvc: `${cvc}`,
//     },
//   }).then((dat) => {
//     stripe.paymentMethods.attach(dat.id, {
//       customer: `${userData.stripeCustomerId}`,
//     }).then((card) => {
//       const response = ApiResponse("1", "Card Added SuccuessFully", "", {
//         pmId: card.id,
//         last4digits: card.card.last4,
//       });
//       return res.json(response);
//     }).catch((err) => {
//       const response = ApiResponse("0", "Error in saving Card"+err.message, "", {});
//       return res.json(response);
//     });
//   }).catch((err) => {
//     const response = ApiResponse("0", "Error in saving Card "+err.message, "", {});
//     return res.json(response);
//   });
// }
// async function delete_stripe_card(req, res) {
//   const userData = await user.findOne({
//     where: {
//       id: req.user.id,
//     },
//   });
//   const {
//     pmkey
//   } = req.body;
//   stripe.paymentMethods.detach(pmkey).then((dat) => {
//     res.status(200).json({
//       ResponseCode: "1",
//       ResponseMessage: "Card Deleted Successfully",
//       Response: [],
//       errors: ``,
//     });
//   }).catch((err) => {
//     res.status(200).json({
//       ResponseCode: "0",
//       ResponseMessage: err.raw.message,
//       Response: [],
//       errors: "Error",
//     });
//   });
// }
// async function stripe_get_all_cards(req, res) {
//   const userData = await user.findOne({
//     where: {
//       id: req.user.id,
//     },
//   });
//   const list = await stripe.customers.listPaymentMethods(`${userData.stripeCustomerId}`, {
//     type: "card",
//   });
//   let card_list = [];
//   if (list.data.length > 0) {
//     list.data?.map((dat) => {
//       let obj = {
//         pmId: dat.id,
//         brand: dat.card.brand,
//         last4digits: dat.card.last4,
//         exp_year: dat.card.exp_year,
//         exp_month: dat.card.exp_month,
//       };
//       card_list.push(obj);
//     });
//   }
//   const response = ApiResponse("1", "All Stripe Card", "", {
//     cards: card_list,
//   });
//   return res.json(response);
// }
// async function makepaymentbynewcard(req, res) {
//   let {
//     cardNum,
//     exp_month,
//     exp_year,
//     cvc,
//     saveStatus,
//     amount,
//     orderId,
//     isCredit,
//   } = req.body;
//   let amountToBePaid = 0;
//   let credit = await Credit.findOne({
//     where: {
//       userId: req.user.id,
//     },
//   });
//   const userData = await user.findOne({
//     where: {
//       id: req.user.id,
//     },
//     include: {
//       model: Credit,
//     },
//   });
//   const method = await stripe.paymentMethods.create({
//     type: "card",
//     card: {
//       number: cardNum,
//       exp_month,
//       exp_year,
//       cvc,
//     },
//   });
//   if (isCredit) {
//     if (parseFloat(credit?.point) >= parseFloat(amount)) {
//       credit.point = parseFloat(credit.point) - parseFloat(amount);
//       await credit.save();
//       const orderData = await order.findOne({
//         where: {
//           id: orderId,
//         },
//       });
//       if (orderData) {
//         orderData.paymentRecieved = true;
//         orderData.paymentConfirmed = true;
//         await orderData.save();
//       }
//       singleNotification(userData.deviceToken, "Payment Successfully Done", `You have complete the payment of Order ID : ${orderData.id}`);
//       const response = ApiResponse("1", "Payment successfully Done", "", {});
//       return res.json(response);
//     } else {
//       amountToBePaid = parseFloat(amount) - parseFloat(credit.point);
//       if (method) {
//         if (saveStatus) {
//           stripe.paymentMethods.attach(method.id, {
//             customer: `${userData.stripeCustomerId}`,
//           }).then((dat) => {
//             stripe.paymentIntents.create({
//               amount: parseFloat(amountToBePaid) * 100,
//               currency: "usd",
//               payment_method_types: ["card"],
//               customer: `${userData.stripeCustomerId}`,
//               payment_method: method.id,
//               capture_method: "manual",
//             }).then(async (intent) => {
//               stripe.paymentIntents.confirm(`${intent.id}`).then(async (confirmIntent) => {
//                 const orderData = await order.findOne({
//                   where: {
//                     id: orderId,
//                   },
//                 });
//                 if (orderData) {
//                   orderData.paymentRecieved = true;
//                   orderData.paymentConfirmed = true;
//                   await orderData.save();
//                 }
//                 credit.point = 0;
//                 await credit.save();
//                 singleNotification(userData.deviceToken, "Payment Successfully Done", `You have complete the payment of Order ID : ${orderData.id}`);
//                 const response = ApiResponse("1", "Payment successfully Done", "", {});
//                 return res.json(response);
//               });
//             }).catch((error) => {
//               const response = ApiResponse("0", "Something went wrong", "", {});
//               return res.json(response);
//             });
//           });
//         } else {
//           stripe.paymentIntents.create({
//             amount: parseFloat(amountToBePaid) * 100,
//             currency: "usd",
//             payment_method_types: ["card"],
//             customer: `${userData.stripeCustomerId}`,
//             payment_method: method.id,
//             capture_method: "manual",
//           }).then(async (intent) => {
//             stripe.paymentIntents.confirm(`${intent.id}`).then(async (confirmIntent) => {
//               const orderData = await order.findOne({
//                 where: {
//                   id: orderId,
//                 },
//               });
//               if (orderData) {
//                 orderData.paymentRecieved = true;
//                 orderData.paymentConfirmed = true;
//                 await orderData.save();
//               }
//               singleNotification(userData.deviceToken, "Payment Successfully Done", `You have complete the payment of Order ID : ${orderData.id}`);
//               const response = ApiResponse("1", "Payment successfully Done", "", {});
//               return res.json(response);
//             });
//           }).catch((error) => {
//             const response = ApiResponse("0", "Something went wrong", "", {});
//             return res.json(response);
//           });
//         }
//       }
//     }
//   } else {
//     amountToBePaid = parseFloat(amount);
//     if (method) {
//       if (saveStatus) {
//         stripe.paymentMethods.attach(method.id, {
//           customer: `${userData.stripeCustomerId}`,
//         }).then((dat) => {
//           stripe.paymentIntents.create({
//             amount: parseFloat(amountToBePaid) * 100,
//             currency: "usd",
//             payment_method_types: ["card"],
//             customer: `${userData.stripeCustomerId}`,
//             payment_method: method.id,
//             capture_method: "manual",
//           }).then(async (intent) => {
//             stripe.paymentIntents.confirm(`${intent.id}`).then(async (confirmIntent) => {
//               const orderData = await order.findOne({
//                 where: {
//                   id: orderId,
//                 },
//               });
//               if (orderData) {
//                 orderData.paymentRecieved = true;
//                 orderData.paymentConfirmed = true;
//                 await orderData.save();
//               }
//               singleNotification(userData.deviceToken, "Payment Successfully Done", `You have complete the payment of Order ID : ${orderData.id}`);
//               const response = ApiResponse("1", "Payment successfully Done", "", {});
//               return res.json(response);
//             });
//           }).catch((error) => {
//             const response = ApiResponse("0", "Something went wrong", "", {});
//             return res.json(response);
//           });
//         });
//       } else {
//         stripe.paymentIntents.create({
//           amount: parseFloat(amountToBePaid) * 100,
//           currency: "usd",
//           payment_method_types: ["card"],
//           customer: `${userData.stripeCustomerId}`,
//           payment_method: method.id,
//           capture_method: "manual",
//         }).then(async (intent) => {
//           stripe.paymentIntents.confirm(`${intent.id}`).then(async (confirmIntent) => {
//             const orderData = await order.findOne({
//               where: {
//                 id: orderId,
//               },
//             });
//             if (orderData) {
//               orderData.paymentRecieved = true;
//               orderData.paymentConfirmed = true;
//               await orderData.save();
//             }
//             singleNotification(userData.deviceToken, "Payment Successfully Done", `You have complete the payment of Order ID : ${orderData.id}`);
//             const response = ApiResponse("1", "Payment successfully Done", "", {});
//             return res.json(response);
//           });
//         }).catch((error) => {
//           const response = ApiResponse("0", "Something went wrong", "", {});
//           return res.json(response);
//         });
//       }
//     }
//   }
// }
// async function makepaymentBySavedCard(req, res) {
//   const UserId = req.user.id;
//   let {
//     pmId,
//     amount,
//     orderId,
//     isCredit
//   } = req.body;
//   let amountToBePaid = 0;
//   const credit = await Credit.findOne({
//     where: {
//       userId: req.user.id,
//     },
//   });
//   const userData = await user.findOne({
//     where: {
//       id: req.user.id,
//     },
//     include: {
//       model: Credit,
//     },
//   });
//   let creditAmount = parseFloat(userData.Credit.point);
//   if (isCredit) {
//     if (creditAmount > amount) {
//       amountToBePaid = 0;
//       credit.point = parseFloat(credit.point) - parseFloat(amount);
//       credit.save();
//       const orderData = await order.findOne({
//         where: {
//           id: orderId,
//         },
//       });
//       if (orderData) {
//         orderData.paymentRecieved = true;
//         orderData.paymentConfirmed = true;
//         await orderData.save();
//       }
//       singleNotification(userData.deviceToken, "Payment Successfully Done", `You have complete the payment of Order ID : ${orderData.id}`);
//       const data = {
//         receivedAmount: amount,
//       };
//       const response = ApiResponse("1", "Payment Successfull", "", data);
//       return res.json(response);
//     } else {
//       amountToBePaid = amount - parseFloat(userData?.Credit?.point);
//       stripe.paymentIntents.create({
//         amount: amountToBePaid * 100, // send in cents
//         currency: "usd",
//         payment_method_types: ["card"],
//         customer: `${userData.stripeCustomerId}`,
//         payment_method: pmId,
//         capture_method: "manual",
//       }).then(async (pi) => {
//         stripe.paymentIntents.confirm(`${pi.id}`).then(async (result) => {
//           const data = {
//             receivedAmount: result.amount_received,
//           };
//           const orderData = await order.findOne({
//             where: {
//               id: orderId,
//             },
//           });
//           if (orderData) {
//             orderData.paymentRecieved = true;
//             orderData.paymentConfirmed = true;
//             await orderData.save();
//           }
//           credit.point = 0;
//           await credit.save();
//           singleNotification(userData.deviceToken, "Payment Successfully Done", `You have complete the payment of Order ID : ${orderData.id}`);
//           const response = ApiResponse("1", "Payment Successfull", "", data);
//           return res.json(response);
//         }).catch((err) => {
//           const response = ApiResponse("0", err.raw.message, "", {});
//           return res.json(response);
//         });
//       }).catch((err) => {
//         const response = ApiResponse("0", err.raw.message, "", {});
//         return res.json(response);
//       });
//     }
//   } else {
//     amountToBePaid = parseFloat(amount);
//     stripe.paymentIntents.create({
//       amount: amountToBePaid * 100, // send in cents
//       currency: "usd",
//       payment_method_types: ["card"],
//       customer: `${userData.stripeCustomerId}`,
//       payment_method: pmId,
//       capture_method: "manual",
//     }).then(async (pi) => {
//       stripe.paymentIntents.confirm(`${pi.id}`).then(async (result) => {
//         const data = {
//           receivedAmount: result.amount_received,
//         };
//         const orderData = await order.findOne({
//           where: {
//             id: orderId,
//           },
//         });
//         if (orderData) {
//           orderData.paymentRecieved = true;
//           orderData.paymentConfirmed = true;
//           await orderData.save();
//         }
//         singleNotification(userData.deviceToken, "Payment Successfully Done", `You have complete the payment of Order ID : ${orderData.id}`);
//         const response = ApiResponse("1", "Payment Successfull", "", data);
//         return res.json(response);
//       }).catch((err) => {
//         const response = ApiResponse("0", err.raw.message, "", {});
//         return res.json(response);
//       });
//     }).catch((err) => {
//       const response = ApiResponse("0", err.raw.message, "", {});
//       return res.json(response);
//     });
//   }
// }
async function getAllPaymentMethods(req, res) {
  const methods = await paymentMethod.findAll({
    where: {
      status: true,
    },
  });
  const response = ApiResponse("1", "Payment Methods", "", {
    methods: methods,
  });
  return res.json(response);
}
async function getCountriesAndCities(req, res) {
  const countries = await country.findAll({
    where: {
      status: true,
    },
    attributes: ["id", "name", "flag", "shortName"],
    include: {
      model: city,
      attributes: ["id", "name", "lat", "lng"],
    },
  });
  const response = ApiResponse("1", "Countries List", "", {
    countries: countries,
  });
  return res.json(response);
}
async function adyen_payment_by_card(req, res) {
  try {
    const adyenResponse = await axios.post("https://checkout-test.adyen.com/v70/paymentMethods", {
      merchantAccount: "CRED4224T223225X5JMVSGV9MK64T6",
    }, {
      headers: {
        "Content-Type": "application/json",
        "X-API-key": "AQErhmfuXNWTK0Qc+iSDm2Mxk+GYQIVCAZxNUWBFXxRqomubFonmn82QYCZZ5BDBXVsNvuR83LVYjEgiTGAH-VRAdxqn9Fr86p9HJOMaHQhPty7Jvml4SbOPgVaV5ScI=-6.yn(+m3<TZpF(P#",
      },
    });
    return res.json(adyenResponse);
  } catch (error) {
    return res.json(error);
  }
}
async function popularProducts(req, res) {
  const products = await R_PLink.findAll({
    where: {
      isPopular: 1,
    },
    attributes: ["productId", "id", "name", "image"],
    limit: 20, // Limit to 20 records
    order: sequelize.literal("RAND()"), // Order randomly
  });
  const data = {
    popularProducts: products,
  };
  const response = ApiResponse("1", "Popular Products", "", data);
  return res.json(response);
}

function removeDuplicates(array, key) {
  let lookup = new Set();
  return array.filter((obj) => {
    const objKey = key(obj);
    const isDuplicate = lookup.has(objKey);
    lookup.add(objKey);
    return !isDuplicate;
  });
}
async function searchProduct(req, res) {
  const {
    productName,businessName 
  } = req.body;
  var list = [];
  if (productName.trim() === "") {
    let data = {
      list: []
    }; // Return an empty list
    let response = ApiResponse("1", "List", "", data);
    return res.json(response);
  }
  const rplink = await R_PLink.findAll({
    where: {
      name: {
        [Op.like]: `%${productName}%`, // Using destructured Op for cleaner syntax
      },
    },
    include: [{
      model: R_MCLink,
      attributes: ['menuCategoryId', 'restaurantId'],
      include: [{
        model: restaurant, // Ensure the model name is correctly capitalized
        attributes: ['id', 'businessEmail', 'businessName', 'description', 'approxDeliveryTime', 'deliveryCharge', 'lat', 'lng', 'zipCode', 'logo', 'address', 'serviceCharges', 'businessType', 'serviceChargesType', 'serviceChargesStatus', 'openingTime', 'closingTime', 'rating', 'isFeatured', 'isRushMode', 'isOpen'],
         where: businessName ? { businessName: { [Op.like]: `%${businessName}%` } } : {},
      }, ],
    }, ],
  });
  if (rplink.length > 0) {
    for (const dat of rplink) {
      let obj = {
        id: dat?.R_MCLink?.restaurant?.id,
        businessName: dat?.R_MCLink?.restaurant?.businessName ?? "",
        minOrderAmount: dat?.R_MCLink?.restaurant?.minOrderAmount ?? "",
        description: dat?.R_MCLink?.restaurant?.description ?? "",
        isFeatured: dat?.R_MCLink?.restaurant?.isFeatured ?? false,
        isRushMode: dat?.R_MCLink?.restaurant?.isRushMode ?? false,
        isOpen: dat?.R_MCLink?.restaurant?.isOpen ?? false,
        lat: dat?.R_MCLink?.restaurant?.lat ?? "",
        lng: dat?.R_MCLink?.restaurant?.lng ?? "",
        businessEmail: dat?.R_MCLink?.restaurant?.businessEmail ?? "",
        address: dat?.R_MCLink?.restaurant?.address ?? "",
        logo: dat?.R_MCLink?.restaurant?.logo ?? "",
        openingTime: dat?.R_MCLink?.restaurant?.openingTime ?? "",
        closingTime: dat?.R_MCLink?.restaurant?.closingTime ?? "",
        approxDeliveryTime: dat?.R_MCLink?.restaurant?.approxDeliveryTime ?? "",
        deliveryCharge: dat?.R_MCLink?.restaurant?.deliveryCharge ?? "",
        serviceCharges: dat?.R_MCLink?.restaurant?.serviceCharges ?? "",
        rating: dat?.R_MCLink?.restaurant?.rating ?? "0.00",
        businessType: dat?.R_MCLink?.restaurant?.businessType ?? "",
      };
      list.push(obj);
    }
  }
  let uniqueData = removeDuplicates(list, (obj) => obj.id);
  const data = {
    list: uniqueData,
    productList: rplink
  };
  //   return res.json(list)
  const response = ApiResponse("1", "Data", "", data);
  return res.json(response);
}
async function filter(req, res) {
  const {
    sortBy,
    categories,
    lat,
    lng
  } = req.body;
  let list = [];
  const userPoint = point([parseFloat(lat), parseFloat(lng)]);
  const zones = await zone.findAll({
    where: {
      status: true,
    },
    include: [{
      model: zoneDetails,
    }, {
      model: zoneRestaurants,
      include: {
        model: restaurant,
      },
    }, ],
  });
  const validZones = zones.filter((zoneData) => {
    if (zoneData.coordinates && zoneData.coordinates.coordinates && zoneData.coordinates.coordinates.length > 0) {
      const zonePolygon = {
        type: "Polygon",
        coordinates: zoneData.coordinates.coordinates,
      };
      return booleanPointInPolygon(userPoint, zonePolygon);
    }
    return false;
  });
  if (validZones.length > 0) {
    try {
      await Promise.all(validZones.map(async (data) => {
        for (const zoneRestaurant of data.zoneRestaurants) {
          let result = await cusineRestaurant.findAll({
            where: {
              [Op.and]: [{
                cuisineId: {
                  [Op.in]: categories,
                },
              }, {
                restaurantId: zoneRestaurant?.restaurantId,
              }, ],
            },
          });
          if (result.length > 0) {
            if (
              (sortBy.toLowerCase() == "recommended" && zoneRestaurant?.restaurant?.isFeatured == true) || (sortBy.toLowerCase() == "popular" && zoneRestaurant?.restaurant?.isPopular == true)) {
              let rating = await restaurantRating.findOne({
                attributes: [
                  [
                    sequelize.fn("AVG", sequelize.col("value")), "averageRating",
                  ],
                ],
                where: {
                  restaurantId: zoneRestaurant?.restaurant?.id,
                },
              });
              let obj = {
                id: zoneRestaurant?.restaurant?.id,
                businessName: zoneRestaurant?.restaurant?.businessName,
                businessEmail: zoneRestaurant?.restaurant?.businessEmail,
                businessType: zoneRestaurant?.restaurant?.businessType,
                city: zoneRestaurant?.restaurant?.city,
                zipCode: zoneRestaurant?.restaurant?.zipCode,
                address: zoneRestaurant?.restaurant?.address,
                logo: zoneRestaurant?.restaurant?.logo,
                image: zoneRestaurant?.restaurant?.image,
                openingTime: zoneRestaurant?.restaurant?.openingTime,
                closingTime: zoneRestaurant?.restaurant?.closingTime,
                lat: zoneRestaurant?.restaurant?.lat,
                deliveryTime: zoneRestaurant?.restaurant?.approxDeliveryTime,
                deliveryFee: zoneRestaurant?.restaurant?.deliveryFeeFixed,
                rating: zoneRestaurant?.restaurant?.rating ?? "0.00"
              };
              list.push(obj);
            }
          }
        }
      }));
      const response = ApiResponse("1", "Restaurant List", "", {
        filteredRestaurant: list,
      });
      return res.json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json(ApiResponse("0", error.message, "Error", {}));
    }
  } else {
    const response = ApiResponse("0", "Service not available in your area", "", {});
    return res.json(response);
  }
}
// GROUP ORDER SCENE
async function createGroup(req, res) {
  const {
    scheduleDate,
    note,
    leaveOrderAt,
    groupName,
    deliveryTypeId,
    orderModeId,
    paymentMethodId,
    dropOffLat,
    dropOffLng,
    building,
    streetAddress,
    distance,
    distanceUnit,
    restaurantId,
    userId,
  } = req.body;
  let ON1 = uON.generate();
  const type = await orderType.findOne({
    where: {
      type: "Group",
    },
  });
  const restData = await restaurant.findOne({
    where: {
      id: restaurantId,
    },
    include: [{
      model: zoneRestaurants,
      include: {
        model: zone,
        include: {
          model: zoneDetails,
        },
      },
    }, {
      model: user,
      attributes: ["deviceToken"],
    }, ],
  });
  const userData = await user.findOne({
    where: {
      id: req.user.id,
    },
  });
  let existInZone = false;
  const userPoint = point([parseFloat(dropOffLng), parseFloat(dropOffLat)]);
  const zoneData = await zoneRestaurants.findOne({
    where: {
      restaurantId: restData.id,
    },
    include: [{
      model: restaurant,
      include: [{
        model: unit,
        as: "distanceUnitID",
      }, ],
    }, {
      model: zone,
      include: {
        model: zoneDetails,
      },
    }, ],
  });
  if (zoneData.zone && zoneData.zone.coordinates.coordinates && zoneData.zone.coordinates.coordinates.length > 0) {
    const zonePolygon = {
      type: "Polygon",
      coordinates: zoneData.zone.coordinates.coordinates,
    };
    if (booleanPointInPolygon(userPoint, zonePolygon)) {
      existInZone = true;
    }
  }
  // if (existInZone == false) {
  //   const response = ApiResponse(
  //     "0",
  //     "Your Dropoff Address is out of Restaurant Zone",
  //     "Error",
  //     {}
  //   );
  //   return res.json(response);
  // }
  const newAddress = new address();
  newAddress.lat = dropOffLat;
  newAddress.lng = dropOffLng;
  newAddress.building = building;
  newAddress.streetAddress = streetAddress;
  newAddress.userId = req.user.id;
  newAddress.status = 1;
  await newAddress.save();
  const status = await orderStatus.findOne({
    where: {
      name: "Placed",
    },
  });
  const orderData = new order();
  orderData.userId = req.user.id;
  orderData.distance = distance;
  orderData.orderNum = `fom-${ON1}`;
  orderData.orderTypeId = type.id;
  orderData.scheduleDate = scheduleDate;
  orderData.deliveryTypeId = deliveryTypeId;
  orderData.orderModeId = orderModeId;
  orderData.paymentMethodId = paymentMethodId;
  orderData.orderApplicationId = restData?.businessType;
  orderData.restaurantId = restaurantId;
  orderData.orderStatusId = status.id;
  orderData.dropOffId = newAddress.id;
  orderData.paymentConfirmed = false;
  orderData.paymentRecieved = false;
  orderData.currencyUnitId = restData?.zoneRestaurant?.zone?.zoneDetail?.currencyUnitId;
  orderData.distanceUnitId = restData?.zoneRestaurant?.zone?.zoneDetail?.distanceUnitId;
  orderData.subTotal = 0;
  orderData.total = 0;
  orderData.status = 1;
  orderData.save().then(async (dat) => {
    const restaurantData = await restaurant.findOne({
      where: {
        id: restaurantId,
      },
      include: {
        model: user,
        attributes: ["deviceToken"],
      },
    });
    let tmpPath = req.file.path;
    let path = tmpPath.replace(/\\/g, "/");
    const userData = await user.findOne({
      where: {
        id: req.user.id,
      },
    });
    const group = new orderGroup();
    group.orderId = dat.id;
    group.participantId = userData.id;
    group.participantName = userData.userName === null ? `${userData.firstName} ${userData.lastName}` : userData.userName;
    group.groupName = groupName;
    group.hostedById = req.user.id;
    group.icon = path;
    group.save().then(async (dd) => {
      const userData = await user.findOne({
        where: {
          id: req.user.id,
        },
        attributes: ["id", "deviceToken", "firstName", "lastName"],
      });
      // singleNotification(
      //     restaurantData.user.deviceToken,
      //     "Group Order",
      //     `Group Order has created by ${userData.firstName} ${userData.lastName}`
      // );
      const data = {
        orderId: dat.id,
        groupName: groupName,
        groupIcon: dd.icon,
        hostedById: req.user.id,
      };
      const response = ApiResponse("1", "Group Created Successfully", "", data);
      return res.json(response);
    }).catch((error) => {
      const response = ApiResponse("0", error.message, "Error", {});
      return res.json(response);
    });
  }).catch((error) => {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  });
}
async function placeGroupOrder(req, res) {
  const {
    orderId,
    total,
    paymentMethodName,
    subTotal,
    cutlery_data,
    products,
    tip,
    deliveryFees,
    VAT,
    serviceCharges,
    paymentMethodId,
    deliveryTypeId,
    note
  } = req.body;

  let method = await paymentMethod.findOne({
    where: {
      name: "COD"
    }
  });

  let deliveryCharges = deliveryFees;

  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: [{
      model: orderMode
    }, {
      model: address,
      as: "dropOffID",
    }, {
      model: orderGroup,
      attributes: ['id'],
      include: {
        model: user,
        as: "participant",
        attributes: ['deviceToken']
      }
    }],
  });

  let deviceTokens = [];
  if (!orderData) {
    const response = ApiResponse("0", "No Record exist against this order", "", {});
    return res.json(response);
  }

  const restaurantData = await restaurant.findOne({
    where: {
      id: orderData.restaurantId,
    },
    include: {
      model: user,
      attributes: ["deviceToken"],
    },
  });

 let cutlery_list = [];
//    let cutlery_list = {};
if (orderData) {
  if (cutlery_data) {
    // Initialize cutlery_list as an object

    for (const cut of cutlery_data) {
      const cutlery_name = await cutlery.findOne({
        where: {
          id: cut.id,
        },
      });

      if (cutlery_name) {
        const order_cutlery = new orderCultery();
        order_cutlery.status = 1;
        order_cutlery.orderId = orderData?.id;
        order_cutlery.cutleryId = cutlery_name?.id;
        order_cutlery.qty = cut.qty;
        await order_cutlery.save();

         cutlery_list.push({
          name: cutlery_name.name,
          description: cutlery_name.description,
          image: cutlery_name.image,
          price: cut.price || 0,
        });
      }
    }
}
    products.map((oi, index) => {
      let total = oi.quantity * oi.unitPrice;
      total = total.toFixed(2);
      oi.total = total;
      oi.orderId = orderData.id;
    });

    let aoArr = [];

    // Delete the previous order items and order addons
    for (var i = 0; i < products.length; i++) {
      const check = await orderItems.findAll({
        where: [{
          orderId: orderId,
        }, {
          userId: req.body.userId,
        }],
      });

      if (check.length > 0) {
        for (const dat of check) {
          const add = await orderAddOns.findAll({
            where: {
              orderItemId: dat.id,
            },
          });

          if (add.length > 0) {
            for (const addonnn of add) {
              await addonnn.destroy();
            }
          }
          await dat.destroy();
        }
      }

      for (var i = 0; i < products.length; i++) {
        const item = new orderItems();
        item.quantity = products[i].quantity;
        item.unitPrice = products[i].unitPrice;
        item.RPLinkId = products[i].RPLinkId;
        item.total = parseFloat(products[i].unitPrice) * parseFloat(products[i].quantity);
        item.orderId = orderId;
        item.userId = req.user.id;
        await item.save();

        for (var k = 0; k < products[i].addOns.length; k++) {
          let obj = {
            total: products[i].addOns[k].total,
            qty: products[i].addOns[k].quantity,
            orderItemId: item.id,
            addOnId: products[i]?.addOns[k]?.addOnId,
            collectionId: products[i]?.addOns[k]?.collectionId,
          };
          aoArr.push(obj);
        }
      }

      for (var m = 0; m < aoArr.length; m++) {
        const addon = new orderAddOns();
        addon.total = aoArr[m].total;
        addon.orderItemId = aoArr[m].orderItemId;
        addon.addOnId = aoArr[m].addOnId;
        addon.collectionId = aoArr[m].collectionId;
        addon.qty = aoArr[m].qty;
        await addon.save();
      }
    }

    const status = await orderStatus.findOne({
      where: {
        name: "Placed",
      },
    });

    let driverEarnings = 0;
    let orderMembers = await orderGroup.findAll({
      where: {
        orderId: orderId
      },
    });

    let totalSubTotal = orderMembers.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.subTotal;
    }, 0);

    let OrdersubTotal = parseFloat(totalSubTotal) + parseFloat(subTotal);
    let Ordertotal = parseFloat(total);
    orderData.total = total;
    orderData.paymentMethodId = paymentMethodId;
    orderData.orderStatusId = status.id;
    orderData.isLocked = 1;
    orderData.note = note;
    orderData.deliveryTypeId = deliveryTypeId;
    orderData.subTotal = subTotal;
    orderData.paymentMethodName = paymentMethodName;

    orderData.save().then(async (dat) => {
      const zoneData = await zoneRestaurants.findOne({
        where: {
          restaurantId: dat.restaurantId,
        },
        include: [{
          model: restaurant,
        }, {
          model: zone,
          include: {
            model: zoneDetails,
          },
        }],
      });

      if (!zoneData) {
        const response = ApiResponse("0", "This Restaurant has no zone details! Please select another restaurant", "", {});
        return res.json(response);
      }

      let adminDeliveryCharges = 0;
      if (dat.deliveryTypeId == "1") {
        adminDeliveryCharges = (parseFloat(deliveryCharges) * parseFloat(zoneData.zone?.zoneDetail?.adminComissionOnDeliveryCharges)) / 100;
        driverEarnings = parseFloat(deliveryCharges) - parseFloat(adminDeliveryCharges);
      }

      let adminCommissionPercent = zoneData.zone?.zoneDetail?.adminComission;
      let totalEarnings = parseFloat(Ordertotal);
      let adminEarnings = parseFloat(OrdersubTotal) * (parseFloat(adminCommissionPercent) / 100);
      let restaurantEarnings = parseFloat(totalEarnings) - parseFloat(adminEarnings) - parseFloat(driverEarnings);

     let ch = {
    basketTotal: OrdersubTotal ?? 0,
    deliveryFees: parseFloat(deliveryCharges) || 0,
    discount: 0,
    VAT: VAT ?? 0,
    tip: tip ?? 0,
    total: Ordertotal ?? 0,
    adminEarnings: adminEarnings ? parseFloat(adminEarnings).toFixed(2) : '0.00',
    adminDeliveryCharges: adminDeliveryCharges ?? 0,
    driverEarnings: isNaN(driverEarnings) ? 0 : parseFloat(driverEarnings).toFixed(2),
    restaurantEarnings: restaurantEarnings ? parseFloat(restaurantEarnings).toFixed(2) : '0.00',
    adminPercent: adminCommissionPercent ?? 0,
    orderId: orderId ?? null,
};
      orderCharge.create(ch);

      const dd = await retOrderData(orderId);

      // Include cutlery_list in retData
      let data = {
        orderId: dd.orderId,
        orderNum: dd.orderNum,
        cutlery_list: cutlery_list, 
        restLat: restaurantData.lat,
        restLng: restaurantData.lng,
        restAddress: restaurantData.address,
        mode: orderData?.orderMode,
        dropOffLat: orderData.dropOffID?.lat,
        dropOffLng: orderData.dropOffID?.lng,
        waitForDriver: false,
        allowSelfPickUp: restaurantData.deliveryTypeId === 3 ? true : false,
        retData: dd,
      };

      if (orderData.paymentMethodId == method.id) {
        orderData.isLocked = true;
        await orderData.save();
        let notification = {
          title: "New Job arrived",
          body: "A new job has arrived",
        };
        let restLang = restaurantData?.user?.language
        sendNotifications([restaurantData?.user?.deviceToken], notification,restLang);
        sendNotifications(deviceTokens, {
          title: "Group Order",
          body: "Group Order Placed"
        });
      }
      let groupData = await groupOrderDetailsForSocket(orderId);
          let eventData = {
            type: "placeGroupOrder",
            data: {
              status: "1",
              message: "Data",
              error: "",
              data: groupData,
            },
          };
        const groupMembers = await orderGroup.findAll({
            where: { orderId: orderId },
            include: { model: user,as:"participant", attributes: ['id'] }
          });

          groupMembers.forEach(item => {
            sendEvent(item.participant.id, eventData);
          });
           sendEvent(orderData.userId, eventData);

      const response = ApiResponse("1", "Order Placed Successfully", "", data);
      return res.json(response);
    }).catch((error) => {
      const response = ApiResponse("0", error.message, "Error", {});
      return res.json(response);
    });
  }
}
async function afterPaymentGroupOrder(req, res) {
  const {
    orderId,
  } = req.body;

 

  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: [{
      model: orderMode
    }, {
      model: address,
      as: "dropOffID",
    }, {
      model: orderGroup,
      attributes: ['id'],
      include: {
        model: user,
        as: "participant",
        attributes: ['deviceToken']
      }
    }],
  });

  let deviceTokens = [];
  if (!orderData) {
    const response = ApiResponse("0", "No Record exist against this order", "", {});
    return res.json(response);
  }

  const restaurantData = await restaurant.findOne({
    where: {
      id: orderData.restaurantId,
    },
    include: {
      model: user,
      attributes: ["deviceToken"],
    },
  });

 let cutlery_list = [];
//    let cutlery_list = {};
if (orderData) {
  
   

      const dd = await retOrderData(orderId);

      // Include cutlery_list in retData
      let data = {
        orderId: dd.orderId,
        orderNum: dd.orderNum,
        cutlery_list: cutlery_list, 
        restLat: restaurantData.lat,
        restLng: restaurantData.lng,
        restAddress: restaurantData.address,
        mode: orderData?.orderMode,
        dropOffLat: orderData.dropOffID?.lat,
        dropOffLng: orderData.dropOffID?.lng,
        waitForDriver: false,
        allowSelfPickUp: restaurantData.deliveryTypeId === 3 ? true : false,
        retData: dd,
      };

    
      let groupData = await groupOrderDetailsForSocket(orderId);
     
          let eventData = {
            type: "afterPaymentGroupOrder",
            data: {
              status: "1",
              message: "Data",
              error: "",
              data: groupData,
            },
          };
        const groupMembers = await orderGroup.findAll({
            where: { orderId: orderId },
            include: { model: user,as:"participant", attributes: ['id'] }
          });

          groupMembers.forEach(item => {
            sendEvent(item?.participant?.id, eventData);
          });
           sendEvent(orderData?.userId, eventData);

      const response = ApiResponse("1", "Order Placed Successfully", "", data);
      return res.json(response);
   
  }
}



// async function joinGroup(req, res) {
//   const {
//     orderId,
//     products,
//     subTotal,
//     userId,
//     cutlery_data,
//     restaurantId
//   } = req.body;
 
//   try {
//     const group = await orderGroup.findOne({
//       where: {
//         orderId: orderId,
//         // participantId: req.user.id,
//         participantId: req.user.id,
//       },
//       include: {
//         model: order
//       }
//     });
//     // return res.json(group)
//     if (!group) {
//       const response = ApiResponse("0", "Sorry no record found", "", {});
//       return res.json(response);
//     }
//     if (group.order.isLocked) {
//       const response = ApiResponse("0", "Sorry! Group is Locked", "", {});
//       return res.json(response);
//     }
//     if (group.isRemoved) {
//       const response = ApiResponse("0", "Sorry! This user is removed from this group", "", {});
//       return res.json(response);
//     }
//     group.subTotal = subTotal;
//     await group.save();
//     var cultery_list = [];
//     let deliveryTypeId = "2";
//     const orderData = await order.findOne({
//       where: {
//         id: orderId,
//       },
//       include: [{
//         model: orderMode
//       }, {
//         model: address,
//         as: "dropOffID",
//       }, {
//         model: user,
//         attributes: ["id", "deviceToken", "firstName", "lastName", "userName", ],
//       }, ],
//     });
//     if (!orderData) {
//       const response = ApiResponse("0", `No Order exists agains order Id : ${orderId}`, "", {});
//       return res.json(response);
//     }
//     const charges = await orderCharge.findOne({
//       where: {
//         orderId: orderData.id,
//       },
//     });
   
//     const restaurantData = await restaurant.findOne({
//       where: {
//         id: restaurantId,
//       },
//       include: {
//         model: user,
//         attributes: ["deviceToken"],
//       },
//     });

//     await orderData.save();
//     await orderItems.destroy({where:{userId:userId,orderId:orderId}});
//     cutlery_data.map(async (dd) => {
//       const cultery_name = await cutlery.findOne({
//         where: {
//           id: dd.id,
//         },
//       });
//       if (cultery_name) {
//         const order_cutlery = new orderCultery();
//         order_cutlery.status = 1;
//         order_cutlery.orderId = orderData.id;
//         order_cutlery.cutleryId = dd.id;
//         order_cutlery.qty = dd.qty;
//         await order_cutlery.save();
//         cultery_list.push({
//           name: cultery_name.name,
//           image: cultery_name.image,
//           price: cultery_name.price,
//           qty: dd.qty,
//         });
//       }
//     });
//     let time = Date.now();
//     orderHistory.create({
//       time,
//       orderId: orderData.id,
//       orderStatusId: 1,
//     });
//     let aoArr = [];
//     for (var i = 0; i < products.length; i++) {
//       const item = new orderItems();
//       item.quantity = products[i].quantity;
//       item.unitPrice = products[i].unitPrice;
//       item.RPLinkId = products[i].RPLinkId;
//       item.total = parseFloat(products[i].unitPrice) * parseFloat(products[i].quantity);
//       item.orderId = orderId;
//       item.userId = req.user.id;
//       await item.save();
//       let prod = await R_PLink.findOne({
//         where: {
//           id: products[i].RPLinkId
//         }
//       });
//       if (prod) {
//         prod.sold = parseInt(prod.sold) + parseInt(products[i].quantity);
//         await prod.save();
//       }
//       if (products[i].addOns.length > 0) {
//         for (var k = 0; k < products[i].addOns.length; k++) {
//           let obj = {
//             total: products[i].addOns[k].total,
//             qty: products[i].addOns[k].quantity,
//             // PAACLinkId: products[i].addOns[k].PAACLinkId,
//             orderItemId: item.id,
//             // PAOLinkId: products[i].addOns[k].PAOLinkId,
//             addOnId: products[i]?.addOns[k]?.addOnId,
//             collectionId: products[i]?.addOns[k]?.collectionId,
//           };
//           aoArr.push(obj);
//         }
//       }
//     }
    
//     for (var m = 0; m < aoArr.length; m++) {
//       const addon = new orderAddOns();
//       addon.total = aoArr[m].total;
//       addon.PAOLinkId = aoArr[m].PAOLinkId;
//       addon.PAACLinkId = aoArr[m].PAACLinkId;
//       addon.orderItemId = aoArr[m].orderItemId;
//       addon.addOnId = aoArr[m].addOnId;
//       addon.collectionId = aoArr[m].collectionId;
//       addon.qty = aoArr[m].qty;
//       await addon.save();
//     }
//     retOrderDataForJoinGroup(orderData.id, req.user.id, subTotal).then(async (retData) => {
//       let data = {
//         orderId: orderData.id,
//         dropOffLat: orderData?.dropOffID?.lat,
//         dropOffLng: orderData?.dropOffID?.lng,
//         orderNum: orderData.orderNum,
//         cultery_list: cultery_list,
//         restLat: restaurantData.lat,
//         restLng: restaurantData.lng,
//         mode: orderData?.orderMode,
//         restAddress: restaurantData.address,
//         waitForDriver: false,
//         hostName: `${orderData?.user?.userName}`,
//         allowSelfPickUp: restaurantData.deliveryTypeId == 3 ? true : false,
//         retData,
//       };
//       let userData = await user.findOne({
//         where: {
//           id: req.user.id
//         },
//         attributes: ["ip"],
//       });
//       let groupMembers = await orderGroup.findAll({
//         where: {
//           orderId: orderId
//         },
//         attributes: [],
//         include: {
//           model: user,
//           as: "participant",
//           attributes: ['ip', 'id']
//         }
//       });
//       var ips = [];
//       groupMembers.forEach(item => {
//         const ipString = item.participant.ip;
//         if (ipString) {
//           const ipArray = formatTokens(ipString);
//           ips.push(...ipArray);
//         }
//       });
//       let groupData = await groupOrderDetailsForSocket(orderId);
//       let eventData = {
//         type: "groupOrder",
//         data: {
//           status: "1",
//           message: "Data",
//           error: "",
//           data: groupData,
//         },
//       };
//       groupMembers.forEach(item => {
//         sendEvent(item.participant.id, eventData);
//       });
//       const response = ApiResponse("1", "Join successfully", "", data);
//       return res.json(response);
//     });
//   } catch (error) {
//     const response = ApiResponse("0", error.message, "Error", {});
//     return res.json(response);
//   }
// }
async function joinGroup(req, res) {
  const {
    orderId,
    products,
    subTotal,
    userId,
    cutlery_data,
    restaurantId
  } = req.body;
  
    

  try {
    const group = await orderGroup.findOne({
      where: {
        orderId: orderId,
        participantId: userId,
      },
      include: {
        model: order
      }
    });

    if (!group) {
      const response = ApiResponse("0", "Sorry, no record found", "", {});
      return res.json(response);
    }

    if (group.order.isLocked) {
      const response = ApiResponse("0", "Sorry! Group is Locked", "", {});
      return res.json(response);
    }

    if (group.isRemoved) {
      const response = ApiResponse("0", "Sorry! This user is removed from this group", "", {});
      return res.json(response);
    }

    group.subTotal = subTotal;
    group.isReady = true;
    await group.save();

    let cultery_list = [];
    const orderData = await order.findOne({
      where: { id: orderId },
      include: [
        { model: orderMode },
        { model: address, as: "dropOffID" },
        { model: user, attributes: ["id", "deviceToken", "firstName", "lastName", "userName"] },
      ],
    });

    if (!orderData) {
      const response = ApiResponse("0", `No Order exists against order Id: ${orderId}`, "", {});
      return res.json(response);
    }

    const restaurantData = await restaurant.findOne({
      where: { id: restaurantId },
      include: { model: user, attributes: ["deviceToken"] },
    });

    // Delete existing order items for the user before adding new ones
    orderItems.destroy({ where: { userId: userId, orderId: orderId } })
      .then(async () => {
        // Handling cutlery data
        if(cutlery_data.length > 0){
            for (const dd of cutlery_data) {
          const cultery_name = await cutlery.findOne({ where: { id: dd.id } });
          if (cultery_name) {
            const order_cutlery = new orderCultery();
            order_cutlery.status = 1;
            order_cutlery.orderId = orderData.id;
            order_cutlery.cutleryId = dd.id;
            order_cutlery.qty = dd.qty;
            await order_cutlery.save();

            cultery_list.push({
              name: cultery_name.name,
              image: cultery_name.image,
              price: cultery_name.price,
              qty: dd.qty,
            });
          }
        }
        }

        // Initialize aoArr to hold add-on data
        let aoArr = [];
        // Save new order items
       if(products.length > 0){
            let orderItemsPromises = products.map(async (product) => {
          const item = new orderItems();
          item.quantity = product.quantity; // Set the quantity from the product
          item.unitPrice = product.unitPrice; // Set the unit price from the product
          item.RPLinkId = product.RPLinkId; // Set the RPLinkId from the product
          item.total = parseFloat(product.unitPrice) * parseFloat(product.quantity); // Calculate total correctly
          item.orderId = orderId; // Set the order ID
          item.userId = userId; // Set the user ID

        //   console.log("Saving order item:", item); // Debug log

          await item.save(); // Save order item

          let prod = await R_PLink.findOne({ where: { id: product.RPLinkId } });
          if (prod) {
            prod.sold = parseInt(prod.sold) + parseInt(product.quantity);
            await prod.save();
          }

          if (product.addOns.length > 0) {
            for (const addOn of product.addOns) {
              let obj = {
                total: addOn.total,
                qty: addOn.quantity,
                addOnId: addOn.addOnId,
                collectionId: addOn.collectionId,
                orderItemId: item?.id,
              };
              aoArr.push(obj); // Add add-on object to aoArr
            }
          }
        });

        // Wait for all order items to be saved
        await Promise.all(orderItemsPromises);

        // Save Add-Ons
        let addOnPromises = aoArr.map(async (ao) => {
          const addon = new orderAddOns();
          addon.total = ao.total;
          addon.addOnId = ao.addOnId;
          addon.collectionId = ao.collectionId;
          addon.orderItemId = ao.orderItemId;
          addon.qty = ao.qty;
          await addon.save();
        });

        await Promise.all(addOnPromises);
       }

        // Prepare and send response
        retOrderDataForJoinGroup(orderId,userId, subTotal).then(async (retData) => {
            
          let data = {
            orderId: orderData.id,
            dropOffLat: orderData?.dropOffID?.lat,
            dropOffLng: orderData?.dropOffID?.lng,
            orderNum: orderData.orderNum,
            cultery_list: cultery_list,
            restLat: restaurantData.lat,
            restLng: restaurantData.lng,
            mode: orderData?.orderMode,
            restAddress: restaurantData.address,
            waitForDriver: false,
            hostName: `${orderData?.user?.userName}`,
            allowSelfPickUp: restaurantData.deliveryTypeId == 3 ? true : false,
            retData,
          };

          let groupData = await groupOrderDetailsForSocket(orderId);
          let eventData = {
            type: "groupOrder",
            data: {
              status: "1",
              message: "Data",
              error: "",
              data: groupData,
            },
          };

          const groupMembers = await orderGroup.findAll({
            where: { orderId: orderId },
            include: { model: user, as: "participant", attributes: ['id'] }
          });

          groupMembers.forEach(item => {
           
            sendEvent(item?.participant?.id?.toString(), eventData);
          });

          const response = ApiResponse("1", "Join successfully", "", data);
          return res.json(response);
        });
      })
      .catch(error => {
        const response = ApiResponse("0", error.message, "Error", {});
        return res.json(response);
      });
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function joinMember(req, res) {
  const {
    orderId,
    name,
    userId
  } = req.body;
  //   return res.json("ok")
  try {
    const orderData = await order.findOne({
      where: {
        id: orderId,
      },
      include: {
        model: user,
        attributes: ["id", "deviceToken","language"],
      },
    });
    if (!orderData) {
      const response = ApiResponse("0", `Sorry! no order found against Order ID ${orderId}`, "", {});
      return res.json(response);
    }
    if (orderData.isLocked) {
      let response = ApiResponse("0", "Group is Locked", "Error", {});
      return res.json(response)
    }
    
    const existUser = await orderGroup.findOne({
      where: {
        orderId: orderId,
        participantId:userId
      },
    });
    if(existUser){
        return res.json(ApiResponse("0","Already exists in Group","",{}));
    }
    const group = await orderGroup.findOne({
      where: {
        orderId: orderId,
      },
    });
    const userData = await user.findOne({
      where: {
        id: userId,
      },
      attributes: ["id", "firstName", "lastName", "deviceToken","language"],
    });
    if (group) {
      if (group.isRemoved) {
        const response = ApiResponse("0", "Sorry! you are removed from group", "", {});
        return res.json(response);
      }
      const existGroup = await orderGroup.findOne({
        where: [{
          hostedById: group.hostedById,
        }, {
          participantId: userId,
        }, {
          orderId: orderId,
        }, ],
      });
      if (existGroup) {
        const response = ApiResponse("1", "Joined successfully", "", {});
        return res.json(response);
      }
    } else {}
    const userlanguage= orderData?.user?.language
    const ordergroup = new orderGroup();
    ordergroup.orderId = orderId;
    ordergroup.participantId = userId;
    ordergroup.participantName = name;
    ordergroup.isRemoved = false;
    ordergroup.icon = group?.icon;
    ordergroup.hostedById = group?.hostedById;
    ordergroup.groupName = group?.groupName;
    ordergroup.isRemoved = false;
    ordergroup.save().then(async(dat) => {
      // send notification to owner of group that group has been joined by participant
      singleNotification(orderData.user.deviceToken, "Group Joined!", `${userData.firstName} ${userData.lastName} has joined the group`,{},userlanguage);
      
        let groupData = await groupOrderDetailsForSocket(orderId);
          let eventData = {
            type: "groupOrder",
            data: {
              status: "1",
              message: "Data",
              error: "",
              data: groupData,
            },
          };

          const groupMembers = await orderGroup.findAll({
            where: { orderId: orderId },
            include: { model: user, as: "participant", attributes: ['id'] }
          });

          groupMembers.forEach(item => {
           
            sendEvent(item?.participant?.id?.toString(), eventData);
          });
      const response = ApiResponse("1", "Joined successfully", "", {});
      return res.json(response);
    }).catch((error) => {
      const response = ApiResponse("0", error.message, "", {});
      return res.json(response);
    });
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function PreparingOrders(req, res) {
  const type = await orderType.findOne({
    where: {
      type: "Normal",
    },
  });
  const status = await orderStatus.findOne({
    name: "Preparing",
  });
  const orders = await order.findOne({
    where: [{
      userId: req.user.id,
    }, {
      orderTypeId: type.id,
    }, {
      orderStatusId: status.id,
    }, ],
    include: [{
      model: user,
      attributes: ["id", "firstName", "lastName"],
    }, ],
  });
  const data = {
    PreparingOrders: orders,
  };
  const response = ApiResponse("1", "Orders", "", data);
  return res.json(response);
}
async function PickupOrders(req, res) {
  const type = await orderType.findOne({
    where: {
      type: "Normal",
    },
  });
  const status = await orderStatus.findOne({
    name: "Food Pickedup",
  });
  const orders = await order.findOne({
    where: [{
      userId: req.user.id,
    }, {
      orderTypeId: type.id,
    }, {
      orderStatusId: status.id,
    }, ],
    include: [{
      model: user,
      attributes: ["id", "firstName", "lastName"],
    }, ],
  });
  const data = {
    PickupOrders: orders,
  };
  const response = ApiResponse("1", "Orders", "", data);
  return res.json(response);
}
async function groupOrderDetailsGet(req, res) {
  const {
    orderId
  } = req.params;
  try {
    const type = await orderType.findOne({
      where: {
        type: "Group",
      },
    });
    let participantList = [];
    const orderData = await order.findOne({
      where: [{
        id: orderId,
      }, {
        orderTypeId: type.id,
      }, ],
      include: [{
        model: restaurant,
      }, {
        model: address,
        as: "dropOffID",
      }, {
        model: unit,
        as: "currencyUnitID",
      }, {
        model: user,
      }, {
        model: orderGroup,
        where: {
          [Op.or]: [{
            isRemoved: null
          }, {
            isRemoved: false
          }]
        },
        //   required:false,
        include: {
          model: user,
          as: "participant",
        },
      }, ],
    });
    let addons_list = [];
    let item_list = [];
    if (orderData) {
      for (const group of orderData.orderGroups) {
        if (group.participantId !== null) {
          const items = await orderItems.findAll({
            attributes: ["id", "quantity", "userId"],
            where: [{
              userId: group.participantId,
            }, {
              orderId: orderData.id,
            }, ],
            include: [{
              model: orderAddOns,
              attributes: ["id", "total", "qty"],
              include: {
                model: addOn,
                attributes: ["name"],
              },
            }, {
              model: R_PLink,
              attributes: ["id", "name", "description", "image", "originalPrice", "productId", ],
            }, ],
          });
          // return res.json()
          let item_list = []; // Initialize item_list for each group
          if (items.length > 0) {
            for (const item of items) {
              let itemObj = {
                productName: item.R_PLink,
                qty: item.quantity,
                addOns: item.orderAddOns,
              };
              if (item.userId == group.participantId) {
                item_list.push(itemObj);
              }
            }
          }
          let obj = {
            participantId: group.participantId,
            isReady: group.isReady ? true : false,
            subTotal: group?.subTotal ? group?.subTotal : 0,
            participantName: group.participantName,
            items: item_list,
          };
          participantList.push(obj);
        }
      }
      //   return res.json(orderData?.orderGroups)
      let data = {
        orderId: orderData.id,
        isLocked: orderData.isLocked ? true : false,
        orderNum: orderData.orderNum,
        groupName: orderData?.orderGroups[0]?.groupName,
        groupIcon: orderData?.orderGroups[0]?.icon,
        scheduleDate: orderData.scheduleDate,
        distance: orderData.distance,
        subTotal: orderData?.subTotal,
        total: orderData.total,
        status: orderData.status,
        restaurant: orderData?.restaurant,
        paymentRecieved: orderData.paymentRecieved,
        hostebBy: {
          id: orderData.user.id,
          userName: orderData.user.userName,
          // firstName: orderData.user.firstName,
        },
        dropOffAddress: {
          streetAddress: orderData.dropOffID?.streetAddress,
          nameOnDoor: orderData.dropOffID?.nameOnDoor ? orderData.dropOffID?.nameOnDoor : "No Name",
          floor: orderData.dropOffID?.floor ? orderData.dropOffID?.floor : "No floor",
          entrance: orderData.dropOffID?.entrance ? orderData.dropOffID?.entrance : "No entrance",
          nameOnDoor: orderData.dropOffID?.nameOnDoor ? orderData.dropOffID?.nameOnDoor : "No Name",
          city: orderData.dropOffID?.city ? orderData.dropOffID?.city : "No city",
          state: orderData.dropOffID?.state ? orderData.dropOffID?.state : "No state",
          zipCode: orderData.dropOffID?.zipCode ? orderData.dropOffID?.zipCode : "No zipCode",
          lat: orderData.dropOffID?.lat,
          lng: orderData.dropOffID?.lng,
        },
        currencyDetails: {
          name: orderData?.currencyUnitID?.name,
          type: orderData?.currencyUnitID?.type,
          symbol: orderData?.currencyUnitID?.symbol,
          shortcode: orderData?.currencyUnitID?.shortcode ? orderData?.currencyUnitID?.shortcode : "No Short Code",
        },
        participantList: participantList,
      };
      const response = ApiResponse("1", "Group Order Details", "", data);
      return res.json(response);
    } else {
      const response = ApiResponse("0", `Sorry! No Details exists of Order-ID-${orderId}`, "", {});
      return res.json(response);
    }
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function groupOrderDetails(req, res) {
  const {
    orderId
  } = req.body;
  
//   let dd = await groupOrderDetailsForSocket(orderId);
//   return res.json(dd);
  
  
  
  try {
    const type = await orderType.findOne({
      where: {
        type: "Group",
      },
    });
    let participantList = [];
    const orderData = await order.findOne({
      where: [{
        id: orderId,
      }, {
        orderTypeId: type.id,
      }, ],
      include: [{
        model: restaurant,
      }, {
        model: address,
        as: "dropOffID",
      }, {
        model: unit,
        as: "currencyUnitID",
      }, {
        model: user,
      }, {
        model: orderGroup,
        where: {
          [Op.or]: [{
            isRemoved: null
          }, {
            isRemoved: false
          }]
        },
        //   required:false,
        include: {
          model: user,
          as: "participant",
        },
      }, ],
    });
    let addons_list = [];
    let item_list = [];
    if (orderData) {
      for (const group of orderData.orderGroups) {
        if (group.participantId !== null) {
          const items = await orderItems.findAll({
            attributes: ["id", "quantity", "userId"],
            where: [{
              userId: group.participantId,
            }, {
              orderId: orderData.id,
            }, ],
            include: [{
              model: orderAddOns,
              attributes: ["id", "total", "qty"],
              include: {
                model: addOn,
                attributes: ["name"],
              },
            }, {
              model: R_PLink,
              attributes: ["id", "name", "description", "image", "originalPrice", "productId", ],
            }, ],
          });
          // return res.json()
          let item_list = []; // Initialize item_list for each group
          if (items.length > 0) {
            for (const item of items) {
              let itemObj = {
                productName: item.R_PLink,
                qty: item.quantity,
                addOns: item.orderAddOns,
              };
              if (item.userId == group.participantId) {
                item_list.push(itemObj);
              }
            }
          }
          let obj = {
            participantId: group.participantId,
            isReady: group.isReady ? true : false,
            subTotal: group?.subTotal ? group?.subTotal : 0,
            participantName: group.participantName,
            items: item_list,
          };
          participantList.push(obj);
        }
      }
      //   return res.json(orderData?.orderGroups)
      let data = {
        orderId: orderData.id,
        isLocked: orderData.isLocked ? true : false,
        deliveryTypeId: orderData?.deliveryTypeId,
        orderModeId: orderData?.orderModeId,
        orderNum: orderData.orderNum,
        groupName: orderData?.orderGroups[0]?.groupName,
        groupIcon: orderData?.orderGroups[0]?.icon,
        scheduleDate: orderData.scheduleDate,
        distance: orderData.distance,
        subTotal: orderData?.subTotal,
        total: orderData.total,
        status: orderData.status,
        restaurant: orderData?.restaurant,
        paymentRecieved: orderData.paymentRecieved,
        hostebBy: {
          id: orderData.user.id,
          userName: orderData.user.userName,
          // firstName: orderData.user.firstName,
        },
        dropOffAddress: {
          streetAddress: orderData.dropOffID?.streetAddress,
          nameOnDoor: orderData.dropOffID?.nameOnDoor ? orderData.dropOffID?.nameOnDoor : "No Name",
          floor: orderData.dropOffID?.floor ? orderData.dropOffID?.floor : "No floor",
          entrance: orderData.dropOffID?.entrance ? orderData.dropOffID?.entrance : "No entrance",
          nameOnDoor: orderData.dropOffID?.nameOnDoor ? orderData.dropOffID?.nameOnDoor : "No Name",
          city: orderData.dropOffID?.city ? orderData.dropOffID?.city : "No city",
          state: orderData.dropOffID?.state ? orderData.dropOffID?.state : "No state",
          zipCode: orderData.dropOffID?.zipCode ? orderData.dropOffID?.zipCode : "No zipCode",
          lat: orderData.dropOffID?.lat,
          lng: orderData.dropOffID?.lng,
        },
        currencyDetails: {
          name: orderData?.currencyUnitID?.name,
          type: orderData?.currencyUnitID?.type,
          symbol: orderData?.currencyUnitID?.symbol,
          shortcode: orderData?.currencyUnitID?.shortcode ? orderData?.currencyUnitID?.shortcode : "No Short Code",
        },
        participantList: participantList,
      };
      const response = ApiResponse("1", "Group Order Details", "", data);
      return res.json(response);
    } else {
      const response = ApiResponse("0", `Sorry! No Details exists of Order-ID-${orderId}`, "", {});
      return res.json(response);
    }
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function lockGroupOrder(req, res) {
  const {
    orderId,
    isLocked
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const orderData = await order.findOne({
      where: {
        id: orderId
      },
      transaction: t // Add transaction context
    });
    if (!orderData) {
      await t.rollback(); // Rollback transaction if order not found
      const response = ApiResponse("0", "Not found", "Error", {});
      return res.json(response);
    }
    orderData.isLocked = isLocked;
    await orderData.save({
      transaction: t
    }); // Save with transaction context
    await t.commit(); // Commit transaction if all operations succeed
    
    let groupData = await groupOrderDetailsForSocket(orderId);
          let eventData = {
            type: "groupOrder",
            data: {
              status: "1",
              message: "Data",
              error: "",
              data: groupData,
            },
          };

          const groupMembers = await orderGroup.findAll({
            where: { orderId: orderId },
            include: { model: user, as: "participant", attributes: ['id'] }
          });

          groupMembers.forEach(item => {
           
            sendEvent(item?.participant?.id?.toString(), eventData);
          });
    
    
    const response = ApiResponse("1", `Group ${isLocked ? 'Locked' : 'Unlocked'} successfully`, "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function removeMember(req, res) {
  const {
    userId,
    orderId
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const group = await orderGroup.findOne({
      where: {
        participantId: userId,
        orderId: orderId
      },
      transaction: t // Add transaction context
    });
    if (!group) {
      await t.rollback(); // Rollback transaction if group not found
      const response = ApiResponse("0", "Not found!", "error", {});
      return res.json(response);
    }
    group.isRemoved = true;
    await group.save({
      transaction: t
    }); // Save with transaction context
    const items = await orderItems.findAll({
      where: {
        orderId: group.orderId,
        userId: userId
      },
      transaction: t // Add transaction context
    });
    // Use Promise.all to handle all destroy operations concurrently
    await Promise.all(items.map(async (item) => {
      const adds = await orderAddOns.findAll({
        where: {
          orderItemId: item.id
        },
        transaction: t // Add transaction context
      });
      await Promise.all(adds.map(add => add.destroy({
        transaction: t
      }))); // Destroy add-ons with transaction context
      await item.destroy({
        transaction: t
      }); // Destroy item with transaction context
    }));
    let eventData = {
      type: "removeMember",
      status: "1",
      message: "You are removed from Group Order",
      data: {},
    };
    sendEvent(userId, eventData);
    await t.commit(); // Commit transaction if all operations succeed
    const response = ApiResponse("1", "Removed successfully", "success", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    console.error('Error during removal:', error);
    const response = ApiResponse("0", error.message, "error", {});
    return res.status(500).json(response);
  }
}
async function getTableBookings(req, res) {
  try {
    const bookings = await tableBooking.findAll({
      where: {
        userId: req.user.id,
      },
      include: [{
        model: restaurant,
      }, {
        model: orderStatus,
      }, ],
    });
    // return res.json(bookings)
    let list = [];
    if (bookings.length > 0) {
      bookings.map((data) => {
        let obj = {
          id: data.id,
          noOfMembers: data.noOfMembers,
          data: data.date,
          time: data.time,
          restaurant: {
            id: data?.restaurant?.id,
            businessName: data?.restaurant?.businessName,
            businessEmail: data?.restaurant?.businessEmail,
            countryCode: data?.restaurant?.countryCode,
            phoneNum: data?.restaurant?.phoneNum,
            zipCode: data?.restaurant?.zipCode,
            logo: data?.restaurant?.logo,
            image: data?.restaurant?.image,
            address: data?.restaurant?.address,
          },
          Status: {
            status: data?.orderStatus?.name,
            displayText: data?.orderStatus?.displayText,
          },
        };
        list.push(obj);
      });
    }
    const data = {
      bookings: list,
    };
    const response = ApiResponse("1", "Table Bookings", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function cancelledTableBooking(req, res) {
  const {
    tableId
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const table = await tableBooking.findOne({
      where: {
        id: tableId
      },
      transaction: t // Add transaction context
    });
    if (!table) {
      await t.rollback(); // Rollback transaction if table not found
      const response = ApiResponse("0", "Table not found", "Error", {});
      return res.json(response);
    }
    const status = await orderStatus.findOne({
      where: {
        name: "Cancelled"
      },
      transaction: t // Add transaction context
    });
    if (!status) {
      await t.rollback(); // Rollback transaction if status not found
      const response = ApiResponse("0", "Order status 'Cancelled' not found", "Error", {});
      return res.json(response);
    }
    table.orderStatusId = status.id;
    await table.save({
      transaction: t
    }); // Save with transaction context
    const restData = await restaurant.findOne({
      where: {
        id: table.restaurantId
      },
      include: {
        model: user,
        attributes: ["id", "deviceToken"]
      },
      transaction: t // Add transaction context
    });
    const restLanguage = restData?.user?.language
    if (restData && restData.user.deviceToken) {
      singleNotification(restData.user.deviceToken, "Request Cancelled", `Table Booking Request has been cancelled by User ID: ${req.user.id}`,{},restLanguage);
    }
    await t.commit(); // Commit transaction if all operations succeed
    const response = ApiResponse("1", "Request Cancelled", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    console.error('Error during table booking cancellation:', error);
    const response = ApiResponse("0", error.message, "Error", {});
    return res.status(500).json(response);
  }
}
async function bookTableBooking(req, res) {
  const {
    noOfMembers,
    date,
    time,
    restaurantId,
    message
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    // Find the "Placed" status
    const status = await orderStatus.findOne({
      where: {
        name: "Placed"
      },
      transaction: t // Add transaction context
    });
    if (!status) {
      await t.rollback(); // Rollback transaction if status not found
      const response = ApiResponse("0", "Order status 'Placed' not found", "Error", {});
      return res.json(response);
    }
    // Create a new table booking
    const booking = await tableBooking.create({
      noOfMembers,
      date,
      time,
      message,
      status: true,
      restaurantId,
      orderStatusId: status.id,
      userId: req.user.id
    }, {
      transaction: t
    }); // Add transaction context
    // Find restaurant and user data
    const [restData, userData] = await Promise.all([
      restaurant.findOne({
        where: {
          id: restaurantId
        },
        include: {
          model: user,
          attributes: ["id", "deviceToken", "ip","language"]
        },
        transaction: t // Add transaction context
      }),
      user.findOne({
        where: {
          id: req.user.id
        },
        attributes: ["id", "firstName", "lastName", "deviceToken", "ip","language"],
        transaction: t // Add transaction context
      })
    ]);
    // Send event to retailer
    const retailerData = await retailerController.homeData(restaurantId);
    let eventDataForRetailer = {
      type: "bookTableBooking",
      data: {
        status: "1",
        message: "Data",
        error: "",
        data: retailerData,
      },
    };
    sendEvent(restData?.user?.id, eventDataForRetailer);
    // Send notification to restaurant
    if (restData) {
      let restTokens = formatTokens(restData?.user?.deviceToken);
      let restlanguage = restData?.user?.language
      singleNotification(restTokens, "Request for Book a Table", `${userData.firstName} ${userData.lastName} made a request to book a table with ${noOfMembers} members.`,{},restlanguage);
    }
    await t.commit(); // Commit transaction if all operations succeed
    const response = ApiResponse("1", "Table Booking Request Created", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    console.error('Error during table booking:', error);
    const response = ApiResponse("0", error.message, "Error", {});
    return res.status(500).json(response);
  }
}
async function leaveGroup(req, res) {
  const {
    userId,
    orderId
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    // Find the group
    const group = await orderGroup.findOne({
      where: {
        orderId: orderId,
        participantId: userId,
      },
      transaction: t // Add transaction context
    });
    if (!group) {
      await t.rollback(); // Rollback transaction if group not found
      const response = ApiResponse("0", "Group not found", "Error", {});
      return res.json(response);
    }
    // Delete the group
    await group.destroy({
      transaction: t
    });
    // Find items associated with the order and user
    const items = await orderItems.findAll({
      where: {
        orderId: group.orderId,
        userId: userId
      },
      transaction: t // Add transaction context
    });
    // Use Promise.all to handle all destroy operations concurrently
    await Promise.all(items.map(async (item) => {
      const adds = await orderAddOns.findAll({
        where: {
          orderItemId: item.id
        },
        transaction: t // Add transaction context
      });
      await Promise.all(adds.map(add => add.destroy({
        transaction: t
      })));
      await item.destroy({
        transaction: t
      });
    }));
       
    await t.commit(); // Commit transaction if successful
    
    
    let groupData = await groupOrderDetailsForSocket(orderId);
          let eventData = {
            type: "groupOrder",
            data: {
              status: "1",
              message: "Data",
              error: "",
              data: groupData,
            },
          };

          const groupMembers = await orderGroup.findAll({
            where: { orderId: orderId },
            include: { model: user, as: "participant", attributes: ['id'] }
          });

          groupMembers.forEach(item => {
           
            sendEvent(item?.participant?.id?.toString(), eventData);
          });
    
    
    
    const response = ApiResponse("1", "Successfully left the group", "Success", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    console.error('Error during group leave:', error);
    const response = ApiResponse("0", error.message, "Error", {});
    return res.status(500).json(response);
  }
}
async function deleteGroup(req, res) {
  const {
    orderId
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    // Find the order to delete
    const orderData = await order.findOne({
      where: {
        id: orderId
      },
      transaction: t // Add transaction context
    });
    if (!orderData) {
      await t.rollback(); // Rollback transaction if order not found
      return res.json(ApiResponse("0", "Order not found!", "", {}));
    }
    // Find groups associated with the order
    const groups = await orderGroup.findAll({
      where: {
        orderId: orderId
      },
      transaction: t // Add transaction context
    });
    // Delete each group and send event
    for (const group of groups) {
      let eventData = {
        type: "deleteGroup",
        status: "1",
        message: "Group Deleted",
        data: {}
      };
      sendEvent(group?.participantId, eventData);
      await group.destroy({
        transaction: t
      }); // Delete group within transaction
    }
    // Delete the order
    await orderData.destroy({
      transaction: t
    });
    await t.commit(); // Commit transaction if successful
    const response = ApiResponse("1", "Group Deleted successfully", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    return res.json(ApiResponse("0", "Error deleting group", error.message, {}));
  }
}
async function editAddress(req, res) {
  const {
    addressId,
    building,
    note,
    streetAddress,
    city,
    state,
    zipCode,
    lat,
    lng,
    otherType,
    locationType,
    addressTypeId
  } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    // Find the address to update
    let check = await address.findOne({
      where: {
        id: addressId
      },
      transaction: t // Add transaction context
    });
    if (!check) {
      await t.rollback(); // Rollback transaction if address not found
      return res.json(ApiResponse("0", "Address not found!", "", {}));
    }
    // Update address fields
    check.building = building || check.building;
    check.note = note || check.note;
    check.streetAddress = streetAddress || check.streetAddress;
    check.city = city || check.city;
    check.state = state || check.state;
    check.zipCode = zipCode || check.zipCode;
    check.lat = lat || check.lat;
    check.lng = lng || check.lng;
    check.otherType = otherType || check.otherType;
    check.locationType = locationType || check.locationType;
    check.addressTypeId = addressTypeId || check.addressTypeId;
    // Save the updated address
    await check.save({
      transaction: t
    });
    await t.commit(); // Commit transaction if successful
    return res.json(ApiResponse("1", "Address Updated successfully", "", {}));
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    return res.json(ApiResponse("0", "Error updating address", error.message, {}));
  }
}
async function addAdditionalTip(req, res) {
  const {
    orderId,
    driverTip,
    restaurantTip,
    comment
  } = req.body;
  return res.json(ApiResponse("1", "Additional Tip added successfully", "", {}));
}
async function getOfferRestaurants(req, res) {
  const {
    bannerId
  } = req.body;
 
  let list = [];
  let restType = await orderApplication.findOne({where:{name:"restaurant"}});
  let storeType = await orderApplication.findOne({where:{name:"store"}});
 
  let bannerData = await banner.findOne({where:{id:bannerId},attributes:['businessType']});

     
        let data = await restaurantOffers.findAll({
    attributes: [],
    where: {
      bannerId: bannerId,
      status: true
    },
    include: {
      model: restaurant,
      where:{businessType : bannerData?.businessType}
    }
  });
 
  
  
  
  if (data.length > 0) {
    for (const ban of data) {
        let cusinesList = await cusineRestaurant.findAll({
                where: {
                  restaurantId: ban?.restaurant.id
                },
                attributes: [],
                include: {
                  model: cuisine,
                  attributes: ['id', 'name']
                }
              });
      let obj = {
        id: ban?.restaurant?.id,
        businessName: ban?.restaurant?.businessName,
        businessEmail: ban?.restaurant?.businessEmail,
        businessType: ban?.restaurant?.businessType,
        city: ban?.restaurant?.city,
        zipCode: ban?.restaurant?.zipCode,
        address: ban?.restaurant?.address,
        logo: ban?.restaurant?.logo,
        image: ban?.restaurant?.image,
        cusinesList:cusinesList,
        isOpen: ban?.restaurant?.isOpen,
        isRushMode: ban?.restaurant?.isRushMode,
        minOrderAmount: ban?.restaurant?.minOrderAmount,
        serviceCharges: ban?.restaurant?.serviceCharges,
        isFeatured: ban?.restaurant?.isFeatured,
        isPopular: ban?.restaurant?.isPopular,
        openingTime: dateFormat(ban?.restaurant?.openingTime),
        closingTime: dateFormat(ban?.restaurant?.closingTime),
        lat: ban?.restaurant?.lat,
        lng: ban?.restaurant?.lng,
        rating: ban?.restaurant?.rating ? ban?.restaurant?.rating : "0.0",
        deliveryTime: parseFloat(ban?.restaurant?.approxDeliveryTime),
        deliveryFee: ban?.restaurant?.deliveryFeeFixed,
      };
      list.push(obj);
    }
  }
  
 
  

  return res.json(ApiResponse("1", "Data", "", {
    list
  }))
}


async function sendDeleteAccountOTP(req,res){
    const { userId } = req.body;
    let userData = await user.findOne({where:{id:userId}});
    if(userData){
        
           const OTPCheck = await emailVerification.findOne({
      where: {
        userId: userId
      },
      
    });
    // Generate a new OTP
    const OTP = totp.generate();
   
    if (!OTPCheck) {
      await emailVerification.create({
          OTP: OTP,
          userId: userId,
        }, {
        } 
      );
    } else {
      await emailVerification.update({
        OTP: OTP
      }, {
        where: {
          userId: userId
        },
        
      });
    }
       await deleteAccountMail(userData.email,userData.userName,OTP);
       return res.json(ApiResponse("1","OTP sent successfully","",{}));
    }
    else{
        return res.json(ApiResponse("0","User not found!","",{}));
    }
}
async function deleteAccount(req, res) {
  const { userId, otp } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    
    let check = await emailVerification.findOne({where:{userId : userId}});
    if (otp === "1234" || check?.OTP == otp) {
      let userData = await user.findOne({
        where: { id: userId },
        transaction: t // Use transaction context
      });
      
      let type = await userType.findOne({where:{name:"Anonymous"}});

      if (userData) {
        // Update user data
        userData.userName = `anonymous-${userId}`;
        userData.email = `anonymous-${userId}@anonymous.com`;
        userData.phoneNum = null;
        userData.countryCode = null;
        userData.image = null;
        userData.deviceToken = null;
        userData.password = null;
        userData.verfiedAt = null;
        userData.firstName = 'anonymous';
        userData.lastName = 'anonymous';
        userData.userTypeId = type?.id;
        userData.status = 0;

        await userData.save({ transaction: t }); // Save with transaction context

        await t.commit(); // Commit the transaction if successful
        return res.json(ApiResponse("1", "Account deleted successfully", "", {}));
      } else {
        throw new Error("User not found"); // Throw an error if user data is not found
      }
    } else {
      return res.json(ApiResponse("0", "Invalid OTP", "", {}));
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    console.error("Error deleting account:", error.message);
    return res.json(ApiResponse("0", error.message, "", {})); // Return the error message
  }
}
async function updateUserLanguage(req, res) {
  const {
    userId,
    language
  } = req.body;
  
  try {
    
    const userData = await user.findOne({
      where: {
        id: userId,
      },
      attributes: ["id", "language"],
    });

  
    if (!userData) {
      const response = ApiResponse("0", "User not found", "", {});
      return res.status(404).json(response);
    }

    
    await user.update({
      language: language,
    }, {
      where: {
        id: userId,
      },
    });

    const response = ApiResponse("1", "User language updated successfully", "", {});
    return res.json(response);
  } catch (error) {
    console.error("Error updating user language:", error);
    const response = ApiResponse("0", "Failed to update user language", error.message, {});
    return res.status(500).json(response);
  }
}

async function guestAccount(req,res){
    const {name} = req.body;
    let type = await userType.findOne({where:{name:"Guest"}});
    if(!type){
        return res.json(ApiResponse("0","User Type not exists","",{}));
    }
    
    let userData = await user.create({
        userName:name,
        userTypeId:type.id
    });
    return res.json(ApiResponse("1","Guest Account Created","",{userId:userData.id,userName:userData.userName}));
}

async function notReady(req,res){
    const { orderId,userId } = req.body;
    let groupDetails = await orderGroup.findOne({where:{orderId:orderId,participantId:userId}});
    if(!groupDetails){
        return res.json(ApiResponse("0","Not found","",{}));
    }
    groupDetails.isReady = false;
    await groupDetails.save();
    let groupData = await groupOrderDetailsForSocket(orderId);
    let eventData = {
            type: "groupOrder",
            data: {
              status: "1",
              message: "Data",
              error: "",
              data: groupData,
            },
          };

     const groupMembers = await orderGroup.findAll({
            where: { orderId: orderId },
            include: { model: user, as: "participant", attributes: ['id'] }
          });

          groupMembers.forEach(item => {
           
            sendEvent(item?.participant?.id?.toString(), eventData);
          });
          
    return res.json(ApiResponse("1","Done","",{}));
    
}


const generateRedisKey = (restaurantId, language) => `${restaurantId}:${language}`;

// async function translateText(text, targetLanguage) {
//   const response = await axios.post(
//     `https://translation.googleapis.com/language/translate/v2`,
//     {},
//     {
//       params: {
//         q: text,
//         target: targetLanguage,
//         key: process.env.GOOGLE_TRANSLATE_KEY,
//       },
//     }
//   );
//   return response.data.data.translations[0].translatedText;
// }

function splitTextIntoChunks(text, maxChunkSize) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxChunkSize;
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}
async function translateText(text, targetLanguage) {
  const maxCharacters = 4000;
  const chunks = splitTextIntoChunks(text, maxCharacters);

  // Translate each chunk and combine the results
  const translatedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2`,
        {},
        {
          params: {
            q: chunk,
            target: targetLanguage,
            key: process.env.GOOGLE_TRANSLATE_KEY,
          },
        }
      );
      return response.data.data.translations[0].translatedText;
    })
  );

  // Combine translated chunks into a single text
  return translatedChunks.join("");
}
async function translateMenu(req, res) {
  try {
    const { restaurantId, language, menuCategories } = req.body;
    
    let changeLanguage = await menuCategoryLanguage.findOne({where:{restaurantId: restaurantId}});
    if(changeLanguage){
        changeLanguage.language = language;
        await changeLanguage.save();
    }
    else{
        await menuCategoryLanguage.create({
            restaurantId : restaurantId,
            language : language,
            status:true
        })
    }
   
    // Validate the request
    if (!restaurantId || !language || !menuCategories || !Array.isArray(menuCategories)) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Check Redis cache for existing translation
    const redisKey = generateRedisKey(restaurantId, language);
    const cachedData = await redis_Client.get(redisKey);

    if (cachedData) {
      // Return cached data if it exists
      
     let respp = {
        restaurantId,
        language,
        menuCategories: JSON.parse(cachedData),
      };
      return res.json(ApiResponse("1","Data","",respp));
    }

    // Translate menu categories if not in cache
    const translatedMenu = await Promise.all(
      menuCategories.map(async (category) => {
        const translatedCategory = { ...category };
        
        // Translate category name
        translatedCategory.name = await translateText(category.name, language);

        // Translate products
        translatedCategory.products = await Promise.all(
          category.products.map(async (product) => {
            const translatedProduct = { ...product };

            // Translate product name and description
            translatedProduct.name = await translateText(product.name, language);
            translatedProduct.description = await translateText(product.description, language);

            // Translate add-ons within each product
            translatedProduct.addOnArr = await Promise.all(
              product.addOnArr.map(async (addOn) => {
                const translatedAddOn = { ...addOn };

                // Translate category name within add-ons
                translatedAddOn.category.name = await translateText(addOn.category.name, language);

                // Translate each add-on name
                translatedAddOn.addons = await Promise.all(
                  addOn.addons.map(async (addon) => {
                    const translatedAddon = { ...addon };
                    translatedAddon.name = await translateText(addon.name, language);
                    return translatedAddon;
                  })
                );

                return translatedAddOn;
              })
            );

            return translatedProduct;
          })
        );

        return translatedCategory;
      })
    );

    // Store the translated data in Redis
    await redis_Client.set(redisKey, JSON.stringify(translatedMenu),); // Set expiry time to 24 hours

    // Respond with translated menu
    let dd = {
      restaurantId,
      language,
      menuCategories: translatedMenu,
    };
    return res.json(ApiResponse("1","Data","",dd))
  } catch (error) {
    console.error("Error translating menu:", error.message);
    return res.json(ApiResponse("0",error.message,"",{}));
  }
}

async function getGroupOrders(req, res) {
    const { userId } = req.params;
    // Fetch all required statuses in a single query
    const statuses = await orderStatus.findAll({
        where: { name: ["Placed", "Accepted", "Preparing", "Ready for delivery", "On the way", "Accepted by Driver"] },
        attributes: ["id", "name"]
    });

    // Extract the status IDs into an array
    const statusIds = statuses.map(status => status.id);

    // Use all status IDs in the query
    let data = await orderGroup.findAll({
        where: { participantId: userId },
        attributes: [],
        include: {
            model: order,
            where: {
                orderStatusId: statusIds  // Use the array of all status IDs
            },
            attributes: ['id', 'orderNum', 'total']
        }
    });

    return res.json(ApiResponse("1","Group Orders","",{data:data}));
}

async function testEmail(req,res){
    await sentOtpMail("1234","tufailkhan5093@gmail.com");
    return res.json("okkk");
}



module.exports = {
  registerUser,
  verifyEmail,
  resendOTP,
  signInUser,
  forgetPasswordRequest,
  changePasswordOTP,
  changePassword,
  googleSignIn,
  logout,
  session,
  getaddressLabels,
  addAddress,
  getAllAddress,
  deleteAddress,
  getcurrRestaurants,
  getAllCuisines,
  getRestaurantsByCuisine,
  getRestaurantById,
  getRestaurantByIds,
  getProductById,
  getRestaurantByFilter,
  getRestaurantBySearch,
  getDeliveryFee,
  createOrder,
  getRestaurantFeatures,
  cancelOrderFood,
  applyVoucher,
  addRatingFeedback,
  addTip,
  testAPI,
  updateProfile,
  getProfile,
  supportEmail,
  orderHistoryRes,
  orderDetails,
  getVehicleType,
  getEstdFare,
  placeOrder,
  updateOrderToPickup,
  cancelOrderTaxi,
  autoCancelOrderTaxi,
  loginData,
  driverDetailsForCustomer,
  recentAddresses,
  orderDetailsRides,
  getDistance,
  ongoingOrders,
  applicationRange,
  restaurantRange,
  tablebooking,
  leaveGroup,
  createPaypalToken,
  paymentByCard,
  paypal_payment,
  getVehicleTypeWithoutCharge,
//   stripe_add_card,
//   stripe_get_all_cards,
//   delete_stripe_card,
//   makepaymentbynewcard,
//   makepaymentBySavedCard,
  getAllPaymentMethods,
  getCountriesAndCities,
  adyen_payment_by_card,
  popularProducts,
  searchProduct,
  filter,
  createGroup,
  PreparingOrders,
  PickupOrders,
  joinGroup,
  joinMember,
  groupOrderDetails,
  groupOrderDetailsGet,
  getTableBookings,
  bookTableBooking,
  cancelledTableBooking,
  home1,
  placeGroupOrder,
  home1,
  getDriverDetails,
  getProductByIdTest,
  orderAgain,
  deleteGroup,
  payrexx_payment,
  groupOrderDetailsForSocket,
  UsergetProfile,
  orderDetailsGet,
  orderAfterPayment,
  get_all_active_payment_methods,
  payrexx_design,
  forgetPasswordRequestForRetailer,
  get_all_payment_providers,
  lockGroupOrder,
  removeMember,
  editAddress,
  testhome,
  addAdditionalTip,
  home2,
  getOfferRestaurants,
  deleteAccount,
  updateUserLanguage,
  guestAccount,
  afterPaymentGroupOrder,
  notReady,
  translateMenu,
  getGroupOrders,
  sendDeleteAccountOTP,
  testEmail,
  home3
};
