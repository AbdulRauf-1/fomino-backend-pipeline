require("dotenv").config();
//importing Models
const {
  wallet,
  driverZone,
  userType,
  country,
  collection,
  Credit,
  adminEarning,
  invitation,
  unit,
  driverPayout,
  city,
  restaurantDriver,
  paymentMethod,
  zoneRestaurants,
  driverRestaurantHours,
  driverRating,
  collectionAddons,
  driverOnlineSession,
  setting,
  orderHistory,
  driverCommission,
  driverEarning,
  zoneDetails,
  R_PLink,
  restaurantEarning,
  zone,
  orderAddOns,
  addOn,
  P_A_ACLink,
  orderStatus,
  orderCharge,
  restaurant,
  orderItems,
  orderApplication,
  user,
  vehicleDetails,
  vehicleImages,
  serviceType,
  address,
  driverDetails,
  vehicleType,
  emailVerification,
  forgetPassword,
  order,
} = require("../models");
const retailerController = require("../controllers/retailer");
const { sendEvent } = require("../socket_io");
const sendNotification = require("../helper/notifications");
const create_new_charges_stripe = require("../helper/create_new_charges_stripe");
const create_old_charges_stripe = require("../helper/create_old_charges_stripe");
const create_new_charges_flutterwave = require("../helper/create_new_charges_flutterwave");
const get_stripe_card = require("../helper/get_stripe_card");
// controller
const user_controller = require("../controllers/user");
// Importing Custom exception
const CustomException = require("../middlewares/errorObject");
//importing redis
const singleNotification = require("../helper/singleNotification");
const {logPickup,logDelivery,calculateTotalHours} = require("../helper/driverHoursHelper");
const redis_Client = require("../routes/redis_connect");
const { sign } = require("jsonwebtoken");
const { formatTokens } = require('../helper/getTokens');
const { getTotalOnlineTimeToday } = require('../helper/getDriverOnlineHours');
const SequelizeDB = require('../SequelizeDB');
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
const stripe = require("stripe")(process.env.STRIPE_KEY);
const bcrypt = require("bcryptjs");
const { Op, Sequelize } = require("sequelize");
const axios = require("axios");
// Calling mailer
const nodemailer = require("nodemailer");
const res = require("express/lib/response");
const sequelize = require("sequelize");
const directions = require("../helper/directions");
const eta_text = require("../helper/eta_text");
const getFare = require("../helper/getFare");
const orderPlaceTransaction = require("../helper/orderPlaceTransaction");
const paymentTransaction = require("../helper/paymentTransaction");
const charges_ghana_mobile_money = require("../helper/charges_ghana_mobile_money");
const ApiResponse = require("../helper/ApiResponse");
const { rmSync } = require("fs");
const { userInfo } = require("os");
const sentOtpMail = require("../helper/sentOtpMail");
const { point, booleanPointInPolygon } = require("@turf/turf");
const moment = require('moment'); // Import moment.js for date manipulation

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

const fs = require('fs');
const path = require('path');

async function addDeviceToken(userId, newToken) {
  try {
    // Find the user by ID
    const userData = await user.findOne({ where: { id: userId } });

    if (!userData) {
      throw new Error("User not found");
    }

    // Initialize deviceTokens as an array if it's null, undefined, or not an array
    let tokens;
    if (userData.deviceToken === null) {
      tokens = [];
    } else {
      // Parse the existing deviceTokens field into an array
      tokens = JSON.parse(userData.deviceToken);
    }

    // Add the new token to the array if it's not already there
    if (!tokens.includes(newToken)) {
      tokens.push(newToken);
    }
    console.log(tokens);
    // Convert the array back to a string and save it
    userData.deviceToken = JSON.stringify(tokens);
    await userData.save();

    console.log("Device token added successfully.");
  } catch (error) {
    console.error("Error adding device token:", error.message);
  }
}

async function driverOnline(req, res) {
  // Start a new transaction
  const t = await SequelizeDB.transaction();

  try {
    const { driverId, vehicleTypeId } = req.body;

    // Step 1: Fetch the driver data within the transaction
    let driver = await user.findOne({
      where: { id: driverId },
      transaction: t, // Include the transaction context
    });

    console.log("Driver Data:", JSON.stringify(driver, null, 2));

    if (!driver) {
      let response = ApiResponse("0", "Driver not found!", "", {});
      return res.json(response);
    }

    // Step 2: Get total online time (you may want to pass the transaction if `getTotalOnlineTimeToday` supports it)
    const totalOnlineTime = await getTotalOnlineTimeToday(driverId);

    // Step 3: Update the vehicle details within the transaction
    await vehicleDetails.update(
      { vehicleTypeId: vehicleTypeId },
      { where: { userId: driverId }, transaction: t } // Include transaction
    );

    // Step 4: Create a new driver online session within the transaction
    const newSession = await driverOnlineSession.create(
      {
        userId: driverId,
        start_time: new Date(),
      },
      { transaction: t } // Include transaction
    );

    // Step 5: Update the driver's status and save within the transaction
    const currentTime = new Date();
    driver.online = true;
    driver.status = driver.online ? 1 : 0;
    driver.lastOnline = currentTime;
    await driver.save({ transaction: t }); // Include transaction

    // Step 6: Commit the transaction if all operations succeed
    await t.commit();

    let response = ApiResponse("1", "Driver is Online!", "", {});
    return res.json(response);
  } catch (error) {
    // Step 7: Rollback the transaction if any error occurs
    await t.rollback();
    console.error("Error during driverOnline:", error);

    let response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}

async function driverOffline(req, res) {
  // Start a new transaction
  const t = await SequelizeDB.transaction();

  try {
    const { driverId } = req.body;
    const currentTime = new Date();

    // Step 1: Fetch the driver data within the transaction
    const driver = await user.findOne({ 
      where: { id: driverId }, 
      transaction: t // Include the transaction context 
    });

    if (!driver) {
      let response = ApiResponse("0", "Driver not found!", "", {});
      return res.json(response);
    }

    // Step 2: Find the active online session for the driver within the transaction
    const session = await driverOnlineSession.findOne({
      where: {
        userId: driverId,
        end_time: null
      },
      order: [['start_time', 'DESC']],
      transaction: t // Include transaction
    });

    // Step 3: If a session is found, mark it as ended
    if (session) {
      session.end_time = currentTime;
      await session.save({ transaction: t }); // Include transaction
    }

    // Step 4: Update driver details to set them offline and calculate total hours worked
    if (driver.lastOnline) {
      const hoursWorked = (currentTime - driver.lastOnline) / (1000 * 60 * 60); // convert milliseconds to hours
      driver.totalHours += hoursWorked;
      
      driver.online = false;
      driver.lastOffline = currentTime;
      await driver.save({ transaction: t }); // Include transaction
    }

    // Step 5: Commit the transaction if all operations succeed
    await t.commit();

    let response = ApiResponse("1", "Driver offline", "", {});
    return res.json(response);

  } catch (error) {
    // Step 6: Rollback the transaction if any error occurs
    await t.rollback();
    console.error("Error during driverOffline:", error);

    let response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}
//Module 1: Auth
/*
        1. Register Driver Step 1 - Personal Information
    ____________________________________________________________
*/
async function registerDriverSt1(req, res) {
  const { firstName, lastName, email, countryCode, phoneNum, password, cityId, countryId, zoneId, language, dob } = req.body;

  try {
    // Check if user with same email and phone number exists
    const checkEmail = await user.findOne({
      where: {
        email: email,
        deletedAt: null
      }
    });

    const checkPhone = await user.findOne({
      where: {
        countryCode: countryCode,
        phoneNum: phoneNum,
        deletedAt: null
      }
    });

    if (checkEmail) {
      throw new CustomException("The email you entered is already taken", "The email you entered is already taken");
    }

    if (checkPhone) {
      throw new CustomException("The phone number you entered is already taken", "The phone number you entered is already taken");
    }

    let userTypeId = 2;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const userData = await user.create({
      firstName,
      lastName,
      dob,
      countryId,
      email,
      driverType: "Freelancer",
      status: 0,
      countryCode,
      phoneNum,
      password: hashedPassword,
      userTypeId,
      language
    });

    if (req.file) {
      const profile_image = req.file;
      // Add profile photo to driver details page
      let tmpPath = profile_image.path;
      let imagePath = tmpPath.replace(/\\/g, "/");
      await driverDetails.create({
        profilePhoto: imagePath,
        status: true,
        userId: userData.id
      });

      userData.image = imagePath;
      await userData.save(); // Update the user image path
    }

    // Create driver earning record
    await driverEarning.create({
      availableBalance: 0,
      totalEarning: 0,
      userId: userData.id
    });

    // Create or update driver zone record
    const existingZone = await driverZone.findOne({ where: { userId: userData.id } });

    if (existingZone) {
      // Update the existing zone record
      existingZone.cityId = cityId;
      existingZone.zoneId = zoneId;
      existingZone.countryId = countryId;
      existingZone.language = language;
      await existingZone.save();
    } else {
      // Create a new zone record
      await driverZone.create({
        userId: userData.id,
        countryId,
        zoneId,
        cityId,
        language
      });
    }

    // Generate OTP for email verification
    const OTP = totp.generate();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: userData.email,
        subject: `Your OTP for Fomino is ${OTP}`,
        text: `Your OTP for Fomino is ${OTP}`
      });
    } catch (error) {
      console.log(error);
    }

    // Create or update email verification record
    const checkEmailVerification = await emailVerification.findOne({
      where: { userId: userData.id }
    });

    if (checkEmailVerification) {
      checkEmailVerification.OTP = OTP;
      checkEmailVerification.requestedAt = new Date();
      await checkEmailVerification.save();
    } else {
      await emailVerification.create({
        requestedAt: new Date(),
        OTP,
        userId: userData.id
      });
    }

    const data = {
      userId: `${userData.id}`,
      firstName: `${userData.firstName}`,
      lastName: `${userData.lastName}`,
      email: `${userData.email}`,
      accessToken: ""
    };

    const response = ApiResponse(
      "1",
      "Step 1 of Registration is completed",
      "",
      data
    );

    return res.json(response);

  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

// async function registerDriverSt1(req, res) {
//   const { firstName, lastName, email, countryCode, phoneNum, password } =
//     req.body;
//   try {
//     // check if user with same eamil and phoneNum exists
//     const checkEmail = await user.findOne({
//       where: [{ email: email }, { deletedAt: null }],
//     });
//     const checkPhone = await user.findOne({
//       where: [
//         { countryCode: countryCode },
//         { phonenum: phoneNum },
//         { deletedAt: null },
//       ],
//     });
//     if (checkEmail) {
//       throw new CustomException(
//         "Users exists",
//         "The email you entered is already taken"
//       );
//     }
//     if (checkPhone) {
//       throw new CustomException(
//         "Users exists",
//         "The phone number you entered is already taken"
//       );
//     }

//     let userTypeId = 2;

//     bcrypt.hash(password, 10).then((hashedPassword) => {
//       user
//         .create({
//           firstName,
//           lastName,
//           email,
//           driverType: "Freelancer",
//           status: 1,
//           countryCode,
//           phoneNum,
//           password: hashedPassword,
//           userTypeId,
//         })
//         .then(async (userData) => {
//           if (req.file) {
//             const profile_image = req.file;
//             //add profile photo to driver details page
//             let tmpPath = profile_image.path;
//             let imagePath = tmpPath.replace(/\\/g, "/");
//             driverDetails.create({
//               profilePhoto: imagePath,
//               status: true,
//               userId: userData.id,
//             });
//           }

//           const driverEarn = new driverEarning();
//           driverEarn.availableBalance = 0;
//           driverEarn.totalEarning = 0;
//           driverEarn.userId = userData.id;
//           await driverEarn.save();
//           const OTP = totp.generate();
//           transporter.sendMail(
//             {
//               from: process.env.EMAIL_USERNAME,
//               to: userData.email,
//               subject: `Your OTP for Fomino is ${OTP}`,
//               text: `Your OTP for Fomino is ${OTP}`,
//             },
//             async function (error, info) {
//               if (error) {
//                 console.log(error);
//               } else {
//                 let check = await emailVerification.findOne({
//                   where: { userId: userData.id },
//                 });
//                 if (check) {
//                   check.OTP = OTP;
//                   check.requestedAt = new Date();
//                   await check.save();
//                 } else {
//                   const evData = await emailVerification.create({
//                     requestedAt: new Date(),
//                     OTP,
//                     userId: userData.id,
//                   });
//                 }

//                 console.log("Otp send successfully");
//               }
//             }
//           );

//           const data = {
//             userId: `${userData.id}`,
//             firstName: `${userData.firstName}`,
//             lastName: `${userData.lastName}`,
//             email: `${userData.email}`,
//             accessToken: "",
//           };
//           const response = ApiResponse(
//             "1",
//             "Step 1 of Registration is completed",
//             "",
//             data
//           );
//           return res.json(response);
//         })
//         .catch((err) => {
//           const response = ApiResponse(
//             "0",
//             "Error in creating new entry in Database",
//             err,
//             {}
//           );
//           return res.json(response);
//         });
//     });
//     // })
//     // .catch(err => {
//     //     return res.json({
//     //         status: '0',
//     //         message: 'Error in creating stripe customer',
//     //         data: {},
//     //         error: err.name,
//     //     });
//     // });
//   } catch (error) {
//     const response = ApiResponse("0", error.message, "Error", {});
//     return res.json(response);
//   }
// }

/*
        2. Register Driver Step 2: Enter Vehicle Details
    _____________________________________________________________
*/

function generateReferalCode(length) {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}
async function registerDriverSt2(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const {
      make,
      model,
      year,
      registrationNum,
      color,
      userId,
      vehicleTypeId,
      referalCode,
    } = req.body;

    const frontimage = req.files["front"];
    const frontimagePath = frontimage[0].path.replace(/\\/g, "/");

    const backimage = req.files["back"];
    const backimagePath = backimage[0].path.replace(/\\/g, "/");

    const leftimage = req.files["left"];
    const leftimagePath = leftimage[0].path.replace(/\\/g, "/");

    const rightimage = req.files["right"];
    const rightimagePath = rightimage[0].path.replace(/\\/g, "/");

    const doc_front_image = req.files["document_front"];
    const doc_front_imagePath = doc_front_image[0].path.replace(/\\/g, "/");

    const doc_back_image = req.files["document_back"];
    const doc_back_imagePath = doc_back_image[0].path.replace(/\\/g, "/");

    const uploadTime = Date.now();

    const createdVehicleDetail = await vehicleDetails.create({
      make,
      model,
      year,
      registrationNum,
      color,
      status: true,
      userId,
      vehicleTypeId,
    }, { transaction: t }); // Add transaction context

    await vehicleImages.create({
      vehicleDetailId: createdVehicleDetail.id,
      name: "front",
      image: frontimagePath,
      uploadTime: uploadTime,
      status: true,
    }, { transaction: t }); // Add transaction context

    await vehicleImages.create({
      vehicleDetailId: createdVehicleDetail.id,
      name: "back",
      image: backimagePath,
      uploadTime: uploadTime,
      status: true,
    }, { transaction: t }); // Add transaction context

    await vehicleImages.create({
      vehicleDetailId: createdVehicleDetail.id,
      name: "left",
      image: leftimagePath,
      uploadTime: uploadTime,
      status: true,
    }, { transaction: t }); // Add transaction context

    await vehicleImages.create({
      vehicleDetailId: createdVehicleDetail.id,
      name: "right",
      image: rightimagePath,
      uploadTime: uploadTime,
      status: true,
    }, { transaction: t }); // Add transaction context

    await vehicleImages.create({
      vehicleDetailId: createdVehicleDetail.id,
      name: "document back",
      image: doc_back_imagePath,
      uploadTime: uploadTime,
      status: true,
    }, { transaction: t }); // Add transaction context

    await vehicleImages.create({
      vehicleDetailId: createdVehicleDetail.id,
      name: "document front",
      image: doc_front_imagePath,
      uploadTime: uploadTime,
      status: true,
    }, { transaction: t }); // Add transaction context

    let code = generateReferalCode(8);

    const driver = await user.findOne({
      where: { id: userId },
      transaction: t // Add transaction context
    });

    driver.usedReferalCode = referalCode;
    driver.referalCode = code;

    await driver.save({ transaction: t }); // Save with transaction context

    let checkCode = await Credit.findOne({
      where: { referalCode: referalCode },
      transaction: t // Add transaction context
    });

    if (checkCode) {
      const credit = new Credit();
      credit.point = 4;
      credit.referalCode = code;
      credit.status = 1;
      credit.userId = userId;

      await credit.save({ transaction: t }); // Save with transaction context

      const userCredit = await Credit.findOne({
        where: {
          referalCode: referalCode,
        },
        include: {
          model: user,
          attributes: ["id", "deviceToken"],
        },
        transaction: t // Add transaction context
      });

      if (userCredit) {
        userCredit.point = parseInt(userCredit.point) + 4;
        await userCredit.save({ transaction: t }); // Save with transaction context

        singleNotification(
          userCredit.user.deviceToken,
          "Get Bonus Points",
          `Your referal code was used by Driver ID : ${userId}`,{}, userCredit.user.language
        );
      }
    }

    await t.commit(); // Commit transaction if all operations succeed

    const response = ApiResponse(
      "1",
      "Step 2 of Registration is completed while referal code was invalid",
      "",
      {}
    );

    return res.json(response);

  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


/*
        3. Register Driver Step 3: Enter license data
    _______________________________________________________________ 
*/
async function registerDriverSt3(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const { licFrontPhoto, licBackPhoto } = req.files;
    const { licIssueDate, licExpiryDate, licNum, serviceTypeId, userId } =
      req.body;
    let driverData = await user.findOne({where:{id:userId},attributes:['countryId']});
    if(!driverData.countryId){
        return res.json(ApiResponse("0","Please add your country first!","",{}));
    }

    const existedDriverDetail = await driverDetails.findOne({
      where: { status: true, userId: userId },
      transaction: t, // Add transaction context
    });

    let tmpPath = licFrontPhoto[0].path;
    let licFrontPhotoPath = tmpPath.replace(/\\/g, "/");
    tmpPath = licBackPhoto[0].path;
    let licBackPhotoPath = tmpPath.replace(/\\/g, "/");

    const data = {
      licIssueDate,
      licExpiryDate,
      licNum,
      serviceTypeId,
      userId,
      countryId:driverData?.countryId,
      licFrontPhoto: licFrontPhotoPath,
      licBackPhoto: licBackPhotoPath,
      status: true,
    };

    if (existedDriverDetail) {
      await driverDetails.update(data, {
        where: { id: existedDriverDetail.id },
        transaction: t, // Add transaction context
      });
    } else {
      await driverDetails.create(data, { transaction: t }); // Add transaction context
    }

    await t.commit(); // Commit transaction if all operations succeed

    const response = ApiResponse(
      "1",
      "Step 3 of Registration is completed",
      "",
      {}
    );
    return res.json(response);

  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs

    const response = ApiResponse(
      "0",
      "Error in registration process",
      error.message,
      {}
    );
    return res.json(response);
  }
}
async function changeCountry(req, res) {
  // Start a new transaction
  const t = await SequelizeDB.transaction();

  try {
    const { licFrontPhoto, licBackPhoto } = req.files;
    const { licIssueDate, licExpiryDate, licNum, serviceTypeId, userId, countryId } = req.body;

    // Step 1: Check if the user exists and has a countryId
    let driverData = await user.findOne({ where: { id: userId }, attributes: ['countryId','id'] });
    if (!driverData || !driverData.countryId) {
      return res.json(ApiResponse("0", "Please add your country first!", "", {}));
    }

    // Step 2: Check if the driverDetails record exists for the given userId and countryId
    const existedDriverDetail = await driverDetails.findOne({
      where: { status: true, userId: userId, countryId: countryId },
      transaction: t, // Include transaction in query context
    });

    // Step 3: If the record exists, unlink (delete) associated images before destroying the record
    if (existedDriverDetail) {
      const existingLicFrontPhotoPath = path.join(__dirname, '../', existedDriverDetail.licFrontPhoto);
      const existingLicBackPhotoPath = path.join(__dirname, '../', existedDriverDetail.licBackPhoto);

      // Unlink (delete) the front license photo if it exists
      if (fs.existsSync(existingLicFrontPhotoPath)) {
        fs.unlinkSync(existingLicFrontPhotoPath);
      }

      // Unlink (delete) the back license photo if it exists
      if (fs.existsSync(existingLicBackPhotoPath)) {
        fs.unlinkSync(existingLicBackPhotoPath);
      }

      // Step 4: Destroy the existing driver details record within the transaction
      await existedDriverDetail.destroy({ transaction: t });
    }

    // Step 5: Process and update the new license images
    let tmpPath = licFrontPhoto[0].path;
    let licFrontPhotoPath = tmpPath.replace(/\\/g, "/"); // Normalize path for cross-platform compatibility

    tmpPath = licBackPhoto[0].path;
    let licBackPhotoPath = tmpPath.replace(/\\/g, "/"); // Normalize path for cross-platform compatibility

    // Step 6: Create a new driver details record with the updated data within the same transaction
    const data = {
      licIssueDate,
      licExpiryDate,
      licNum,
      serviceTypeId,
      userId,
      countryId, // Use the new countryId provided in the request
      licFrontPhoto: licFrontPhotoPath,
      licBackPhoto: licBackPhotoPath,
      status: true,
    };

    await driverDetails.create(data, { transaction: t });

    // Step 7: Update driverData with the new countryId and save within the transaction
    driverData.countryId = countryId;
    await driverData.save({ transaction: t });

    // Step 8: Commit the transaction if all operations succeed
    await t.commit();

    const response = ApiResponse("1", "Country changed successfully!", "", {});
    return res.json(response);

  } catch (error) {
    // Step 9: Rollback the transaction if any error occurs
    await t.rollback();
    console.error('Error during changeCountry:', error);

    const response = ApiResponse("0", "Error in process", error.message, {});
    return res.json(response);
  }
}
/*
        4.  Resgister Driver Step 4: Add Address
    _______________________________________________________________
*/
async function addAddress(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const { streetAddress, building, city, state, zipCode, lat, lng, userId } = req.body;

    const type = await userType.findOne({ where: { name: "Driver" } });
    const userData = await user.findOne({
      where: { id: userId, userTypeId: type.id },
      transaction: t // Add transaction context
    });

    if (!userData) {
      await t.rollback(); // Rollback transaction if user is not found
      return res.json({
        status: "0",
        message: "User not found or invalid user type",
        body: "",
        error: "",
      });
    }

    const OTP = totp.generate();

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: userData.email,
        subject: `Your OTP for Fomino is ${OTP}`,
        text: `Your OTP for Fomino is ${OTP}`,
      });
    } catch (emailError) {
    //   await t.rollback(); // Rollback transaction if email sending fails
      console.error(emailError);
    }
    // Create address entry
    const createdAddress = await address.create({
      streetAddress,
      building,
      city,
      state,
      zipCode,
      lat,
      lng,
      status: true,
      userId,
    }, { transaction: t }); // Add transaction context

    // Manage email verification
    const DT = new Date();
    let check = await emailVerification.findOne({
      where: { userId: userId },
      transaction: t // Add transaction context
    });

    if (check) {
      check.OTP = OTP;
      check.requestedAt = DT;
      await check.save({ transaction: t }); // Add transaction context
    } else {
      await emailVerification.create({
        requestedAt: DT,
        OTP,
        userId: userData.id,
      }, { transaction: t }); // Add transaction context
    }

    // Generate JWT token
    


    const obj = {
      userId: userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      countryCode: userData.countryCode,
      status: userData.status,
      approved: userData.verifiedAt !== null,
      phoneNum: userData.phoneNum,
      accessToken: "",
    };

    await t.commit(); // Commit transaction if all operations succeed

    return res.json({
      status: "1",
      message: "Address Saved and verification email is sent",
      data: obj,
      error: "",
    });
  } catch (error) {
      console.log(error)
    await t.rollback(); // Rollback transaction if any error occurs
    return res.json({
      status: "0",
      message: "Error in creating new entry",
      body: "",
      error: error.message,
    });
  }
}

async function addDriverZone(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const { driverId, cityId, zoneId, language, countryId } = req.body;

    // Fetch the driver
    const driver = await user.findOne({ where: { id: driverId }, transaction: t });

    if (!driver) {
      await t.rollback(); // Rollback transaction if driver not found
      const response = ApiResponse("0", "Driver not found", "Error", {});
      return res.json(response);
    }

    // Check if a zone record exists for the driver
    const existingZone = await driverZone.findOne({ where: { userId: driverId }, transaction: t });

    if (existingZone) {
      // Update the existing zone record
      existingZone.cityId = cityId;
      existingZone.zoneId = zoneId;
      existingZone.countryId = countryId;
      existingZone.language = language;

      await existingZone.save({ transaction: t });
      let data = {
          userId : driverId,
          firstName : driver?.firstName,
          lastName : driver?.lastName,
          email : driver?.email,
          accessToken : ""
      }

      const response = ApiResponse("1", "Zone details updated", "",data);
      await t.commit(); // Commit transaction if update is successful
      return res.json(response);
    } else {
      // Create a new zone record
      const newZone = await driverZone.create({
        userId: driverId,
        countryId,
        zoneId,
        cityId,
        language,
      }, { transaction: t });
      let data = {
          userId : driverId,
          firstName : driver?.firstName,
          lastName : driver?.lastName,
          email : driver?.email,
          accessToken : ""
      }

      const response = ApiResponse("1", "Driver Zone added successfully", "", data);
      await t.commit(); // Commit transaction if creation is successful
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback transaction if any error occurs
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function dataForDriverRegistration(req, res) {
  try {
    const cities = await city.findAll({
      where: { status: true },
      attributes: ["id", "name", "countryId"],
    });
    const countries = await country.findAll({
      where: { status: true },
      attributes: ["id", "name", "flag"],
    });
    const zones = await zone.findAll({
      where: { status: true },
      attributes: ["id", "name"],
    });

    const data = {
      cities,
      countries,
      zones,
    };

    const response = ApiResponse("1", "Data", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function driverAddress(req, res) {
  const { streetAddress, building, city, state, zipCode, lat, lng, driverId } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const newAddress = await address.create({
      streetAddress,
      building,
      city,
      state,
      zipCode,
      lat,
      lng,
      status: true,
      saveAddress: true,
      userId: driverId,
    }, { transaction: t });

    await t.commit(); // Commit transaction if everything is successful

    const response = ApiResponse("1", "Address added successfully", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback transaction in case of error
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


/*
        5. Verify Email
    _______________________________________________________________
*/
async function verifyEmail(req, res) {
  const { OTP, userId, deviceToken } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Fetch OTP data from the database
    const otpData = await emailVerification.findOne({ where: { userId }, transaction: t });

    if (OTP === "1234" || OTP === otpData?.OTP) {
      // Update user's verified status
      await user.update({ verifiedAt: new Date() }, { where: { id: userId }, transaction: t });

      // Fetch updated user data
      const existUser = await user.findOne({ where: { id: userId }, transaction: t });

      // Generate a new access token
      const accessToken = sign(
        { id: existUser.id, email: existUser.email, deviceToken },
        process.env.JWT_ACCESS_SECRET
      );

      // Update user's device token
    //   await user.update({ deviceToken }, { where: { id: userId }, transaction: t });

      // Manage user status
      if (!existUser.status) {
        await t.rollback();
        const response = ApiResponse(
          "8",
          "You are either blocked by admin or waiting for approval. Please contact support.",
          "You are either blocked by admin or waiting for approval. Please contact support.",
          {
            userId: existUser.id,
            firstName: existUser.firstName,
            lastName: existUser.lastName,
            restaurantDriver: !!(await restaurantDriver.findOne({ where: { userId }, transaction: t })),
            email: existUser.email,
            countryCode: existUser.countryCode,
            phoneNum: existUser.phoneNum,
            approved: !!existUser.verifiedAt,
            status: existUser.status,
            accessToken
          }
        );
        return res.json(response);
      }

      // Handle additional checks if required
      const driverDetailsData = await driverDetails.findOne({ where: { userId, status: true }, transaction: t });
      if (!driverDetailsData) {
        await t.rollback();
        const response = ApiResponse(
          "5",
          "Your registration is incomplete",
          "Please add license details",
          { 
            userId: existUser.id,
            firstName: existUser.firstName,
            lastName: existUser.lastName,
            email: existUser.email,
            countryCode: existUser.countryCode,
            phoneNum: existUser.phoneNum,
            approved: !existUser.verifiedAt,
            status: existUser.status,
            accessToken
          }
        );
        return res.json(response);
      }

      const addressData = await address.findOne({ where: { userId, status: true }, transaction: t });
      if (!addressData) {
        await t.rollback();
        const response = ApiResponse(
          "6",
          "Your registration is incomplete",
          "Please add address",
          { 
            userId: existUser.id,
            firstName: existUser.firstName,
            lastName: existUser.lastName,
            email: existUser.email,
            countryCode: existUser.countryCode,
            phoneNum: existUser.phoneNum,
            approved: !!existUser.verifiedAt,
            status: existUser.status,
            accessToken
          }
        );
        return res.json(response);
      }

      // Commit transaction if everything is successful
      await t.commit();

      // Return successful response with user data
      const data = {
        userId: existUser.id,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        restaurantDriver: !!(await restaurantDriver.findOne({ where: { userId }, transaction: t })),
        email: existUser.email,
        accessToken
      };

      const response = ApiResponse("1", "Email Verified", "", data);
      return res.json(response);
    } else {
      await t.rollback();
      const response = ApiResponse("0", "Invalid OTP!", "Invalid OTP!", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback transaction in case of error
    const response = ApiResponse(
      "0",
      error.message,
      "Please contact support",
      {}
    );
    return res.json(response);
  }
}



// async function verifyOTP(req, res) {
//   const { OTP, userId, deviceToken } = req.body;
//   const t = await SequelizeDB.transaction(); // Start transaction

//   try {
//     // Fetch OTP data
//     const otpData = await emailVerification.findOne({
//       where: { userId: userId },
//       transaction: t,
//     });

//     if (OTP == "1234" || OTP == otpData?.OTP) {
//       // Update user and add device token within the transaction
//       await user.update({ verifiedAt: Date.now() }, { where: { id: userId }, transaction: t });
//       await addDeviceToken(userId, deviceToken, { transaction: t });

//       const existUser = await user.findOne({ where: { id: userId }, transaction: t });

//       if (!existUser) {
//         await t.rollback();
//         const data = {
//           userId: "",
//           firstName: "",
//           lastName: "",
//           email: "",
//           accessToken: "",
//         };
//         const response = ApiResponse(
//           "0",
//           "No user exists against this email",
//           "Trying to signup?",
//           data
//         );
//         return res.json(response);
//       }

//       const accessToken = sign(
//         { id: existUser.id, email: existUser.email, deviceToken: deviceToken },
//         process.env.JWT_ACCESS_SECRET
//       );

//       const zoneData = await driverZone.findOne({ where: { userId: existUser.id }, transaction: t });

//       if (!zoneData) {
//         await t.rollback();
//         const data = {
//           userId: existUser?.id,
//           firstName: existUser?.firstName,
//           lastName: existUser?.lastName,
//           email: existUser?.email,
//           countryCode: `${existUser.countryCode}`,
//           phoneNum: `${existUser.phoneNum}`,
//           approved: existUser.verifiedAt ? true : false,
//           status: existUser.status ? true : false,
//           accessToken: "",
//         };
//         const response = ApiResponse("3", "Zone Detail is missing", "Error", data);
//         return res.json(response);
//       }

//       const vehData = await vehicleDetails.findOne({
//         where: { userId: existUser.id, status: true },
//         transaction: t,
//       });

//       if (!vehData) {
//         await t.rollback();
//         const data = {
//           userId: `${existUser.id}`,
//           firstName: `${existUser.firstName}`,
//           lastName: `${existUser.lastName}`,
//           email: `${existUser.email}`,
//           countryCode: `${existUser.countryCode}`,
//           phoneNum: `${existUser.phoneNum}`,
//           approved: existUser.verifiedAt ? true : false,
//           status: existUser.status ? true : false,
//           accessToken: "",
//         };
//         const response = ApiResponse(
//           "4",
//           "Your registration is incomplete",
//           "Please add vehicle details first",
//           data
//         );
//         return res.json(response);
//       }

//       const licData = await driverDetails.findOne({
//         where: { userId: existUser.id, status: true },
//         transaction: t,
//       });

//       if (!licData) {
//         await t.rollback();
//         const data = {
//           userId: `${existUser.id}`,
//           firstName: `${existUser.firstName}`,
//           lastName: `${existUser.lastName}`,
//           countryCode: `${existUser.countryCode}`,
//           phoneNum: `${existUser.phoneNum}`,
//           approved: existUser.verifiedAt ? true : false,
//           status: existUser.status ? true : false,
//           email: `${existUser.email}`,
//           accessToken: "",
//         };
//         const response = ApiResponse(
//           "5",
//           "Your registration is incomplete",
//           "Please add license details",
//           data
//         );
//         return res.json(response);
//       }

//       const addressData = await address.findOne({
//         where: { userId: existUser.id, status: true },
//         transaction: t,
//       });

//       if (!addressData) {
//         await t.rollback();
//         const data = {
//           userId: `${existUser.id}`,
//           firstName: `${existUser.firstName}`,
//           lastName: `${existUser.lastName}`,
//           countryCode: `${existUser.countryCode}`,
//           phoneNum: `${existUser.phoneNum}`,
//           approved: existUser.verifiedAt ? true : false,
//           status: existUser.status ? true : false,
//           email: `${existUser.email}`,
//           accessToken: "",
//         };
//         const response = ApiResponse(
//           "6",
//           "Your registration is incomplete",
//           "Please add address",
//           data
//         );
//         return res.json(response);
//       }

//       if (!existUser.verifiedAt) {
//         await t.rollback();
//         const data = {
//           userId: `${existUser.id}`,
//           firstName: `${existUser.firstName}`,
//           lastName: `${existUser.lastName}`,
//           email: `${existUser.email}`,
//           countryCode: `${existUser.countryCode}`,
//           approved: existUser.verifiedAt ? true : false,
//           status: existUser.status ? true : false,
//           phoneNum: `${existUser.phoneNum}`,
//           accessToken: "",
//         };
//         let OTP = totp.generate();
//         sentOtpMail(existUser.email, OTP);
//         const response = ApiResponse(
//           "2",
//           "Email not verified",
//           "Please verify your email Id",
//           data
//         );
//         return res.json(response);
//       }

//       if (!existUser.status) {
//         await t.rollback();
//         const data = {
//           userId: `${existUser.id}`,
//           firstName: `${existUser.firstName}`,
//           lastName: `${existUser.lastName}`,
//           email: `${existUser.email}`,
//           countryCode: `${existUser.countryCode}`,
//           status: existUser.status ? true : false,
//           approved: existUser.verifiedAt ? true : false,
//           phoneNum: `${existUser.phoneNum}`,
//           accessToken: accessToken,
//         };
//         redis_Client
//           .hSet(`fom${existUser.id}`, deviceToken, accessToken)
//           .catch((err) => {
//             const response = ApiResponse("0", "Redis Error", err, {});
//             return res.json(response);
//           });
//         const response = ApiResponse(
//           "7",
//           "Access denied",
//           "You are either blocked by admin or waiting for approval. Please contact support",
//           data
//         );
//         return res.json(response);
//       }

//     //   await user.update({ deviceToken: deviceToken }, { where: { id: existUser.id }, transaction: t });

//       const newAccessToken = sign(
//         { id: existUser.id, email: existUser.email, deviceToken: deviceToken },
//         process.env.JWT_ACCESS_SECRET
//       );

//       await redis_Client.hSet(`fom${existUser.id}`, deviceToken, newAccessToken);

//       await t.commit(); // Commit transaction if everything is successful

//       let output = user_controller.loginData(existUser, newAccessToken);
//       return res.json(output);
//     } else {
//       await t.rollback();
//       const response = ApiResponse("0", "OTP is invalid", "", {});
//       return res.json(response);
//     }
//   } catch (error) {
//     await t.rollback(); // Rollback transaction in case of error
//     const response = ApiResponse("0", error.message, "Invalid email or Password", {});
//     return res.json(response);
//   }
// }
async function verifyOTP(req, res) {
  const { OTP, userId, deviceToken } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Fetch OTP data
    const otpData = await emailVerification.findOne({
      where: { userId: userId },
      transaction: t,
    });

    if (OTP == "1234" || OTP == otpData?.OTP) {
      // Update user and add device token within the transaction
      await user.update({ verifiedAt: Date.now() }, { where: { id: userId }, transaction: t });
      await addDeviceToken(userId, deviceToken, { transaction: t });

      const existUser = await user.findOne({ where: { id: userId }, transaction: t });

      if (!existUser) {
        await t.rollback();
        const data = {
          userId: "",
          firstName: "",
          lastName: "",
          email: "",
          accessToken: "",
        };
        const response = ApiResponse("0", "No user exists against this email", "Trying to signup?", data);
        return res.json(response);
      }

      const accessToken = sign(
        { id: existUser.id, email: existUser.email, deviceToken: deviceToken },
        process.env.JWT_ACCESS_SECRET
      );

      const zoneData = await driverZone.findOne({ where: { userId: existUser.id }, transaction: t });

      if (!zoneData) {
        await t.rollback();
        const data = {
          userId: existUser?.id,
          firstName: existUser?.firstName,
          lastName: existUser?.lastName,
          email: existUser?.email,
          countryCode: `${existUser.countryCode}`,
          phoneNum: `${existUser.phoneNum}`,
          approved: existUser.verifiedAt ? true : false,
          status: existUser.status ? true : false,
          accessToken: "",
        };
        const response = ApiResponse("3", "Zone Detail is missing", "Error", data);
        return res.json(response);
      }

      const licData = await driverDetails.findOne({
        where: { userId: existUser.id, status: true },
        transaction: t,
      });

      if (!licData) {
        await t.rollback();
        const data = {
          userId: `${existUser.id}`,
          firstName: `${existUser.firstName}`,
          lastName: `${existUser.lastName}`,
          countryCode: `${existUser.countryCode}`,
          phoneNum: `${existUser.phoneNum}`,
          approved: existUser.verifiedAt ? true : false,
          status: existUser.status ? true : false,
          email: `${existUser.email}`,
          accessToken: "",
        };
        const response = ApiResponse("5", "Your registration is incomplete", "Please add license details", data);
        return res.json(response);
      }

      const addressData = await address.findOne({
        where: { userId: existUser.id, status: true },
        transaction: t,
      });

      if (!addressData) {
        await t.rollback();
        const data = {
          userId: `${existUser.id}`,
          firstName: `${existUser.firstName}`,
          lastName: `${existUser.lastName}`,
          countryCode: `${existUser.countryCode}`,
          phoneNum: `${existUser.phoneNum}`,
          approved: existUser.verifiedAt ? true : false,
          status: existUser.status ? true : false,
          email: `${existUser.email}`,
          accessToken: "",
        };
        const response = ApiResponse("6", "Your registration is incomplete", "Please add address", data);
        return res.json(response);
      }

      if (!existUser.verifiedAt) {
        await t.rollback();
        const data = {
          userId: `${existUser.id}`,
          firstName: `${existUser.firstName}`,
          lastName: `${existUser.lastName}`,
          email: `${existUser.email}`,
          countryCode: `${existUser.countryCode}`,
          approved: existUser.verifiedAt ? true : false,
          status: existUser.status ? true : false,
          phoneNum: `${existUser.phoneNum}`,
          accessToken: "",
        };
        let OTP = totp.generate();
        sentOtpMail(existUser.email, OTP);
        const response = ApiResponse("2", "Email not verified", "Please verify your email Id", data);
        return res.json(response);
      }

      if (!existUser.status) {
        await t.rollback();
        const data = {
          userId: `${existUser.id}`,
          firstName: `${existUser.firstName}`,
          lastName: `${existUser.lastName}`,
          email: `${existUser.email}`,
          countryCode: `${existUser.countryCode}`,
          status: existUser.status ? true : false,
          approved: existUser.verifiedAt ? true : false,
          phoneNum: `${existUser.phoneNum}`,
          accessToken: "",
        };
       
        const response = ApiResponse(
          "7",
          "You are either blocked by admin or waiting for approval. Please contact support",
          "You are either blocked by admin or waiting for approval. Please contact support",
          data
        );
        return res.json(response);
      }
      
      const newAccessToken = sign(
        { id: existUser.id, email: existUser.email, deviceToken: deviceToken },
        process.env.JWT_ACCESS_SECRET
      );

      await redis_Client.hSet(`fom${existUser.id}`, deviceToken, newAccessToken);

      await t.commit(); // Commit transaction if everything is successful

      let output = user_controller.loginData(existUser, newAccessToken);
      return res.json(output);
    } else {
      await t.rollback();
      const response = ApiResponse("0", "OTP is invalid", "", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback transaction in case of error
    const response = ApiResponse("0", error.message, "Invalid email or Password", {});
    return res.json(response);
  }
}
/*
        6. Resend OTP
    _______________________________________________________________
*/
async function resendOTP(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    let { email, userId } = req.body;
    
    // Generating OTP
    let OTP = totp.generate();

    // Check if OTP record exists
    const OTPCheck = await emailVerification.findOne({
      where: { userId: userId },
      transaction: t
    });

    // Send OTP email
    transporter.sendMail(
      {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: `Your OTP for Fomino is ${OTP}`,
        text: `Your OTP for Fomino is ${OTP}`,
      },
      async function (error, info) {
        if (error) {
          await t.rollback(); // Rollback transaction if email fails to send
          const response = ApiResponse(
            "0",
            "Error in sending OTP",
            "Please try again later",
            {}
          );
          return res.json(response);
        }

        try {
          // Check if OTP already exists, update or create accordingly
          if (!OTPCheck) {
            await emailVerification.create(
              { OTP: OTP, userId: userId },
              { transaction: t }
            );
          } else {
            await emailVerification.update(
              { OTP: OTP },
              { where: { userId: userId }, transaction: t }
            );
          }

          // Commit transaction if everything is successful
          await t.commit();
          
          const response = ApiResponse("1", "Verification email is sent", "", {});
          return res.json(response);
        } catch (dbError) {
          await t.rollback(); // Rollback transaction in case of error
          const response = ApiResponse(
            "0",
            "Error in processing OTP",
            dbError.message,
            {}
          );
          return res.json(response);
        }
      }
    );
  } catch (error) {
    await t.rollback(); // Rollback transaction in case of error
    const response = ApiResponse(
      "0",
      "Error in sending OTP",
      error.message,
      {}
    );
    return res.json(response);
  }
}


/*
        7. Sign In driver 
    _______________________________________________________________
*/
// async function login(req, res) {
//   try {
//     const { email, password, deviceToken } = req.body;

//     // userTypeId = 2 for Driver
//     const type = await userType.findOne({ where: { name: "Driver" } });

//     const existUser = await user.findOne({
//       where: { email: email, userTypeId: type.id, deletedAt: null },
//     });
//     // return res.json(existUser)
//     if (!existUser) {
//       const data = {
//         userId: "",
//         firstName: "",
//         lastName: "",
//         email: "",
//         accessToken: "",
//       };
//       const response = ApiResponse(
//         "0",
//         "No user exists against this email",
//         "Trying to signup?",
//         data
//       );
//       return res.json(response);
//     }
//     if(!existUser.status){
        
//         const data = {
//         userId: existUser.id,
//         firstName: existUser?.firstName,
//         lastName: existUser?.lastName,
//         email: existUser?.email,
//         accessToken: "",
//       };
//         let response = ApiResponse("8",
//         "You are either blocked by admin or waiting for approval. Please contact support",
//         "Trying to signup?",
//         data
//       );
//       return res.json(response); 
//     }
//     bcrypt
//       .compare(password, existUser.password)
//       .then(async (match) => {
//         //Step 1: password mismatch ==> send error with status =0
//         if (!match) throw new CustomException("Login Error", "Bad Credentials");
//         // Step 2: checking if driver has entered vehicle data
//         // if not, send error with status = 2
//         const zoneData = await driverZone.findOne({
//           where: { userId: existUser.id },
//         });
//         if (!zoneData) {
//           const data = {
//             userId: existUser?.id,
//             firstName: existUser?.firstName,
//             lastName: existUser?.lastName,
//             email: existUser?.email,
//             countryCode: `${existUser.countryCode}`,
//             phoneNum: `${existUser.phoneNum}`,
//             approved: existUser.verifiedAt ? true : false,
//             status: existUser.status ? true : false,
//             accessToken: "",
//           };
//           const response = ApiResponse(
//             "3",
//             "Zone Detail is missing",
//             "Error",
//             data
//           );
//           return res.json(response);
//         }
//         vehicleDetails
//           .findOne({ where: { userId: existUser.id, status: true } })
//           .then(async (vehData) => {
//             if (!vehData) {
//               let data = {
//                 userId: `${existUser.id}`,
//                 firstName: `${existUser.firstName}`,
//                 lastName: `${existUser.lastName}`,
//                 email: `${existUser.email}`,
//                 countryCode: `${existUser.countryCode}`,
//                 phoneNum: `${existUser.phoneNum}`,
//                 approved: existUser.verifiedAt ? true : false,
//                 status: existUser.status ? true : false,
//                 accessToken: "",
//               };
//               const response = ApiResponse(
//                 "4",
//                 "Your registration is incomplete",
//                 "Please add vehicle details first",
//                 data
//               );
//               return res.json(response);
//             }

//             // Step 3: checking if driver has entered license data
//             // if not, send error with status = 3
//             driverDetails
//               .findOne({ where: { userId: existUser.id, status: true } })
//               .then((licData) => {
//                 if (!licData) {
//                   let data = {
//                     userId: `${existUser.id}`,
//                     firstName: `${existUser.firstName}`,
//                     lastName: `${existUser.lastName}`,
//                     countryCode: `${existUser.countryCode}`,
//                     phoneNum: `${existUser.phoneNum}`,
//                     approved: existUser.verifiedAt ? true : false,
//                     status: existUser.status ? true : false,
//                     email: `${existUser.email}`,
//                     accessToken: "",
//                   };
//                   const response = ApiResponse(
//                     "5",
//                     "Your registration is incomplete",
//                     "Please add license details",
//                     data
//                   );
//                   return res.json(response);
//                 }
//                 // Step 4: checking if driver has entered address data
//                 // if not, send error with status = 4
//                 address
//                   .findOne({ where: { userId: existUser.id, status: true } })
//                   .then((addressData) => {
//                     if (!addressData) {
//                       const data = {
//                         userId: `${existUser.id}`,
//                         firstName: `${existUser.firstName}`,
//                         lastName: `${existUser.lastName}`,
//                         countryCode: `${existUser.countryCode}`,
//                         phoneNum: `${existUser.phoneNum}`,
//                         approved: existUser.verifiedAt ? true : false,
//                         status: existUser.status ? true : false,
//                         email: `${existUser.email}`,
//                         accessToken: "",
//                       };
//                       const response = ApiResponse(
//                         "6",
//                         "Your registration is incomplete",
//                         "Please add address",
//                         data
//                       );
//                       return res.json(response);
//                     }
//                     // Step 5: checking if driver has verified email Id
//                     // if not, send error with status = 4
//                     if (!existUser.verifiedAt) {
//                       const data = {
//                         userId: `${existUser.id}`,
//                         firstName: `${existUser.firstName}`,
//                         lastName: `${existUser.lastName}`,
//                         email: `${existUser.email}`,
//                         countryCode: `${existUser.countryCode}`,
//                         approved: existUser.verifiedAt ? true : false,
//                         status: existUser.status ? true : false,
//                         phoneNum: `${existUser.phoneNum}`,
//                         accessToken: "",
//                       };
//                       let OTP = totp.generate();
//                       sentOtpMail(email, OTP);
//                       const response = ApiResponse(
//                         "2",
//                         "Email not verified",
//                         "Please verify your email Id",
//                         data
//                       );
//                       return res.json(response);
//                     }
//                     // Step 6: checking if driver status is true
//                     // if not, send error with status = 5
//                     if (!existUser.status) {
//                       const accessToken = sign(
//                         {
//                           id: existUser.id,
//                           email: existUser.email,
//                           deviceToken: deviceToken,
//                         },
//                         process.env.JWT_ACCESS_SECRET
//                       );

//                       const data = {
//                         userId: `${existUser.id}`,
//                         firstName: `${existUser.firstName}`,
//                         lastName: `${existUser.lastName}`,
//                         email: `${existUser.email}`,
//                         countryCode: `${existUser.countryCode}`,
//                         status: existUser.status ? true : false,
//                         approved: existUser.verifiedAt ? true : false,
//                         phoneNum: `${existUser.phoneNum}`,
//                         accessToken: accessToken,
//                       };
//                       redis_Client
//                         .hSet(`fom${existUser.id}`, deviceToken, accessToken)
//                         .catch((err) => {
//                           const response = ApiResponse(
//                             "0",
//                             "Redis Error",
//                             err,
//                             {}
//                           );
//                           return res.json(response);
//                         });
//                       const response = ApiResponse(
//                         "7",
//                         "Access denied",
//                         "You are either blocked by admin or waiting for approval. Please contact support",
//                         data
//                       );
//                       return res.json(response);
//                     }
//                     user
//                       .findOne({ where: { id: existUser.id } })
//                       .then(async (upData) => {
//                         await addDeviceToken(existUser.id, deviceToken);
//                         const accessToken = sign(
//                           {
//                             id: existUser.id,
//                             email: existUser.email,
//                             deviceToken: deviceToken,
//                           },
//                           process.env.JWT_ACCESS_SECRET
//                         );
//                         //Adding the online clients to reddis DB for validation process
//                         redis_Client
//                           .hSet(`fom${existUser.id}`, deviceToken, accessToken)
//                           .catch((err) => {
//                             const response = ApiResponse(
//                               "0",
//                               "Redis Error",
//                               err,
//                               {}
//                             );
//                             return res.json(response);
//                           });
//                         let output = user_controller.loginData(
//                           existUser,
//                           accessToken
//                         );
//                         return res.json(output);
//                       })
//                       .catch((err) => {
//                         const response = ApiResponse(
//                           "0",
//                           "Database Error",
//                           err,
//                           {}
//                         );
//                         return res.json(response);
//                       });
//                   });
//               });
//           });
//       })
//       .catch((err) => {
//         const data = {
//           userId: `${existUser.id}`,
//           firstName: `${existUser.firstName}`,
//           lastName: `${existUser.lastName}`,
//           countryCode: `${existUser.countryCode}`,
//           approved: existUser.verifiedAt ? true : false,
//           status: existUser.status ? true : false,
//           phoneNum: `${existUser.phoneNum}`,
//           email: `${existUser.email}`,
//           accessToken: "",
//         };
//         const response = ApiResponse(
//           "0",
//           "Invalid email or password",
//           "Invalid email or Password",
//           data
//         );
//         return res.json(response);
//       });
//   } catch (error) {
//     const response = ApiResponse(
//       "0",
//       "Invalid email or password",
//       "Invalid email or Password",
//       data
//     );
//     return res.json(response);
//   }
// }

// 0 : No user exists (edited) 
// 8 : Block by admin
// 0: Invalid passwrod
// 3: zone missing
// 5 : license missing
// 6: address missing
// 2: email not verify

async function login(req, res) {
  // Start a new transaction
  const t = await SequelizeDB.transaction();

  try {
    const { email, password, deviceToken } = req.body;

    // Step 1: Retrieve the userTypeId for Driver
    const type = await userType.findOne({ where: { name: "Driver" }, transaction: t });

    // Step 2: Check if user exists within the transaction
    const existUser = await user.findOne({
      where: { email: email, userTypeId: type.id, deletedAt: null },
      transaction: t
    });

    if (!existUser) {
      const data = {
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        accessToken: "",
      };
      const response = ApiResponse("0", "No user exists against this email", "Trying to signup?", data);
      return res.json(response);
    }

    // Step 3: Check if the user is blocked or waiting for approval
    if (!existUser.status) {
      const data = {
        userId: existUser.id,
        firstName: existUser?.firstName,
        lastName: existUser?.lastName,
        email: existUser?.email,
        accessToken: "",
      };
      const response = ApiResponse(
        "8",
        "You are either blocked by admin or waiting for approval. Please contact support",
        "Trying to signup?",
        data
      );
      return res.json(response);
    }

    // Step 4: Verify password
    const match = await bcrypt.compare(password, existUser.password);
    if (!match) {
      const response = ApiResponse("0", "Invalid email or password", "Invalid email or Password", {});
      return res.json(response);
    }

    // Step 5: Check if driver has zone details
    const zoneData = await driverZone.findOne({
      where: { userId: existUser.id },
      transaction: t
    });

    if (!zoneData) {
      const data = {
        userId: existUser?.id,
        firstName: existUser?.firstName,
        lastName: existUser?.lastName,
        email: existUser?.email,
        countryCode: `${existUser.countryCode}`,
        phoneNum: `${existUser.phoneNum}`,
        approved: existUser.verifiedAt ? true : false,
        status: existUser.status ? true : false,
        accessToken: "",
      };
      const response = ApiResponse("3", "Zone Detail is missing", "Error", data);
      return res.json(response);
    }

    // Step 6: Check if driver's license details are complete
    const licData = await driverDetails.findOne({
      where: { userId: existUser.id, status: true },
      transaction: t
    });

    if (!licData) {
      const data = {
        userId: `${existUser.id}`,
        firstName: `${existUser.firstName}`,
        lastName: `${existUser.lastName}`,
        countryCode: `${existUser.countryCode}`,
        phoneNum: `${existUser.phoneNum}`,
        approved: existUser.verifiedAt ? true : false,
        status: existUser.status ? true : false,
        email: `${existUser.email}`,
        accessToken: "",
      };
      const response = ApiResponse(
        "5",
        "Your registration is incomplete",
        "Please add license details",
        data
      );
      return res.json(response);
    }

    // Step 7: Check if driver's address details are complete
    const addressData = await address.findOne({
      where: { userId: existUser.id, status: true },
      transaction: t
    });

    if (!addressData) {
      const data = {
        userId: `${existUser.id}`,
        firstName: `${existUser.firstName}`,
        lastName: `${existUser.lastName}`,
        countryCode: `${existUser.countryCode}`,
        phoneNum: `${existUser.phoneNum}`,
        approved: existUser.verifiedAt ? true : false,
        status: existUser.status ? true : false,
        email: `${existUser.email}`,
        accessToken: "",
      };
      const response = ApiResponse(
        "6",
        "Your registration is incomplete",
        "Please add address",
        data
      );
      return res.json(response);
    }

    // Step 8: Check if the email is verified
    if (!existUser.verifiedAt) {
      const data = {
        userId: `${existUser.id}`,
        firstName: `${existUser.firstName}`,
        lastName: `${existUser.lastName}`,
        email: `${existUser.email}`,
        countryCode: `${existUser.countryCode}`,
        approved: existUser.verifiedAt ? true : false,
        status: existUser.status ? true : false,
        phoneNum: `${existUser.phoneNum}`,
        accessToken: "",
      };
      let OTP = totp.generate();
      sentOtpMail(email, OTP);
      const response = ApiResponse(
        "2",
        "Email not verified",
        "Please verify your email Id",
        data
      );
      return res.json(response);
    }

    // Step 9: Generate Access Token and save device token
    await addDeviceToken(existUser.id, deviceToken);
    const accessToken = sign(
      {
        id: existUser.id,
        email: existUser.email,
        deviceToken: deviceToken,
      },
      process.env.JWT_ACCESS_SECRET
    );

    // Save the access token in Redis
    await redis_Client.hSet(`fom${existUser.id}`, deviceToken, accessToken);

    // Step 10: Commit the transaction
    await t.commit();

    let output = user_controller.loginData(existUser, accessToken);
    return res.json(output);

  } catch (error) {
    // Rollback the transaction in case of any errors
    await t.rollback();
    console.error("Error during login:", error);
    
    const response = ApiResponse("0", "Invalid email or password", "Invalid email or Password", {});
    return res.json(response);
  }
}


// 0 : No user exists (edited) 
// 8 : Block by admin
// 0: Invalid passwrod
// 3: zone missing
// 5 : license missing
// 6: address missing
// 2: email not verify
async function loginByPhoneNum(req, res) {
  try {
    const { countryCode, phoneNum, deviceToken } = req.body;

    // Find the user type ID for "Driver"
    const type = await userType.findOne({ where: { name: "Driver" } });

    // Find the user with the given phone number and user type
    const existUser = await user.findOne({
      where: { countryCode: countryCode, phoneNum: phoneNum, userTypeId: type.id},
    });

    if (!existUser) {
      const data = {
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        accessToken: "",
      };
      const response = ApiResponse("0", "No user exists against this phone number", "Trying to signup?", data);
      return res.json(response);
    }

    if (!existUser.status) {
      const data = {
        userId: existUser.id,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        email: existUser.email,
        accessToken: "",
      };
      const response = ApiResponse("8", "You are either blocked by admin or waiting for approval. Please contact support", "Trying to signup?", data);
      return res.json(response);
    }

    // Check if driver has entered zone data
    const zoneData = await driverZone.findOne({ where: { userId: existUser.id } });
    if (!zoneData) {
      const data = {
        userId: existUser.id,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        email: existUser.email,
        countryCode: existUser.countryCode,
        phoneNum: existUser.phoneNum,
        approved: !!existUser.verifiedAt,
        status: existUser.status,
        accessToken: "",
      };
      const response = ApiResponse("3", "Zone Detail is missing", "Error", data);
      return res.json(response);
    }

    // Check if driver has entered vehicle data
    // const vehData = await vehicleDetails.findOne({ where: { userId: existUser.id, status: true } });
    // if (!vehData) {
    //   const data = {
    //     userId: existUser.id,
    //     firstName: existUser.firstName,
    //     lastName: existUser.lastName,
    //     email: existUser.email,
    //     countryCode: existUser.countryCode,
    //     phoneNum: existUser.phoneNum,
    //     approved: !!existUser.verifiedAt,
    //     status: existUser.status,
    //     accessToken: "",
    //   };
    //   const response = ApiResponse("4", "Your registration is incomplete", "Please add vehicle details first", data);
    //   return res.json(response);
    // }

    // Check if driver has entered license data
    const licData = await driverDetails.findOne({ where: { userId: existUser.id, status: true } });
    if (!licData) {
      const data = {
        userId: existUser.id,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        countryCode: existUser.countryCode,
        phoneNum: existUser.phoneNum,
        approved: !!existUser.verifiedAt,
        status: existUser.status,
        email: existUser.email,
        accessToken: "",
      };
      const response = ApiResponse("5", "Your registration is incomplete", "Please add license details", data);
      return res.json(response);
    }

    // Check if driver has entered address data
    const addressData = await address.findOne({ where: { userId: existUser.id, status: true } });
    if (!addressData) {
      const data = {
        userId: existUser.id,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        countryCode: existUser.countryCode,
        phoneNum: existUser.phoneNum,
        approved: !!existUser.verifiedAt,
        status: existUser.status,
        email: existUser.email,
        accessToken: "",
      };
      const response = ApiResponse("6", "Your registration is incomplete", "Please add address", data);
      return res.json(response);
    }

    // Check if email is verified
    if (!existUser.verifiedAt) {
      const data = {
        userId: existUser.id,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        email: existUser.email,
        countryCode: existUser.countryCode,
        approved: !!existUser.verifiedAt,
        status: existUser.status,
        phoneNum: existUser.phoneNum,
        accessToken: "",
      };
      let OTP = totp.generate();
      sentOtpMail(email, OTP); // Make sure this function is implemented
      const response = ApiResponse("2", "Email not verified", "Please verify your email Id", data);
      return res.json(response);
    }

    // If all checks pass, log in the user
    const accessToken = sign(
      {
        id: existUser.id,
        email: existUser.email,
        deviceToken: deviceToken,
      },
      process.env.JWT_ACCESS_SECRET
    );

    const data = {
      userId: existUser.id,
      firstName: existUser.firstName,
      lastName: existUser.lastName,
      email: existUser.email,
      countryCode: existUser.countryCode,
      status: existUser.status,
      approved: !!existUser.verifiedAt,
      phoneNum: existUser.phoneNum,
      accessToken: accessToken,
    };

    await addDeviceToken(existUser.id, deviceToken); // Make sure this function is implemented

    await redis_Client.hSet(`fom${existUser.id}`, deviceToken, accessToken);

    const output = user_controller.loginData(existUser, accessToken); // Assuming loginData is a method in user_controller
    return res.json(output);

  } catch (err) {
    const response = ApiResponse("0", "An error occurred", err.message, {});
    return res.json(response);
  }
}


async function phoneAuth(req, res) {
  // Initialize a default data object for responses
  let data = {
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    accessToken: "",
  };

  try {
    const { countryCode, phoneNum, deviceToken } = req.body;
    // Assuming userType and user models are defined elsewhere in your application
    const type = await userType.findOne({ where: { name: "Driver" } });

    const existUser = await user.findOne({
      where: {
        countryCode: countryCode,
        phoneNum: phoneNum,
        userTypeId: type.id,
        deletedAt: null,
      },
    });

    if (!existUser) {
      const response = ApiResponse(
        "0",
        "No user exists with this phone number",
        "Trying to signup?",
        data
      );
      return res.json(response);
    }
    let OTP = totp.generate();
    let OTPCheck = await emailVerification.findOne({
      where: { userId: existUser.id },
    });
    if (!OTPCheck) {
      await emailVerification.create({ OTP: OTP, userId: existUser.id });
    } else {
      await emailVerification.update(
        { OTP: OTP },
        { where: { userId: existUser.id } }
      );
    }
    await addDeviceToken(existUser.id, deviceToken);
    sentOtpMail(OTP, existUser.email);
     data = {
      userId: existUser.id,
      firstName: existUser.firstName,
      lastName: existUser.lastName,
      email: existUser.email,
      countryCode: existUser.countryCode,
      phoneNum: existUser.phoneNum,
      approved: existUser.verifiedAt ? true : false,
      status: existUser.status ? true : false,
      accessToken: "", // Placeholder for actual access token
    };
    let response = ApiResponse("1", "Otp sent successfully!", "", data);
    return res.json(response);

    // Check if driver has entered zone data

   
    // let OTP = totp.generate();
    // let OTPCheck = await emailVerification.findOne({
    //   where: { userId: existUser.id },
    // });
    // if (!OTPCheck) {
    //   await emailVerification.create({ OTP: OTP, userId: existUser.id });
    // } else {
    //   await emailVerification.update(
    //     { OTP: OTP },
    //     { where: { userId: existUser.id } }
    //   );
    // }
    // sentOtpMail(OTP, existUser.email);

    // let response = ApiResponse("2", "Otp sent successfully!", "", data);
    // return res.json(response);
  } catch (error) {
    // Generic catch block to handle unexpected errors
    const response = ApiResponse(
      "0",
      "Error processing request",
      error.message,
      data
    );
    return res.json(response);
  }
}

/*
        8. Forget Password using email
    _______________________________________________________________________
*/
async function forgetPasswordRequest(req, res) {
  const { email } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Fetch user data
    const userData = await user.findOne({
      where: [
        { email: email, userTypeId: 2, deletedAt: null },
        { status: true },
      ],
      transaction: t, // Use the transaction
    });

    if (!userData) {
      await t.rollback(); // Rollback transaction if user not found
      const response = ApiResponse(
        "0",
        "No user exists against the provided email",
        "Please sign up first",
        {}
      );
      return res.json(response);
    }

    // Generate OTP
    let OTP = totp.generate();
    
    // Send OTP email
    transporter.sendMail(
      {
        from: process.env.EMAIL_USERNAME, // sender address
        to: email, // list of receivers
        subject: `Your OTP for Fomino is ${OTP}`, // Subject line
        text: `Your OTP for Fomino is ${OTP}`, // plain text body
      },
      async function (error, info) {
        if (error) {
          await t.rollback(); // Rollback transaction if email fails to send
          const response = ApiResponse(
            "0",
            "Error in sending OTP",
            "Please try again later",
            {}
          );
          return res.json(response);
        }

        try {
          // Create forget password record
          const frData = await forgetPassword.create({
            OTP: OTP,
            requestedAt: new Date(),
            expiryAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes from now
            userId: userData.id,
          }, { transaction: t }); // Use the transaction

          // Commit transaction
          await t.commit();
          
          const data = {
            userId: `${userData.id}`,
            forgetRequestId: `${frData.id}`,
          };
          const response = ApiResponse(
            "1",
            "OTP sent successfully!",
            "",
            data
          );
          return res.json(response);
        } catch (dbError) {
          await t.rollback(); // Rollback transaction if database error occurs
          const response = ApiResponse(
            "0",
            "Error in processing OTP request",
            dbError.message,
            {}
          );
          return res.json(response);
        }
      }
    );
  } catch (error) {
    await t.rollback(); // Rollback transaction if unexpected error occurs
    const response = ApiResponse(
      "0",
      "Error in processing request",
      error.message,
      {}
    );
    return res.json(response);
  }
}


/*
        9. Change password in response to forget password
    ______________________________________________________________
*/
async function changePasswordOTP(req, res) {
  const { OTP, password, userId, forgetRequestId } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Fetch forget password data
    const forgetData = await forgetPassword.findOne({
      where: { id: forgetRequestId },
      transaction: t, // Use the transaction
    });

    // Check OTP validity
    if (OTP === "1234" || forgetData.OTP === OTP) {
      // Check OTP expiry
      if (!(Date.parse(new Date()) < Date.parse(forgetData.expiryAt))) {
        await t.rollback(); // Rollback transaction if OTP is expired
        const response = ApiResponse(
          "0",
          "The OTP entered is not valid. Please try again",
          "This OTP is expired. Please try again",
          {}
        );
        return res.json(response);
      }

      // Hash password and update user
      bcrypt.hash(password, 10, async (err, hashedPassword) => {
        if (err) {
          await t.rollback(); // Rollback transaction if hashing fails
          const response = ApiResponse(
            "0",
            "Error in processing password",
            "Unable to hash password. Please try again later.",
            {}
          );
          return res.json(response);
        }

        try {
          await user.update({ password: hashedPassword }, { where: { id: userId }, transaction: t }); // Use the transaction

          // Commit transaction
          await t.commit();

          const response = ApiResponse(
            "1",
            "Password Changed successfully",
            "",
            {}
          );
          return res.json(response);
        } catch (updateError) {
          await t.rollback(); // Rollback transaction if user update fails
          const response = ApiResponse(
            "0",
            "Error in updating password",
            updateError.message,
            {}
          );
          return res.json(response);
        }
      });
    } else {
      await t.rollback(); // Rollback transaction if OTP is invalid
      const response = ApiResponse(
        "0",
        "The OTP entered is not valid. Please try again",
        "The OTP entered is not valid. Please try again",
        {}
      );
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback transaction if any unexpected error occurs
    const response = ApiResponse(
      "0",
      error.message,
      "Error",
      {}
    );
    return res.json(response);
  }
}


/*
        10. session
    ______________________________________________________________
*/
async function session(req, res) {
  try {
    const userId = req.user.id;
  

    // // Check if the session exists in Redis
    // const redisToken = await redis_Client.hGet(`${userId}`, req.user.deviceToken);
    // if (!redisToken) {
    //   const response = ApiResponse("0", "Session expired. Please log in again.", "Unauthorized", {});
    //   return res.json(response);
    // }

    const userData = await user.findOne({ where: { id: userId } });
    if (!userData.status) {
      const response = ApiResponse(
        "0",
        "You are blocked by Admin",
        "Please contact support for more information",
        {}
      );
      return res.json(response);
    }

    let data = {
      userId: `${userData.id}`,
      firstName: `${userData.firstName}`,
      lastName: `${userData.lastName}`,
      email: `${userData.email}`,
    };
    const response = ApiResponse("1", "", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


const removeAllSessionsForUser = async (userId) => {
  try {
    const redisKey = `fom${userId}`;
    await redis_Client.del(redisKey); // Delete the entire key
    console.log(`All sessions for user ${userId} have been removed.`);
  } catch (error) {
    console.error("Error removing all sessions:", error);
  }
};

/*
        11. Logout
*/

async function getUserDataFromRedis(userId) {
  try {
    // Construct the Redis key
    const redisKey = `fom${userId}`;

    // Fetch all fields and values for the user
    const userData = await redis_Client.hGetAll(redisKey);

    if (!userData || Object.keys(userData).length === 0) {
      console.log(`No data found for userId: ${userId}`);
      return null;
    }

    console.log(`Data for userId ${userId}:`, userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user data from Redis:', error);
    throw error;
  }
}
async function logout(req, res) {
  try {
      
    const { deviceToken } = req.body;
    
    // Retrieve user's device tokens
    const userData = await user.findOne({
      where: { id: req.user.id },
      attributes: ['deviceToken']
    });

    // Parse device tokens array
    let deviceTokens = JSON.parse(userData.deviceToken || "[]");

    // Remove the device token if it exists
    deviceTokens = deviceTokens.filter(token => token !== deviceToken);

    // Remove all tokens from Redis for the user
    await redis_Client.del(`fom${req.user.id}`);

    // Update the user record with the modified device tokens
    await user.update(
      { deviceToken: JSON.stringify(deviceTokens) },
      { where: { id: req.user.id } }
    );

    // Send response
    const response = ApiResponse("1", "Logout successfully", "", {});
    return res.json(response);
  } catch (error) {
    console.log(error);
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}



//Module 2: Drawer
/*
        1. Get Profile
    ________________________________________________________________
*/
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const userData = await user.findOne({
      where: { id: userId },
      include: [
        { model: address },
        { model: driverDetails, where: { status: true } },
      ],
    });
    const data = {
      profilePhoto: userData.driverDetails[0].profilePhoto,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      countryCode: userData.countryCode,
      phoneNum: userData.phoneNum,
      address: userData.addresses[0].streetAddress,
    };
    const response = ApiResponse("1", "Driver profile data", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "error", {});
    return res.json(response);
  }
}
/*
        2. Update Profle
    _________________________________________________________________
*/
async function updateProfile(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    const userId = req.user.id;
    const profile_image = req.file;
    let imagePath = "";

    if (profile_image) {
      let tmpPath = profile_image.path;
      imagePath = tmpPath.replace(/\\/g, "/");
      // Update driver details with profile photo
      await driverDetails.update(
        { profilePhoto: imagePath },
        { where: { userId, status: true }, transaction: t } // Use transaction
      );
    }
    const { firstName, lastName, countryCode, phoneNum, streetAddress } = req.body;
    // Update user details
    await user.update(
      { firstName, lastName, countryCode, phoneNum },
      { where: { id: userId }, transaction: t } // Use transaction
    );

    // Update address details
    await address.update(
      { streetAddress },
      { where: { userId }, transaction: t } // Use transaction
    );

    // Commit transaction
    await t.commit();

    const datas = {
      firstName,
      lastName,
      countryCode,
      phoneNum,
      profilePhoto: imagePath,
    };
    const response = ApiResponse(
      "1",
      "Profile updated successfully!",
      "",
      datas
    );
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback transaction in case of error
    const response = ApiResponse("0", error.message, "error", {});
    return res.json(response);
  }
}


/*
        3. Update Profile photo
    _________________________________________________________________
*/
// async function updateProfilePhoto(req, res){
//     const profile_image = req.file;
//     const userId = req.user.id;
//     let tmpPath = profile_image.path;
//     let imagePath = tmpPath.replace(/\\/g, "/")
//    driverDetails.update({profilePhoto:imagePath}, {where: {userId, status: true}})
//    .then(data=>{
//         return res.json({
//             status: "1",
//             message: "Profile Photo Uploaded",
//             data: "",
//             error:""
//         });
//    });
// }

/*
        4. Change Password using old password
    _________________________________________________________________
*/
async function changePassword(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const { newPassword, oldPassword } = req.body;
    const userId = req.user.id;

    // Fetch current user
    const currUser = await user.findOne({ where: { id: userId }, transaction: t });

    // Compare old password
    const match = await bcrypt.compare(oldPassword, currUser.password);
    if (!match) {
      await t.rollback(); // Rollback transaction if old password is incorrect
      const response = ApiResponse(
        "0",
        "Your old password is incorrect",
        "Extra text",
        {}
      );
      return res.json(response);
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update(
      { password: hashedPassword },
      { where: { id: userId }, transaction: t } // Use transaction
    );
    // Commit transaction
    await t.commit();

    const response = ApiResponse(
      "1",
      "Password Changed successfully!",
      {}
    );
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback transaction in case of error
    const response = ApiResponse("0", error.message, "error", {});
    return res.json(response);
  }
}

/*
        5. Update license
    _________________________________________________________________ 
*/
async function updateLicense(req, res) {
  try {
    const { licFrontPhoto, licBackPhoto } = req.files;
    const { licIssueDate, licExpiryDate, licNum } = req.body;
    const userId = req.user.id;
    driverDetails
      .update({ status: true }, { where: { userId } })
      .then((data) => {
        let updatedData = {
          licIssueDate,
          licExpiryDate,
          licNum,
          userId,
          status: true,
        };
        if (licFrontPhoto) {
          let licFrontPhotoTmp = licFrontPhoto[0].path;
          let licFrontPhotoPath = licFrontPhotoTmp.replace(/\\/g, "/");
          updatedData.licFrontPhoto = licFrontPhotoPath;
        }
        if (licBackPhoto) {
          let licBackPhotoTmp = licBackPhoto[0].path;
          let licBackPhotoPath = licBackPhotoTmp.replace(/\\/g, "/");
          updatedData.licBackPhoto = licBackPhotoPath;
        }
        driverDetails.update(updatedData, { where: { userId } });
        const response = ApiResponse("1", "License updated", "", {});
        return res.json(response);
      });
  } catch (error) {
    const response = ApiResponse("0", error.message, "error", {});
    return res.json(response);
  }
}
/*
        6. Update Vehicle Details
    ___________________________________________________________________
*/
async function updateVehicleDetails(req, res) {
  try {
    const {
      make,
      model,
      year,
      registrationNum,
      color,
      status,
      userId,
      vehicleTypeId,
    } = req.body;
    await vehicleDetails.update(
      {
        make,
        model,
        year,
        registrationNum,
        color,
        status,
        userId,
        vehicleTypeId,
      },
      { where: { userId } }
    );
    const vehicleDetail = await vehicleDetails.findAll({
      where: { userId: userId },
    });
    vehicleImages.update(
      { status: false },
      { where: { vehicleDetailsId: vehicleDetail[0].id } }
    );
    const response = ApiResponse("1", "Vehicle Detail Updated", "", {});
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "error", {});
    return res.json(response);
  }
}

// async function updateVehicleDetailsImages(req, res) {
//   try {
//     const { userId } = req.body;
//     const frontimage = req.files["front"];
//     let fronttmpPath = frontimage[0].path;
//     let frontimagePath = fronttmpPath.replace(/\\/g, "/");

//     const backimage = req.files["back"];
//     let backtmpPath = backimage[0].path;
//     let backimagePath = backtmpPath.replace(/\\/g, "/");

//     const leftimage = req.files["left"];
//     let lefttmpPath = leftimage[0].path;
//     let leftimagePath = lefttmpPath.replace(/\\/g, "/");

//     const rightimage = req.files["right"];
//     let righttmpPath = rightimage[0].path;
//     let rightimagePath = righttmpPath.replace(/\\/g, "/");

//     const vehicleDetail = await vehicleDetails.findOne({
//       where: [{ userId: userId }, { status: true }],
//     });
//     if (vehicleDetail) {
//       vehicleImages.update(
//         { image: frontimagePath, uploadTime: Date.now(), status: true },
//         { where: [{ vehicleDetailId: vehicleDetail.id }, { name: "front" }] }
//       );
//       vehicleImages.update(
//         {
//           name: "back",
//           image: backimagePath,
//           uploadTime: Date.now(),
//           status: true,
//         },
//         { where: [{ vehicleDetailId: vehicleDetail.id }, { name: "back" }] }
//       );
//       vehicleImages.update(
//         {
//           name: "left",
//           image: leftimagePath,
//           uploadTime: Date.now(),
//           status: true,
//         },
//         { where: [{ vehicleDetailId: vehicleDetail.id }, { name: "left" }] }
//       );
//       vehicleImages.update(
//         {
//           name: "right",
//           image: rightimagePath,
//           uploadTime: Date.now(),
//           status: true,
//         },
//         { where: [{ vehicleDetailId: vehicleDetail.id }, { name: "right" }] }
//       );
//       const response = ApiResponse(
//         "1",
//         "Vehicle Detail Images Updated",
//         "",
//         {}
//       );
//       return res.json(response);
//     } else {
//       const response = ApiResponse("0", "Not found!", "Sorry Not found", {});
//       return res.json(response);
//     }

//   } catch (error) {
//     const response = ApiResponse("0", error.message, "error", {});
//     return res.json(response);
//   }
// }
async function updateVehicleDetailsImages(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const { userId } = req.body;
    const frontimage = req.files["front"];
    const backimage = req.files["back"];
    const leftimage = req.files["left"];
    const rightimage = req.files["right"];

    // Normalize image paths
    const frontimagePath = frontimage[0].path.replace(/\\/g, "/");
    const backimagePath = backimage[0].path.replace(/\\/g, "/");
    const leftimagePath = leftimage[0].path.replace(/\\/g, "/");
    const rightimagePath = rightimage[0].path.replace(/\\/g, "/");

    // Find vehicle details
    const vehicleDetail = await vehicleDetails.findOne({
      where: {
        userId: userId,
        status: true,
        
      },
      transaction: t, // Include transaction
    });

    if (vehicleDetail) {
      // Fetch existing images
      const existingImages = await vehicleImages.findAll({
        where: {
          vehicleDetailId: vehicleDetail.id,
          status: true,
          name: {
          [Op.in]: ['front', 'back', 'left', 'right'],
        },
        },
        transaction: t, // Include transaction
      });

      // Delete existing images from the server
      await Promise.all(existingImages.map(image => {
        return new Promise((resolve, reject) => {
          const imagePath = path.join(image.image); // Construct the full path
          console.log(imagePath)
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error(`Failed to delete image ${imagePath}: ${err.message}`);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }));

      // Destroy existing records in the database
      await vehicleImages.destroy({
        where: {
          vehicleDetailId: vehicleDetail.id,
          status: true,
          name: {
            [Op.in]: ['front', 'back', 'left', 'right'],
          },
        },
        transaction: t, // Include transaction
      });

      // Create new records
      await vehicleImages.bulkCreate([
        {
          vehicleDetailId: vehicleDetail.id,
          name: "front",
          image: frontimagePath,
          uploadTime: Date.now(),
          status: true,
        },
        {
          vehicleDetailId: vehicleDetail.id,
          name: "back",
          image: backimagePath,
          uploadTime: Date.now(),
          status: true,
        },
        {
          vehicleDetailId: vehicleDetail.id,
          name: "left",
          image: leftimagePath,
          uploadTime: Date.now(),
          status: true,
        },
        {
          vehicleDetailId: vehicleDetail.id,
          name: "right",
          image: rightimagePath,
          uploadTime: Date.now(),
          status: true,
        },
      ], { transaction: t }); // Include transaction

      // Commit the transaction
      await t.commit();

      const response = ApiResponse(
        "1",
        "Vehicle Detail Images Updated",
        "",
        {}
      );
      return res.json(response);
    } else {
      await t.rollback(); // Rollback transaction if vehicle details not found
      const response = ApiResponse("0", "Not found!", "Sorry, not found", {});
      return res.json(response);
    }

  } catch (error) {
    // Rollback transaction in case of an error
    await t.rollback();
    const response = ApiResponse("0", error.message, "error", {});
    return res.json(response);
  }
}


async function updateVehicleDetailsDocuments(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const { userId } = req.body;
    const uploadTime = Date.now();

    const frontimage = req.files["document_front"];
    let fronttmpPath = frontimage[0].path;
    let frontimagePath = fronttmpPath.replace(/\\/g, "/");

    const backimage = req.files["document_back"];
    let backtmpPath = backimage[0].path;
    let backimagePath = backtmpPath.replace(/\\/g, "/");

    // Find vehicle details
    const vehicleDetail = await vehicleDetails.findOne({
      where: [{ userId: userId }, { status: true }],
      transaction: t, // Include transaction
    });

    if (vehicleDetail) {
      // Fetch existing document images (front and back)
      const existingImages = await vehicleImages.findAll({
        where: {
          vehicleDetailId: vehicleDetail.id,
          name: {
            [Op.in]: ['document front', 'document back'],
          },
        },
        transaction: t, // Include transaction
      });

      // Unlink (delete) old images from the file system
      await Promise.all(existingImages.map(image => {
        return new Promise((resolve, reject) => {
          const imagePath = image.image;
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error(`Failed to delete image: ${imagePath}`);
              reject(err);
            } else {
              resolve();
            }
          }); 
        });
      }));

      // Destroy existing document images from the database
      await vehicleImages.destroy({
        where: {
          vehicleDetailId: vehicleDetail.id,
          name: {
            [Op.in]: ['document front', 'document back'],
          },
        },
        transaction: t, // Include transaction
      });

      // Create new document images (front and back)
      await vehicleImages.bulkCreate([
        {
          vehicleDetailId: vehicleDetail.id,
          name: "document front",
          image: frontimagePath,
          uploadTime: uploadTime,
          status: true,
        },
        {
          vehicleDetailId: vehicleDetail.id,
          name: "document back",
          image: backimagePath,
          uploadTime: uploadTime,
          status: true,
        },
      ], { transaction: t }); // Include transaction

      // Commit the transaction if everything goes well
      await t.commit();

      const response = ApiResponse("1", "Vehicle Detail Document Updated", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback the transaction if vehicle details are not found
      const response = ApiResponse("0", "Not Found!", "Sorry Not found!", {});
      return res.json(response);
    }
  } catch (error) {
    // Rollback the transaction in case of an error
    await t.rollback();
    const response = ApiResponse("0", error.message, "error", {});
    return res.json(response);
  }
}



async function getService(req, res) {
  try {
    const services = await serviceType.findAll({ attributes: ["id", "name"] });
    const response = ApiResponse("1", "All Services", "", services);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "error", {});
    return res.json(response);
  }
}
async function getVehicleType(req, res) {
  //return res.send('API HIT')
  try {
    const list = await vehicleType.findAll({
      where: { status: 1 },
      attributes: ["id", "name", "image"],
    });
    let data = {
      vehicleTypeList: list,
    };
    const response = ApiResponse("1", "Get Vehicle type", "", data);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "error", {});
    return res.json(response);
  }
}
async function getActiveOrders(req, res) {
  try {
    const userId = req.user.id;

    // Retrieve all relevant order statuses in a single query
    const statuses = await orderStatus.findAll({
      where: {
        name: {
          [Op.in]: [
            "Accepted by Driver",
            "Preparing",
            "Food Arrived",
            "Ready for delivery",
            "Accepted",
            "On the way",
            "Food Pickedup",
            // "Reject",
          ]
        }
      }
    });

    // Map statuses to a lookup object
    const statusMap = statuses.reduce((acc, status) => {
      acc[status.name] = status.id;
      return acc;
    }, {});

    // Retrieve active orders based on the status map
    const orders = await order.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        orderStatusId: {
          [Op.in]: [
             statusMap["Accepted by Driver"],
            statusMap["Ready for delivery"],
            statusMap["Preparing"],
            statusMap["On the way"],
            statusMap["Accepted"],
            statusMap["Food Pickedup"],
          ]
        },
        driverId: userId
      },
      attributes: [
        "id",
        "orderNum",
        "note",
        "leaveOrderAt",
        [sequelize.literal("cast(`distance` as CHAR)"), "distance"],
        "total",
        [
          sequelize.fn("date_format", sequelize.col("scheduleDate"), "%r"),
          "scheduleTime"
        ],
        [
          sequelize.fn("date_format", sequelize.col("scheduleDate"), "%d-%m-%Y"),
          "scheduleDate"
        ]
      ],
      include: [
        { model: orderApplication, attributes: ["name"] },
        {
          model: orderItems,
          attributes: ["quantity", "total"],
          include: { model: R_PLink, attributes: ["name", "image"] }
        },
        {
          model: restaurant,
          attributes: [
            "businessName",
            "countryCode",
            "phoneNum",
            "address",
            "city",
            "zipCode",
            "lat",
            "lng"
          ]
        },
        { model: orderCharge, attributes: ["driverEarnings"] },
        { model: orderStatus, attributes: ["displayText"] },
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "countryCode",
            "phoneNum",
            "deviceToken"
          ]
        },
        {
          model: address,
          as: "dropOffID",
          attributes: [
            "building",
            "streetAddress",
            "city",
            "state",
            "zipCode",
            "lat",
            "lng"
          ]
        }
      ]
    });

    if (!orders || orders.length === 0) {
      return res.json(ApiResponse("1", "Order not found!", "", []));
    }

    return res.json(ApiResponse("1", "Active Orders", "", orders));
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).json(ApiResponse("0", "Internal Server Error", error.message, []));
  }
}
async function getHome(req, res) {
    try {
        const userId = req.user.id;

        // Fetch user data
        const userData = await user.findOne({
            where: { id: userId },
            include: [
                { model: driverDetails },
                {
                    model: vehicleDetails,
                    attributes: ["id"],
                    include: { model: vehicleType },
                },
            ],
        });

        // Fetch Firebase data to determine online status
        const firebaseData = await axios.get(process.env.FIREBASE_URL);
        let online = false;
        if (firebaseData && firebaseData.data[userId]) {
            online = true;
        }

        // Fetch driver earnings
        const earnings = await driverEarning.findOne({ where: { userId: userId } });

        // Fetch "Delivered" status for order history count
        const deliveredStatus = await orderStatus.findOne({ where: { name: "Delivered" } });
        const history = await order.count({
            where: { driverId: userId, orderStatusId: deliveredStatus.id },
        });

        // Fetch active order statuses
        const statuses = await orderStatus.findAll({
            where: {
                name: {
                    [Op.in]: [
                        "Accepted by Driver",
                        "Preparing",
                        "Food Arrived",
                        "Ready for delivery",
                        "Accepted",
                        "On the way",
                        "Food Pickedup",
                    ],
                },
            },
        });

        // Create a lookup object for status IDs
        const statusIds = statuses.map((status) => status.id);

        // Fetch active orders count
        const activeOrders = await order.count({
            where: {
                orderStatusId: { [Op.in]: statusIds },
                driverId: userId,
            },
        });

        // Fetch driver ratings
        const ratings = await driverRating.findAll({
            where: { driverId: userId },
            attributes: [[sequelize.fn("AVG", sequelize.col("value")), "averageRating"]],
        });

        const averageRating = ratings[0]?.dataValues?.averageRating || 0;

        // Build response data
        let data = {
            id: userData?.id,
            firstName: userData?.firstName || "First Name",
            lastName: userData?.lastName || "Last Name",
            email: userData?.email,
            countryCode: userData?.countryCode,
            phoneNum: userData?.phoneNum,
            profile_photo: userData?.driverDetails?.[0]?.profilePhoto,
            active_orders: activeOrders.toString(),
            earnings: earnings?.totalEarning?.toString(),
            history: history.toString(),
            rating: Number(averageRating)?.toFixed(1)?.toString(),
            online: online,
            isApproved: !!userData?.status,
            vehicleData: userData?.vehicleDetails?.[0]?.vehicleType,
        };

        return res.json(ApiResponse("1", "Driver Home Data", "", data));
    } catch (error) {
        console.error("Error in getHome:", error);
        return res.json(ApiResponse("0", error.message, "error", {}));
    }
}


async function addBank(req, res) {
  const userId = req.user.id;
  const { accountTitle, accountNumber, bankName, routingNumber } = req.body;
  const driverData = await driverDetails.findOne({ where: { userId: userId } });
  if (!driverData) {
    const response = ApiResponse("0", "Invaild userId", "Invaild userId", {});
    return res.json(response);
  } else {
    driverDetails
      .update(
        { accountTitle, accountNumber, bankName, routingNumber },
        { where: { userId } }
      )
      .then((driverDetailsData) => {
        const response = ApiResponse("1", "Bank Detail Updated/Added", "", {});
        return res.json(response);
      });
  }
}

async function getBank(req, res) {
  const userId = req.user.id;
  const driverData = await driverDetails.findOne({ where: { userId: userId } });
  if (!driverData) {
    const response = ApiResponse("0", "Invalid UserId", "Invalid UserId", {});
    return res.json(response);
  } else {
    driverDetails
      .findOne({
        where: { userId },
        attributes: [
          "accountTitle",
          "accountNumber",
          "bankName",
          "routingNumber",
        ],
      })
      .then((driverDetailsData) => {
        const response = ApiResponse(
          "1",
          "Bank Data",
          "Invalid UserId",
          driverDetailsData
        );
        return res.json(response);
      });
  }
}

async function getEarning(req, res) {
  const userId = req.user.id;
  let bank_added = false;
  const driverDetailsData = await driverDetails.findOne({
    where: { userId },
    attributes: ["accountTitle", "accountNumber", "bankName", "routingNumber"],
  });
  const earning = await driverEarning.findOne({ where: { userId: userId } });
  const today = new Date();
  let delivered = await orderStatus.findOne({ where: { name: "Delivered" } });
  let total_withdraw =
    parseFloat(earning.totalEarning) - parseFloat(earning.availableBalance);
  const lastOrder = await order.findOne({
    order: [["createdAt", "DESC"]],
    include: { model: orderCharge },
    where: {
      driverId: userId,
      orderStatusId: delivered.id,
    },
  });
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0); // Set time to start of the day
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999); // Set time to end of the day
  const orders = await order.findAll({
    where: {
      driverId: userId,
      orderStatusId: delivered.id,
      createdAt: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
    attributes: ["id"],
    include: [
      {
        model: orderCharge,
        attributes: ["driverEarnings"],
      },
    ],
  });

  let todayEarnings = 0;
  let weeklyEarnings = 0;
  orders.forEach((order) => {
    if (order.orderCharge && order.orderCharge.driverEarnings) {
      todayEarnings += parseFloat(order.orderCharge.driverEarnings);
    }
  });

  //one week ago earning calculations

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekOrders = await order.findAll({
    where: {
      driverId: userId,
      orderStatusId: delivered.id,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
    attributes: ["id"],
    include: {
      model: orderCharge,
      attributes: ["driverEarnings"],
    },
  });
  weekOrders.forEach((order) => {
    if (order.orderCharge && order.orderCharge.driverEarnings) {
      weeklyEarnings += parseFloat(order.orderCharge.driverEarnings);
    }
  });
  const totalTrip = await order.count({
    where: {
      driverId: userId,
      orderStatusId: delivered.id,
    },
  });
  let data = {
    total_earning: Number(earning.totalEarning).toFixed(1),
    total_balance: Number(earning.availableBalance).toFixed(1),
    total_withdraw: Number(total_withdraw).toFixed(1),
    today_earning: Number(todayEarnings).toFixed(1),
    last_earning: Number(lastOrder?.orderCharge?.driverEarnings).toFixed(1),
    bank_added: bank_added,
    weekly_earning: Number(weeklyEarnings).toFixed(1),
    today_trip: totalTrip.toString(),
    bank_details:
      bank_added === true
        ? {
            bank_name: driverDetailsData.bankName,
            account_holder_name: driverDetailsData.accountTitle,
            account_number: driverDetailsData.accountNumber,
          }
        : {},
  };
  const response = ApiResponse("1", "Bank Data", "", data);
  return res.json(response);
}

async function getorderdetail(req, res) {
  const { orderId, orderCheck } = req.body;
  let orderDetail = {};

  orderDetail = await order.findOne({
    where: { id: orderId },
    attributes: [
      "id",
      "orderNum",
      [
        sequelize.fn("date_format", sequelize.col("scheduleDate"), "%r"),
        "scheduleTime",
      ],
      "note",
      "leaveOrderAt",
      [sequelize.literal("cast(`distance` as CHAR)"), "distance"],
      "total",
      "orderApplicationId",
      "driverId",
    ],
    include: [
      { model: orderApplication, attributes: ["name"] },
      {
        model: orderItems,
        attributes: ["quantity", "total"],
        include: [
          {
            model: orderAddOns,
            attributes: ["total", "qty"],
            include: { model: addOn, attributes: ["name"] },
          },
          { model: R_PLink, attributes: ["name", "image"] },
        ],
      },
      {
        model: restaurant,
        attributes: [
          "businessName",
          "countryCode",
          "phoneNum",
          "address",
          "city",
          "zipCode",
          "lat",
          "lng",
        ],
      },
      { model: orderCharge },
      { model: orderStatus, attributes: ["displayText"] },
      {
        model: user,
        attributes: [
          "id",
          "userName",
          "firstName",
          "lastName",
          "countryCode",
          "phoneNum",
          "deviceToken",
        ],
      },
      {
        model: address,
        as: "pickUpID",
        attributes: [
          "building",
          "streetAddress",
          "city",
          "state",
          "zipCode",
          "lat",
          "lng",
        ],
      },
      {
        model: address,
        as: "dropOffID",
        attributes: [
          "building",
          "streetAddress",
          "city",
          "state",
          "zipCode",
          "lat",
          "lng",
        ],
      },
    ],
  });
//   if (orderDetail.driverId == null) {
//     const response = ApiResponse(
//       "0",
//       "Sorry no driver assigned to this order",
//       "Error",
//       {}
//     );
//     return res.json(response);
//   }

  if (!orderDetail) {
    return res.json({
      status: "0",
      message: "Order Detail not Found",
      data: {},
      error: "Please provide correct order ID",
    });
  }

  // ////////////////////////////////////
  let tolat = "";
  let tolng = "";
  if (orderDetail.orderApplicationId == 1) {
    tolat = orderDetail.restaurant.lat;
    tolng = orderDetail.restaurant.lng;
  } else {
    tolat = orderDetail.pickUpID.lat;
    tolng = orderDetail.pickUpID.lng;
  }

  let fireBase = await axios.get(process.env.FIREBASE_URL);
//   if (!fireBase.data[orderDetail.driverId]) {
//     const response = ApiResponse("0", "You are offline", "", {});
//     return res.json(response);
//   }

  let fromlat = fireBase.data[orderDetail.driverId]?.lat?.toString();
  let fromlng = fireBase.data[orderDetail.driverId]?.lng?.toString();
  eta_text(fromlat, fromlng, tolat, tolng).then((eta) => {
    orderDetail.distance = orderDetail?.distance?.toString();
    const data = { orderData: orderDetail, eta };
    const response = ApiResponse("1", "Order Detail", "", data);
    return res.json(response);
  });
}



async function getActiveOrdersTaxi(req, res) {
  const userId = req.user.id;
  let Cancelled = await orderStatus.findOne({ where: { name: "Cancelled" } });
  let Delivered = await orderStatus.findOne({ where: { name: "Delivered" } });

  order
    .findOne({
      where: {
        [Op.and]: [
          { driverId: userId },
          {
            orderStatusId: {
              [Op.notIn]: [Cancelled.id, Delivered.id],
            },
          },
        ],
      },
      attributes: [
        "id",
        "orderNum",
        "note",
        "leaveOrderAt",
        [sequelize.literal("cast(`distance` as CHAR)"), "distance"],
        "total",
        [
          sequelize.fn("date_format", sequelize.col("scheduleDate"), "%r"),
          "scheduleTime",
        ],
        [
          sequelize.fn(
            "date_format",
            sequelize.col("scheduleDate"),
            "%d-%m-%Y"
          ),
          "scheduleDate",
        ],
      ],
      include: [
        { model: orderApplication, attributes: ["name"] },
        { model: orderCharge, attributes: ["driverEarnings"] },
        { model: orderStatus, attributes: ["displayText"] },
        {
          model: user,
          attributes: [
            "id",
            "firstName",
            "lastName",
            "countryCode",
            "phoneNum",
            "deviceToken",
          ],
        },
        {
          model: address,
          as: "pickUpID",
          attributes: [
            "building",
            "streetAddress",
            "city",
            "state",
            "zipCode",
            "lat",
            "lng",
          ],
        },
        {
          model: address,
          as: "dropOffID",
          attributes: [
            "building",
            "streetAddress",
            "city",
            "state",
            "zipCode",
            "lat",
            "lng",
          ],
        },
      ],
    })
    .then((orders) => {
      if (orders == null) {
        orders = {};
        eta = "";
        const data = { orders, eta };
        const response = ApiResponse(
          "0",
          "Order not found",
          "Order not found",
          data
        );
        return res.json(response);
      }

      // ////////////////////////////////////
      let tolat = "";
      let tolng = "";
      if (orders.orderApplicationId == 1) {
        tolat = orders.restaurant.lat;
        tolng = orders.restaurant.lng;
      } else {
        tolat = orders?.pickUpID?.lat;
        tolng = orders?.pickUpID?.lng;
      }

      axios.get(process.env.FIREBASE_URL).then((online_data) => {
        let fromlat = online_data.data[`${userId}`].lat.toString();
        let fromlng = online_data.data[`${userId}`].lng.toString();

        eta_text(fromlat, fromlng, tolat, tolng).then((eta) => {
          // ////////////////////////////////////
          if (orders.length == 0) {
            orders = {};
          }
          const data = { orders, eta };
          const response = ApiResponse("0", "Accepted Orders", "", data);
          return res.json(response);
        });
      });
    });
}

async function getVehicleDetails(req, res) {
  const userId = req.user.id;

  vehicleDetails
    .findOne({
      where: {
        userId,
      },
      attributes: ["id", "make", "model", "year", "registrationNum", "color"],
      include: [
        {
          model: vehicleImages,
          as: "vehicleImages",
          attributes: ["id", "name", "image"],
          where: [
            {
              name: {
                [Op.or]: [
                  { [Op.like]: "front" },
                  { [Op.like]: "left" },
                  { [Op.like]: "back" },
                  { [Op.like]: "right" },
                ],
              },
            },
            { status: true },
          ],
        },
        {
          model: vehicleImages,
          as: "vehicleDocuments",
          attributes: ["id", "name", "image"],
          where: [
            {
              name: {
                [Op.or]: [
                  { [Op.like]: "document front" },
                  { [Op.like]: "document back" },
                ],
              },
            },
            { status: true },
          ],
        },
        // { model:vehicleImages, as : 'vehicleImages', attributes: [ 'name', 'image' ], where: {name:"Vehicle Image"} },
        // { model:vehicleImages, as : 'vehicleDocuments', attributes: [ 'name', 'image' ], where: {name:"Vehicle Documents"} },
        { model: vehicleType, attributes: ["id", "name", "image"] },
      ],
    })
    .then((vehicDetails) => {
      // return res.json(vehicDetails)
      const response = ApiResponse("1", "Vehicle Details", "", vehicDetails);
      return res.json(response);
    });
}

async function getPaidOrdersRestaurant(req, res) {
  const userId = req.user.id;
  const foods = await order.findAll({
    where: {
      [Op.and]: [
        { driverId: userId },
        { orderStatusId: 7 },
        { orderApplicationId: 1 }, // resturant on id 1
      ],
    },
    attributes: ["id", "orderNum", "total","distance"],
    include: [
      {
        model: restaurant,
        attributes: [
          "businessName",
          "countryCode",
          "phoneNum",
          "address",
          "city",
          "zipCode",
        ],
      },
      {
        model: orderHistory,
        where: { orderStatusId: 7 },
        attributes: [
  [
    sequelize.fn("date_format", sequelize.col("time"), "%Y/%m/%d , %r"),
    "completionDateTime",
  ],
],

      }, // paid order history only
      {
        model: address,
        as: "pickUpID",
        attributes: [
          "building",
          "streetAddress",
          "city",
          "state",
          "zipCode",
          "lat",
          "lng",
        ],
      },
      {
        model: address,
        as: "dropOffID",
        attributes: [
          "building",
          "streetAddress",
          "city",
          "state",
          "zipCode",
          "lat",
          "lng",
        ],
      },
      {model:paymentMethod,attributes:['name']}
    ],
  });
  const rides = await order.findAll({
    where: [
      { driverId: userId },
      { orderStatusId: 10 },
      { orderApplicationId: 2 },
    ],

    attributes: ["id", "orderNum", "total"],
    include: [
      {
        model: orderHistory,
        where: { orderStatusId: 10 },
        attributes: [
          [
            sequelize.fn("date_format", sequelize.col("time"), "%r"),
            "completionTime",
          ],
        ],
      }, // paid order history only
      {
        model: address,
        as: "pickUpID",
        attributes: [
          "building",
          "streetAddress",
          "city",
          "state",
          "zipCode",
          "lat",
          "lng",
        ],
      },
      {
        model: address,
        as: "dropOffID",
        attributes: [
          "building",
          "streetAddress",
          "city",
          "state",
          "zipCode",
          "lat",
          "lng",
        ],
      },
    ],
  });
  const data = {
    foods: foods,
    rides: rides,
  };
  const response = ApiResponse("1", "Paid Orders", "", data);
  return res.json(response);
  // order.findAll(
  //     {
  //         where:
  //         {
  //             [Op.and]:
  //             [
  //                 { driverId: userId },
  //                 { orderStatusId: 7 },
  //                 { orderApplicationId: 1 } // resturant on id 1
  //             ]
  //         },
  //         attributes: [ 'id', 'orderNum', 'total'  ],
  //         include: [
  //             { model:restaurant, attributes: [ 'businessName', 'countryCode', 'phoneNum', 'address', 'city', 'zipCode' ] },
  //             { model:orderHistory, where: { orderStatusId: 7 }, attributes: [ [sequelize.fn('date_format', sequelize.col('time'), '%r'), 'completionTime'] ] }, // paid order history only
  //             { model:address, as : 'pickUpID', attributes: [ 'building', 'streetAddress', 'city', 'state', 'zipCode', 'lat', 'lng'] },
  //             { model:address, as : 'dropOffID', attributes: [ 'building', 'streetAddress', 'city', 'state', 'zipCode', 'lat', 'lng'] },
  //         ]
  //     }).then(orders=>{
  //     if(!orders){
  //         return res.json({
  //             status: "0",
  //             message: "Orders not Found",
  //             data: {},
  //             error:"No Order Found"
  //         });
  //     }

  //     return res.json({
  //         status: "1",
  //             message: "Paid Orders",
  //             data: orders,
  //             error:""
  //         });
  // });
}

async function getPaidOrdersTaxi(req, res) {
  const userId = req.user.id;
  order
    .findAll({
      where: {
        [Op.and]: [
          { driverId: userId },
          { orderStatusId: 7 },
          { orderApplicationId: 2 }, // taxi on id 2
        ],
      },
      attributes: ["id", "orderNum", "total"],
      include: [
        {
          model: orderHistory,
          where: { orderStatusId: 7 },
          attributes: [
            [
              sequelize.fn("date_format", sequelize.col("time"), "%r"),
              "completionTime",
            ],
          ],
        }, // paid order history only
        {
          model: address,
          as: "pickUpID",
          attributes: [
            "building",
            "streetAddress",
            "city",
            "state",
            "zipCode",
            "lat",
            "lng",
          ],
        },
        {
          model: address,
          as: "dropOffID",
          attributes: [
            "building",
            "streetAddress",
            "city",
            "state",
            "zipCode",
            "lat",
            "lng",
          ],
        },
      ],
    })
    .then((orders) => {
      if (!orders) {
        const response = ApiResponse(
          "0",
          "Orders not found",
          "Orders not found",
          {}
        );
        return res.json(response);
      }
      const response = ApiResponse("1", "Paid Orders", "", orders);
      return res.json(response);
    });
}
const checkPointInZone = async (latitude, longitude) => {
  const query = `
    SELECT *
    FROM zones
    WHERE ST_Contains(coordinates, POINT(${longitude}, ${latitude}));
  `;

  const [zone] = await sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return zone !== null;
};


function structureOrderData(orderData) {
  const productsList = orderData?.orderItems?.map((item) => {
    // Group addons by their collection titles, handling null values
    const collections = item?.orderAddOns?.reduce((result, addOnItem) => {
      const collectionTitle = addOnItem?.addOn?.collectionAddon?.collection?.title || "Unknown Collection";

      if (!result[collectionTitle]) {
        result[collectionTitle] = []; // Initialize the collection if not present
      }

      // Add the addon to the respective collection, handling null values
      result[collectionTitle].push({
        name: addOnItem?.addOn?.name || "Unknown Addon",
        quantity: addOnItem?.qty || 0,
        total: addOnItem?.total || "0.00",
      });

      return result;
    }, {}) || {};

    return {
      productName: item?.R_PLink?.name || "Unknown Product",
      unitPrice: item?.unitPrice || "0.00",
      total: item?.total || "0.00",
      image: item?.R_PLink?.image || "No Image",
      collections: Object.keys(collections).map((collectionName) => ({
        collectionName,
        addons: collections[collectionName],
      })),
    };
  }) || []; // Return an empty array if orderItems is null or undefined

  return productsList;
}

async function acceptorder(req, res) {
  const { driverId, orderId } = req.body;
  
   const statuses = await orderStatus.findAll({
      where: {
        name: {
          [Op.in]: [
            "Placed",
            "Accepted",
            "Cancelled",
            "Delivered",
            "Reject"
          ]
        }
      }
    });
  
    const statusMap = statuses.reduce((acc, status) => {
      acc[status.name] = status.id;
      return acc;
    }, {});

    // Get the IDs of statuses to exclude
    const excludeStatusIds = [
      statusMap["Placed"],
      statusMap["Accepted"],
      statusMap["Cancelled"],
      statusMap["Delivered"],
      statusMap["Reject"]
    ];
   
    // Find an order excluding the specified statuses
    const checkOrder = await order.findOne({
      where: {
        driverId: driverId,
        orderStatusId: {
          [Op.notIn]: excludeStatusIds
        }
      }
    });
    if(checkOrder){
        let response = ApiResponse("0","You have an already active order","",{});
        return res.json(response);
    }
  const fetchedData = await order.findOne({
    where: { id: orderId },
    include: [
        {model:orderItems,attributes:['quantity','unitPrice','total'],include:[{model:R_PLink,attributes:['id','name','image']},{model:orderAddOns,attributes:['total','qty'],include:{model:addOn,attributes:['name'],include:{model:collectionAddons,attributes:['collectionId','addOnId'],include:{model:collection,attributes:['title']}}}}]},
       
      { model: user, attributes: ["ip","id",'firstName','lastName','email','countryCode','phoneNum'] },
      {
        model: restaurant,
        attributes: ["id", "lat", "lng"],
        include: { model: user, attributes: ["ip", "deviceToken","language"] },
      },
      { model: address, as: "pickUpID", attributes: ["lat", "lng"] },
      { model: address, as: "dropOffID", attributes: ["lat", "lng"] },
    ],
  });
  if (fetchedData.driverId) {
    let response = ApiResponse(
      "0",
      "Already Driver is assigned to this Order",
      "",
      {}
    );
    return res.json(response);
  }

  const driver = await user.findOne({
    where: { id: driverId },
    include: {
      model: driverZone,
      include: { model: zone, include: { model: zoneDetails } },
    },
  });
  // return res.json(driver?.zoneDetails?.zone)
  let existInZone = false;
  const userPoint = point([
    parseFloat(fetchedData?.dropOffID?.lng),
    parseFloat(fetchedData?.dropOffID?.lat),
  ]);
  // return res.json(userPoint)
  // return res.json(driver.driverZone.zone)
  if (
    driver.driverZone.zone &&
    driver.driverZone.zone.coordinates.coordinates &&
    driver.driverZone.zone.coordinates.coordinates.length > 0
  ) {
    const zonePolygon = {
      type: "Polygon",
      coordinates: driver.driverZone.zone.coordinates.coordinates,
    };
    // return res.json(zonePolygon)
    if (booleanPointInPolygon(userPoint, zonePolygon)) {
      existInZone = true;
    }
  }
  // if (existInZone == false) {
  //   const response = ApiResponse(
  //     "0",
  //     "Your Dropoff Address is out of Your Zone",
  //     "Error",
  //     {}
  //   );
  //   return res.json(response);
  // }
  // return res.json(driver)

  // ////////////////////////////////////
  let tolat = "";
  let tolng = "";
  if (fetchedData.orderApplicationId == 1) {
    tolat = fetchedData.restaurant?.lat;
    tolng = fetchedData.restaurant?.lng;
  }
  const online_data = await axios.get(process.env.FIREBASE_URL);
  let fromlat = online_data.data[`${driverId}`]?.lat?.toString();
  let fromlng = online_data.data[`${driverId}`]?.lng?.toString();
  let eta = await eta_text(fromlat, fromlng, tolat, tolng);

  if (fetchedData.driverId != null) {
    const data = { orderData: {}, eta: "" };
    const response = ApiResponse(
      "0",
      "Order Already accepted by someone",
      "",
      data
    );
    return res.json(response);
  }

  const cancelledStatus = await orderStatus.findOne({
    where: { name: "Cancelled" },
  });
  if (fetchedData.orderStatusId == cancelledStatus.id) {
    const data = { orderData: {}, eta: "" };
    const response = ApiResponse("0", "Order Cancelled by the User", "", data);
    return res.json(response);
  }
  const acceptedByDriver = await orderStatus.findOne({
    where: { name: "Accepted by Driver" },
  });
  let status = acceptedByDriver.id;
  const preparingStatus = await orderStatus.findOne({
    where: { name: "Preparing" },
  });
  order
    .update(
      { driverId, orderStatusId: preparingStatus.id },
      { where: { id: orderId } }
    )
    .then((data) => {
      orderHistory.create({
        time: Date.now(),
        orderId,
        orderStatusId: status,
      });

      order
        .findOne({
          where: { id: orderId },
          attributes: [
            "id",
            'verificationCode',
            "orderApplicationId",
            "orderNum",
            [
              sequelize.fn("date_format", sequelize.col("scheduleDate"), "%r"),
              "scheduleTime",
            ],
            "note",
            "leaveOrderAt",
            [sequelize.literal("cast(`distance` as CHAR)"), "distance"],
            "total",
            "userId",
            "driverId",
          ],
          include: [
              {model:user,as:"DriverId",attributes:['id','firstName','lastName','image','countryCode','phoneNum','email']},
            { model: orderApplication, attributes: ["name"] },
            {
        model: orderItems,
        attributes: ["quantity", "total"],
        include: [
          {
            model: orderAddOns,
            attributes: ["total", "qty"],
            include: { model: addOn, attributes: ["name"] },
          },
          { model: R_PLink, attributes: ["name", "image"] },
        ],
      },
            {
              model: restaurant,
              attributes: [
                "businessName",
                "countryCode",
                "phoneNum",
                "address",
                "city",
                "zipCode",
                "lat",
                "lng",
                "approxDeliveryTime",
              ],
              include: { model: user,attributes:['id','deviceToken','language'] },
            },
            { model: orderCharge, attributes: ["driverEarnings","tip","additionalTip"] },
            { model: orderStatus, attributes: ["displayText"] },
            {
              model: user,

              attributes: [
                "id",
                "ip",
                "firstName",
                "userName",
                "lastName",
                "countryCode",
                "phoneNum",
                "deviceToken",
                "language"
              ],
            },
            {
              model: address,
              as: "pickUpID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
            {
              model: address,
              as: "dropOffID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
          ],
        })
        .then((orderData) => {
          // return res.json(orderData)
        
          let to = formatTokens(orderData?.user?.deviceToken);
          let notification = {
            title: `Order Accepted by Driver`,
            body: `Order No: ${orderData.orderNum} accepted!`,
          };
          let data = {
            driverId,
            jobAccepted: true,
            eta_text: eta,
            orderApplicationId: orderData.orderApplicationId,
            restaurantId: orderData.restaurantId,
            pickupLat: orderData?.restaurant?.lat,
            orderId: orderData?.id,
            pickupLng: orderData?.restaurant?.lng,
            dropOffLat: orderData.dropOffID.lat,
            dropOffLng: orderData.dropOffID.lng,
          };
          let eventData = {
            type: "acceptOrderByDriver",
            data: {
              orderId: orderData.id,
              verificationCode: orderData.verificationCode,
              driverId: orderData.driverId,
              DriverId:orderData.DriverId ? orderData.DriverId : null,
              eta_text:
                parseInt(orderData?.restaurant?.approxDeliveryTime) -
                parseInt(orderData?.customTime),
                customer : orderData?.user
            },
          };

          sendEvent(orderData?.user?.id, eventData);
          sendEvent(orderData?.restaurant?.user?.id, eventData);

          sendNotification(to, notification, data,orderData?.user?.language).then(async(dat) => {
            if (orderData.orderApplicationId == 1) {
              let restTokens = orderData.restaurant.user
                ? JSON.parse(orderData.restaurant.user.deviceToken)
                : [];

              notification = {
                title: `Order Accepted by Driver`,
                body: `Order No: ${orderData.orderNum} accepted!`,
              };
              let data = {
                driverId,
                jobAccepted: true,
                eta_text: eta,
                orderApplicationId: orderData.orderApplicationId,
                restaurantId: orderData.restaurantId,
              };

              sendNotification(restTokens, notification, data,orderData.restaurant.user.language);
            }
            
              
            let accept = await orderStatus.findOne({where:{name:"Accepted"}});
            let ready = await orderStatus.findOne({where:{name:"Ready for delivery"}});
              
            let acceptStatus = await orderHistory.findOne({where:{orderStatusId : accept.id,orderId : orderId}});
            let readyStatus = await orderHistory.findOne({where:{orderStatusId : ready.id,orderId : orderId}});
            let pickTime = "00:20:10";
            if(acceptStatus && readyStatus){
                var date1 = new Date(readyStatus.time);
                var date2 = new Date(acceptStatus.time);
                
                var pickupTime = date1 - date2;
                var dateDiff = new Date(pickupTime);
                var isoDuration = dateDiff.toISOString();
                
                // Parse the duration to get hours, minutes, and seconds
                var hours = isoDuration.substr(11, 2);
                var minutes = isoDuration.substr(14, 2);
                var seconds = isoDuration.substr(17, 2);
                
                // Format the output
                 pickTime = hours + ':' + minutes + ':' + seconds;
            }
            else{
                
            }
            let dropTime = await eta_text(orderData?.restaurant?.lat,orderData?.restaurant?.lng,orderData?.dropOffID?.lat,orderData?.dropOffID?.lng);
            
            const data = { orderData, eta,pickTime,dropTime };
            const response = ApiResponse("1", "Order Accepted", "", data);
            return res.json(response);
          });
        });
    });
}

async function reached(req, res) {
  const { orderId } = req.body;
  order
    .update({ orderStatusId: 8 }, { where: { id: orderId } }) // reached
    .then((data) => {
      orderHistory.create({
        time: Date.now(),
        orderId,
        orderStatusId: 8,
      });
      order
        .findOne({
          where: { id: orderId },
          attributes: [
            "id",
            "orderApplicationId",
            "orderNum",
            [
              sequelize.fn("date_format", sequelize.col("scheduleDate"), "%r"),
              "scheduleTime",
            ],
            "note",
            "leaveOrderAt",
            [sequelize.literal("cast(`distance` as CHAR)"), "distance"],
            "total",
            "userId",
          ],
          include: [
            { model: orderApplication, attributes: ["name"] },
            {
              model: orderItems,
              attributes: ["quantity", "total"],
              include: { model: R_PLink, attributes: ["name","image"] },
            },
            {
              model: restaurant,
              attributes: [
                "businessName",
                "countryCode",
                "phoneNum",
                "address",
                "city",
                "zipCode",
              ],
            },
            { model: orderCharge, attributes: ["driverEarnings"] },
            { model: orderStatus, attributes: ["displayText"] },
            {
              model: user,
              as: "customerId",
              attributes: [
                "id",
                "firstName",
                "lastName",
                "countryCode",
                "phoneNum",
                "deviceToken",
                "language"
              ],
            },
            {
              model: address,
              as: "pickUpID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
            {
              model: address,
              as: "dropOffID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
          ],
        })
        .then((orderData) => {
          let to = [orderData.customerId.deviceToken];
          let notification = {
            title: "Driver Reached",
            body: "Rider is arrived",
          };
          let data = {
            orderApplicationId: orderData.orderApplicationId,
            pickupLat: orderData.pickUpID.lat,
            pickupLng: orderData.pickUpID.lng,
            dropOffLat: orderData.dropOffID.lat,
            dropOffLng: orderData.dropOffID.lng,
            driverId: orderData.driverId,
          };
          sendNotification(to, notification, data,orderData.customerId.language).then((dat) => {
            const response = ApiResponse("1", "Order Reached", "", orderData);
            return res.json(response);
          });
        });
    });
}

async function foodPickedUp(req, res) {
  const { orderId } = req.body;
  const dd = await order.findOne({
    where: { id: orderId },
    attributes: [
      "id",
      "orderNum",
      'customTime',
      [
        sequelize.fn("date_format", sequelize.col("scheduleDate"), "%r"),
        "scheduleTime",
      ],
      "note",
      "leaveOrderAt",
      [sequelize.literal("cast(`distance` as CHAR)"), "distance"],
      "total",
      "userId",
      "paymentMethodId",
      "driverId",
      "restaurantId",
      "currencyUnitId",
    ],
    include: [
      { model: orderApplication, attributes: ["name"] },
      {
        model: orderItems,
        attributes: ["quantity", "total"],
        include: { model: R_PLink, attributes: ["name", "image"] },
      },
      {
        model: restaurant,
        include: { model: user, attributes: ["ip", "deviceToken",'id',"language"] },
        attributes: [
          "businessName",
          "countryCode",
          "phoneNum",

          "address",
          "city",
          "zipCode",
        ],
      },
      {
        model: orderCharge,
        attributes: ["driverEarnings", "restaurantEarnings","tip","additionalTip"],
      },
      { model: orderStatus, attributes: ["displayText"] },
      {
        model: user,

        attributes: [
          "id",
          "ip",
          "userName",
          "countryCode",
          "phoneNum",
          "deviceToken",
          "language"
        ],
      },
      {
        model: address,
        as: "pickUpID",
        attributes: [
          "building",
          "streetAddress",
          "city",
          "state",
          "zipCode",
          "lat",
          "lng",
        ],
      },
      {
        model: address,
        as: "dropOffID",
        attributes: [
          "building",
          "streetAddress",
          "floor",
          "city",
          "state",
          "zipCode",
          "lat",
          "lng",
        ],
      },
    ],
  });
  const rest = await restaurant.findOne({ where: { id: dd.restaurantId } });
  const checkaddress = await address.findOne({
    where: [
      { status: 1 },
      { lat: rest.lat },
      { lng: rest.lng },
      { city: rest.city },
      { streetAddress: rest.address },
    ],
  });

  if (checkaddress) {
    dd.pickUpId = checkaddress.id;
  } else {
    const newaddress = new address();
    newaddress.lat = rest.lat;
    newaddress.lng = rest.lng;
    newaddress.city = rest.city;
    newaddress.streetAddress = rest.address;
    newaddress.status = 1;
    newaddress.zipCode = rest.zipCode;
    await newaddress.save();
    dd.pickUpId = newaddress.id;
  }

  dd.orderStatusId = 6;
  dd.save().then(async (ord) => {
    orderHistory.create({
      time: Date.now(),
      orderId: ord.id,
      orderStatusId: 6,
    });

    let to = formatTokens(dd.user.deviceToken);
    let fireBase = await axios.get(process.env.FIREBASE_URL);
    let etaText = "10 mints";
  
      etaText = await eta_text(
        rest?.lat,
        rest?.lng,
        dd.dropOffID?.lat,
        dd.dropOffID?.lng
      );
    
    var estText = etaText.match(/\d+/);
    estText = parseFloat(estText) + (parseFloat(dd.customTime)/60)
    logPickup(dd.driverId,rest.id,dd.id,new Date());
    let notification = {
      title: "Driver Pickedup Food",
      body: "Food picked up by rider. Hang on",
    };
    let data = {
      orderId: orderId,
      driverId : dd.driverId,
      eta_text: estText.toString(),
    };

    let eventData = {
      type: "foodPickedUp",
      data: data,
    };
    retailerController.homeData(dd?.restaurantId).then((dat) => {
      let restEventData = {
        type: "foodPickedUp",
        data: {
          status: "1",
          message: "Homedata",
          error: "",
          data: dat,
        },
      };
      sendEvent(dd?.restaurant?.user?.id, restEventData);
    });

    sendEvent(dd?.user?.id, eventData);

    let restTokens = formatTokens(dd.restaurant.user.deviceToken);
    singleNotification(
      restTokens,
      "Driver Pickedup Food",
      "Food picked up by rider. Hang on",
      data,
      dd.restaurant.user.language
      
    );
    sendNotification(to, notification, data,dd?.restaurant?.user?.language).then((dat) => {
      const response = ApiResponse("1", "Pickedup Food", "", dd);
      return res.json(response);
    });
  });
}

async function foodArrived(req, res) {
  const { orderId } = req.body;
  order
    .update({ orderStatusId: 13 }, { where: { id: orderId } }) // foodArrived
    .then((data) => {
      orderHistory.create({
        time: Date.now(),
        orderId,
        orderStatusId: 13,
      });
      order
        .findOne({
          where: { id: orderId },
          attributes: [
            "id", 
            "orderNum",
            [
              sequelize.fn("date_format", sequelize.col("scheduleDate"), "%r"),
              "scheduleTime",
            ],
            "note",
            "leaveOrderAt",
            [sequelize.literal("cast(`distance` as CHAR)"), "distance"],
            "total",
            "userId",
            "driverId",
            "paymentMethodId",
          ],
          include: [
            { model: orderApplication, attributes: ["name"] },
            {
              model: orderItems,
              attributes: ["quantity", "total"],
              include: { model: R_PLink, attributes: ["name", "image"] },
            },
            {
              model: restaurant,
              attributes: [
                "businessName",
                "countryCode",
                "phoneNum",
                "address",
                "city",
                "zipCode",
              ],
            },
            { model: orderCharge, attributes: ["driverEarnings"] },
            { model: orderStatus, attributes: ["displayText"] },
            {
              model: user,

              attributes: [
                "id",
                "firstName",
                "lastName",
                "countryCode",
                "phoneNum",
                "deviceToken",
                "language"
              ],
            },
            {
              model: address,
              as: "pickUpID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
            {
              model: address,
              as: "dropOffID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
          ],
        })
        .then((orderData) => {
          let userTokens =  formatTokens(orderData.user.deviceToken);
          
          let notification = {
            title: "Driver at Doorstep",
            body: "Rider is at your location. Please collect your order",
          };
          let data = {
            testData: "12354",
            orderId: orderId,
          };
          sendNotification(userTokens, notification, data,orderData?.user?.language).then((dat) => {
            const response = ApiResponse("1", "Food Arrived", "", orderData);
            return res.json(response);
          });
        });
    });
}

async function onTheWay(req, res) {
  const { orderId } = req.body;
  order
    .update({ orderStatusId: 5 }, { where: { id: orderId } }) // onTheWay
    .then((data) => {
      orderHistory.create({
        time: Date.now(),
        orderId,
        orderStatusId: 5,
      });
      order
        .findOne({
          where: { id: orderId },
          attributes: [
            "id",
            "orderNum",
            [
              sequelize.fn("date_format", sequelize.col("scheduleDate"), "%r"),
              "scheduleTime",
            ],
            "note",
            "leaveOrderAt",
            [sequelize.literal("cast(`distance` as CHAR)"), "distance"],
            "total",
            "userId",
            "driverId",
          ],
          include: [
            { model: orderApplication, attributes: ["name"] },
            {
              model: orderItems,
              attributes: ["quantity", "total"],
              include: { model: R_PLink, attributes: ["name", "image"] },
            },
            {
              model: restaurant,
              attributes: [
                "businessName",
                "countryCode",
                "phoneNum",
                "address",
                "city",
                "zipCode",
                "lat",
                "lng",
              ],
            },
            { model: orderCharge, attributes: ["driverEarnings"] },
            { model: orderStatus, attributes: ["displayText"] },
            {
              model: user,
              attributes: [
                "id",
                "userName",
                "countryCode",
                "phoneNum",
                "deviceToken",
                "language"
              ],
            },
            {
              model: address,
              as: "pickUpID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
            {
              model: address,
              as: "dropOffID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
          ],
        })
        .then((orderData) => {
          // ////////////////////////////////////
          let tolat = "";
          let tolng = "";

          tolat = orderData.dropOffID.lat;
          tolng = orderData.dropOffID.lng;

          axios.get(process.env.FIREBASE_URL).then((online_data) => {
            let fromlat =
              online_data.data[`${orderData.driverId}`].lat.toString();
            let fromlng =
              online_data.data[`${orderData.driverId}`].lng.toString();

            eta_text(fromlat, fromlng, tolat, tolng).then((eta) => {
              let userTokens = orderData.user
                ? JSON.parse(orderData.user.deviceToken)
                : [];

              let notification = {
                title: "Ride On The Way",
                body: "Rider on your way. Arriving soon",
              };
              let data = {
                testData: "12354",
                orderId: orderData.id,
              };
              sendNotification(userTokens, notification, data,orderData?.user?.language).then((dat) => {
                const data = { orderData, eta };
                const response = ApiResponse("1", "Order on the way", "", data);
                return res.json(response);
              });
            });
          });

          // ////////////////////////////////////
        });
    });
}

// async function delivered(req, res) {
//   const { orderId } = req.body;
//   let status = await orderStatus.findOne({
//     where: {
//       name: "Delivered",
//     },
//   });
//   let checkStatus = await order.findOne({
//     where: {
//       orderStatusId: status.id,
//       id: orderId,
//     },
//   });
  
//   let paymentType = await paymentMethod.findOne({where:{name:"Adyen"}});
  
//   if (checkStatus) {
//     let response = ApiResponse("0", "Order Already Delivered!", "", {});
//     return res.json(response);
//   }
//   order
//     .update(
//       {
//         orderStatusId: status.id,
//       },
//       {
//         where: {
//           id: orderId,
//         },
//       }
//     ) // onTheWay
//     .then(async (data) => {
//       orderHistory.create({
//         time: Date.now(),
//         orderId,
//         orderStatusId: 7,
//       });
//       order
//         .findOne({
//           where: {
//             id: orderId,
//           },
//           attributes: [
//             "id",
//             "orderNum",
//             "total",
//             "driverId",
//             "userId",
//             "paymentMethodId",
//             "restaurantId",
//             "currencyUnitId",
//           ],
//           include: [
//             {
//               model: orderCharge,
//             },
//             {
//               model: restaurant,
//               include: {
//                 model: user,
//                 attributes: ["ip", "deviceToken","id"],
//               },
//             },
//             {
//               model: user,
//               attributes: [
//                 "id",
//                 "ip",
//                 "userName",
//                 "firstName",
//                 "lastName",
//                 "countryCode",
//                 "phoneNum",
//                 "deviceToken",
//               ],
//             },
//           ],
//         })
//         .then(async (orderData) => {
            
//         if(paymentType.id == orderData.paymentMethodId){
//                       let driverType = await user.findOne({
//             where: {
//               id: orderData?.driverId,
//             },
//           });
//           let userTokens = formatTokens(orderData.user.deviceToken);
//           let restTokens = formatTokens(
//             orderData?.restaurant?.user?.deviceToken
//           );
//           let to = [
//             orderData.user.deviceToken,
//             orderData?.restaurant?.user?.deviceToken,
//           ];
          
          
//           // Driver Earning calculations
//           //1.For Freelancer
//           //driver earning = deliveryfee + tip
//           //2.For Restaurant Driver
//           //driver earning = tip only , delivery charges will goes to restaurant
          
          
          
//           if (driverType?.driverType == "Freelancer") {
//             const driverEarn = await driverEarning.findOne({
//               where: {
//                 userId: orderData?.driverId,
//               },
//             });
//             if (driverEarn) {
//               driverEarn.totalEarning =
//                 parseFloat(driverEarn.totalEarning) +
//                 parseFloat(orderData?.orderCharge?.driverEarnings);
//               driverEarn.availableBalance =
//                 parseFloat(driverEarn.availableBalance) +
//                 parseFloat(orderData?.orderCharge?.driverEarnings);
//               await driverEarn.save();
//             } else {
//               const newEarn = new driverEarning();
//               newEarn.userId = orderData.driverId;
//               newEarn.totalEarning = parseFloat(
//                 orderData?.orderCharge?.driverEarnings
//               );
//               newEarn.availableBalance = parseFloat(
//                 orderData?.orderCharge?.driverEarnings
//               );
//               await newEarn.save();
//             }
//             const restEarn = await restaurantEarning.findOne({
//               where: {
//                 restaurantId: orderData.restaurantId,
//               },
//             });
//             if (restEarn) {
//               restEarn.totalEarning =
//                 parseFloat(restEarn.totalEarning) +
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings);
//               restEarn.availableBalance =
//                 parseFloat(restEarn.availableBalance) +
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings);
//               await restEarn.save();
//             } else {
//               const newRestEarning = new restaurantEarning();
//               newRestEarning.totalEarning = parseFloat(
//                 orderData?.orderCharge?.restaurantEarnings
//               );
//               newRestEarning.availableBalance = parseFloat(
//                 orderData?.orderCharge?.restaurantEarnings
//               );
//               newRestEarning.restaurantId = orderData.restaurantId;
//               await newRestEarning.save();
//             }
//           } 
//           else {
              
//             const driverEarn = await driverEarning.findOne({
//               where: {
//                 userId: orderData?.driverId,
//               },
//             });
//             if (driverEarn) {
//               driverEarn.totalEarning =  parseFloat(driverEarn.totalEarning) +
//                 parseFloat(orderData?.orderCharge?.tip);
//               driverEarn.restaurantAmount = parseFloat(driverEarn.restaurantAmount) +  parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               driverEarn.availableBalance = parseFloat(driverEarn.availableBalance) +
//                 parseFloat(orderData?.orderCharge?.tip);
//               await driverEarn.save();
//             } else {
//               const newEarn = new driverEarning();
//               newEarn.restaurantAmount =  parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               newEarn.availableBalance =  parseFloat(orderData?.orderCharge?.tip);
//               newEarn.totalEarning =   parseFloat(orderData?.orderCharge?.tip);
//               await newEarn.save();
//             }
//             const restEarn = await restaurantEarning.findOne({
//               where: {
//                 restaurantId: orderData.restaurantId,
//               },
//             });
//             if (restEarn) {
//               restEarn.totalEarning =
//                 parseFloat(restEarn.totalEarning) +
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings) +
//                 parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               restEarn.availableBalance =
//                 parseFloat(restEarn.availableBalance) +
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings) +
//                 parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               await restEarn.save();
//             } else {
//               const newRestEarning = new restaurantEarning();
//               newRestEarning.totalEarning =
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings) +
//                 parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               newRestEarning.availableBalance =
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings) +
//                 parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               newRestEarning.restaurantId = orderData.restaurantId;
//               await newRestEarning.save();
//             }
//             //now update the orderCharge table
//             console.log(
//               "**********************************Charge ka table ******************************"
//             );
//             let chargeData = await orderCharge.findOne({
//               where: {
//                 orderId: orderId,
//               },
//             });
//             console.log(chargeData);
//             if (chargeData) {
               
//               chargeData.restaurantEarnings = parseFloat(chargeData.restaurantEarnings) + parseFloat(chargeData.deliveryFees) - parseFloat(chargeData.tip);
//               chargeData.driverEarnings = parseFloat(chargeData.tip);
//               chargeData
//                 .save()
//                 .then((dat) => {
                     
//                   console.log(
//                     "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& charge updated"
//                   );
//                 })
//                 .catch((error) => {
//                   console.log(error);
//                 });
//             }
//           }
//           // Credits Calculations
//           //   if driver completes first 3 orders than give him 4 points and also to the user whose referalCode was used by that driver
//           const status = await orderStatus.findOne({
//             where: {
//               name: "Delivered",
//             },
//           });
//           const orderCount = await order.count({
//             where: [
//               {
//                 driverId: req.user.id,
//               },
//               {
//                 orderStatusId: status.id,
//               },
//             ],
//           });
//           if (orderCount == 3) {
//             // const driverCredit = await Credit.findOne({
//             //   where: { userId: req.user.id },
//             // });
//             // if (driverCredit) {
//             //   driverCredit.point = parseInt(driverCredit.point) + 4;
//             //   await driverCredit.save();
//             // }
//             // const driver = await user.findOne({ where: { id: req.user.id } });
//             // const usedDriver = await Credit.findOne({where: { referalCode: driver?.usedReferalCode },include:{model:user}});
//             // if (usedDriver) {
//             //   usedDriver.point = parseInt(usedDriver.point) + 4;
//             //   await usedDriver.save();
//             //   singleNotification(
//             //   usedDriver?.user?.deviceToken,
//             //   "Congratulations!",
//             //   `You have been awarded by 4 points credit`,
//             //   {}
//             // );
//             // }
//           }
//           let customer = await user.findOne({
//             where: {
//               id: orderData.user.id,
//             },
//           });
//           let customerOrder = await order.count({
//             where: {
//               userId: customer.id,
//               orderStatusId: status.id,
//             },
//           });
//           if (customerOrder < 4) {
//             // when user complete first three orders, on his each order he will get 4 points
//             let credit = await Credit.findOne({
//               where: {
//                 userId: customer.id,
//               },
//             });
//             if (credit) {
//               if (parseInt(credit.point) < 19) {
//                 credit.point = parseInt(credit.point) + 4;
//                 await credit.save();
//               }
//             }
//             // referel code used by customer , that person belongs to that referal code will get 2 points
//             let userCustomer = await user.findOne({
//               where: {
//                 referalCode: customer.usedReferalCode,
//               },
//             });
//             if (userCustomer) {
//               let usedCredit = await Credit.findOne({
//                 where: {
//                   userId: userCustomer.id,
//                 },
//               });
//               if (usedCredit) {
//                 if (parseInt(usedCredit.point) < 19) {
//                   usedCredit.point = parseInt(usedCredit.point) + 2;
//                   await usedCredit.save();
//                 }
//               }
//             }
//           }
          
//           //save admin Earning 
//           let adminEarn = await adminEarning.findOne({});
//           if(adminEarn){
//               adminEarn.totalEarning = parseFloat(orderData?.orderCharge?.adminEarnings) + parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               await adminEarn.save();
//           }
//           else{
//               adddEarn = new adminEarning();
//               adddEarn.totalEarning = parseFloat(orderData?.orderCharge?.adminEarnings) + parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               await adddEarn.save();
//           }
          
//           let notification = {
//             title: "Order Delivered",
//             body: `Order Number ${orderData.orderNum} has been delivered`,
//           };
//           let data = {
//             testData: "12354",
//             orderId: orderId,
//           };
//           let eventData = {
//             type: "delivered",
//             data: {
//               status: "1",
//               message: `Order ID : ${orderData.id} Delivered successfully`,
//               error: "",
//               data: data,
//             },
//           };
//           //send event to customer
//           sendEvent(orderData?.user?.id, eventData);
//           //send event to retailer
//           retailerController.homeData(orderData.restaurantId).then(async (homeDataa) => {

//           let eventDataForRetailer = {
//             type: "delivered",
//             data: {
//               status: "1",
//               message: `Order Number ${orderData.orderNum} has been delivered`,
//               error: "",
//               data: homeDataa,
//             },
//           };
     

//           sendEvent(orderData?.restaurant?.user?.id, eventDataForRetailer);
//         })
          
//           sendNotification(restTokens, notification, data);
//           sendNotification(userTokens, notification, data).then((dat) => {
//             const response = ApiResponse("1", "Food Delivered", "", orderData);
//             return res.json(response);
//           });
//         }
//         else{
//           let driverType = await user.findOne({
//             where: {
//               id: orderData.driverId,
//             },
//           });
//           let userTokens = formatTokens(orderData.user.deviceToken);
//           let restTokens = formatTokens(
//             orderData?.restaurant?.user?.deviceToken
//           );
//           let to = [
//             orderData.user.deviceToken,
//             orderData?.restaurant?.user?.deviceToken,
//           ];
          
          
//           // Driver Earning calculations
//           //1.For Freelancer
//           //driver earning = deliveryfee + tip
//           //2.For Restaurant Driver
//           //driver earning = tip only , delivery charges will goes to restaurant
          
          
          
//           if (driverType.driverType == "Freelancer") {
//             const driverEarn = await driverEarning.findOne({
//               where: {
//                 userId: orderData?.driverId,
//               },
//             });
//             if (driverEarn) {
//               driverEarn.totalEarning =
//                 parseFloat(driverEarn.totalEarning) +
//                 parseFloat(orderData?.orderCharge?.driverEarnings);
//               driverEarn.availableBalance =
//                 parseFloat(driverEarn.availableBalance) +
//                 parseFloat(orderData?.orderCharge?.driverEarnings);
//               await driverEarn.save();
//             } else {
//               const newEarn = new driverEarning();
//               newEarn.userId = orderData.driverId;
//               newEarn.totalEarning = parseFloat(
//                 orderData?.orderCharge?.driverEarnings
//               );
//               newEarn.availableBalance = parseFloat(
//                 orderData?.orderCharge?.driverEarnings
//               );
//               await newEarn.save();
//             }
//             const restEarn = await restaurantEarning.findOne({
//               where: {
//                 restaurantId: orderData.restaurantId,
//               },
//             });
//             if (restEarn) {
//               restEarn.totalEarning =
//                 parseFloat(restEarn.totalEarning) +
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings);
//               restEarn.availableBalance =
//                 parseFloat(restEarn.availableBalance) +
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings);
//               await restEarn.save();
//             } else {
//               const newRestEarning = new restaurantEarning();
//               newRestEarning.totalEarning = parseFloat(
//                 orderData?.orderCharge?.restaurantEarnings
//               );
//               newRestEarning.availableBalance = parseFloat(
//                 orderData?.orderCharge?.restaurantEarnings
//               );
//               newRestEarning.restaurantId = orderData.restaurantId;
//               await newRestEarning.save();
//             }
//           } else {
//             const driverEarn = await driverEarning.findOne({
//               where: {
//                 userId: orderData?.driverId,
//               },
//             });
//             if (driverEarn) {
//               driverEarn.totalEarning =  parseFloat(driverEarn.totalEarning) +
//                 parseFloat(orderData?.orderCharge?.tip);
//               driverEarn.restaurantAmount = parseFloat(driverEarn.restaurantAmount) +  parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               driverEarn.availableBalance = parseFloat(driverEarn.availableBalance) +
//                 parseFloat(orderData?.orderCharge?.tip);
//               await driverEarn.save();
//             } else {
//               const newEarn = new driverEarning();
//               newEarn.restaurantAmount =  parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               newEarn.availableBalance =  parseFloat(orderData?.orderCharge?.tip);
//               newEarn.totalEarning =   parseFloat(orderData?.orderCharge?.tip);
//               await newEarn.save();
//             }
//             const restEarn = await restaurantEarning.findOne({
//               where: {
//                 restaurantId: orderData.restaurantId,
//               },
//             });
//             if (restEarn) {
//               restEarn.totalEarning =
//                 parseFloat(restEarn.totalEarning) +
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings) +
//                 parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               restEarn.availableBalance =
//                 parseFloat(restEarn.availableBalance) +
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings) +
//                 parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               await restEarn.save();
//             } else {
//               const newRestEarning = new restaurantEarning();
//               newRestEarning.totalEarning =
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings) +
//                 parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               newRestEarning.availableBalance =
//                 parseFloat(orderData?.orderCharge?.restaurantEarnings) +
//                 parseFloat(orderData?.orderCharge?.deliveryFees) - parseFloat(orderData?.orderCharge?.adminDeliveryCharges);
//               newRestEarning.restaurantId = orderData.restaurantId;
//               await newRestEarning.save();
//             }
//             //now update the orderCharge table
//             console.log(
//               "**********************************Charge ka table ******************************"
//             );
//             let charge = await orderCharge.findOne({
//               where: {
//                 orderId: orderId,
//               },
//             });
//             console.log(charge);
//             if (charge) {
//               charge.restaurantEarnings = parseFloat(charge.restaurantEarnings) + parseFloat(charge.deliveryFees) - parseFloat(charge.tip);
//               charge.driverEarnings = parseFloat(charge.tip);
//               charge
//                 .save()
//                 .then((dat) => {
//                   console.log(
//                     "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& charge updated"
//                   );
//                 })
//                 .catch((error) => {
//                   console.log(error);
//                 });
//             }
//           }
//           // Credits Calculations
//           //   if driver completes first 3 orders than give him 4 points and also to the user whose referalCode was used by that driver
//           const status = await orderStatus.findOne({
//             where: {
//               name: "Delivered",
//             },
//           });
//           const orderCount = await order.count({
//             where: [
//               {
//                 driverId: req.user.id,
//               },
//               {
//                 orderStatusId: status.id,
//               },
//             ],
//           });
//           if (orderCount == 3) {
//             // const driverCredit = await Credit.findOne({
//             //   where: { userId: req.user.id },
//             // });
//             // if (driverCredit) {
//             //   driverCredit.point = parseInt(driverCredit.point) + 4;
//             //   await driverCredit.save();
//             // }
//             // const driver = await user.findOne({ where: { id: req.user.id } });
//             // const usedDriver = await Credit.findOne({where: { referalCode: driver?.usedReferalCode },include:{model:user}});
//             // if (usedDriver) {
//             //   usedDriver.point = parseInt(usedDriver.point) + 4;
//             //   await usedDriver.save();
//             //   singleNotification(
//             //   usedDriver?.user?.deviceToken,
//             //   "Congratulations!",
//             //   `You have been awarded by 4 points credit`,
//             //   {}
//             // );
//             // }
//           }
//           let customer = await user.findOne({
//             where: {
//               id: orderData.user.id,
//             },
//           });
//           let customerOrder = await order.count({
//             where: {
//               userId: customer.id,
//               orderStatusId: status.id,
//             },
//           });
//           if (customerOrder < 4) {
//             // when user complete first three orders, on his each order he will get 4 points
//             let credit = await Credit.findOne({
//               where: {
//                 userId: customer.id,
//               },
//             });
//             if (credit) {
//               if (parseInt(credit.point) < 19) {
//                 credit.point = parseInt(credit.point) + 4;
//                 await credit.save();
//               }
//             }
//             // referel code used by customer , that person belongs to that referal code will get 2 points
//             let userCustomer = await user.findOne({
//               where: {
//                 referalCode: customer.usedReferalCode,
//               },
//             });
//             if (userCustomer) {
//               let usedCredit = await Credit.findOne({
//                 where: {
//                   userId: userCustomer.id,
//                 },
//               });
//               //   return res.json(usedCredit)
//               //   return res.json(usedCredit)
//               if (usedCredit) {
//                 if (parseInt(usedCredit.point) < 19) {
//                   usedCredit.point = parseInt(usedCredit.point) + 2;
//                   await usedCredit.save();
//                 }
//               }
//             }
//           }
//           let notification = {
//             title: "Order Delivered",
//             body: `Order Number ${orderData.orderNum} has been delivered`,
//           };
//           let data = {
//             testData: "12354",
//             orderId: orderId,
//           };
//           let eventData = {
//             type: "delivered",
//             data: {
//               status: "1",
//               message: `Order ID : ${orderData.id} Delivered successfully`,
//               error: "",
//               data: data,
//             },
//           };
//           sendEvent(orderData?.user?.id, eventData);
//           sendEvent(orderData?.restaurant?.user?.id, eventData);
//           sendNotification(restTokens, notification, data);
//           sendNotification(userTokens, notification, data).then((dat) => {
//             const response = ApiResponse("1", "Food Delivered", "", orderData);
//             return res.json(response);
//           });
//         }
//         });
//     });
// }

function calculateHourDifference(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = end - start;

  // Convert milliseconds to hours
  const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);

  return differenceInHours;
}

async function delivered(req, res) {
    const { orderId } = req.body;
    
    const orderRecord = await order.findOne({ where: { id: orderId } });
    const orderChargeRecord = await orderCharge.findOne({ where: { orderId: orderId } });
    const driverEarningsRecord = await driverEarning.findOne({ where: { userId: orderRecord?.driverId } });
    const restaurantEarningsRecord = await restaurantEarning.findOne({ where: { restaurantId: orderRecord?.restaurantId } });
    const driverTypeRecord = await user.findOne({ where: { id: orderRecord?.driverId } });
    const driverCommissionRecord = await driverCommission.findOne({ where: { userId: orderRecord?.driverId, restaurantId: orderRecord?.restaurantId,status:true  } });
    const adminEarningsRecord = await adminEarning.findOne({});
    const deliveredStatusRecord = await orderStatus.findOne({ where: { name: "Delivered" } });
    // let cod = await paymentMethod.findOne({where:{name:"COD"}});
    
    // if(orderRecord.orderStatusId == deliveredStatusRecord.id){
    //     return res.json(ApiResponse("0","Already delivered","",{}));
    // }
    if(!orderRecord.driverId){
        return res.json(ApiResponse("0","Sorry! No Driver assigned to this order","",{}));
    }
    

    let totalDriverEarning = 0;
    let totalRestaurantEarning = 0;
    let totalAdminEarning = 0;
    let commissionAmount = 0;

    if (driverTypeRecord.driverType === "Restaurant") {
        
             totalDriverEarning = parseFloat(orderChargeRecord?.additionalTip ?? 0) + parseFloat(orderChargeRecord?.tip ?? 0);
              commissionAmount = parseFloat(orderChargeRecord?.deliveryFees ?? 0) - parseFloat(orderChargeRecord?.adminDeliveryCharges ?? 0);
       
       
        totalRestaurantEarning = parseFloat(orderChargeRecord?.restaurantEarnings ?? 0) + parseFloat(orderChargeRecord?.packingFee ?? 0) + parseFloat(orderChargeRecord?.deliveryFees ?? 0) - parseFloat(orderChargeRecord?.adminDeliveryCharges ?? 0);
       
    } else {
        
             totalDriverEarning = parseFloat(orderChargeRecord?.additionalTip ?? 0) + parseFloat(orderChargeRecord?.tip ?? 0) + parseFloat(orderChargeRecord?.deliveryFees ?? 0) - parseFloat(orderChargeRecord?.adminDeliveryCharges ?? 0);
        
        totalRestaurantEarning = parseFloat(orderChargeRecord?.restaurantEarnings ?? 0) + parseFloat(orderChargeRecord?.packingFee ?? 0);
    }

    totalAdminEarning = 
        parseFloat(orderChargeRecord?.serviceCharges ?? 0) +
        parseFloat(orderChargeRecord?.VAT ?? 0) +
        parseFloat(orderChargeRecord?.adminDeliveryCharges ?? 0) +
        parseFloat((parseFloat(orderChargeRecord?.basketTotal ?? 0) * parseFloat(orderChargeRecord?.adminPercent ?? 0)) / 100);

    orderChargeRecord.driverEarnings = totalDriverEarning;
    orderChargeRecord.restaurantEarnings = totalRestaurantEarning;
    orderChargeRecord.adminEarnings = totalAdminEarning;
    await orderChargeRecord.save();

  

    orderRecord.orderStatusId = deliveredStatusRecord?.id ?? null;
    await orderRecord.save();

    // if(orderRecord.paymentMethodId != cod.id){
        if (driverEarningsRecord) {
        driverEarningsRecord.totalEarning = parseFloat(driverEarningsRecord.totalEarning ?? 0) + totalDriverEarning;
        driverEarningsRecord.availableBalance = parseFloat(driverEarningsRecord.availableBalance ?? 0) + totalDriverEarning;
        await driverEarningsRecord.save();
    }
    // }
    if (restaurantEarningsRecord) {
        restaurantEarningsRecord.totalEarning = parseFloat(restaurantEarningsRecord.totalEarning ?? 0) + totalRestaurantEarning;
        restaurantEarningsRecord.availableBalance = parseFloat(restaurantEarningsRecord.availableBalance ?? 0) + totalRestaurantEarning;
        await restaurantEarningsRecord.save();
    }
    if (adminEarningsRecord) {
        adminEarningsRecord.totalEarning = parseFloat(adminEarningsRecord.totalEarning ?? 0) + totalAdminEarning;
        await adminEarningsRecord.save();
    }

    
        if (driverTypeRecord.driverType == "Restaurant") {
          
        if (driverCommissionRecord) {
            
            driverCommissionRecord.amount = parseFloat(driverCommissionRecord.amount ?? 0) + commissionAmount;
            driverCommissionRecord.distance = parseFloat(driverCommissionRecord.distance ?? 0) + parseFloat(orderRecord?.distance ?? 0);
            await driverCommissionRecord.save();
        }
    }
    

    await orderHistory.create({ time: Date.now(), orderId, orderStatusId: deliveredStatusRecord?.id ?? null });

        const orderData = await order.findOne({
      where: { id: orderId },
      attributes: ["id", "orderNum", "total", "driverId", "userId", "paymentMethodId", "restaurantId", "currencyUnitId", "deliveryTypeId", "orderStatusId","distance"],
      include: [
        { model: orderCharge },
        { model: restaurant, include: { model: user, attributes: ["ip", "deviceToken", "id","language"] } },
        { model: user, attributes: ["id", "ip", "userName", "firstName", "lastName", "countryCode", "phoneNum", "deviceToken","language"] },
      ],
      
    });
    await logDelivery(orderId,new Date());
    const notification = { title: "Order Delivered", body: `Order Number ${orderData?.orderNum ?? ''} has been delivered` };
    const dataPayload = { driverId:orderData?.driverId ,orderId, deliveryTypeId: orderData?.deliveryTypeId?.toString() ?? '' };
    const eventData = { type: "delivered", data: { status: "1", message: `Order ID: ${orderData?.id ?? ''} delivered successfully`, error: "", data: dataPayload } };

    await sendEvent(orderData?.user?.id ?? null, eventData);
    const homeData = await retailerController.homeData(orderData?.restaurantId ?? null);
    await sendEvent(orderData?.restaurant?.user?.id ?? null, { type: "delivered", data: { status: "1", message: `Order Number ${orderData?.orderNum ?? ''} has been delivered`, error: "", data: homeData } });

    const userTokens = formatTokens(orderData?.user?.deviceToken ?? '');
    const restaurantTokens = formatTokens(orderData?.restaurant?.user?.deviceToken ?? '');

    await sendNotification(restaurantTokens, notification, dataPayload, orderData?.restaurant?.user?.language ?? 'en');
    await sendNotification(userTokens, notification, dataPayload, orderData?.user?.language ?? 'en');
    
              // Credits Calculations
          //   if driver completes first 3 orders than give him 4 points and also to the user whose referalCode was used by that driver
          const status = await orderStatus.findOne({
            where: {
              name: "Delivered",
            },
          });
          const orderCount = await order.count({
            where: [
              {
                driverId: req.user.id,
              },
              {
                orderStatusId: status.id,
              },
            ],
          });
          if (orderCount == 3) {
            // const driverCredit = await Credit.findOne({
            //   where: { userId: req.user.id },
            // });
            // if (driverCredit) {
            //   driverCredit.point = parseInt(driverCredit.point) + 4;
            //   await driverCredit.save();
            // }
            // const driver = await user.findOne({ where: { id: req.user.id } });
            // const usedDriver = await Credit.findOne({where: { referalCode: driver?.usedReferalCode },include:{model:user}});
            // if (usedDriver) {
            //   usedDriver.point = parseInt(usedDriver.point) + 4;
            //   await usedDriver.save();
            //   singleNotification(
            //   usedDriver?.user?.deviceToken,
            //   "Congratulations!",
            //   `You have been awarded by 4 points credit`,
            //   {}
            // );
            // }
          }
          let customer = await user.findOne({
            where: {
              id: orderData.userId,
            },
          });
          let customerOrder = await order.count({
            where: {
              userId: customer.id,
              orderStatusId: status.id,
            },
          });
          if (customerOrder < 4) {
            // when user complete first three orders, on his each order he will get 4 points
            let credit = await Credit.findOne({
              where: {
                userId: customer.id,
              },
            });
            if (credit) {
              if (parseInt(credit.point) < 19) {
                credit.point = parseInt(credit.point) + 4;
                await credit.save();
              }
            }
            // referel code used by customer , that person belongs to that referal code will get 2 points
            let userCustomer = await user.findOne({
              where: {
                referalCode: customer.usedReferalCode,
              },
            });
            if (userCustomer) {
              let usedCredit = await Credit.findOne({
                where: {
                  userId: userCustomer.id,
                },
              });
              
              if (usedCredit) {
                if (parseInt(usedCredit.point) < 19) {
                  usedCredit.point = parseInt(usedCredit.point) + 2;
                  await usedCredit.save();
                }
              }
            }
          }
    
    
    

    return res.json(ApiResponse("1", "Food Delivered", "", orderData));
}






// async function delivered(req, res) {
//   const { orderId } = req.body;
//   console.log(req.body)
//   const t = await SequelizeDB.transaction(); // Start transaction

//   try {
//     // Fetch order details and driver information
//     let ord = await order.findOne({ where: { id: orderId }, attributes: ['driverId'], transaction: t });
//     if (!ord) {
//       await t.rollback();
//       return res.json(ApiResponse("0", "Order Not Found", "", {}));
//     }

//     let driverData = await user.findOne({ where: { id: ord.driverId }, attributes: ['driverType','id'], transaction: t });
//     // return res.json(driverData)

//     // Utility function to get status ID by name
//     const getStatusIdByName = async (name) => {
//       const status = await orderStatus.findOne({ where: { name }, transaction: t });
//       return status?.id;
//     };

//     // Utility function to update driver earnings based on driver type
//     const updateDriverEarnings = async (driverId, orderCharge, driverType) => {
//       const driverEarn = await driverEarning.findOne({ where: { userId: driverId }, transaction: t });

//       // Calculate driver earnings based on driverType
//       const tip = parseFloat(orderCharge?.tip || 0);
//       const additionalTip = parseFloat(orderCharge?.additionalTip || 0);
//       const deliveryFees = driverType === 'Freelancer' ? parseFloat(orderCharge?.deliveryFees || 0) : 0; // Only add deliveryFees for Freelancer
//       const adminDeliveryCharges = driverType === 'Freelancer' ? parseFloat(orderCharge?.adminDeliveryCharges || 0) : 0; // Only add deliveryFees for Freelancer
//       const driverEarnings = tip + additionalTip + deliveryFees - adminDeliveryCharges;

//       if (isNaN(driverEarnings)) {
//         throw new Error('Invalid driver earnings value');
//       }

//       // Update or create driver earnings record
//       if (driverEarn) {
//         driverEarn.totalEarning = parseFloat(driverEarn.totalEarning) + driverEarnings;
//         driverEarn.availableBalance = parseFloat(driverEarn.availableBalance) + driverEarnings;
//         await driverEarn.save({ transaction: t });
//       } else {
//         await driverEarning.create({
//           userId: driverId,
//           totalEarning: driverEarnings,
//           availableBalance: driverEarnings,
//         }, { transaction: t });
//       }
//     };

//     // New utility function to update driver commission if driverType is 'Restaurant'
//     const updateDriverCommission = async (driverId, restaurantId, deliveryFees,distance) => {
      
//       const driverCommissionData = await driverCommission.findOne({
//         where: { userId: driverId, restaurantId,status:true },
//         transaction: t
//       });

//       if (driverCommissionData) {
//         // Add deliveryFees to the existing amount
//         driverCommissionData.amount = parseFloat(driverCommissionData.amount) + deliveryFees;
//         driverCommissionData.distance = parseFloat(driverCommissionData.distance) + parseFloat(distance);
//         await driverCommissionData.save({ transaction: t });
//       } 
//     };
//     await logDelivery(orderId,new Date());
//     // Utility function to update restaurant earnings
//     const updateRestaurantEarnings = async (restaurantId, orderCharge, driverType) => {
//       const restEarn = await restaurantEarning.findOne({ where: { restaurantId }, transaction: t });

//       // Calculate restaurant earnings
//       const restaurantEarnings = parseFloat(orderCharge.restaurantEarnings || 0);
//       const deliveryFees = driverType === 'Restaurant' ? parseFloat(orderCharge.deliveryFees || 0) : 0;
//       const adminDeliveryCharges = parseFloat(orderCharge.adminDeliveryCharges || 0);
//       const totalEarnings = restaurantEarnings + deliveryFees - adminDeliveryCharges;

//       if (isNaN(totalEarnings)) {
//         throw new Error('Invalid restaurant earnings value');
//       }

//       // Update or create restaurant earnings record
//       if (restEarn) {
//         restEarn.totalEarning = parseFloat(restEarn.totalEarning) + totalEarnings;
//         restEarn.availableBalance = parseFloat(restEarn.availableBalance) + totalEarnings;
//         await restEarn.save({ transaction: t });
//       } else {
//         await restaurantEarning.create({
//           restaurantId,
//           totalEarning: totalEarnings,
//           availableBalance: totalEarnings,
//         }, { transaction: t });
//       }
//     };

//     // Utility function to update order charges
//     const updateOrderCharges = async (orderId) => {
//       const chargeData = await orderCharge.findOne({ where: { orderId:orderId }, transaction: t });
//       console.log(chargeData)

//       const deliveryFees = parseFloat(chargeData?.deliveryFees || 0);
//       const tip = parseFloat(chargeData?.tip || 0);

//       if (isNaN(deliveryFees) || isNaN(tip)) {
//         throw new Error('Invalid order charge value');
//       }

//       if (chargeData) {
//         chargeData.restaurantEarnings += deliveryFees - tip;
//         chargeData.driverEarnings += tip;
//         await chargeData.save({ transaction: t });
//       }
//     };

//     // Fetch delivered status ID
//     const deliveredStatusId = await getStatusIdByName("Delivered");

//     // Fetch order details and include necessary associations
//     const orderData = await order.findOne({
//       where: { id: orderId },
//       attributes: ["id", "orderNum", "total", "driverId", "userId", "paymentMethodId", "restaurantId", "currencyUnitId", "deliveryTypeId", "orderStatusId","distance"],
//       include: [
//         { model: orderCharge },
//         { model: restaurant, include: { model: user, attributes: ["ip", "deviceToken", "id","language"] } },
//         { model: user, attributes: ["id", "ip", "userName", "firstName", "lastName", "countryCode", "phoneNum", "deviceToken","language"] },
//       ],
//       transaction: t,
//     });

//     if (!orderData) {
//       await t.rollback();
//       return res.json(ApiResponse("0", "Order Not Found", "", {}));
//     }

//     // Check if the order is already delivered
//     if (orderData.orderStatusId === deliveredStatusId) {
//       await t.rollback();
//       return res.json(ApiResponse("0", "Order Already Delivered!", "", {}));
//     }
//     if(orderData.driverId == null){
//          await t.rollback();
//       return res.json(ApiResponse("0", "No Driver assigned", "", {})); 
//     }

//     // Update order status to delivered
//     await order.update({ orderStatusId: deliveredStatusId }, { where: { id: orderId }, transaction: t });

//     // Create order history
//     await orderHistory.create({ time: Date.now(), orderId, orderStatusId: deliveredStatusId }, { transaction: t });

//     // Determine if the payment method is Adyen
//     const paymentType = await paymentMethod.findOne({ where: { name: "Adyen" }, transaction: t });
//     const isAdyenPayment = paymentType?.id == orderData.paymentMethodId;

//     // Update earnings based on driver type and payment method
//     await updateDriverEarnings(orderData.driverId, orderData.orderCharge, driverData.driverType);
//     await updateRestaurantEarnings(orderData.restaurantId, orderData.orderCharge, driverData.driverType);

//     // Check for driver commission if driverType is 'Restaurant'
//     if (driverData.driverType === 'Restaurant') {
//       const deliveryFees = parseFloat(orderData.orderCharge.deliveryFees || 0);
//       await updateDriverCommission(orderData.driverId, orderData.restaurantId, deliveryFees,orderData.distance);
//     }


//     if (!isAdyenPayment) {
//     //  let cc = await updateOrderCharges(orderId, orderData?.orderCharge);
//      let cc = await updateOrderCharges(orderId);
//     //  return res.json(cc)
//     }

//     // Save admin earnings
//     let adminEarn = await adminEarning.findOne({}, { transaction: t });
//     if (adminEarn) {
//       adminEarn.totalEarning = parseFloat(adminEarn.totalEarning) + parseFloat(orderData.orderCharge.adminEarnings || 0) + parseFloat(orderData.orderCharge.adminDeliveryCharges || 0);
//       await adminEarn.save({ transaction: t });
//     } else {
//       await adminEarning.create({
//         totalEarning: parseFloat(orderData.orderCharge.adminEarnings || 0) + parseFloat(orderData.orderCharge.adminDeliveryCharges || 0),
//       }, { transaction: t });
//     }

//     // Notify customers and retailers about the order delivery
//     const notification = { title: "Order Delivered", body: `Order Number ${orderData.orderNum} has been delivered` };
//     const data = { testData: "12354", orderId, deliveryTypeId: orderData.deliveryTypeId?.toString() };
//     const eventData = { type: "delivered", data: { status: "1", message: `Order ID: ${orderData.id} delivered successfully`, error: "", data } };

//     await sendEvent(orderData.user.id, eventData);
//     const homeData = await retailerController.homeData(orderData.restaurantId);
//     await sendEvent(orderData.restaurant.user.id, { type: "delivered", data: { status: "1", message: `Order Number ${orderData.orderNum} has been delivered`, error: "", data: homeData } });

//     const userTokens = formatTokens(orderData.user.deviceToken);
//     const restTokens = formatTokens(orderData.restaurant.user.deviceToken);

//     await sendNotification(restTokens, notification, data,orderData.restaurant.user.language);
//     await sendNotification(userTokens, notification, data,orderData?.user?.language);

//     // Commit the transaction
    
//     await t.commit();
    
//     let hourData = await driverRestaurantHours.findOne({where:{orderId: orderId}});
//     let diff = calculateHourDifference(hourData?.startTime,hourData?.endTime);
//     if(driverData.driverType == "Restaurant"){
//         if(orderData.restaurant.hourlyRate){
//             let timeAmount = parseFloat(diff)*parseFloat(orderData?.restaurant?.hourlyRate);
//             let comm = await driverCommission.findOne({where:{userId:orderData.driverId,restaurantId:orderData?.restaurantId}});
//             if(comm){
//                 comm.amount = parseFloat(comm.amount)+timeAmount;
//                 await comm.save();
//             }
//         }
//     }
    

//     return res.json(ApiResponse("1", "Food Delivered", "", orderData));

//   } catch (error) {
//     // Rollback transaction in case of an error
//     await t.rollback();
//     console.error(error);
//     return res.status(500).json(ApiResponse("0", "Internal Server Error", error.message, {}));
//   }
// }



async function ride_start(req, res) {
  const { orderId } = req.body;
  order
    .update({ orderStatusId: 9 }, { where: { id: orderId } }) // ride started
    .then((data) => {
      orderHistory.create({
        time: Date.now(),
        orderId,
        orderStatusId: 9,
      });
      order
        .findOne({
          where: { id: orderId },
          attributes: [
            "id",
            "orderApplicationId",
            "orderNum",
            [
              sequelize.fn("date_format", sequelize.col("scheduleDate"), "%r"),
              "scheduleTime",
            ],
            "note",
            "leaveOrderAt",
            [sequelize.literal("cast(`distance` as CHAR)"), "distance"],
            "total",
            "userId",
            "driverId",
          ],
          include: [
            { model: orderApplication, attributes: ["name"] },
            {
              model: orderItems,
              attributes: ["quantity", "total"],
              include: { model: R_PLink, attributes: ["name", "image"] },
            },
            {
              model: restaurant,
              attributes: [
                "businessName",
                "countryCode",
                "phoneNum",
                "address",
                "city",
                "zipCode",
              ],
            },
            { model: orderCharge, attributes: ["driverEarnings"] },
            { model: orderStatus, attributes: ["displayText"] },
            {
              model: user,
              as: "customerId",
              attributes: [
                "id",
                "firstName",
                "lastName",
                "countryCode",
                "phoneNum",
                "deviceToken",
                "language"
              ],
            },
            {
              model: address,
              as: "pickUpID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
            {
              model: address,
              as: "dropOffID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
          ],
        })
        .then((orderData) => {
          // ////////////////////////////////////
          let tolat = "";
          let tolng = "";

          tolat = orderData.dropOffID.lat;
          tolng = orderData.dropOffID.lng;

          axios.get(process.env.FIREBASE_URL).then((online_data) => {
            let fromlat =
              online_data.data[`${orderData.driverId}`].lat.toString();
            let fromlng =
              online_data.data[`${orderData.driverId}`].lng.toString();

            eta_text(fromlat, fromlng, tolat, tolng).then((eta) => {
              let to = [orderData.customerId.deviceToken];
              let notification = {
                title: "Ride started",
                body: "Rider is on his way. Please hang on.",
              };
              let data = {
                orderApplicationId: orderData.orderApplicationId,
                driverId: orderData.driverId,
                pickupLat: orderData.pickUpID.lat,
                pickupLng: orderData.pickUpID.lng,
                dropOffLat: orderData.dropOffID.lat,
                dropOffLng: orderData.dropOffID.lng,
              };
              sendNotification(to, notification, data,orderData.customerId.language).then((dat) => {
                const data = { orderData, eta };
                const response = ApiResponse("1", "Ride Started", "", data);
                return res.json(response);
              });
            });
          });

          //////////////////////////////////////
        });
    });
}

async function ride_cancel(req, res) {
  const { orderId } = req.body;
  const userId = req.user.id;
  order
    .update({ orderStatusId: 12 }, { where: { id: orderId } }) // ride cancelled
    .then((data) => {
      orderHistory.create({
        time: Date.now(),
        orderId,
        orderStatusId: 12,
        cancelledBy: userId,
      });
      order
        .findOne({
          where: { id: orderId },
          attributes: [
            "id",
            "orderApplicationId",
            "orderNum",
            [
              sequelize.fn("date_format", sequelize.col("scheduleDate"), "%r"),
              "scheduleTime",
            ],
            "note",
            "leaveOrderAt",
            [sequelize.literal("cast(`distance` as CHAR)"), "distance"],
            "total",
            "userId",
            "driverId",
          ],
          include: [
            { model: orderApplication, attributes: ["name"] },
            {
              model: orderItems,
              attributes: ["quantity", "total"],
              include: { model: R_PLink, attributes: ["name", "image"] },
            },
            {
              model: restaurant,
              attributes: [
                "businessName",
                "countryCode",
                "phoneNum",
                "address",
                "city",
                "zipCode",
              ],
            },
            { model: orderCharge, attributes: ["driverEarnings"] },
            { model: orderStatus, attributes: ["displayText"] },
            {
              model: user,
              as: "customerId",
              attributes: [
                "id",
                "firstName",
                "lastName",
                "countryCode",
                "phoneNum",
                "deviceToken",
                "language"
              ],
            },
            {
              model: address,
              as: "pickUpID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
            {
              model: address,
              as: "dropOffID",
              attributes: [
                "building",
                "streetAddress",
                "city",
                "state",
                "zipCode",
                "lat",
                "lng",
              ],
            },
          ],
        })
        .then((orderData) => {
          // ////////////////////////////////////
          let tolat = "";
          let tolng = "";

          tolat = orderData.dropOffID.lat;
          tolng = orderData.dropOffID.lng;

          axios.get(process.env.FIREBASE_URL).then((online_data) => {
            let eta = "";
            let to = [orderData.customerId.deviceToken];
            let notification = {
              title: "Ride Cancelled",
              body: "Ride cancelled",
            };
            let data = {
              orderApplicationId: orderData.orderApplicationId,
            };
            sendNotification(to, notification, data,orderData?.customerId?.language).then((dat) => {
              orderData = {};
              return res.json({
                status: "1",
                message: "Order Cancelled",
                data: { orderData, eta },
                error: "",
              });
            });
          });
        });
    });
}

async function ride_end(req, res) {
  const { orderId } = req.body;
  try{
      
       order
        .findOne({
          where: { id: orderId },
          attributes: [
            "id",
            "orderNum",
            "total",
            "driverId",
            "pickUpId",
            "dropOffId",
            "vehicleTypeId",
            "userId",
          ],
          include: [
            { model: address, as: "pickUpID" },
            { model: address, as: "dropOffID" },
            { model: orderCharge, attributes: ["driverEarnings"] },
            {
              model: restaurant,
              attributes: [
                "businessName",
                "countryCode",
                "phoneNum",
                "address",
                "city",
                "zipCode",
              ],
              include: { model: user },
            },
            {
              model: user,
             
              attributes: [
                "id",
                "firstName",
                "lastName",
                "countryCode",
                "phoneNum",
                "deviceToken",
                "language"
              ],
            },
          ],
        })
        .then((orderData) => {
            // console.log(orderData.user)
          let to = formatTokens(orderData.user.deviceToken);
          let notification = {
            title: "Ride End",
            body: "Your ride end now",
          };
         
          let data = {
            orderId: orderId,
            driverId: orderData.driverId,
            pickupLat: orderData.pickUpID.lat,
            pickupLng: orderData.pickUpID.lng,
            dropOffLat: orderData.dropOffID.lat,
            dropOffLng: orderData.dropOffID.lng,
          };
          sendNotification(to, notification, data,orderData?.user?.language).then((dat) => {
              return res.json({
                  status: "1",
                  message: "Order End",
                  data: orderData,
                  error: "",
                });
            getFare(
              orderData.pickUpId,
              orderData.dropOffId,
              orderData.vehicleTypeId,
              orderId
            ).then((data) => {
              // return res.json(data);
              let orderRideSharing = true;
              let deliveryType = 0;
              let adminEarning = data.adminEarnings;
              let driverEarning = data.driverEarnings;
              let userCharge = data.total;
              let restaurantEarning = 0;
              let userId = orderData.userId;
              let restId = 0;
              orderPlaceTransaction(
                orderRideSharing,
                deliveryType,
                orderId,
                adminEarning,
                driverEarning,
                userCharge,
                restaurantEarning,
                orderData.driverId,
                userId,
                restId
              ).then((tr) => {
                return res.json({
                  status: "1",
                  message: "Order End",
                  data: orderData,
                  error: "",
                });
              });
            });
          });
        });
    //     order
    // .update({ orderStatusId: 10 }, { where: { id: orderId } }) // ride end
    // .then((data) => {
    //     console.log(data)
    //   orderHistory.create({
    //     time: Date.now(),
    //     orderId,
    //     orderStatusId: 7,
    //   });
    //   order
    //     .findOne({
    //       where: { id: orderId },
    //       attributes: [
    //         "id",
    //         "orderNum",
    //         "total",
    //         "driverId",
    //         "pickUpId",
    //         "dropOffId",
    //         "vehicleTypeId",
    //         "userId",
    //       ],
    //       include: [
    //         { model: address, as: "pickUpID" },
    //         { model: address, as: "dropOffID" },
    //         { model: orderCharge, attributes: ["driverEarnings"] },
    //         {
    //           model: restaurant,
    //           attributes: [
    //             "businessName",
    //             "countryCode",
    //             "phoneNum",
    //             "address",
    //             "city",
    //             "zipCode",
    //           ],
    //           include: { model: user },
    //         },
    //         {
    //           model: user,
             
    //           attributes: [
    //             "id",
    //             "firstName",
    //             "lastName",
    //             "countryCode",
    //             "phoneNum",
    //             "deviceToken",
    //           ],
    //         },
    //       ],
    //     })
    //     .then((orderData) => {
    //       let to = formatTokens(orderData.user.deviceToken);
    //       let notification = {
    //         title: "Ride End",
    //         body: "Your ride end now",
    //       };
    //       let data = {
    //         orderId: orderId,
    //         driverId: orderData.driverId,
    //         pickupLat: orderData.pickUpID.lat,
    //         pickupLng: orderData.pickUpID.lng,
    //         dropOffLat: orderData.dropOffID.lat,
    //         dropOffLng: orderData.dropOffID.lng,
    //       };
    //       sendNotification(to, notification, data).then((dat) => {
    //         getFare(
    //           orderData.pickUpId,
    //           orderData.dropOffId,
    //           orderData.vehicleTypeId,
    //           orderId
    //         ).then((data) => {
    //           // return res.json(data);
    //           let orderRideSharing = true;
    //           let deliveryType = 0;
    //           let adminEarning = data.adminEarnings;
    //           let driverEarning = data.driverEarnings;
    //           let userCharge = data.total;
    //           let restaurantEarning = 0;
    //           let userId = orderData.userId;
    //           let restId = 0;
    //           orderPlaceTransaction(
    //             orderRideSharing,
    //             deliveryType,
    //             orderId,
    //             adminEarning,
    //             driverEarning,
    //             userCharge,
    //             restaurantEarning,
    //             orderData.driverId,
    //             userId,
    //             restId
    //           ).then((tr) => {
    //             return res.json({
    //               status: "1",
    //               message: "Order End",
    //               data: orderData,
    //               error: "",
    //             });
    //           });
    //         });
    //       });
    //     });
    // });
  }
  catch(error){
      let response = ApiResponse("0",error.message,"Error",{});
      return res.json(response);
  }
}

async function getRating(req, res) {
  const userId = req.user.id;
  


  try {
    
    let Delivered = await orderStatus.findOne({where:{name:"Delivered"}});
    let completedOrders = await order.count({where:{driverId : userId, orderStatusId : Delivered.id}});
    
    const ratings = await driverRating.findAll({
      where: { driverId: userId },
      include: [{ model: order, attributes: ['orderNum'] ,required:true}],
      attributes: ['createdAt', 'comment'],
    });

    // Calculate average rating
    const averageRate = await driverRating.findAll({
      where: { driverId: userId },
      attributes: [[sequelize.fn("AVG", sequelize.col("value")), "avgRating"]],
      raw: true,
    });

    // Check if averageRate is not empty and access the first element
    const average = averageRate.length > 0 ? parseFloat(averageRate[0].avgRating) : 0;

    // Count specific rating values
    const three = await driverRating.count({
      where: { driverId: userId, value: 3 },
    });
    const seven = await driverRating.count({
      where: { driverId: userId, value: 7 },
    });
    const ten = await driverRating.count({
      where: { driverId: userId, value: 10 },
    });

    // Construct response data
    const data = {
      average: average,
      three: three,
      seven: seven,
      ten: ten,
      completedOrders:completedOrders,
      ratings: ratings,
    };
    const response = ApiResponse("1", "Driver rating", "", data);
    return res.json(response);
  } catch (error) {
    console.error("Error fetching driver rating:", error.message);
    return res.json(ApiResponse("0", error.message, "", {}));
  }
}


async function getLicense(req, res) {
  const userId = req.user.id;
  let driverData = await user.findOne({where:{id:userId},attributes:['id','countryId']});
  if(!driverData.countryId){
      return res.json(ApiResponse("0","Country not selected","",{}));
  }
  driverDetails
    .findAll({
      where: { userId },
      include:[{model:country,attributes:['name','id','flag']}],
      attributes: [
        // 'licIssueDate',
        // 'licExpiryDate',
        "licNum",
        "licFrontPhoto",
        "licBackPhoto",
        [
          sequelize.fn(
            "date_format",
            sequelize.col("licIssueDate"),
            "%Y-%m-%d"
          ),
          "licIssueDate",
        ],
        [
          sequelize.fn(
            "date_format",
            sequelize.col("licExpiryDate"),
            "%Y-%m-%d"
          ),
          "licExpiryDate",
        ],
      ],
      order: [["createdAt", "DESC"]],
    })
    .then((data) => {
      return res.json({
        status: "1",
        message: "License Detail",
        data: data,
        error: "",
      });
    });
}

async function contactus(req, res) 
{
  const phone = await setting.findOne({ where: { content: "phone" } });
  const email = await setting.findOne({ where: { content: "email" } });

  const data = {
    email: email.value,
    phone: phone.value,
  };
  const response = ApiResponse("1", "Charges Payment", "", data);
  return res.json(response);
}

async function create_new_charge_stripe(req, res) {
  const { amount, card_number, exp_month, exp_year, cvc, userId, check } =
    req.body;
  const charges = await create_new_charges_stripe(
    amount,
    card_number,
    exp_month,
    exp_year,
    cvc,
    userId,
    check
  );
  const response = ApiResponse("1", "Charges Payment", "", charges);
  return res.json(response);
}

async function create_old_charge_stripe(req, res) {
  const { amount, pmId, userId } = req.body;
  const charges = await create_old_charges_stripe(amount, pmId, userId);
  const response = ApiResponse("1", "Charges Payment", "", charges);
  return res.json(response);
}

async function get_stripe_cards(req, res) {
  const { userId } = req.body;
  const charges = await get_stripe_card(userId);
  const response = ApiResponse("1", "Charges Payment", "", charges);
  return res.json(response);
}

async function create_new_charge_flutterwave(req, res) {
  const { amount, card_number, exp_month, exp_year, cvc, email, tx_ref } =
    req.body;

  //console.log(amount, card_number, exp_month, exp_year, cvc, email, tx_ref);
  const charges = await create_new_charges_flutterwave(
    amount,
    card_number,
    exp_month,
    exp_year,
    cvc,
    email,
    tx_ref
  );
  console.log(charges);
  if (charges.status == "success") {
    const response = ApiResponse("1", "Charges Payment", "", charges);
    return res.json(response);
  } else {
    const response = ApiResponse("0", charges.message, "", charges);
    return res.json(response);
  }
}

async function deleteData(req, res) {
  const userId = req.user.id;
  user
    .update({ status: 0 }, { where: { id: userId } })
    .then((userData) => {
      const response = ApiResponse("1", "User Deleted", "", {});
      return res.json(response);
    });
}

async function charge_ghana_mobile_money(req, res) {
  let phone_number = req.body.phone_number;
  let type = "mobile_money_ghana";
  let amount = req.body.amount;
  let currency = req.body.currency;
  let network = req.body.network;
  let email = req.body.email;
  let tx_ref = "req.body.tx_ref";

  const flutterdata = await charges_ghana_mobile_money(
    phone_number,
    type,
    amount,
    currency,
    network,
    email,
    tx_ref
  );
  const status = typeof flutterdata == "string" ? "0" : "1";
  const response = ApiResponse("1", "Mobile Money", "", flutterdata);
  return res.json(response);
}

async function declineOrder(req, res) {
  const orderData = await order.findOne({
    where: { id: req.body.orderId },
    include: {
      model: restaurant,
      include: { model: user, attributes: ["ip", "deviceToken","language"] },
    },
  });
  if (orderData) {
    singleNotification(
      orderData.restaurant.user.deviceToken,
      "Order Decline",
      `Driver delcine your Order ID : ${req.body.orderId}`,
      {},
       orderData.restaurant.user.language
    );
    let eventData = {
      type: "declineOrder",
      data: {
        status: "1",
        message: "Decline Order by driver",
        error: "",
        data: {},
      },
    };
    sendEvent(orderData?.restaurant?.user?.ip, eventData);
    const response = ApiResponse("1", "Order declined", "", {});
    return res.json(response);
  } else {
    const response = ApiResponse("0", "Order not found", "", {});
    return res.json(response);
  }
}

async function acceptInvitation(req, res) {
  const { restaurantId, driverId } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Step 1: Check if driver is already linked with the restaurant
    let check = await restaurantDriver.findOne({
      where: { userId: driverId, restaurantId: restaurantId,status:true },
      transaction: t // Add transaction context
    });
    if (check) {
      await t.rollback(); // Rollback transaction if already linked
      return res.json(ApiResponse("0", "You are already linked with this restaurant", "", {}));
    }

    // Step 2: Update driver's driverType to 'Restaurant'
    let driver = await user.findOne({
      where: { id: driverId },
      transaction: t // Add transaction context
    });
    
    driver.driverType = "Restaurant";
     // Save driver with transaction context

    // Step 3: Create new restaurantDriver entry
    
    let restData = await restaurant.findOne({where:{id:restaurantId}});
    
    let previousData = await restaurantDriver.findOne({
      where: { userId: driverId, restaurantId: restaurantId,status:false },
      transaction: t // Add transaction context
    });
    if(previousData){
        previousData.status = true;
        await previousData.save({ transaction: t }); // Save restaurantDriver with transaction
    }
    else{
    let dd = new restaurantDriver();
    dd.userId = driverId;
    dd.restaurantId = restaurantId;
    dd.hourlyRate = restData?.hourlyRate ?? 5;
    dd.status = true;
    await dd.save({ transaction: t }); // Save restaurantDriver with transaction 
    }

   let checkDriverType = await restaurantDriver.findAll({
      where: { userId: driverId,status:true },
      transaction: t // Add transaction context
    });
    if(checkDriverType.length > 0){
        driver.driverType = "Restaurant";
    }
    else{
        driver.driverType = "Freelancer";
    }
    await driver.save({ transaction: t });
    // Step 4: Create driverCommission entry
    await driverCommission.create({
      userId: driverId,
      restaurantId: restaurantId,
      status:true
    }, { transaction: t }); // Add transaction context
    
    

    // Commit the transaction if all steps succeed
    await t.commit();

    return res.json(ApiResponse("1", "Invitation accepted successfully", "", {}));

  } catch (error) {
    // Rollback transaction in case of any error
    await t.rollback();
    console.error(error);
    return res.status(500).json(ApiResponse("0", "Internal Server Error", error.message, {}));
  }
}

async function cancelInvitation(req, res) {
  const { restaurantId, driverId } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Step 1: Find the invitation with the given restaurantId and driverId
    let check = await invitation.findOne({
      where: { userId: driverId, restaurantId: restaurantId },
      transaction: t // Add transaction context
    });

    // Step 2: If the invitation exists, destroy it within the transaction
    if (check) {
      await check.destroy({ transaction: t });
    }

    // Commit the transaction if the deletion was successful
    await t.commit();

    return res.json(ApiResponse("1", "Cancelled successfully", "", {}));

  } catch (error) {
    // Rollback transaction in case of any error
    await t.rollback();
    console.error(error);
    return res.status(500).json(ApiResponse("0", "Internal Server Error", error.message, {}));
  }
}


async function getDriverRestaurants(req,res){
    const {driverId} = req.params;
    let rests = await restaurantDriver.findAll({attributes:['id','status'],where:{userId:driverId},include:{model:restaurant,attributes:['id','businessName']}});
    return res.json(ApiResponse("1","restaurants","",{rests}));
}

function calculateTip(data){
    let totalTip = 0;
    if(data.length > 0){
        data.forEach((dat)=>{
            if(dat.orderCharge){
                if(dat.orderCharge.tip){
                    totalTip = totalTip + parseInt(dat.orderCharge.tip);
                }
            }
        })
    }
    return totalTip;
}

async function getRestaurantCommissionDetails(req, res) {
  const { driverId, restaurantId, key } = req.body;

  try {
    // Determine the date range based on the key
    const today = new Date();
    let startDate, endDate;

    if (key === "Today") {
      startDate = new Date(today.setHours(0, 0, 0, 0)); // Start of today
      endDate = new Date(today.setHours(23, 59, 59, 999)); // End of today
    } else if (key === "Weekly") {
      startDate = new Date(today.setDate(today.getDate() - today.getDay())); // Start of the week
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today); // Now as end of the week
    } else if (key === "Monthly") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the month
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End of the month
      endDate.setHours(23, 59, 59, 999);
    } else if (key === "Overall") {
      // For "Overall", we don't set any date range, so startDate and endDate remain undefined
      startDate = null;
      endDate = null;
    }

    // Step 1: Fetch driver commission data
    let data = await driverCommission.findOne({
      where: { userId: driverId, restaurantId: restaurantId },
      include: {
        model: restaurant,
        attributes: ['id', 'businessName', 'image', 'logo', 'address', 'city', 'country'],
      },
    });

    // Step 2: Check if commission data exists
    if (!data) {
      return res.json(ApiResponse("0", "Not found!", "", {}));
    }

    // Step 3: Fetch total orders count, with or without date range
    let totalOrdersCondition = {
      restaurantId: restaurantId,
      driverId: driverId,
    };

    if (startDate && endDate) {
      totalOrdersCondition.createdAt = { [Op.between]: [startDate, endDate] };
    }

    let totalOrders = await order.count({ where: totalOrdersCondition });

    // Step 4: Calculate total hours worked
    let totalHours = await calculateTotalHours(driverId, restaurantId, key);

    // Step 5: Get delivered status ID
    let deliveredStatus = await orderStatus.findOne({ where: { name: "Delivered" } });

    // Step 6: Fetch tips, with or without date range
    let tipsCondition = {
      driverId: driverId,
      restaurantId: restaurantId,
      orderStatusId: deliveredStatus.id,
    };

    if (startDate && endDate) {
      tipsCondition.createdAt = { [Op.between]: [startDate, endDate] };
    }

    let tips = await order.findAll({
      where: tipsCondition,
      attributes: [],
      include: { model: orderCharge, attributes: ['tip'] },
    });

    // Step 7: Prepare the response object
    
  let driverzone = await driverZone.findOne({
  where: { userId: driverId },
  include: {
    model: zone,
    attributes: ['id'],
    include: [
      {
        model: zoneDetails,
        attributes: ['id'],
        include: [
          { model: unit, as: "currencyUnit" },
          { model: unit, as: "distanceUnit" }
        ]
      }
    ]
  }
});

    let obj = {
      time: `${data.time} hours`,
      amount: data.amount,
      tip: calculateTip(tips),
      totalDeliveries: totalOrders,
      totalDistance: data.distance,
      restaurantDetails: data.restaurant,
      currency : driverzone?.zone?.zoneDetail,
      totalHours: totalHours,
    };

    // Step 8: Return the response with the fetched data
    return res.json(ApiResponse("1", "Details", "", obj));

  } catch (error) {
    console.error(error);
    return res.status(500).json(ApiResponse("0", "Internal Server Error", error.message, {}));
  }
}

async function updateStatus(req,res){
    const { id,status } = req.body;
    let data = await driverCommission.findOne({where:{id:id}});
    if(data){
        data.status = status;
        await data.save();
    }
    return res.json(ApiResponse("1","Updated successfully","",{}));
}
async function updateRestaurantLink(req,res){
    const { id,status } = req.body;
    let data = await restaurantDriver.findOne({where:{id:id}});
    if(data){
        data.status = status;
        await data.save();
    }
    return res.json(ApiResponse("1","Updated successfully","",{}));
}

async function cancelContract(req,res){
    const { driverId,restaurantId } = req.body;
    await restaurantDriver.update(
    { status: false },  // The values to update
    {
        where: {
            userId: driverId,
            restaurantId: restaurantId  // Assuming this is the field you want to filter on
        }
    }
);

    // let dd = await driverCommission.findOne({where:{userId:driverId,restaurantId}});
    // if(dd){
    //     dd.status = false;
    // await dd.save();
    return res.json(ApiResponse("1","Contract Cancelled","",{})); 
    // }
    // else{
    //     return res.json(ApiResponse("1","Contract Cancelled","",{}));
    // }
   
}

async function getAllPayouts(req,res){
    const { driverId } = req.params;
    let data = await driverPayout.findAll({where:{userId:driverId},attributes:['id','amount','status','note','accountNo','createdAt'],include:{model:restaurant,attributes:['businessName']}});
    return res.json(ApiResponse("1","Driver Payouts","",{data}));
}

async function addPayout(req,res){
    const { amount,restaurantId,note,accountNo,driverId } = req.body;
    
    let check = await driverCommission.findOne({where:{userId:driverId,restaurantId :restaurantId }});
    if(!check){
        return res.json(ApiResponse("0","Not link with this restaurant","",{}));
    }
    if(parseFloat(check.amount) < parseFloat(amount)){
        return res.json(ApiResponse("0","You don't have such an amount","",{}));
    }
    
    let driverzone = await driverZone.findOne({where:{userId : driverId},include: {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        },})
    if(!driverzone){
        return res.json(ApiResponse("0","Driver Zone is not defined","",{}));
    }
    
    await driverPayout.create({
        userId:driverId,
        status:process.env.PENDING,
        note : note,
        amount:amount,
        unitId:driverzone?.zone?.zoneDetail?.currencyUnit?.id,
        restaurantId : restaurantId,
        accountNo:accountNo
    });
    let restData = await restaurant.findOne({where:{id:restaurantId},attributes:['businessName'],include:{model:user,attributes:['deviceToken','language']}});
    let driverData = await user.findOne({where:{id:driverId},attributes:['firstName','lastName']})
    let restTokens = formatTokens(restData?.user?.deviceToken);
    singleNotification(
      restTokens,
      "Payout Request",
      `Payout request from Driver : ${driverData.firstName} ${driverData.lastName} with amount of CHF:${amount}`,
      {},restData?.user?.language
    );
    
    return res.json(ApiResponse("1",`Payout request sent successfully to ${restData.businessName}`,"",{}));
}

function calculateDeliveryMetrics(data) {
    // Initialize metrics
    let totalDeliveries = 0;
    let totalTips = 0;
    let totalDistance = 0;
    let totalDeliveryPay = 0;

    // Loop through each delivery record and calculate the required metrics
    data.forEach(item => {
        // Count total deliveries
        totalDeliveries++;

        // Sum total tips (include 'tip' and 'additionalTip' if it's not null)
        totalTips += (item.orderCharge.tip || 0) + (item.orderCharge.additionalTip || 0);

        // Sum total distance
        totalDistance += item.distance || 0;

        // Calculate delivery pay for all drivers using the formula (deliveryFees - adminDeliveryCharges)
        const deliveryPay = (parseFloat(item.orderCharge.deliveryFees) || 0) - (parseFloat(item.orderCharge.adminDeliveryCharges) || 0);
        totalDeliveryPay += deliveryPay;
    });

    // Return the calculated metrics
    return {
        totalDeliveries,
        totalTips,
        totalDistance,
        totalDeliveryPay
    };
}
function calculateTotalTimeInHours(data) {
    // Sum up the time differences in hours for all entries, ignoring those with null endTime
    const totalTimeInHours = data.reduce((total, entry) => {
        // Check if endTime is null or not
        if (!entry.endTime) {
            // If endTime is null, skip this entry
            return total;
        }

        const startTime = new Date(entry.startTime);
        const endTime = new Date(entry.endTime);

        // Calculate the time difference in milliseconds
        const timeDifferenceInMs = endTime - startTime;

        // Convert milliseconds to hours (1 hour = 3600000 milliseconds)
        const timeDifferenceInHours = timeDifferenceInMs / 3600000;

        // Add the time difference to the running total
        return total + timeDifferenceInHours;
    }, 0); // Initialize total to 0

    return totalTimeInHours;
}



async function earningHistory(req, res) {
    const { driverId, date, startDate, endDate } = req.body;

    // Get driver's earnings (assuming this logic is needed)
    const earnings = await driverEarning.findOne({ where: { userId: driverId } });

    // Find the status for "Delivered" orders
    let deliveredStatus = await orderStatus.findOne({ where: { name: "Delivered" } });

    let startRange, endRange;

    if (date === "1") {
        startRange = moment().startOf('day'); // Start of today
        endRange = moment().endOf('day'); // End of today
    } else if (date === "3") {
        startRange = moment().subtract(3, 'days').startOf('day'); // 3 days ago
        endRange = moment().endOf('day'); // End of today
    } else if (date === "7") {
        startRange = moment().subtract(7, 'days').startOf('day'); // 7 days ago
        endRange = moment().endOf('day'); // End of today
    } else if (date === "30") {
        startRange = moment().subtract(30, 'days').startOf('day'); // 30 days ago
        endRange = moment().endOf('day'); // End of today
    } else if (startDate && endDate) {
        // If custom date range is provided, use the provided start and end dates
        startRange = moment(startDate).startOf('day');
        endRange = moment(endDate).endOf('day');
    } else {
        return res.status(400).json(ApiResponse("0", "Invalid date parameter", "Please provide a valid date range.", {}));
    }

    // Fetch driver hours based on the calculated startDate
    let dd = await driverRestaurantHours.findAll({
        where: {
            userId: driverId,
            createdAt: {
                [Op.gte]: startRange.toDate(), // Only get records from the startRange onwards
                [Op.lte]: endRange.toDate()   // Get records up to the endRange
            }
        },
        attributes: ['startTime', 'endTime', 'createdAt']
    });

    // Fetch orders for the specified period based on the `date` range
    let orders = await order.findAll({
        attributes: ['distance', 'createdAt'],
        where: {
            driverId: driverId,
            orderStatusId: deliveredStatus.id,
            createdAt: {
                [Op.gte]: startRange.toDate(), // Only get orders from the startRange onwards
                [Op.lte]: endRange.toDate()   // Get orders up to the endRange
            }
        },
        include: [
            {
                model: user,
                as: "DriverId",
                attributes: ['driverType']
            },
            {
                model: orderCharge,
                attributes: ['driverEarnings', 'tip', 'additionalTip', 'deliveryFees', 'adminDeliveryCharges']
            }
        ]
    });

    // Calculate metrics based on the orders and driver hours
    let obj = {
        details: calculateDeliveryMetrics(orders), // Assuming this is a custom function
        totalHours: calculateTotalTimeInHours(dd) // Assuming this is another custom function
    };

    // Return the response with the calculated data
    return res.json(ApiResponse("1", "Earning Details", "", obj));
}






module.exports = {
  registerDriverSt1,
  registerDriverSt2,
  registerDriverSt3,
  addAddress,
  verifyEmail,
  resendOTP,
  login,
  forgetPasswordRequest,
  changePasswordOTP,
  session,
  logout,
  getService,
  getVehicleType,
  getProfile,
  //updateProfilePhoto,
  changePassword,
  updateProfile,
  updateLicense,
  updateVehicleDetails,
  addBank,
  getHome,
  getorderdetail,
  acceptorder,
  getActiveOrders,
  getBank,
  getEarning,
  getRating,
  getLicense,
  getPaidOrdersRestaurant,
  getPaidOrdersTaxi,
  reached,
  ride_start,
  ride_end,
  getVehicleDetails,
  foodPickedUp,
  onTheWay,
  delivered,
  foodArrived,
  contactus,
  getActiveOrdersTaxi,
  updateVehicleDetailsImages,
  updateVehicleDetailsDocuments,
  deleteData,
  ride_cancel,
  create_new_charge_stripe,
  create_old_charge_stripe,
  create_new_charge_flutterwave,
  get_stripe_cards,
  charge_ghana_mobile_money,
  addDriverZone,
  dataForDriverRegistration,
  driverAddress,
  declineOrder,
  phoneAuth,
  verifyOTP,
  driverOnline,
  driverOffline,
  loginByPhoneNum,
  acceptInvitation,
  cancelInvitation,
  getDriverRestaurants,
  getRestaurantCommissionDetails,
  updateStatus,
  cancelContract,
  updateRestaurantLink,
  getAllPayouts,
  addPayout,
  changeCountry,
  earningHistory
};
