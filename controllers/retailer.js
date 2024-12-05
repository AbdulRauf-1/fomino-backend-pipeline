require("dotenv").config();
//importing Models
const {
  user,
  productStock,
  userType,
  role,
  collection,
  collectionAddons,
  productCollections,
  bogoDetail,
  freeDeliveryDetail,
  addressType,
  menuCategoryLanguage,
  restaurantOffers,
  restaurantBanners,
  driverCommission,
  excludeProducts,
  Credit,
  menuCategory,
  discountProducts,
  discountDetail,
  driverEarning,
  productAddons,
  orderCultery,
  zoneRestaurants,
  defaultValues,
  restaurantPayout,
  director,
  zone,
  restaurant_cultery,
  cutlery,
  zoneDetails,
  invitation,
  country,
  driverPayout,
  cusineRestaurant,
  city,
  cuisine,
  banner,
  time,
  paymentMethod,
  deliveryType,
  tableBooking,
  restaurantDriver,
  driverZone,
  unit,
  restaurant,
  deliveryFee,
  addOnCategory,
  addOn,
  product,
  R_PLink,
  P_AOLink,
  R_CLink,
  voucher,
  R_MCLink,
  vehicleType,
  wallet,
  order,
  orderType,
  RP_Link,
  orderStatus,
  driverDetails,
  serviceType,
  vehicleDetails,
  restaurantEarning,
  vehicleImages,
  driverRating,
  P_A_ACLink,
  orderApplication,
  orderMode,
  address,
  orderCharge,
  orderHistory,
  orderItems,
  orderAddOns,
  restaurantRating,
  configuration,
  payout,
} = require("../models");
const { sendEvent } = require("../socket_io");
// Importing Custom exception
const CustomException = require("../middlewares/errorObject");
const bcrypt = require("bcryptjs");
const { Op,fn, col, literal } = require("sequelize");
const sequelize = require("sequelize");
const redis_Client = require("../routes/redis_connect");
const { sign } = require("jsonwebtoken");
const sendNotification = require("../helper/notifications");
const orderPlaceTransaction = require("../helper/orderPlaceTransaction");
const paymentTransaction = require("../helper/paymentTransaction");
const eta_text = require("../helper/eta_text");
const { formatTokens } = require('../helper/getTokens');
const axios = require("axios");
const uuid = require("uuid");
const ApiResponse = require("../helper/ApiResponse");
const { response } = require("../routes/user");
const notifications = require("../helper/notifications");
const singleNotification = require("../helper/singleNotification");
const {sendSms} = require("../helper/twilloService");
const distance = require("../helper/distance");
const checkDriverOnline = require("../helper/checkDriverOnline");
const fs = require("fs").promises;
const turf = require('@turf/turf');
const { refundPayment } = require('./adyenPaymentController');
const SequelizeDB = require('../SequelizeDB');
 const GeoPoint = require('geopoint');
 const twilio = require('twilio');

 const apiKey =
  "AQEyhmfxLY7MYhxFw0m/n3Q5qf3Ve4JKBIdPW21YyXSkmW9OjdSfqGOv8cMc3yb6ZGJ2VbQQwV1bDb7kfNy1WIxIIkxgBw==-VqTivhbxpvY5+2ta4JEVhgUgPY0IKbxnw0NS8stIsHI=-i1iW@z33#+;L7m9K_jx";
const merchantAccount = "SigitechnologiesECOM";

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

//Module 1 - Auth
/*
        1. Sign Up
*/

async function addDeviceToken(userId, newToken) {
    
  try {
    // Find the user by ID
    const userData = await user.findOne({where:{id:userId}});

    if (!userData) {
      throw new Error('User not found');
    }

    // Initialize deviceTokens as an array if it's null, undefined, or not an array
    let tokens = [];
    if (userData.deviceToken) {
      try {
        tokens = JSON.parse(userData.deviceToken);
        if (!Array.isArray(tokens)) {
          tokens = [];
        }
      } catch (error) {
        // In case JSON.parse fails
        tokens = [];
      }
    }

    // Add the new token to the array if it's not already there
    if (!tokens.includes(newToken)) {
      tokens.push(newToken);
    }

    // Convert the array back to a string and save it
    userData.deviceToken = JSON.stringify(tokens);
    await userData.save();

    console.log('Device token added successfully.');
  } catch (error) {
    console.error('Error adding device token:', error.message);
  }
}

async function restSignUp(req, res) {
  const t = await SequelizeDB.transaction(); // Start transaction
  
  try {
    const {
      firstName,
      lastName,
      deliveryTime,
      email,
      CountryCode,
      phoneNum,
      password,
      confirmPassword,
      logo,
      coverImage,
      country,
      businessType,
      businessName,
      businessEmail,
      code,
      businessPhone,
      description,
      address,
      cityName,
      zipCode,
      deviceToken,
      lat,
      lng,
    } = req.body;
    
    // Validate lat and lng
    if (!lat || !lng) {
      await t.rollback();
      return res.json(ApiResponse("0", "Invalid latitude or longitude", "", {}));
    }
    let formattedCityName = cityName.replace(/\s+/g, ''); // Remove all spaces
    let cityData = await city.findOne({
      where: {
        name: {
          [Op.like]: `%${formattedCityName}%`
        }
      }
    });
    if(!cityData){
        let response = ApiResponse("0","City not found!","",{});
        return res.json(response);
    }
    // Determine the zone based on the lat/lng
    let Zid = "";
    let zones = await zone.findAll({where:{cityId:cityData.id}});
    const point = turf.point([lng, lat]); // Lat/Lng for checking point

    // Iterate through zones and check if point falls within the polygon
    for (const zoneData of zones) {
      if (zoneData.coordinates && Array.isArray(zoneData.coordinates.coordinates) && zoneData.coordinates.coordinates.length > 0) {
        const coordinates = zoneData.coordinates.coordinates.map(ring =>
          ring.map(point => [parseFloat(point[1]), parseFloat(point[0])]) // Convert to [longitude, latitude]
        );

        try {
          const zonePolygon = turf.polygon(coordinates); // Create polygon
          if (turf.booleanPointInPolygon(point, zonePolygon)) {
            Zid = zoneData.id;
            break;
          }
        } catch (err) {
          console.error(`Error processing zone ${zoneData.id}: ${err.message}`);
        }
      } else {
        console.error(`Invalid coordinates for zone ${zoneData.id}`);
      }
    }

    if (!Zid) {
      await t.rollback();
      return res.json(ApiResponse("0", "No zone found for the given coordinates.", "Error", {}));
    }

    // Proceed with the rest of the sign-up process...
    const requiredFields = [
      "firstName", "lastName", "email", "password", "confirmPassword",
      "businessType", "businessName","businessEmail", "businessPhone",
      "address", "cityName", "zipCode", "deviceToken", "lat", "lng",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        await t.rollback();
        const response = ApiResponse("0", `${field} is required`, `Please provide a value for ${field}`, {});
        return res.json(response);
      }
    }

    const userExist = await user.findOne({
      where: {
        [Op.or]: [{ email: email }, { [Op.and]: [{ countryCode: code }, { phoneNum: businessPhone }] }],
      },
      transaction: t,
    });
    if (userExist) {
      await t.rollback();
      const response = ApiResponse("0", "User exists", "The email or phone number you entered is already taken", {});
      return res.json(response);
    }

    const type = await userType.findOne({ where: { name: "Retailer" }, transaction: t });
    const businessTypeId = await orderApplication.findOne({ where: { name: businessType }, transaction: t });

    // Create the new user
    const newUser = await user.create({
      firstName,
      lastName,
      password: await bcrypt.hash(password, 10),
      email,
      countryCode: code,
      phoneNum: businessPhone,
      deviceToken,
      online: 0,
      status: true,
      userTypeId: type.id,
    }, { transaction: t });

    // Process logo and cover image paths
    let logoPath = req.files.logo[0]?.path.replace(/\\/g, "/");
    let imagePath = req.files.coverImage[0]?.path.replace(/\\/g, "/");
  
    // Fetch default values and create restaurant with buffered area as coordinates
    const [
      defaultDistanceUnitId,
      paymentMethodId,
      currencyUnitId,
      comission,
      deliveryCharge,
      deliveryTypeId,
      deliveryRadius,
      serviceCharge,
      deliveryFeeTypeId,
      packingFee,
      deliveryFeeFixed,
      approxDeliveryTime,
      VATpercent,
      serviceChargesType,
      ratePerHour,
      hourlyRate,
    ] = await Promise.all([
      defaultValues.findOne({ where: { name: "distanceUnitId" }, transaction: t }),
      defaultValues.findOne({ where: { name: "hourlyRate" }, transaction: t }),
      defaultValues.findOne({ where: { name: "paymentMethodId" }, transaction: t }),
      defaultValues.findOne({ where: { name: "currencyUnitId" }, transaction: t }),
      defaultValues.findOne({ where: { name: "comission" }, transaction: t }),
      defaultValues.findOne({ where: { name: "deliveryCharge" }, transaction: t }),
      defaultValues.findOne({ where: { name: "deliveryTypeId" }, transaction: t }),
      defaultValues.findOne({ where: { name: "deliveryRadius" }, transaction: t }),
      defaultValues.findOne({ where: { name: "serviceCharge" }, transaction: t }),
      defaultValues.findOne({ where: { name: "deliveryFeeTypeId" }, transaction: t }),
      defaultValues.findOne({ where: { name: "packingFee" }, transaction: t }),
      defaultValues.findOne({ where: { name: "deliveryFeeFixed" }, transaction: t }),
      defaultValues.findOne({ where: { name: "approxDeliveryTime" }, transaction: t }),
      defaultValues.findOne({ where: { name: "VATpercent" }, transaction: t }),
      defaultValues.findOne({ where: { name: "serviceChargesType" }, transaction: t }),
      defaultValues.findOne({ where: { name: "ratePerHour" }, transaction: t }),
    ]);
    // const restaurantPoint = turf.point([parseFloat(lat),parseFloat(lng)]);

    // const bufferedArea = turf.buffer(restaurantPoint, 10, { units: 'kilometers' });

    // const polygonCoordinates = bufferedArea.geometry.coordinates;

    const newRest = await restaurant.create({
      businessName: businessName ?? "",
      businessEmail: businessEmail ?? "",
      countryCode: code ?? "",
      name: `${firstName ?? ""} ${lastName ?? ""}`,
      email: email ?? "",
      phoneNum: businessPhone ?? "",
      description: description ?? "",
      city: cityName ?? "",
      zipCode: zipCode ?? "",
      lat: lat ?? "",
      lng: lng ?? "",
      approxDeliveryTime: approxDeliveryTime?.value ?? deliveryTime ?? "",
      minOrderAmount: 10,
      deliveryFeeFixed: deliveryFeeFixed?.value ?? 25,
      deliveryTypeId: deliveryTypeId?.value ?? 1,
      serviceCharges: serviceCharge?.value ?? 15,
      deliveryRadius: deliveryRadius?.value ?? 10,
      unitId: defaultDistanceUnitId?.value ?? 1,
      country,
      isPureVeg: 0,
      pickupTime: 20,
      isOpen: 1,
      businessType: businessTypeId?.id ?? 0,
      comission: comission?.value ?? 10,
      VATpercent: VATpercent?.value ?? 0,
      paymentMethodId: paymentMethodId?.value ?? 1,
      address: address ?? "",
      userId: newUser.id,
      distanceUnitId: defaultDistanceUnitId?.value ?? 1,
      currencyUnitId: currencyUnitId?.value ?? 1,
      hourlyRate: hourlyRate?.value ?? 5,
      status: true,
      logo: logoPath ?? "",
      image: imagePath ?? "",
    //   coordinates: {
    //     type: 'Polygon',
    //     coordinates: polygonCoordinates,
    //   },
    }, { transaction: t });

    await restaurantEarning.create({
      totalEarning: 0,
      availableBalance: 0,
      restaurantId: newRest.id,
    }, { transaction: t });

    await zoneRestaurants.create({
      restaurantId: newRest.id,
      zoneId: Zid,
      status: true,
    }, { transaction: t });
    await configuration.create({
      restaurantId: newRest.id,
      isOpen_pickupOrders: true,
      isOpen_deliveryOrders: true,
      isOpen_schedule_pickupOrders: true,
      isOpen_schedule_deliveryOrders: true,
      isClose_schedule_pickupOrders: true,
      isClose_schedule_deliveryOrders: true,
      temporaryClose_pickupOrders: true,
      temporaryClose_schedule_pickupOrders: true,
      temporaryClose_schedule_deliveryOrders: true,
      isRushMode_pickupOrders: true,
      isRushMode_deliveryOrders: true,
      isRushMode_schedule_pickupOrders: true,
      isRushMode_schedule_deliveryOrders: true,
      delivery: true,
      takeAway: true,
      scheduleOrders: true,
      tableBooking: true,
      stampCard: true,
      euro: true,
      print: true,
      cod: true,
      selfDelivery: true,
      incommingOrdersSound: true,
      readyOrdersSound: true,
      tableBookingSound: true,
      isGroupOrder: true,
      cutlery:false,
      status: true,
    }, { transaction: t });
    
     const timeData = [
              {
                name: "sunday",
                startAt: "01:00",
                endAt: "23:00",
                day: "0",
              },
              {
                name: "friday",
                 startAt: "01:00",
                endAt: "23:00",
                day: "5",
              },
              {
                name: "wednesday",
                  startAt: "01:00",
                endAt: "23:00",
                day: "3",
              },
              {
                name: "monday",
                 startAt: "01:00",
                endAt: "23:00",
                day: "1",
              },
              {
                name: "tuesday",
                 startAt: "01:00",
                endAt: "23:00",
                day: "2",
              },
              {
                name: "thursday",
                 startAt: "01:00",
                endAt: "23:00",
                day: "4",
              },
              {
                name: "saturday",
                 startAt: "01:00",
                endAt: "23:00",
                day: "6",
              },
            ];
            timeData.map(async (data) => {
                
              await time.create({
                  name:data.name,
                  startAt:data.startAt,
                  endAt:data.endAt,
                  restaurantId : newRest.id,
                  status:true,
                  day:data.day
              })    
            });
            
    await menuCategoryLanguage.create({
        restaurantId : newRest.id,
        language:"en",
        status:true
    })        

    await t.commit();

    const userData = {
      id: newUser.id,
      restaurantId: newRest.id.toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phoneNum: newUser.phoneNum,
      accessToken: "",
    };
    return res.json(ApiResponse("1", "Signup successfully!", "", userData));

  } catch (error) {
    await t.rollback();
    return res.json(ApiResponse("0", error.message, "Error", {}));
  }
}

const createAccountHolder = async () => {
 
  const data = {
  "accountHolderCode": "YOUR_UNIQUE_ACCOUNT_HOLDER_CODE",
  "accountHolderDetails": {
    "address": {
      "country": "US"
    },
    "businessDetails": {
      "doingBusinessAs": "Real Good Restaurant",
      "legalBusinessName": "Real Good Restaurant Inc.",
      "shareholders": [
        {
          "shareholderType": "Controller",
          "name": {
            "firstName": "John",
            "lastName": "Carpenter"
          },
          "address": {
            "country": "NL"
          },
          "email": "testshareholder@email.com"
        }
      ]
    },
    "email": "test@email.com",
    "webAddress": "https://www.your-website.com"
  },
  "legalEntity": "Business"
}

  try {
    const response = await axios.post('https://cal-test.adyen.com/cal/services/Account/v6/createAccountHolder', data, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    console.log('Account Holder Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating account holder:', error);
  }
};

async function addDirector(req, res) {
  const { 
    firstName,
    lastName,
    dob,
    streetAddress,
    zip,
    city,
    country,
    bankName,
    accountHolderName,
    accountNo,
    IBAN,
    swiftCode,
    bankAddress,
    bankCountry,
    restaurantId
  } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction
  try {
    let check = await director.findOne({ where: { restaurantId: restaurantId }, transaction: t });

    if (check) {
      check.firstName = firstName;
      check.lastName = lastName;
      check.dob = dob;
      check.streetAddress = streetAddress;
      check.zip = zip;
      check.city = city;
      check.country = country;
      check.bankName = bankName;
      check.accountHolderName = accountHolderName;
      check.accountNo = accountNo;
      check.IBAN = IBAN;
      check.swiftCode = swiftCode;
      check.bankAddress = bankAddress;
      check.status = 1;
      check.bankCountry = bankCountry;
      check.restaurantId = restaurantId;

      await check.save({ transaction: t }); // Save with transaction context
    } else {
      let dir = await director.create({
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        streetAddress: streetAddress,
        zip: zip,
        city: city,
        country: country,
        bankName: bankName,
        accountHolderName: accountHolderName,
        accountNo: accountNo,
        IBAN: IBAN,
        swiftCode: swiftCode,
        bankAddress: bankAddress,
        status: 1,
        bankCountry: bankCountry,
        restaurantId: restaurantId,
      }, { transaction: t }); // Create with transaction context
    }

    await t.commit(); // Commit the transaction if everything is successful
    let response = ApiResponse("1", "Director added successfully", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    let response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}

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
      accessToken: `${accessToken}`,
    },
    error: "",
  };
};
/*
        2. Sign In
*/
async function restSignIn(req, res) {
  const { email, password, deviceToken } = req.body;
  const requiredFields = ["email", "password", "deviceToken"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field.toUpperCase()} is required`,
        `Please provide a value for ${field.toUpperCase()}`,
        {}
      );
      return res.json(response);
    }
  }
  const retailerType = await userType.findOne({
    where: {
      name: "Retailer",
    },
  });
  const storeType = await userType.findOne({
    where: {
      name: "Store owner",
    },
  });

  // new user add kia
  const userExist = await user.findOne({
    where: {
      email: email,
      [Op.or]: [
        {
          userTypeId: retailerType.id,
        },
        {
          userTypeId: storeType.id,
        },
      ],
    },
    include: [
      {
        model: restaurant,
      },
    ],
  });
  if (!userExist) {
    const response = ApiResponse(
      "0",
      "No user exist",
      "Trying to sign up",
      "",
      {}
    );
    return res.json(response);
  }
  if (userExist.restaurants.length == 0) {
    const response = ApiResponse(
      "2",
      "Sorry No Restaurant registered against this email address",
      "",
      {}
    );
    return res.json(response);
  }
  if (!userExist.restaurants[0]?.status) {
    const response = ApiResponse(
      "0",
      "Sorry! You are blocked from Admin",
      "",
      {}
    );
    return res.json(response);
  }
  let match = await bcrypt.compare(password, userExist.password);
  if (!match) {
    const response = ApiResponse(
      "0",
      "Invalid Credentials",
      "Wrong credentials",
      {}
    );
    return res.json(response);
  }
  if (!userExist.status) {
    const response = ApiResponse(
      "0",
      "Waiting for approval by admin",
      "In case of query . Contact Admin",
      {}
    );
    return res.json(response);
  }
  await addDeviceToken(userExist.id,deviceToken);
//   let tokens;
//     if (userExist.deviceToken === null) {
//       tokens = [];
//     } else {
//       // Parse the existing deviceTokens field into an array
//       tokens = JSON.parse(userExist.deviceToken);
//     }

//     // Add the new token to the array if it's not already there
//     if (!tokens.includes(deviceToken)) {
//       tokens.push(deviceToken);
//     }
  
//   user.update(
//     {
//       deviceToken: JSON.stringify(tokens),
//     },
//     {
//       where: {
//         id: userExist.id,
//       },
//     }
//   );
  const accessToken = sign(
    {
      id: userExist.id,
      email: userExist.email,
      deviceToken: deviceToken,
    },
    process.env.JWT_ACCESS_SECRET
  );
  await redis_Client.hSet(`fom${userExist.id}`, deviceToken, accessToken);

  const output = loginData(userExist, accessToken);
  const data = {
    userId: `${userExist.id}`,
    //   userName: `${userExist.userName}`,
    firstName: `${userExist.firstName}`,
    lastName: `${userExist.lastName}`,
    email: `${userExist.email}`,
    accessToken: `${accessToken}`,
    logo: userExist.restaurants[0]?.logo,
    image: userExist.restaurants[0]?.image,
    restaurantId: userExist.restaurants[0]?.id,
    businessName: userExist.restaurants[0]?.businessName,
    businessEmail: userExist.restaurants[0]?.businessEmail,
    businessType: userExist.restaurants[0]?.businessType,
    businessCountryCode: userExist.restaurants[0]?.countryCode,
    businessPhone: userExist.restaurants[0]?.phoneNum,
    city: userExist.restaurants[0]?.city,
    country: userExist.restaurants[0]?.country,
    lat: userExist.restaurants[0]?.lat,
    lng: userExist.restaurants[0]?.lng,
    zipCode: userExist.restaurants[0]?.zipCode,
    address: userExist.restaurants[0]?.address,
    description: userExist.restaurants[0]?.description,
  };
  const response = ApiResponse("1", "Login Successfully!", "", data);
  return res.json(response);
}
/*
        2. Get distance between two locations in km
*/
function getDistance(userLat, userLng, orderLat, orderLng) {
  let earth_radius = 6371;
  let dLat = (Math.PI / 180) * (orderLat - userLat);
  let dLon = (Math.PI / 180) * (orderLng - userLng);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((Math.PI / 180) * orderLat) *
      Math.cos((Math.PI / 180) * orderLat) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  let c = 2 * Math.asin(Math.sqrt(a));
  let d = earth_radius * c;
  return d;
}
async function home(req, res) {
  try {
    const userData = await user.findOne({
      where: {
        id: req.user.id,
      },
      include: {
        model: restaurant,
        include: {
          model: zoneRestaurants,
        },
      },
    });

    const fireBase = await axios.get(process.env.FIREBASE_URL);

    const zoneDrivers = await driverZone.findAll({
      where: {
        zoneId: userData.restaurants[0]?.zoneRestaurant?.zoneId,
      },
    });

    let distanceList = [];
    let timeList = [];

    if (fireBase?.data) {
      if (zoneDrivers.length > 0) {
        await Promise.all(
          zoneDrivers.map(async (driver) => {
            let checkDriver = fireBase.data[driver.userId];
            if (checkDriver) {
              const distance = getDistance(
                userData.restaurants[0].lat,
                userData.restaurants[0].lng,
                checkDriver.lat,
                checkDriver.lng
              );
              let etaTime = await eta_text(
                userData.restaurants[0].lat,
                userData.restaurants[0].lng,
                checkDriver.lat,
                checkDriver.lng
              );
              distanceList.push(distance);
              timeList.push(etaTime);
            }
          })
        );
      }
    }
    const smallestNumber = Math.min(...distanceList);
    const index = distanceList.indexOf(smallestNumber);
    const restaurantId = userData.restaurants[0].id;
    const mode = await orderMode.findOne({
      where: {
        name: "Scheduled",
      },
    });
    const ordertype = await orderType.findOne({
      where: {
        type: "Normal",
      },
    });
    const standardMode = await orderMode.findOne({
      where: {
        name: "Standard",
      },
    });
    const incommingStatus = await orderStatus.findOne({
      where: {
        name: "Placed",
      },
    });
    const acceptStatus = await orderStatus.findOne({
      where: {
        name: "Accepted",
      },
    });
    const outgoingStatus = await orderStatus.findOne({
      where: {
        name: "Preparing",
      },
    });
    const readyStatus = await orderStatus.findOne({
      where: {
        name: "Ready for delivery",
      },
    });
    const codMethod = await paymentMethod.findOne({
      where: {
        name: "COD",
      },
    });

    const scheduleOrders = await order.findAll({
      where: {
        orderTypeId: ordertype.id,
        restaurantId: restaurantId,
        orderModeId: mode.id,
        orderStatusId: acceptStatus.id,
      },
      include: [
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "firstName",
            "lastName",
            "email",
            "countryCode",
            "phoneNum",
          ],
        },
        {
          model: orderMode,
        },
        {
          model: orderItems,
          include: [
            {
              model: R_PLink,
            },
            {
              model: orderAddOns,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          ],
        },
      ],
    });

    const incomming_orders = await order.findAll({
      order: [["updatedAt", "DESC"]],
      where: {
        restaurantId: restaurantId,
        orderStatusId: incommingStatus.id,
        [sequelize.Op.or]: [
          {
            paymentMethodId: codMethod.id,
          },
          {
            [sequelize.Op.and]: [
              { paymentRecieved: true },
              { paymentConfirmed: true },
            ],
          },
        ],
      },
      include: [
        {
          model: orderItems,
        },
        {
          model: orderStatus,
        },
        {
          model: orderMode,
        },
        {
            model: orderCultery,
        },
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "firstName",
            "lastName",
            "email",
            "countryCode",
            "phoneNum",
          ],
        },
        {
          model: orderItems,
          include: [
            {
              model: R_PLink,
            },
            {
              model: orderAddOns,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          ],
        },
      ],
    });

    const outgoing_orders = await order.findAll({
      order: [["updatedAt", "ASC"]],
      where: {
        restaurantId: restaurantId,
        orderStatusId: outgoingStatus.id,
        [sequelize.Op.or]: [
          {
            paymentMethodId: codMethod.id,
          },
          {
            [sequelize.Op.and]: [
              { paymentRecieved: true },
              { paymentConfirmed: true },
            ],
          },
        ],
        [sequelize.Op.or]: [
          {
            orderModeId: mode.id,
          },
          {
            orderModeId: standardMode.id,
          },
        ],
       
      },
      include: [
          {model:user,as:"DriverId",attributes:['id','firstName','lastName','image','countryCode','phoneNum']},
        {
          model: orderHistory,
          where: {
            orderStatusId: acceptStatus.id,
          },
          include: {
            model: orderStatus,
            attributes: ["name"],
          },
        },
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "firstName",
            "lastName",
            "email",
            "countryCode",
            "phoneNum",
          ],
        },
        {
          model: orderMode,
        },
        {
          model: orderItems,
          include: [
            {
              model: R_PLink,
            },
            {
              model: orderAddOns,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          ],
        },
      ],
    });

    const ready_orders = await order.findAll({
      where: {
        restaurantId: restaurantId,
        orderStatusId: readyStatus.id,
        [sequelize.Op.or]: [
          {
            paymentMethodId: codMethod.id,
          },
          {
            [sequelize.Op.and]: [
              { paymentRecieved: true },
              { paymentConfirmed: true },
            ],
          },
        ],
      },
      include: [
          {model:user,as:"DriverId",attributes:['id','firstName','lastName','image','countryCode','phoneNum']},
        {
          model: orderMode,
        },
        {
          model: restaurant,
          attributes: ["id", "lat", "lng"],
        },
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "firstName",
            "lastName",
            "email",
            "countryCode",
            "phoneNum",
          ],
        },
        {
          model: orderItems,
          include: [
            {
              model: R_PLink,
            },
            {
              model: orderAddOns,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          ],
        },
      ],
    });

    const tableBookingsPlaced = await tableBooking.findAll({
      where: {
        restaurantId: restaurantId,
        orderStatusId: incommingStatus.id,
      },
      include: [
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "countryCode",
            "phoneNum",
            "email",
            "firstName",
            "lastName",
          ],
        },
      ],
    });

    const tableBookingsAccepted = await tableBooking.findAll({
      where: {
        restaurantId: restaurantId,
        orderStatusId: acceptStatus.id,
      },
      include: [
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "countryCode",
            "phoneNum",
            "email",
            "firstName",
            "lastName",
          ],
        },
      ],
    });

    let list = [];
    let firebaseData = await axios.get(process.env.FIREBASE_URL);
    if (ready_orders.length > 0) {
      for (const order of ready_orders) {
        let driverLatLng = firebaseData?.data[order.driverId];
        let distance = await eta_text(
          order.restaurant?.lat,
          order.restaurant?.lng,
          driverLatLng?.lat,
          driverLatLng?.lng
        );
        let obj = {
          est_time: distance === "" ? "0 mins" : distance,
          order,
        };
        list.push(obj);
      }
    }
    let config = await configuration.findOne({
      where: { restaurantId: userData.restaurants[0].id },
      attributes: ['selfDelivery'],
    });

    const data = {
      incomming_orders,
      ready_orders: list,
      scheduleOrders: scheduleOrders,
      outgoing_orders,
      nearest_pickup_time:
        timeList.length > 0
          ? timeList[index] === ""
            ? "0"
            : timeList[index]
          : "5 minutes",
      isRushMode:
        userData.restaurants[0]?.isRushMode == null ||
        userData.restaurants[0]?.isRushMode == false
          ? false
          : true,
      isOpen:
        userData?.restaurants[0]?.isOpen == null
          ? false
          : userData?.restaurants[0]?.isOpen,
      tableBookingsPlaced,
      tableBookingsAccepted,
      configuration: config ? config : null,
    };

    const response = ApiResponse("1", "Get Data", "", data);
    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json(ApiResponse("0", "Internal Server Error", error.message));
  }
}

async function homeData(restId) {
  try {
    let restData = await restaurant.findOne({
      where: { id: restId },
      include: { model: user },
    });

    const userData = await user.findOne({
      where: {
        id: restData.user.id,
      },
      include: {
        model: restaurant,
        include: {
          model: zoneRestaurants,
        },
      },
    });

    const fireBase = await axios.get(process.env.FIREBASE_URL);
    const zoneDrivers = await driverZone.findAll({
      where: {
        zoneId: userData.restaurants[0]?.zoneRestaurant?.zoneId,
      },
    });

    let distanceList = [];
    let timeList = [];

    if (fireBase?.data) {
      if (zoneDrivers.length > 0) {
        await Promise.all(
          zoneDrivers.map(async (driver) => {
            let checkDriver = fireBase.data[driver.userId];
            if (checkDriver) {
              const distance = getDistance(
                userData.restaurants[0].lat,
                userData.restaurants[0].lng,
                checkDriver.lat,
                checkDriver.lng
              );
              let etaTime = await eta_text(
                userData.restaurants[0].lat,
                userData.restaurants[0].lng,
                checkDriver.lat,
                checkDriver.lng
              );
              distanceList.push(distance);
              timeList.push(etaTime);
            }
          })
        );
      }
    }

    const smallestNumber = Math.min(...distanceList);
    const index = distanceList.indexOf(smallestNumber);
    const restaurantId = userData.restaurants[0].id;

    const mode = await orderMode.findOne({
      where: {
        name: "Scheduled",
      },
    });
    const ordertype = await orderType.findOne({
      where: {
        type: "Normal",
      },
    });
    const standardMode = await orderMode.findOne({
      where: {
        name: "Standard",
      },
    });
    const incommingStatus = await orderStatus.findOne({
      where: {
        name: "Placed",
      },
    });
    const acceptStatus = await orderStatus.findOne({
      where: {
        name: "Accepted",
      },
    });
    const outgoingStatus = await orderStatus.findOne({
      where: {
        name: "Preparing",
      },
    });
    const readyStatus = await orderStatus.findOne({
      where: {
        name: "Ready for delivery",
      },
    });
    const codMethod = await paymentMethod.findOne({
      where: {
        name: "COD",
      },
    });

    const scheduleOrders = await order.findAll({
      where: {
        orderTypeId: ordertype.id,
        restaurantId: restaurantId,
        orderModeId: mode.id,
        orderStatusId: acceptStatus.id,
      },
      include: [
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "firstName",
            "lastName",
            "email",
            "countryCode",
            "phoneNum",
          ],
        },
        {
          model: orderMode,
        },
        {
          model: orderItems,
          include: [
            {
              model: R_PLink,
            },
            {
              model: orderAddOns,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          ],
        },
      ],
    });

    const incomming_orders = await order.findAll({
      order: [["updatedAt", "DESC"]],
      where: {
        restaurantId: restaurantId,
        orderStatusId: incommingStatus.id,
        [sequelize.Op.or]: [
          {
            paymentMethodId: codMethod.id,
          },
          {
            [sequelize.Op.and]: [
              { paymentRecieved: true },
              { paymentConfirmed: true },
            ],
          },
        ],
      },
      include: [
        {
          model: orderItems,
        },
        {
          model: orderStatus,
        },
        {
          model: orderMode,
        },
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "firstName",
            "lastName",
            "email",
            "countryCode",
            "phoneNum",
          ],
        },
        {
          model: orderItems,
          include: [
            {
              model: R_PLink,
            },
            {
              model: orderAddOns,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          ],
        },
      ],
    });

    const outgoing_orders = await order.findAll({
      order: [["updatedAt", "ASC"]],
      where: {
        restaurantId: restaurantId,
        orderStatusId: outgoingStatus.id,
        [sequelize.Op.or]: [
          {
            paymentMethodId: codMethod.id,
          },
          {
            [sequelize.Op.and]: [
              { paymentRecieved: true },
              { paymentConfirmed: true },
            ],
          },
        ],
        [sequelize.Op.or]: [
          {
            orderModeId: mode.id,
          },
          {
            orderModeId: standardMode.id,
          },
        ],
       
      },
      include: [
          {model:user,as:"DriverId",attributes:['id','firstName','lastName','countryCode','phoneNum','image','email']},
        {
          model: orderHistory,
          where: {
            orderStatusId: acceptStatus.id,
          },
          include: {
            model: orderStatus,
            attributes: ["name"],
          },
        },
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "firstName",
            "lastName",
            "email",
            "countryCode",
            "phoneNum",
          ],
        },
        {
          model: orderMode,
        },
        {
          model: orderItems,
          include: [
            {
              model: R_PLink,
            },
            {
              model: orderAddOns,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          ],
        },
      ],
    });

    const ready_orders = await order.findAll({
      where: {
        restaurantId: restaurantId,
        orderStatusId: readyStatus.id,
        [sequelize.Op.or]: [
          {
            paymentMethodId: codMethod.id,
          },
          {
            [sequelize.Op.and]: [
              { paymentRecieved: true },
              { paymentConfirmed: true },
            ],
          },
        ],
      },
      include: [
          {model:user,as:"DriverId",attributes:['id','firstName','lastName','countryCode','phoneNum','image','email']},
        {
          model: orderMode,
        },
        {
          model: restaurant,
          attributes: ["id", "lat", "lng"],
        },
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "firstName",
            "lastName",
            "email",
            "countryCode",
            "phoneNum",
          ],
        },
        {
          model: orderItems,
          include: [
            {
              model: R_PLink,
            },
            {
              model: orderAddOns,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          ],
        },
      ],
    });

    const tableBookingsPlaced = await tableBooking.findAll({
      where: {
        restaurantId: restaurantId,
        orderStatusId: incommingStatus.id,
      },
      include: [
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "countryCode",
            "phoneNum",
            "email",
            "firstName",
            "lastName",
          ],
        },
      ],
    });

    const tableBookingsAccepted = await tableBooking.findAll({
      where: {
        restaurantId: restaurantId,
        orderStatusId: acceptStatus.id,
      },
      include: [
        {
          model: user,
          attributes: [
            "id",
            "userName",
            "countryCode",
            "phoneNum",
            "email",
            "firstName",
            "lastName",
          ],
        },
      ],
    });

    let list = [];
    let firebaseData = await axios.get(process.env.FIREBASE_URL);
    if (ready_orders.length > 0) {
      for (const order of ready_orders) {
        let driverLatLng = firebaseData?.data[order.driverId];
        let distance = await eta_text(
          order.restaurant?.lat,
          order.restaurant?.lng,
          driverLatLng?.lat,
          driverLatLng?.lng
        );
        let obj = {
          est_time: distance === "" ? "0 mins" : distance,
          order,
        };
        list.push(obj);
      }
    }

    let config = await configuration.findOne({
      where: { restaurantId: userData.restaurants[0].id },
      attributes: ['selfDelivery'],
    });
    const data = {
      incomming_orders,
      ready_orders: list,
      scheduleOrders: scheduleOrders,
      outgoing_orders,
      configuration:config,
      nearest_pickup_time:
        timeList.length > 0
          ? timeList[index] === ""
            ? "0"
            : timeList[index]
          : "5 minutes",

      isRushMode:
        userData.restaurants[0]?.isRushMode == null ||
        userData.restaurants[0]?.isRushMode == false
          ? false
          : true,
      isOpen:
        userData?.restaurants[0]?.isOpen == null
          ? false
          : userData?.restaurants[0]?.isOpen,

      tableBookingsPlaced,
      tableBookingsAccepted,
    };
    return data;
    //   const response = ApiResponse("1", "Get Data", "", data);
    //   return res.json(response);
  } catch (error) {
    return {};
  }
}

async function scheduleOrder_to_Outgoing(req, res) {
  const { orderId } = req.body;
  if (!orderId) {
    const response = ApiResponse(
      "0",
      `Order ID is required`,
      `Please provide a value for Order ID`,
      {}
    );
    return res.json(response);
  }
  // const ordertype = await orderType.findOne({where:{type:"Normal"}});
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include:{model:restaurant,attributes:['id'],include:{model:user,attributes:['id','ip']}}
  });
  if (orderData) {
    const mode = await orderMode.findOne({
      where: {
        name: "Scheduled",
      },
    });
    //   if(orderData.orderModeId == mode.id){
    //     const apiDate = orderData.scheduleDate;
    //     const apiDateTime = new Date(apiDate);
    //     const currentDateTime = new Date();
    //     // if (currentDateTime < apiDateTime){
    //     //     const response = ApiResponse("0","Sorry you cannot start preparing before schedule Date&Time","",{});
    //     //     return res.json(response);
    //     // }
    //   }

    const status = await orderStatus.findOne({
      where: {
        name: "Preparing",
      },
    });
    orderData.orderStatusId = status.id;
    orderData
      .save()
      .then(async (dat) => {
        let time = Date.now();
        orderHistory.create({
          time,
          orderId: orderData.id,
          orderStatusId: status.id,
        });
        
        homeData(orderData.restaurantId).then((dat)=>{
         let eventDataForRetailer = {
          type: "rejectBookTableRequest",
          data: {
            status: "1",
            message: "Data",
            error: "",
            data: dat,
          },
        };
        sendEvent(orderData?.restaurant?.user?.id,eventDataForRetailer)
    })
    .catch((error)=>{
        console.log(error)
    })
        
        const response = ApiResponse(
          "1",
          `Schedule Order ID : ${orderId} has been set for outgoing`,
          "",
          {}
        );
        return res.json(response);
      })
      .catch((error) => {
        const response = ApiResponse("0", error.message, "Error", {});
        return res.json(response);
      });
  } else {
    const response = ApiResponse("0", "Sorry order not found!", "Error", {});
    return res.json(response);
  }
}

async function acceptOrder(req, res) {
  const { orderId, restaurantId, customTime } = req.body;
  const requiredFields = ["orderId", "restaurantId", "customTime"];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field} is required`,
        `Please provide a value for ${field}`,
        {}
      );
      return res.json(response);
    }
  }
  const dd = await order.findOne({
    where: {
      id: orderId,
    },
    include: [
      {
        model: address,
        as: "dropOffID",
      },
      {
        model: restaurant,
      },
      {
        model: user,
        attributes: ["id", "deviceToken", "ip","language"],
      },
    ],
  });
  if (dd) {
    const restData = await restaurant.findOne({
      where: {
        id: restaurantId,
      },
      include: { model: user, attributes: ["ip","id"] },
      attributes: ["approxDeliveryTime", "lat", "lng"],
    });
    let etaText = await eta_text(
      restData?.lat,
      restData?.lng,
      dd.dropOffID?.lat,
      dd.dropOffID?.lng
    );

    const status = await orderStatus.findOne({
      where: {
        name: "Preparing",
      },
    });
    const acceptedStatus = await orderStatus.findOne({
      where: {
        name: "Accepted",
      },
    });
    const mode = await orderMode.findOne({
      where: {
        name: "Scheduled",
      },
    });

    if (dd.orderStatusId == acceptedStatus.id) {
      const response = ApiResponse(
        "0",
        "Order Already accepted by restaurant",
        "",
        {}
      );
      return res.json(response);
    }
    if (dd.orderModeId == mode.id) {
      dd.orderStatusId = acceptedStatus.id;
    } else {
      dd.orderStatusId = status.id;
    }

    dd.customTime = customTime;
    dd.save()
      .then(async (dat) => {
        
        let time = Date.now();
        orderHistory.create({
          time,
          orderId: dd.id,
          orderStatusId: acceptedStatus.id,
        });
        orderHistory.create({
          time,
          orderId: dd.id,
          orderStatusId: status.id,
        });

        let data = {
          eta_text: parseInt(parseInt(customTime)/60) + parseInt(etaText),
          orderId: dd.id,
        };
       
        const eventData = {
          type: "acceptOrder",
          data: { data: data },
        };
        let retailerHomeData = await homeData(restaurantId);
        const eventDataForRetailer = {
          type: "acceptOrder",
          data: {
            status: "1",
            message: "data",
            error: "",
            data: retailerHomeData,
          },
        };
        sendEvent(dd?.user?.id, eventData);
        sendEvent(restData?.user?.id, eventDataForRetailer);
          let userLang = dd?.user?.language
        let userTokens = formatTokens(dd?.user?.deviceToken);
        singleNotification(
          userTokens,
          "Order Accepted",
          `Your Order ID : ${orderId} has accepted by Restaurant`,
          data,userLang
        );
        const response = ApiResponse(
          "1",
          "Order Accepted by Restaurant",
          "",
          {}
        );
        return res.json(response);
      })
      .catch((error) => {
        const response = ApiResponse("0", error.message, "Error", {});
        return res.json(response);
      });
  }
  else{
    let response = ApiResponse("0","Order not found","",{});
    return res.json(response)
  }
}

async function acceptOrderForSocket(orderId, restaurantId, customTime) {
  try {
  const dd = await order.findOne({
    where: {
      id: orderId,
    },
    include: [
      {
        model: address,
        as: "dropOffID",
      },
      {
        model: restaurant,
      },
      {
        model: user,
        attributes: ["id", "deviceToken", "ip","language"],
      },
    ],
  });
  if (dd) {
    const restData = await restaurant.findOne({
      where: {
        id: restaurantId,
      },
      include: { model: user, attributes: ["ip","id"] },
      attributes: ["approxDeliveryTime", "lat", "lng"],
    });
    let etaText = await eta_text(
      restData?.lat,
      restData?.lng,
      dd.dropOffID?.lat,
      dd.dropOffID?.lng
    );

    const status = await orderStatus.findOne({
      where: {
        name: "Preparing",
      },
    });
    const acceptedStatus = await orderStatus.findOne({
      where: {
        name: "Accepted",
      },
    });
    const mode = await orderMode.findOne({
      where: {
        name: "Scheduled",
      },
    });

    if (dd.orderStatusId == acceptedStatus.id) {
      const response = ApiResponse(
        "0",
        "Order Already accepted by restaurant",
        "",
        {}
      );
      return res.json(response);
    }
    if (dd.orderModeId == mode.id) {
      dd.orderStatusId = acceptedStatus.id;
    } else {
      dd.orderStatusId = status.id;
    }

    dd.customTime = customTime;
    dd.save()
      .then(async (dat) => {
        
        let time = Date.now();
        orderHistory.create({
          time,
          orderId: dd.id,
          orderStatusId: acceptedStatus.id,
        });
        orderHistory.create({
          time,
          orderId: dd.id,
          orderStatusId: status.id,
        });

        let data = {
          eta_text: parseInt(parseInt(customTime)/60) + parseInt(restData?.approxDeliveryTime),
          orderId: dd.id,
        };
       
        const eventData = {
          type: "acceptOrder",
          data: { data: data },
        };
        let retailerHomeData = await homeData(restaurantId);
        const eventDataForRetailer = {
          type: "acceptOrder",
          data: {
            status: "1",
            message: "data",
            error: "",
            data: retailerHomeData,
          },
        };
        sendEvent(dd?.user?.id, eventData);
        sendEvent(restData?.user?.id, eventDataForRetailer);
         let userLang = dd?.user?.language
        let userTokens = formatTokens(dd?.user?.deviceToken) ;
        singleNotification(
          userTokens,
          "Order Accepted",
          `Your Order ID : ${orderId} has accepted by Restaurant`,
          data,userLang
        );
        let resData = {
            message:"",
            data:{},
            status:"1",
            error:""
        }
        return resData;
      })
      .catch((error) => {
        let resData = {
            message:error.message,
            data:{},
            status:"0",
            error:""
        }
        return resData;
      });
      }
      else{
        let resData = {
            message:"Order not found!",
            data:{},
            status:"0",
            error:""
        }
        return resData;
      }
  } catch (error) {
    let resData = {
            message:error.message,
            data:{},
            status:"0",
            error:""
        }
        return resData;
  }
}

async function rejectOrder(req, res) {
    
    // let check = await refundPayment(req.body.orderId);
    // return res.json(check);
    
    
  const { orderId, cancelledBy, comment, title,fineStatus } = req.body;
  console.log(req.body)
  const requiredFields = ["orderId",  "comment"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field.toUpperCase()} is required`,
        `Please provide a value for ${field.toUpperCase()}`,
        {}
      );
      return res.json(response);
    }
  }
  const status = await orderStatus.findOne({
    where: {
      name: "Reject",
    },
  });
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: [{
      model: user,
      attributes: ["id", "deviceToken","ip","language"],
    },{model:restaurant,attributes:['id'],include:{model:user,attributes:['ip','id']}}],
  });
  //   return res.json(orderData)
  if (orderData) {
    orderData.orderStatusId = status.id;
    orderData
      .save()
      .then((dd) => {
        const history = new orderHistory();
        history.time = new Date();
        history.orderId = dd.id;
        history.orderStatusId = status.id;
        history.reason = comment;
        history.cancelledBy = req.user.id;
        history
          .save()
          .then(async(his) => {
              if(orderData.credits){
                  if (parseInt(orderData.credits) > 0 ) {
             
                        let userCredits = await Credit.findOne({ where: { userId: orderData.userId } });
                        if (parseInt(userCredits.point) < 18) {
                            userCredits.point = (parseInt(userCredits.point)+parseInt(orderData.credits)) > 18 ? 18 : parseInt(userCredits.point)+parseInt(orderData.credits);
                            await userCredits.save();
                        }
                    }
              }
              
            
              
              let chargeData = await orderCharge.findOne({where:{orderId : orderData.id}});
              if(chargeData && fineStatus){
                  chargeData.fine = 20;
                  await chargeData.save();
                  
                    //on reject order, restaurant will be fine 20
              let restEarning = await restaurantEarning.findOne({where:{restaurantId : orderData?.restaurantId}});
              if(restEarning){
                  restEarning.availableBalance = parseInt(restEarning.availableBalance) - 20;
                  restEarning.totalEarning = parseInt(restEarning.totalEarning) - 20;
                  await restEarning.save();
              }
              }
            
            //refund the payment 
            let adyen = await paymentMethod.findOne({where:{name:"Adyen"}});
            if(adyen.id == orderData.paymentMethodId){
                try{
                    let check = await refundPayment(orderData.id);
                }
                catch(error){
                    console.log(error)
                }
            }
            // send notification to customer that your order has been rejected
            let notiBody = {
              comment: comment,
              title: title,
              orderId:orderId
            };
            const userLang = orderData?.user?.language
            let userTokens = formatTokens(orderData?.user?.deviceToken);
            singleNotification(
             userTokens,
              "Order Rejected",
              `Your Order ID : ${orderId} has rejected due to ${title}`,
              notiBody,userLang
            );
            const eventData = {
              type: "rejectOrder",
              data: notiBody,
            };
            let restHomeData = await homeData(orderData.restaurantId);
            restHomeData.reject = 20;
            const restEventData = {
              type: "rejectOrder",
              data: {
                  status:"1",
                  message:"Home data",
                  error:"",
                  data:restHomeData
              },
            };
            sendEvent(orderData?.user?.id, eventData);
            sendEvent(orderData?.restaurant?.user?.id, restEventData);
            const response = ApiResponse("1", "Order Cancelled", "", {});
            return res.json(response);
          })
          .catch((error) => {
            const response = ApiResponse("0", error.message, "", {});
            return res.json(response);
          });
      })
      .catch((error) => {
        const response = ApiResponse("0", error.message, "", {});
        return res.json(response);
      });
  } else {
    const response = ApiResponse("0", "No order found", "", {});
    return res.json(response);
  }
}

async function delivered(req, res) {
  const { orderId } = req.body;
  const status = await orderStatus.findOne({
    where: {
      name: "Delivered",
    },
  });
  order
    .update(
      {
        orderStatusId: status.id,
      },
      {
        where: {
          id: orderId,
        },
      }
    ) // onTheWay
    .then(async (data) => {
        
      orderHistory.create({
        time: Date.now(),
        orderId,
        orderStatusId: status.id,
      });
      order
        .findOne({
          where: {
            id: orderId,
          },
          attributes: [
            "id",
            "orderNum",
            "total",
            "driverId",
            "userId",
            "paymentMethodId",
            "restaurantId",
            "currencyUnitId",
            "deliveryTypeId"
          ],
          include: [
            {
              model: orderCharge,
            },
            {
              model: restaurant,
              include: {
                model: user,
              },
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
                "ip",
                "language"
              ],
            },
          ],
        })
        .then(async (orderData) => {
          
          const restEarn = await restaurantEarning.findOne({
            where: {
              restaurantId: orderData.restaurantId,
            },
          });
          if (restEarn) {
            restEarn.totalEarning =
              parseFloat(restEarn.totalEarning) +
              parseFloat(orderData?.orderCharge?.restaurantEarnings);
            restEarn.availableBalance =
              parseFloat(restEarn.availableBalance) +
              parseFloat(orderData?.orderCharge?.restaurantEarnings);
            await restEarn.save();
          } else {
            const newRestEarning = new restaurantEarning();
            newRestEarning.totalEarning = parseFloat(
              orderData?.orderCharge?.restaurantEarnings
            );
            newRestEarning.availableBalance = parseFloat(
              orderData?.orderCharge?.restaurantEarnings
            );
            newRestEarning.restaurantId = orderData.restaurantId;
            await newRestEarning.save();
          }

          let notification = {
            title: "Order Delivered",
            body: `Order Number ${orderData.orderNum} has been delivered`,
          };
          let data = {
            testData: "12354",
            orderId : orderData.id,
            deliveryTypeId:orderData?.deliveryTypeId
          };
          let restHome = await homeData(orderData.restaurantId);
          const restEventData = {
              type: "restaurantDelivered",
              data: {
                  status:"1",
                  message:"Home data",
                  error:"",
                  data:restHome
              },
            };
            let userTokens=[];
            let restTokens=[];
            try{
                 let userTokens = formatTokens(orderData.user.deviceToken); 
            let restTokens = formatTokens( orderData?.restaurant?.user?.deviceToken)
            }
            catch(error){
                console.log(error)
            }
            let userLang = orderData.user?.language
            let restLang = orderData?.restaurant?.user?.language
            sendEvent(orderData?.restaurant?.user?.id, restEventData);
            sendNotification(restTokens,notification,data,restLang)
            sendNotification(userTokens, notification, data,userLang).then((dat) => {
            const response = ApiResponse("1", "Food Delivered", "", orderData);
            return res.json(response);
          });
        });
    });
}

async function restaurantDrivers(req, res) {
  const { orderId } = req.body;
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
  });
  const drivers = await restaurantDriver.findAll({
    where: [
      {
        restaurantId: req.params.restaurantId,
      },
      {
        status: true,
      },
    ],
    include: {
      model: user,
      where:{status:true},
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "deviceToken",
        "countryCode",
        "phoneNum",
        "status",
      ],
      include: {
        model: driverDetails,
        attributes: ["profilePhoto"],
      },
    },
  });
  let list = [];
  // return res.json(drivers)
  if (drivers.length > 0) {
    drivers.forEach((driver) => {
      let obj = {
        id: driver?.user?.id,
        phoneNum: driver?.user?.phoneNum,
        countryCode: driver?.user?.countryCode,
        firstName: driver?.user?.firstName,
        lastName: driver?.user?.lastName,
        email: driver?.user?.email,
        deviceToken: driver?.user?.deviceToken,
        status: driver?.user?.status,
        driverDetails: driver?.user?.driverDetails[0],
        isAssigned: driver?.user?.id == orderData?.driverId ? true : false,
      };
      list.push(obj);
    });
  }

  const response = ApiResponse("1", "Restaurant Drivers", "", list);
  return res.json(response);
}

async function assignDriver(req, res) {
  const { driverId, orderId } = req.body;
  
  const requiredFields = ["driverId", "orderId"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field.toUpperCase()} is required`,
        `Please provide a value for ${field.toUpperCase()}`,
        {}
      );
      return res.json(response);
    }
  }
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: [
      { model: orderCharge },
      {
        model: address,
        as: "dropOffID",
      },
      {
        model: restaurant,
      },
      {
        model: user,
        attributes: ["id", "deviceToken", "ip"],
      },
    ],
  });
  if (orderData?.driverId != null) {
    const response = ApiResponse(
      "0",
      "Already driver is assigned to this order",
      "",
      {}
    );
    return res.json(response);
  }
  const driverData = await user.findOne({
    where: {
      id: driverId,
    },
    attributes: ["id", "deviceToken", "firstName", "lastName", "ip","language"],
  });
  


  if (!driverData) {
    const response = ApiResponse(
      "0",
      `Sorry! No Driver exists against ID : ${driverId}`,
      "",
      {}
    );
    return res.json(response);
  }
  if (orderData) {
    // orderData.driverId = driverId;
    orderData
      .save()
      .then(async (dat) => {
        const estTime = await eta_text(
          orderData.restaurant.lat,
          orderData.restaurant.lng,
          orderData.dropOffID.lat,
          orderData.dropOffID.lng
        );
        let notiDAta = {
          orderId: orderData.id,
          restaurantName: orderData.restaurant.businessName,
          estEarning: orderData?.orderCharge?.deliveryFees,
          dropOffAddress: orderData.dropOffID.streetAddress,
          pickUpAddress: orderData.restaurant.address,
          orderApplication: orderData.businessType,
          estTime: estTime,
          distance: orderData.distance,
          orderNum: orderData.orderNum,
          orderType: orderData.deliveryTypeId,
        };

        const eventData = {
          type: "assignDriver",
          data: { data: notiDAta },
        };
        // sendEvent(orderData?.user?.ip, eventData);
        sendEvent(driverData?.id, eventData);

       let driverLang = driverData?.language
        let driverTokens = formatTokens(driverData?.deviceToken);
        console.log("**********************************")
        console.log(driverTokens)
        singleNotification(
          driverTokens,
          "A new Job Arrived",
          `You have been assigned to Order ID : ${orderId}`,
          notiDAta,driverLang
        );
        // let userTokens = orderData?.user?.deviceToken ? JSON.parse(orderData.user.deviceToken):[];
        let userLang = orderData?.user?.language
        let userTokens = formatTokens(orderData?.user?.deviceToken);
        singleNotification(
          userTokens,
          "Driver Assign",
          `${driverData.firstName} ${driverData.lastName} has been assigned for your order`,{},userLang
        );

        const response = ApiResponse("1", "Driver Assign to Order", "", {});
        return res.json(response);
      })
      .catch((error) => {
        const response = ApiResponse("0", error.message, "Error", {});
        return res.json(response);
      });
  }
}
async function assignDriverForSocket(driverId, orderId) {
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: [
      { model: orderCharge },
      {
        model: address,
        as: "dropOffID",
      },
      {
        model: restaurant,
      },
      {
        model: user,
        attributes: ["id", "deviceToken"],
      },
    ],
  });

  if (orderData.driverId != null) {
    let response = {
      status: "0",
      message: "Driver Already assigned!",
      error: "",
      data: {},
    };
    return response;
  }
  const driverData = await user.findOne({
    where: {
      id: driverId,
    },
    attributes: ["id", "deviceToken", "firstName", "lastName"],
  });

  if (!driverData) {
    let response = {
      status: "0",
      message: `Sorry! No Driver exists against ID : ${driverId}`,
      error: "",
      data: {},
    };
    return response;
  }
  if (orderData) {
    const estTime = await eta_text(
      orderData.restaurant.lat,
      orderData.restaurant.lng,
      orderData.dropOffID.lat,
      orderData.dropOffID.lng
    );
    let notiDAta = {
      orderId: orderData.id,
      restaurantId: orderData.restaurantId,
      userId: orderData.userId,
      restaurantName: orderData.restaurant.businessName,
      estEarning: orderData?.orderCharge?.driverEarnings,
      dropOffAddress: orderData.dropOffID.streetAddress,
      pickUpAddress: orderData.restaurant.address,
      orderApplication: orderData.businessType,
      estTime: estTime,
      distance: orderData.distance,
      orderNum: orderData.orderNum,
      orderType: orderData.deliveryTypeId,
    };

    let response = {
      status: "1",
      message: "Data",
      error: "",
      data: notiDAta,
    };
    return response;
  } else {
    let response = {
      status: "0",
      message: "Sorry order not found!",
      error: "",
      data: {},
    };
    return response;
  }
}

async function getRestaurantDrivers(req, res) {
  const { restaurantId } = req.params;

  // Fetch drivers from the database
  const drivers = await restaurantDriver.findAll({
    where: {
      restaurantId: restaurantId,
    },
    include: {
      model: user,
      where: { status: true },
      attributes: [
        "id",
        "userName",
        "firstName",
        "lastName",
        "phoneNum",
        "countryCode",
        "email",
        "status",
        "verifiedAt",
      ],
    },
  });

  // Use Promise.all to handle async operations
  const driverList = await Promise.all(
    drivers.map(async (driver) => {
      const obj = {
        id: driver?.user?.id,
        key: driver?.id,
        userName: driver?.user?.userName,
        email: driver?.user?.email,
        firstName: driver?.user?.firstName,
        lastName: driver?.user?.lastName,
        phoneNum: driver?.user?.phoneNum,
        countryCode: driver?.user?.countryCode,
        status: driver?.status,
        checkDriverOnline: await checkDriverOnline(driver?.user?.id?.toString()),
        active: driver?.user?.verifiedAt == null ? 0 : 1,
      };
      return obj;
    })
  );

  // Return the response
  const response = ApiResponse("1", "Restaurant Drivers", "", driverList);
  return res.json(response);
}


async function storeTime(req, res) {
  let timing = await time.findAll({
    where: {
      restaurantId: req.params.restaurantId,
    },
    attributes: ["id", "day", "name", "startAt", "endAt", "status"],
  });
  const response = ApiResponse("1", "Store Timing", "", timing);
  return res.json(response);
}

async function updateStoreTime(req, res) {
  const { restaurantId, data } = req.body;
  data.map(async (dat) => {
    const timeTable = await time.findOne({
      where: [
        {
          restaurantId: restaurantId,
        },
        {
          day: dat.day,
        },
      ],
    });
    if (timeTable) {
      timeTable.startAt = dat.startAt;
      timeTable.endAt = dat.endAt;
      timeTable.status = dat.flag === 1 ? true : false;
      await timeTable.save();
    } else {
      const newTime = new time();
      newTime.startAt = dat.startAt;
      newTime.endAt = dat.endAt;
      newTime.status = dat.flag === 1 ? true : false;
      newTime.restaurantId = restaurantId;
      newTime.day = dat.day;
      newTime.name =
        dat.day == "0"
          ? "sunday"
          : dat.day == "1"
          ? "monday"
          : dat.day == "2"
          ? "tuesday"
          : dat.day == "3"
          ? "wednesday"
          : dat.day == "4"
          ? "thursday"
          : dat.day == "5"
          ? "friday"
          : dat.day == "6"
          ? "saturday"
          : "";
      await newTime.save();
    }
  });
  const response = ApiResponse("1", "Store Time updated successfully", "", {});
  return res.json(response);
}

async function session(req, res) {
  const userId = req.user.id;
  const userExist = await user.findOne({
    where: {
      id: userId,
    },
    include: [
      {
        model: restaurant,
      },
    ],
  });
  if (!userExist.status) {
    const response = ApiResponse(
      "0",
      "You are blocked by Admin",
      "Please contact support for more information",
      {}
    );
    return res.json(response);
  }
  const acccessToken = req.header("accessToken");
  const data = {
    userId: `${userExist.id}`,
    //   userName: `${userExist.userName}`,
    firstName: `${userExist.firstName}`,
    lastName: `${userExist.lastName}`,
    email: `${userExist.email}`,
    accessToken: `${acccessToken}`,
    logo: userExist.restaurants[0].logo,
    image: userExist.restaurants[0].image,
    restaurantId: userExist.restaurants[0].id,
    businessName: userExist.restaurants[0]?.businessName,
    businessEmail: userExist.restaurants[0]?.businessEmail,
    businessType: userExist.restaurants[0]?.businessType,
    businessCountryCode: userExist.restaurants[0]?.countryCode,
    businessPhone: userExist.restaurants[0]?.phoneNum,
    city: userExist.restaurants[0]?.city,
    lat: userExist.restaurants[0]?.lat,
    lng: userExist.restaurants[0]?.lng,
    zipCode: userExist.restaurants[0]?.zipCode,
    address: userExist.restaurants[0]?.address,
    description: userExist.restaurants[0]?.description,
  };
  const response = ApiResponse("1", "Login Successfull", "", data);
  return res.json(response);
}

async function orderDetails(req, res) {
  const { orderId } = req.body;
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: [
        {model:orderCultery,attributes:['qty'],include:{model:cutlery,attributes:['name','description','image','price']}},
      { model: orderHistory, attributes: ['time'], include: { model: orderStatus, attributes: ['name'] } },
      {
        model: restaurant,
        include: {
          model: unit,
          as: "currencyUnitID",
        },
      },
      {
        model: orderStatus,
      },
      {
        model: address,
        as: "dropOffID",
      },
      {
        model: orderItems,
        include: [
          {
            model: R_PLink,
            include: {
              model: R_MCLink,
              attributes: ["id"],
              include: {
                model: menuCategory,
                attributes: ["id", "name", "image"],
              },
            },
          },
          {
            model: orderAddOns,
            include: {
              model: addOn,
              include: {
                model: collectionAddons,
                attributes: ['collectionId', 'addOnId'],
                include: {
                  model: collection,
                  attributes: ["id", "title", "minAllowed", "maxAllowed"],
                },
              },
            },
          },
        ],
      },
      {
        model: orderCharge,
      },
      {
        model: paymentMethod,
      },
      {
        model: deliveryType,
      },
      {
        model: user,
        as: "DriverId",
        include: {
          model: driverDetails,
        },
      },
      {
        model: user,
        attributes: [
          "id",
          "userName",
          "firstName",
          "lastName",
          "email",
          "countryCode",
          "phoneNum",
        ],
      },
    ],
  });


  if (!orderData) {
    const response = ApiResponse("0", "Sorry no order exists", "Error", {});
    return res.json(response);
  }
  let orderCount = await order.count({where:{restaurantId : orderData.restaurantId,userId:orderData.userId}});
  const apiDate = orderData.scheduleDate;
  const parsedDate = new Date(apiDate);
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: "UTC",
  };
  const schDate = parsedDate.toLocaleString("en-US", options);

  let itemArr = [];

  orderData.orderItems.map((oi, idx) => {
    let itemPrice = parseFloat(oi.total);
    let collectionArr = [];

    // Manipulate addons by grouping them by collection
    oi.orderAddOns?.forEach((oao, ind) => {
      itemPrice += parseFloat(oao.total);
      
      // Find the collection and its add-ons
      const collectionTitle = oao?.addOn?.collectionAddon?.collection?.title;
      const collectionId = oao?.addOn?.collectionAddon?.collection?.id;

      // Check if this collection already exists in the collectionArr
      let existingCollection = collectionArr.find(c => c.id === collectionId);

      if (!existingCollection) {
        // If the collection doesn't exist yet, add it
        existingCollection = {
          id: collectionId,
          title: collectionTitle,
          addOns: []
        };
        collectionArr.push(existingCollection);
      }

      // Add the add-on under its collection
      const addOnObj = {
        name: oao?.addOn?.name,
        price: oao.total,
      };
      existingCollection.addOns.push(addOnObj);
    });

    let itemObj = {
      itemName: oi.R_PLink.name,
      menuCategory: oi?.R_PLink?.R_MCLink?.menuCategory,
      quantity: oi.quantity,
      itemPrice: itemPrice,
      collections: collectionArr,  // Add collections and their add-ons
    };
    itemArr.push(itemObj);
  });

  let driver_lat = "";
  let driver_lng = "";
  const firebase_data = await axios.get(process.env.FIREBASE_URL);
  if (firebase_data.data) {
    const driverLatLng = firebase_data?.data[orderData.driverId];
  }

  let outObj = {
    id: orderData.id,
    restaurantId: orderData.restaurant ? orderData.restaurant.id : "",
    restaurantName: orderData.restaurant ? orderData.restaurant.businessName : "",
    restaurantPhoto: orderData.restaurant ? orderData.restaurant.logo : "",
    restaurantLat: orderData.restaurant.lat,
    restaurantLng: orderData.restaurant.lng,
    orderNum: orderData.orderNum,
    scheduleDate: schDate,
    OrderStatusId: orderData.orderStatus.id,
    OrderStatus: orderData.orderStatus?.name,
    address: `${orderData.dropOffID?.building} ${orderData.dropOffID?.streetAddress}`,
    dropOffLat: orderData.dropOffID?.lat,
    dropOffLng: orderData.dropOffID?.lng,
    items: itemArr,
    subTotal: orderData.orderCharge.basketTotal,
    deliveryFee: orderData.orderCharge.deliveryFees,
    VAT: orderData.orderCharge.VAT,
    discount: orderData.orderCharge.discount ? orderData.orderCharge.discount : 0,
    serviceCharges: orderData.orderCharge.serviceCharges,
    total: orderData.orderCharge.total,
    note: orderData.note,
    paymentMethod: orderData.paymentMethod?.name ?? "",
    deliveryType: orderData.deliveryType.name,
    orderHistories: orderData?.orderHistories,
    driverDetails: orderData.driverId
      ? {
          name: `${orderData.DriverId.firstName} ${orderData.DriverId.lastName}`,
          image: orderData.DriverId.driverDetails[0]?.profilePhoto
            ? orderData.DriverId.driverDetails[0]?.profilePhoto
            : "",
          phoneNum: `${orderData.DriverId.countryCode} ${orderData.DriverId.phoneNum}`,
        }
      : null,
    user: orderData?.user,
    currency: orderData.restaurant.currencyUnitID?.symbol,
    orderCulteries:orderData?.orderCulteries,
    orderCount:orderCount
  };

  const response = ApiResponse("1", "Order Details", "", outObj);
  return res.json(response);
}


async function activeOrders(req, res) {
  const { restaurantId } = req.params;
  const Accepted = await orderStatus.findOne({
    where: {
      name: "Accepted",
    },
  });
  const Preparing = await orderStatus.findOne({
    where: {
      name: "Preparing",
    },
  });
  const readyForDelivery = await orderStatus.findOne({
    where: {
      name: "Ready for delivery",
    },
  });
  const way = await orderStatus.findOne({
    where: {
      name: "On the way",
    },
  });
  const pickup = await orderStatus.findOne({
    where: {
      name: "Food Pickedup",
    },
  });
  const AcceptedByDriver = await orderStatus.findOne({
    where: {
      name: "Accepted by Driver",
    },
  });
  let status_list = [
    Accepted.id,
    Preparing.id,
    readyForDelivery.id, 
    way.id,
    pickup.id,
    AcceptedByDriver.id,
  ];
 
  const orderData = await order.findAll({
    where: {
      restaurantId: restaurantId,
      orderStatusId: {
        [sequelize.Op.in]: [3, 4, 5, 6, 7],
      },
    },
  });
  const response = ApiResponse("1", "Active Orders", "", orderData);
  return res.json(response);
}

async function completedOrders(req, res) {
  const { restaurantId } = req.params;
  const status = await orderStatus.findOne({
    where: {
      name: "Delivered",
    },
  });
 
  const orderData = await order.findAll({
    include: {
      model: orderCharge,
    },
    where: [
      {
        restaurantId: restaurantId,
      },
      {
        orderStatusId: status.id,
      },
    ],
  });
  return res.json(orderData)
  const response = ApiResponse("1", "completed Orders", "", orderData);
  return res.json(response);
}

async function readyForPickup(req, res) {
  const { orderId } = req.body;
  const status = await orderStatus.findOne({
    where: {
      name: "Ready for delivery",
    },
  });
  const orderData = await order.findOne({
    where: {
      id: orderId,
    },
    include: [
      {
        model: restaurant,include:{model:user,attributes:['ip','id']}
      },
      {
        model: deliveryType,
      },
      {
        model: address,
        as: "dropOffID",
      },
      {
        model: user,
      },
      {
        model: user,
        as: "DriverId",
        attributes: [
          "id",
          "firstName",
          "deviceToken",
          "lastName",
          "email",
          "countryCode",
          "phoneNum",
          "ip",
          "language"
        ],
      },
    ],
  });
  
  const rejectStatus = await orderStatus.findOne({
    where: {
      name: "Cancelled",
    },
  });
  const deliveryStatus = await deliveryType.findOne({
    where: {
      name: "Delivery",
    },
  });

  if (orderData) {
    if (orderData.orderStatusId == rejectStatus.id) {
      const response = ApiResponse(
        "0",
        `This order ID ${orderId} is already rejected by Driver`,
        "",
        {}
      );
      return res.json(response);
    }
    if (orderData?.deliveryType?.name == "Delivery") {
      if (orderData.driverId == null) {
        const response = ApiResponse(
          "0",
          `Please assign driver to Order for Delivery`,
          "",
          {}
        );
        return res.json(response);
      }
    }

    orderData.orderStatusId = status.id;
    orderData
      .save()
      .then(async (dat) => {
        const history = new orderHistory();
        history.time = Date.now();
        history.orderId = orderId;
        history.orderStatusId = status.id;
        history
          .save()
          .then(async (dd) => {
            let lat = "";
            let lng = "";
            if (orderData.deliveryTypeId == deliveryStatus.id) {
              const estTime = await eta_text(
                orderData.restaurant.lat,
                orderData.restaurant.lng,

                orderData.dropOffID.lat,
                orderData.dropOffID.lng
              );
              let data = {
                estTime,
                orderStatus: "Ready for delivery",
                orderId:orderData.id
              };
              let eventData = {
                type: "readyForPickup",
                data: data,
              };
              
              //send to driver
              sendEvent(orderData.driverId, eventData);
              sendEvent(orderData?.user?.id, eventData);
              homeData(orderData.restaurantId).then((dat)=>{
                    let restData = {
                        type: "readyForPickup",
                        data: {
                            status:"1",
                            message:"home data",
                            error:"",
                            data:dat
                        },
                      };
                    sendEvent(orderData?.restaurant?.user?.id, restData);
              })
              //send to customer
              let userLang = orderData?.user?.language
              let userTokens = formatTokens(orderData?.user?.deviceToken);
              singleNotification(
                userTokens,
                "Ready for Pickup",
                `Your Order ID ${orderId} is ready for Pickup`,
                data,userLang
              );
              const response = ApiResponse(
                "1",
                "Order is ready for Pickup",
                "",
                data
              );
              return res.json(response);
            } 
            else {
              const fireBase = await axios.get(process.env.FIREBASE_URL);
              if (fireBase?.data) {
                if (fireBase.data[orderData.driverId]) {
                  lat = fireBase.data[orderData.driverId].lat;
                  lng = fireBase.data[orderData.driverId].lng;
                }
              }
              const estTime = await eta_text(
                orderData.restaurant.lat,
                orderData.restaurant.lng,
                lat,
                lng
              );
              const data = {
                estTime,
                orderStatus: "Ready for delivery",
              };

              // send notification ot customer that your order is ready for pickup
              const userLanguage = orderData?.user?.language
              let userTokens = formatTokens(orderData?.user?.deviceToken);
              singleNotification(
                userTokens,
                "Ready for Pickup",
                `Your Order ID ${orderId} is ready for Pickup`,
                data,userLanguage
              );
              const driverLanguage = orderData?.DriverId?.language
              let driverTokens = formatTokens(orderData?.DriverId?.deviceToken);
              singleNotification(
                driverTokens,
                "Ready for Pickup",
                `Your Order ID ${orderId} is ready for Pickup`,
                data,driverLanguage
              );
            }
            const data = {
              estTime: "10 mints",
              orderStatus: "Ready for delivery",
            };
             let eventData = {
                type: "readyForPickup",
                data: data,
              };
              //send to user
              sendEvent(orderData?.user?.id, eventData);
            let userEvent = {
                type: "readyForPickup",
                data: {
                    status:"1",
                    message:"home data",
                    error:"",
                    data:{}
                },
              };
            
            //send event to restaurant
             homeData(orderData.restaurantId).then((dat)=>{
                   let restData = {
                        type: "readyForPickup",
                        data: {
                            status:"1",
                            message:"home data",
                            error:"",
                            data:dat
                        },
                      };
                  sendEvent(orderData?.restaurant?.user?.id, restData);
             })
              
            const response = ApiResponse(
              "1",
              "Order is ready for Pickup",
              "",
              data
            );
            return res.json(response);
          })
          .catch((error) => {
            const response = ApiResponse("0", error.message, "Error", {});
            return res.json(response);
          });
      })
      .catch((error) => {
        const response = ApiResponse("0", error.message, "Error", {});
        return res.json(response);
      });
  }
}

async function updateRestaurant(req, res) {
  const {
    restaurantId,
    businessName,
    businessEmail,
    countryCode,
    country,
    phoneNum,
    city,
    description,
    zipCode,
    address,
    lat,
    lng,
    zoneId,
  } = req.body;

  const restData = await restaurant.findOne({
    where: {
      id: restaurantId,
    },
  });

  if (restData) {
    restData.businessName = businessName;
    restData.businessEmail = businessEmail;
    restData.countryCode = countryCode;
    restData.address = address;
    restData.zipCode = zipCode;
    restData.country = country;
    restData.phoneNum = phoneNum;
    restData.lat = lat;
    restData.lng = lng;
    restData.description = description;
    if (city) {
      restData.city = city;
    }
    const imageToBeRemoved = restData?.image;
    const imagelogo = restData?.logo;
    // 3. Delete the image file from the server
    if (req?.files?.logo?.length > 0) {
        
         if (imagelogo) {
      try {
        await fs.unlink(imagelogo);
      } catch (error) {}
    }
      let logoPathTemp = req.files.logo[0].path;
      let logoPath = logoPathTemp.replace(/\\/g, "/");
      restData.logo = logoPath;
    }
    if (req?.files?.coverImage?.length > 0) {
        
         if (imageToBeRemoved) {
      try {
        await fs.unlink(imageToBeRemoved);
      } catch (error) {}
    }
      let imagePathTemp = req.files.coverImage[0].path;
      let imagePath = imagePathTemp.replace(/\\/g, "/");
      restData.image = imagePath;
    }
    restData
      .save()
      .then(async (dat) => {
        const restZone = await zoneRestaurants.findOne({
          where: {
            restaurantId: restaurantId,
          },
        });
        if (restZone) {
        //   restZone.zoneId = zoneId;
          await restZone.save();
        }
        const response = ApiResponse("1", "Restaurant Updated", "", {});
        return res.json(response);
      })
      .catch((error) => {
        const response = ApiResponse("0", error.message, "Error", {});
        return res.json(response);
      });
  } else {
    let response = ApiResponse("0", "Sorry! restaurant not found", "", {});
    return res.json(response);
  }
}

async function updatePassword(req, res) {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const requiredFields = ["currentPassword", "newPassword", "confirmPassword"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field.toUpperCase()} is required`,
        `Please provide a value for ${field.toUpperCase()}`,
        {}
      );
      return res.json(response);
    }
  }

  // Additional validation for password matching
  if (newPassword !== confirmPassword) {
    const response = ApiResponse(
      "0",
      "Password mismatch",
      "New password and confirm password do not match",
      {}
    );
    return res.json(response);
  }
  if (newPassword === confirmPassword) {
    const userData = await user.findOne({
      where: {
        id: req.user.id,
      },
    });
    if (userData) {
      let match = await bcrypt.compare(currentPassword, userData.password);
      if (!match) {
        const response = ApiResponse(
          "0",
          "Current Password mismatch",
          "Error",
          {}
        );
        return res.json(response);
      }
      userData.password = await bcrypt.hash(newPassword, 10);
      userData
        .save()
        .then((dat) => {
          const response = ApiResponse(
            "1",
            "Password updated successfully",
            "",
            {}
          );
          return res.json(response);
        })
        .catch((error) => {
          const response = ApiResponse("0", error.message, "Error", {});
          return res.json(response);
        });
    }
  } else {
    const response = ApiResponse("0", "Confirm Password mismatch", "Error", {});
    return res.json(response);
  }
}

async function enableRushMode(req, res) {
  const { restaurantId, time } = req.body;
  const rest = await restaurant.findOne({
    where: {
      id: restaurantId,
    },
  });
  if (rest) {
    if (rest.isRushMode) {
      rest.isRushMode = false;
      rest.rushModeTime = 0;
      rest
        .save()
        .then((dat) => {
          const response = ApiResponse("1", "Rush Mode Disable", "", {});
          return res.json(response);
        })
        .catch((error) => {
          const response = ApiResponse("0", error.message, "Error", {});
          return res.json(response);
        });
    } else {
      rest.isRushMode = true;
      rest.rushModeTime = time;
      rest
        .save()
        .then((dat) => {
          const response = ApiResponse("1", "Rush Mode Enable", "", {});
          return res.json(response);
        })
        .catch((error) => {
          const response = ApiResponse("0", error.message, "Error", {});
          return res.json(response);
        });
    }
  } else {
    const response = ApiResponse("0", "No Restaurant found", "Error", {});
    return res.json(response);
  }
}

// async function addProduct(req, res) {
//   const {
//     productName,
//     price,
//     description,
//     RMCLinkId,
//     collections,
//     deliveryPrice,
//     pickupPrice,
//     isAvailable,
//   } = req.body;
//   // return res.json(JSON.parse(collections))
//   const pro = new product();
//   pro
//     .save()
//     .then(async (prd) => {
//       let tmpPath = req.file.path;
//       let path = tmpPath.replace(
//         /\\/g, "/");

//       const productData =
//         new R_PLink();
//       productData.name =
//         productName;
//       productData.description =
//         description;
//       productData.image = path;
//       productData.originalPrice =
//         price;
//       productData.deliveryPrice =
//         deliveryPrice;
//       if (isAvailable) {
//         productData.isAvailable =
//           isAvailable;
//       }

//       productData.pickupPrice =
//         pickupPrice;
//       productData.discountPrice =
//         price;
//       productData.discountValue =
//         0;
//       productData.isNew = 1;
//       productData.isRecommended =
//         1;
//       productData.productId = prd
//         .id;
//       productData.status = 1;
//       productData.RMCLinkId =
//         RMCLinkId;
//       productData
//         .save()
//         .then(async (dd) => {
//           //   collections?.map(async (coll) => {
//           //     const pao = new P_AOLink();
//           //     pao.minAllowed = 1;
//           //     pao.maxAllowed = 5;
//           //     pao.status = true;
//           //     pao.RPLinkId = dd.id;
//           //     pao.addOnCategoryId = coll;
//           //     await pao.save();
//           //   });

//           const response =
//             ApiResponse(
//               "1", "Product Added successfully", "", {}
//             );
//           return res.json(
//             response);
//         })
//         .catch((error) => {
//           const response =
//             ApiResponse("0", error.message, "Error", {});
//           return res.json(
//             response);
//         });
//     })
//     .catch((error) => {
//       const response = ApiResponse(
//         "0", error.message, "Error", {});
//       return res.json(response);
//     });
// }
async function addProduct(req, res) {
  const {
    productName,
    price,
    description,
    RMCLinkId,
    collections,
    deliveryPrice,
    weight,
    pickupPrice,
    isAvailable,
    addonList,
    collectionId,
    countryOfOrigin,
    ingredients,
    allergies,
    nutrients,
    qty
  } = req.body;
  
  let collectionList = JSON.parse(addonList);
  console.log(collectionList)
  let check = await R_PLink.findOne({
    where: [{
      name: productName,
    }, {
      RMCLinkId: RMCLinkId,
    }, ],
  });
  if (check) {
    let response = ApiResponse("1", "Product already exist with this name", "Error", {});
    return res.json(response);
  }
  const pro = new product();
  pro.save().then(async (prd) => {
    //   let tmpPath = req.file.path;
    //   let path = tmpPath.replace(/\\/g, "/");
    const productData = new R_PLink();
    productData.name = productName;
    productData.description = description ? description :"description";
    productData.image = req?.files?.image[0]?.path?.replace(/\\/g, "/");
    productData.bannerImage = req?.files?.bannerImage[0]?.path?.replace(/\\/g, "/");
    productData.originalPrice = price;
    productData.deliveryPrice = deliveryPrice;
    if (isAvailable) {
      productData.isAvailable = isAvailable;
    }
    productData.pickupPrice = pickupPrice;
    productData.discountPrice = price;
    productData.discountValue = 0;
    productData.isNew = 1;
    productData.isRecommended = 1;
    productData.weight = weight;
    productData.productId = prd.id;
    productData.status = 1;
    productData.RMCLinkId = RMCLinkId;
    productData.qty = qty;
    productData.countryOfOrigin = countryOfOrigin ? countryOfOrigin :"No";
    productData.ingredients = ingredients ? ingredients :"No Ingredients";
    productData.allergies = allergies ? allergies : "No allergies";
    productData.nutrients = nutrients ? nutrients :"No Nutirents";
    productData.save().then(async (dd) => {
      for (const col of collectionList) {
          
        let proColl = new productCollections();
        proColl.collectionId = col.collectionId;
        proColl.RPLinkId = dd.id;
        proColl.maxAllowed = col.maxAllowed;
        proColl.minAllowed = col.minAllowed;
        proColl.status = true;
        await proColl.save();
       
        if (col.addOns.length) {
          for (const newAdd of col.addOns) {
            let check = await productAddons.findOne({where:{RPLinkId:dd.id,addOnId:newAdd.id}});
            if(check){
                check.isAvaiable  = newAdd.isAvaiable;
                check.isPaid  = newAdd.isPaid;
                check.price  = newAdd.price;
                check.status = true;
                await check.save();
            }
            else{
                let newData = new productAddons();
                newData.RPLinkId  = dd.id;
                newData.addOnId  = newAdd.id;
                newData.isAvaiable  = newAdd.isAvaiable;
                newData.isPaid  = newAdd.isPaid;
                newData.price  = newAdd.price;
                newData.status = true;
                await newData.save();
                console.log(newData) 
            }
          }
        }
      }
      const response = ApiResponse("1", "Product Added successfully", "", {});
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

async function editProduct(req, res) {
  try {
    let {
      productId,
      productName,
      price,
      description,
      RMCLinkId,
      collections,
      deliveryPrice,
      pickupPrice,
      isAvailable,
      weight,
      addonList,
      nutrients,
      allergies,
      ingredients,
      countryOfOrigin,
      qty,
    } = req.body;
    console.log(req.body);
    
    const collectionList = JSON.parse(addonList);

    const productData = await R_PLink.findOne({
      where: {
        id: productId,
      },
    });
    
     for (const col of collectionList) {
          if (col.addOns.length) {
        for (const newAdd of col.addOns) {
          let check = await addOn.findOne({where:{id:newAdd.id}});
          if(check){
              if(!check?.isAvaiable){
                  let response = ApiResponse("0",`Please update addon availability of AddOn  : ${check.name}`,"",{});
                  return res.json(response)
              }
          }
        }
      }
     }

    productData.name = productName;
    productData.countryOfOrigin = countryOfOrigin;
    productData.ingredients = ingredients;
    productData.nutrients = nutrients;
    productData.allergies = allergies;
    productData.description = description;
    productData.originalPrice = price;
    productData.deliveryPrice = deliveryPrice;
    productData.qty = qty;
    productData.isAvailable = isAvailable;
    productData.pickupPrice = pickupPrice;
    productData.discountPrice = price;
    productData.weight = weight;
    productData.isNew = 1;
    productData.isRecommended = 1;
    productData.status = 1;
    productData.RMCLinkId = RMCLinkId;

    if (req.files.image) {
      const imageToBeRemoved = productData.image;
      if (imageToBeRemoved) {
        await fs.unlink(imageToBeRemoved);
      }
      productData.image = req?.files?.image[0]?.path?.replace(/\\/g, "/");
    }
    if (req.files.bannerImage) {
      const imageToBeRemoved = productData.bannerImage;
      if (imageToBeRemoved) {
        await fs.unlink(imageToBeRemoved);
      }
      productData.bannerImage = req?.files?.bannerImage[0]?.path?.replace(/\\/g, "/");
    }

    const savedProduct = await productData.save();

    // Delete old product collections
    const oldProductCollections = await productCollections.findAll({ where: { RPLinkId: savedProduct.id } });
    if (oldProductCollections.length > 0) {
      for (const old of oldProductCollections) {
        await old.destroy();
      }
    }

    // Delete old product addons
    const oldProductAddons = await productAddons.findAll({ where: { RPLinkId: savedProduct.id } });
    if (oldProductAddons.length > 0) {
      for (const oldAddon of oldProductAddons) {
        await oldAddon.destroy();
      }
    }

    // Save new product collections and addons
    for (const col of collectionList) {
      let proColl = new productCollections();
      proColl.collectionId = col.collectionId;
      proColl.RPLinkId = savedProduct.id;
      proColl.maxAllowed = col.maxAllowed;
      proColl.minAllowed = col.minAllowed;
      proColl.status = true;
      await proColl.save();

      if (col.addOns.length) {
        for (const newAdd of col.addOns) {
          let newData = new productAddons();
          newData.RPLinkId = savedProduct.id;
          newData.addOnId = newAdd.id;
          newData.isAvaiable = newAdd.isAvaiable;
          newData.isPaid = newAdd.isPaid;
          newData.price = newAdd.price;
          newData.status = true;
          await newData.save();
        }
      }
    }
    const response = ApiResponse("1", "Product Updated successfully", "", {});
    return res.json(response);

  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function getProducts(req, res) {
  const { restaurantId } = req.params;

  try {
    // Step 1: Fetch R_MCLink data first
    const rmcData = await R_MCLink.findAll({
      attributes: ['id'],
      where: { restaurantId },
      include: [
        {
          model: menuCategory,
          attributes: ["id", "name", "image"],
        },
      ],
    });

    if (!rmcData.length) {
      const response = ApiResponse("1", "No Products Found", "", []);
      return res.json(response);
    }

    // Step 2: Fetch R_PLink and their related models using promises
    const rmcPromises = rmcData.map(async (rmc) => {
        
      const rpLinks = await R_PLink.findAll({
         
        where: { RMCLinkId: rmc.id }, // Assuming rmcId exists in R_PLink
        attributes:['id','name','description','originalPrice','isAvailable','bannerImage','image',"status"],
        // include: [
        //   {
        //     model: productAddons,
        //     attributes: ["id", "isPaid", "isAvaiable", "price"],
        //     required: false,
        //     include: {
        //       model: addOn,
        //       attributes: ["id", "name", "status"],
        //       required: false,
        //       include: [
        //         {
        //           model: collectionAddons,
        //           attributes: ["id", "collectionId"],
        //           required: false,
        //         },
        //       ],
        //     },
        //   },
        //   {
        //     model: productCollections,
        //     where: { status: true },
        //     required: false,
        //     include: [
        //       {
        //         model: collection,
        //         where: { status: true },
        //         attributes: ["id", "title", "minAllowed", "maxAllowed"],
        //         required: false,
        //         include: [
        //           {
        //             model: collectionAddons,
        //             where: { status: true },
        //             attributes: ["id", "maxAllowed", "minAllowed", "isPaid", "isAvaiable", "price"],
        //             required: false,
        //             include: {
        //               model: addOn,
        //               attributes: ["id", "name"],
        //               required: false,
        //             },
        //           },
        //         ],
        //       },
        //     ],
        //   },
        // ],
      });
      return { ...rmc.toJSON(), rpLinks }; // Merge R_MCLink data with its R_PLink
    });

    // Step 3: Resolve all promises
    const rmcWithLinks = await Promise.all(rmcPromises);

    // Step 4: Return the response
    const response = ApiResponse("1", "Products", "", rmcWithLinks);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "error", {});
    return res.status(500).json(response);
  }
}



async function addCategory(req, res) {
  const { name, businessType, restaurantId } = req.body;
  const requiredFields = ["name", "restaurantId", "businessType"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field.toUpperCase()} is required`,
        `Please provide a value for ${field.toUpperCase()}`,
        {}
      );
      return res.json(response);
    }
  }
  const check_cat = await menuCategory.findOne({
    where: [
      {
        name: name,
      },
      {
        businessType: businessType,
      },
    ],
  });
  if (check_cat) {
    const rmc = await R_MCLink.findOne({
      where: [
        {
          status: true,
        },
        {
          menuCategoryId: check_cat.id,
        },
        {
          restaurantId: restaurantId,
        },
      ],
    });

    if (rmc) {
      const response = ApiResponse(
        "0",
        "Category with same name already exists",
        "",
        {}
      );
      return res.json(response);
    } else {
      let type = await orderApplication.findOne({
        where: {
          name: businessType,
        },
      });
       const category = new menuCategory();
    //   if(req.file){
    //         let tmpPath = req.file.path;
    //         let path = tmpPath.replace(/\\/g, "/");
    //         category.image = path;
    //     }
     
      category.name = name;
      category.status = true;
      category.businessType = type?.id;
      // category.restaurantId = restaurantId;
    
      category.status = 1;
      category
        .save()
        .then(async (dat) => {
          const rmc = new R_MCLink();
          rmc.restaurantId = restaurantId;
          rmc.status = true;
          rmc.menuCategoryId = dat.id;
          await rmc.save();

          const response = ApiResponse(
            "1",
            "Category added successfully",
            "",
            {}
          );
          return res.json(response);
        })
        .catch((error) => {
          const response = ApiResponse("0", error.message, "", {});
          return res.json(response);
        });
    }
  } else {
    // let tmpPath = req.file.path;
    // let path = tmpPath.replace(/\\/g, "/");

    const category = new menuCategory();
    category.name = name;
    category.status = true;
    category.businessType = businessType;
    // category.restaurantId = restaurantId;
    // category.image = path;
    category.status = 1;
    category
      .save()
      .then(async (dat) => {
        const rmc = new R_MCLink();
        rmc.restaurantId = restaurantId;
        rmc.status = true;
        rmc.menuCategoryId = dat.id;
        await rmc.save();

        const response = ApiResponse(
          "1",
          "Category added successfully",
          "",
          {}
        );
        return res.json(response);
      })
      .catch((error) => {
        const response = ApiResponse("0", error.message, "", {});
        return res.json(response);
      });
  }
}

async function getAllCategory(req, res) {
  const cats = await R_MCLink.findAll({
    where: [
      {
        restaurantId: req.params.restaurantId,
      },
    ],
    include: {
      model: menuCategory,
      where: {
        status: true,
      },
    },
  });
  let list = [];
  if (cats.length > 0) {
    cats.map((categ) => {
      if (categ?.menuCategory) {
        let obj = {
          id: categ.id,
          cateId: categ?.menuCategory?.id,
          name: categ.menuCategory.name,
          businessType: categ.menuCategory.businessType,
          image: categ.menuCategory.image,
          status: categ.menuCategory.status,
          createdAt: categ.menuCategory.createdAt,
          updatedAt: categ.menuCategory.updatedAt,
        };
        list.push(obj);
      }
    });
  }
  const response = ApiResponse("1", "All Categories", "", {
    categories: list,
  });
  return res.json(response);
}

async function removeCategory(req, res) {
  const { id } = req.body;
  
  const restId = await user.findOne({
    where: {
      id: req.user.id,
    },
    include: {
      model: restaurant,
    },
  });
  const menu = await menuCategory.findOne({
    where: {
      id: id,
    },
  });
  if (menu) {
    menu.status = false;
    menu
      .save()
      .then(async (Dat) => {
        const rmc = await R_MCLink.findOne({
          where: [
            {
              menuCategoryId: menu.id,
            },
            {
              restaurantId: restId.restaurants[0].id,
            },
          ],
        });
        // return res.json(rmc)
        if (rmc) {
          rmc.status = false;
          await rmc.save();
          const response = ApiResponse(
            "1",
            "Category removed successfully",
            "",
            {}
          );
          return res.json(response);
        }
      })
      .catch((error) => {
        const response = ApiResponse("0", error.message, "", {});
        return res.json(response);
      });
  } else {
    const response = ApiResponse("0", "Category not found!", "", {});
    return res.json(response);
  }
}

async function editCategory(req, res) {
  const { categoryId, name } = req.body;
  const requiredFields = ["categoryId", "name"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field.toUpperCase()} is required`,
        `Please provide a value for ${field.toUpperCase()}`,
        {}
      );
      return res.json(response);
    }
  }
  const category = await menuCategory.findOne({
    where: {
      id: categoryId,
    },
  });
  if (category) {
    category.name = name;
    if (req.file) {
      const imagePath = category.image;

      // 3. Delete the image file from the server
      if (imagePath) {
        await fs.unlink(imagePath);
      }
      let tmpPath = req.file.path;
      let path = tmpPath.replace(/\\/g, "/");
      category.image = path;
    }

    category
      .save()
      .then((dat) => {
        const response = ApiResponse(
          "1",
          "Category updated successfully",
          "",
          {}
        );
        return res.json(response);
      })
      .catch((error) => {
        const response = ApiResponse("0", error.message, "", {});
        return res.json(response);
      });
  } else {
    const response = ApiResponse("0", "Category not found", "", {});
    return res.json(response);
  }
}

async function addCollection(req, res) {
  const { name } = req.body;
  const requiredFields = ["name"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field} is required`,
        `Please provide a value for ${field.toUpperCase()}`,
        {}
      );
      return res.json(response);
    }
  }
  const restData = await restaurant.findOne({
    where: {
      userId: req.user.id,
    },
  });
  const check = await collection.findOne({
    where: [
      {
        title: name,
      },
      {
        status: true,
      },
      {
        restaurantId: restData.id,
      },
    ],
  });

  if (check) {
    const response = ApiResponse("0", "Already exists", "", {});
    return res.json(response);
  } else {
    const coll = new collection();
    coll.title = name;
    coll.maxAllowed = 5;
    coll.minAllowed = 1;
    coll.restaurantId = restData.id;

    coll.status = true;
    coll
      .save()
      .then(async (dat) => {
        const response = ApiResponse("1", "Added successfully", "", {});
        return res.json(response);

        // const paoLink = new P_AOLink();
        // paoLink.maxAllowed = max;
        // paoLink.minAllowed = min;
        // paoLink.status = true;
        // paoLink.RPLinkId = rpLinkId;
        // paoLink.addOnCategoryId = dat.id;
        // paoLink
        //   .save()
        //   .then((dd) => {
        //     const response = ApiResponse("1", "Added successfully", "", {});
        //     return res.json(response);
        //   })
        //   .catch((error) => {
        //     const response = ApiResponse("0", error.message, "", {});
        //     return res.json(response);
        //   });
      })
      .catch((error) => {
        const response = ApiResponse("0", error.message, "", {});
        return res.json(response);
      });
  }
}

async function getRPLinkIds(req, res) {
  const rmc = await R_MCLink.findAll({
    where: {
      restaurantId: req.params.restaurantId,
    },
    include: {
      model: R_PLink,
    },
  });
  var list = [];
  if (rmc.length > 0) {
    rmc.map((dd) => {
      dd.R_PLinks.map((data) => {
        let obj = {
          name: data.name,
          rplinkId: data.id,
        };
        list.push(obj);
      });
    });
  }
  const response = ApiResponse("1", "List of Rplinks", "", list);
  return res.json(response);
}

async function addAddOns(req, res) {
  const {
    name,
    collectionId,
    price,
    isPaid,
    isAvaiable,
    minAllowed,
    maxAllowed,
    addOnCategoryId,
    restaurantId,
  } = req.body;
  console.log(req.body)
  
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const requiredFields = ["name", "addOnCategoryId", "restaurantId"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        await t.rollback(); // Rollback if required fields are missing
        const response = ApiResponse(
          "0",
          `${field} is required`,
          `Please provide a value for ${field.toUpperCase()}`,
          {}
        );
        return res.json(response);
      }
    }

    // Additional validation if minAllowed should be less than or equal to maxAllowed
    if (minAllowed > maxAllowed) {
      await t.rollback(); // Rollback if minAllowed is greater than maxAllowed
      const response = ApiResponse(
        "0",
        "Invalid range",
        "Minimum allowed value should be less than or equal to Maximum allowed value",
        {}
      );
      return res.json(response);
    }

    const restData = await restaurant.findOne({
      where: { id: restaurantId },
      attributes: ['businessType'],
      transaction: t // Add transaction context
    });

    const check = await addOn.findOne({
      where: { name: name, restaurantId: restaurantId, status: true },
      transaction: t // Add transaction context
    });

    // If you want to prevent duplicates, uncomment this block
    // if (check) {
    //   await t.rollback(); // Rollback if addon already exists
    //   const response = ApiResponse("0", "Already exists", "", {});
    //   return res.json(response);
    // }

    const newAddon = await addOn.create({
      name: name,
      isPaid: isPaid,
      isAvaiable: isAvaiable,
      minAllowed: 1,
      maxAllowed: 5,
      price: price,
      orderApplicationName: restData.businessType,
      restaurantId: restaurantId,
      status: 1,
    }, { transaction: t }); // Add transaction context

    const collAdd = await collectionAddons.create({
      isPaid: isPaid,
      isAvaiable: isAvaiable,
      minAllowed: minAllowed ? minAllowed : 1,
      maxAllowed: maxAllowed ? maxAllowed : 5,
      price: price,
      status: true,
      addOnId: newAddon.id,
      collectionId: addOnCategoryId,
    }, { transaction: t }); // Add transaction context

    await t.commit(); // Commit the transaction if everything is successful
    let response = ApiResponse("1", "Added successfully", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    const response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}


async function updateAddOns(req, res) {
  const {
    id,
    name,
    isPaid,
    isAvaiable,
    minAllowed,
    maxAllowed,
    price,
    collectionId,
  } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Additional validation if minAllowed should be less than or equal to maxAllowed
    if (minAllowed > maxAllowed) {
      await t.rollback(); // Rollback the transaction
      const response = ApiResponse(
        "0",
        "Invalid range",
        "Minimum allowed value should be less than or equal to Maximum allowed value",
        {}
      );
      return res.json(response);
    }

    let linkCheck = await productAddons.findOne({
      where: { addOnId: id, isAvaiable: true },
      transaction: t // Add transaction context
    });

    if (linkCheck) {
      if (!isAvaiable) {
        await t.rollback(); // Rollback the transaction
        let response = ApiResponse(
          "0",
          "You cannot change its availability as it is linked with a product",
          "",
          {}
        );
        return res.json(response);
      }
    }

    const check = await addOn.findOne({
      where: { id: id },
      transaction: t // Add transaction context
    });

    if (check) {
      check.name = name;
      check.price = price;
      check.isPaid = isPaid;
      check.maxAllowed = maxAllowed;
      check.minAllowed = minAllowed;
      check.isAvaiable = isAvaiable;

      await check.save({ transaction: t }); // Save with transaction context

      let col = await collectionAddons.findOne({
        where: { addOnId: check.id },
        transaction: t // Add transaction context
      });

      if (col) {
        col.collectionId = collectionId;
        col.price = price;
        col.isPaid = isPaid;
        col.isAvaiable = isAvaiable;
        await col.save({ transaction: t }); // Save with transaction context
      } else {
        let newC = await collectionAddons.create({
          collectionId: collectionId,
          price: price,
          isPaid: isPaid,
          isAvaiable: isAvaiable,
          maxAllowed: maxAllowed,
          addOnId: check.id,
          minAllowed: minAllowed,
        }, { transaction: t }); // Create with transaction context
      }

      await t.commit(); // Commit the transaction if everything is successful
      const response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback the transaction
      let response = ApiResponse("0", "Addon not found!", "", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    const response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}


async function getAllAddOnCategories(req, res) {
  const dd = await collection.findAll({
    where: [
      {
        status: true,
      },
      {
        restaurantId: req.params.restaurantId,
      },
    ],
  });
  // return res.json(dd)
  var list = [];
  for (var i = 0; i < dd.length; i++) {
    let obj = {
      //   paoLink: dd[i]?.P_AOLinks[0]?.id,
      addonCategory: {
        id: dd[i]?.id,
        name: dd[i]?.title,
      },
      minAllowed: "1",
      maxAllowed: "2",
    };
    list.push(obj);
  }

  const response = ApiResponse("1", "Add On Cateogry list", "", list);
  return res.json(response);
}

async function deleteAddonCategory(req, res) {
  const { id } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Find the collection by ID
    let data = await collection.findOne({ where: { id: id }, transaction: t });

    if (data) {
      // Soft delete the collection by setting its status to 0
      data.status = 0;
      await data.save({ transaction: t });

      // Find and soft delete all related collectionAddons
      let coll = await collectionAddons.findAll({ where: { collectionId: id }, transaction: t });
      if (coll.length > 0) {
        for (const col of coll) {
          let add = await addOn.findOne({ where: { id: col.addOnId }, transaction: t });
          if (add) {
            add.status = false;
            await add.save({ transaction: t });
          }
        }
      }

      await t.commit(); // Commit the transaction if everything is successful
      const response = ApiResponse("1", "Collection and related data removed successfully", "", {});
      return res.json(response);
    } else {
      // If the collection is not found, rollback the transaction
      await t.rollback();
      const response = ApiResponse("0", "Collection not found", "Error", {});
      return res.json(response);
    }
  } catch (error) {
    // Rollback the transaction if any error occurs
    await t.rollback();
    console.error(error);
    const response = ApiResponse("0", "An error occurred", "Error", {});
    return res.status(500).json(response);
  }
}


async function getAllAddOns(req, res) {
  let add = await collection.findAll({
    where: [
      {
        restaurantId: req.params.restaurantId,
      },
      {
        status: true,
      },
    ],
    include: {
      model: collectionAddons,
      attributes: [
        "id",
        "minAllowed",
        "maxAllowed",
        "isPaid",
        "isAvaiable",
        "price",
      ],
      include: {
        model: addOn,
        attributes: ["id", "name"],
      },
    },
  });

  let ress = ApiResponse("1", "Restaurant Addons", "", add);
  return res.json(ress);
}

async function getRestaurantProfile(req, res) {
  const id = req.user.id;
  const userData = await user.findOne({
    where: {
      id: id,
    },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
    ],
    include: {
      model: restaurant,
      include: {
        model: zoneRestaurants,
        attributes: ["zoneId"],
        include: {
          model: zone,
          attributes: ["name"],
        },
      },
    },
  });

  let obj = {
    id: userData.id,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    countryCode: userData.countryCode,
    phoneNum: userData.phoneNum,
  };
  const data = {
    user: obj,
    restaurant: userData.restaurants[0],
  };
  const response = ApiResponse("1", "Profile", "", data);
  return res.json(response);
}
//Module 2 Stores

/*
        1. Get all restaurants by a user
*/
async function getAllRest(req, res) {
  const userId = req.params.id;
  const restList = await restaurant.findAll({
    where: {
      userId: userId,
    },
    attributes: ["id", "businessName", "address", "status", "logo"],
  });
  const response = ApiResponse("1", "Login successfull", "", restList);
  return res.json(response);
}
/*
        3. Get all prodcuts by a restaurant
*/
async function getAllProdByRest(req, res) {
  const restId = req.params.restid;
  const productsData = await R_MCLink.findAll({
    where: {
      restaurantId: restId,
    },
    include: [
      {
        model: R_PLink,
        attributes: [
          "id",
          "name",
          "description",
          "image",
          "status",
          "isAdult",
          "discountPrice",
        ],
      },
      {
        model: menuCategory,
        attributes: ["id", "name"],
      },
    ],
  });
  const restaurantData = await restaurant.findByPk(restId, {
    include: {
      model: unit,
      as: "currencyUnitID",
      attributes: ["symbol"],
    },
    attributes: ["id"],
  });
  let data = {
    productsData,
    unit: restaurantData.currencyUnitID.symbol,
  };
  const response = ApiResponse("1", "All Products by restaurant", "", data);
  return res.json(response);
}
async function getAdultsProducts(req, res) {
  const restId = req.params.restid;
  const productsData = await R_MCLink.findAll({
    where: {
      restaurantId: restId,
    },
    include: [
      {
        model: R_PLink,
        where:{isAdult:true},
        required:true,
        attributes: [
          "id",
          "name",
          "description",
          "image",
          "status",
          "isAdult",
          "discountPrice",
        ],
      },
      {
        model: menuCategory,
        attributes: ["id", "name"],
      },
    ],
  });
  const restaurantData = await restaurant.findByPk(restId, {
    include: {
      model: unit,
      as: "currencyUnitID",
      attributes: ["symbol"],
    },
    attributes: ["id"],
  });
  let data = {
    productsData,
    unit: restaurantData.currencyUnitID.symbol,
  };
  const response = ApiResponse("1", "All Products by restaurant", "", data);
  return res.json(response);
}

async function getAllCuisineByRest(req, res) {
  const restId = req.params.restid;
  const cuisinesData = await R_CLink.findAll({
    where: {
      restaurantId: restId,
    },
    include: [
      {
        model: cuisine,
        attributes: ["id", "name"],
      },
    ],
  });
  const response = ApiResponse("1", "All cuisines by restaurant", "", {
    cuisinesData,
  });
  return res.json(response);
}
/*
        3. Get all orders by a restaurant
*/
async function getAllOrdersByRest(req, res) {
  const restId = req.params.restid;
  const orderData = await order.findAll({
    where: {
      restaurantId: restId,
    },
    include: [
      {
        model: paymentMethod,
        attributes: ["name"],
      },
      {
        model: orderStatus,
        attributes: ["name"],
      },
      {
        model: deliveryType,
        attributes: ["name"],
      },
    ],
    attributes: ["id", "orderNum", "scheduleDate", "total"],
  });
  const restaurantData = await restaurant.findByPk(restId, {
    include: {
      model: unit,
      as: "currencyUnitID",
      attributes: ["symbol"],
    },
    attributes: ["id"],
  });
  const data = {
    orderData,
    unit: restaurantData.currencyUnitID.symbol,
  };
  const response = ApiResponse("1", "All Orders by a restaurant", "", data);
  return res.json(response);
}
/*
        3. Get ratings of a restaurant
*/
async function getRatingByRest(req, res) {
  const restId = req.params.restid;
  let feedbackData = await restaurantRating.findAll({
    where: {
      restaurantId: restId,
    },
    include: [
      {
        model: user,
        attributes: ["firstName", "lastName"],
      },
      {
        model: order,
        attributes: ["orderNum"],
      },
    ],
  });
  //return res.json(feedbackData);
  let feedbackArr = [];
  let restAvgRate = 0;
  feedbackData.map((fb, idx) => {
    restAvgRate = restAvgRate + fb.value;
    if (fb.comment !== "") {
      let outObj = {
        text: fb.comment,

        userName: `${fb.user?.firstName} ${fb.user?.lastName}`,
        at: fb.at,
        orderNum: fb.order.orderNum,
      };
      feedbackArr.push(outObj);
    }
  });

  let avgRate =
    restAvgRate === 0 ? "No rating yet" : restAvgRate / feedbackData.length;
  avgRate = avgRate !== "No rating yet" ? avgRate.toFixed(2) : avgRate;
  let data = {
    avgRate: avgRate,
    feedBacks: feedbackArr,
  };
  const response = ApiResponse("1", "Ratins", "", data);
  return res.json(response);
}

// Module 3 - Order management
/*
        1.  Get new orders of all restaurants of a user
*/
async function getNewOrders(req, res) {
  let userId = req.params.userid;
  let status = req.params.status;
  if (status === "1") {
    status = [14];
  }
  const allRestaurants = await restaurant.findAll({
    where: {
      userId: userId,
    },
    attributes: ["id"],
  });
  let restArr = allRestaurants.map((ele) => {
    return ele.id;
  });
  let allNewOrders = await order.findAll({
    where: {
      [Op.and]: [
        {
          restaurantId: {
            [Op.or]: restArr,
          },
        },
        {
          orderApplicationId: 1,
        },
        {
          orderStatusId: status,
        },
      ],
    },
    include: [
      {
        model: restaurant,
        include: {
          model: unit,
          as: "currencyUnitID",
          attributes: ["symbol"],
        },
        attributes: ["businessName"],
      },
      {
        model: deliveryType,
        attributes: ["name"],
      },
    ],
    attributes: ["id", "orderNum", "scheduleDate", "total"],
  });
  const response = ApiResponse("1", "All new orders", "", allNewOrders);
  return res.json(response);
}
/*
        2. Get statuses
*/
async function getStatus(req, res) {
  let status = ["Accepted", "Preparing", "Ready for delivery"];
  const allStatusesRaw = await orderStatus.findAll({
    where: {
      name: {
        [Op.or]: status,
      },
    },
    attributes: ["id", "name"],
  });
  const response = ApiResponse("1", "All New Orders", "", allStatusesRaw);
  return res.json(response);
}
async function resturantcharge(req, res) {
  const userId = req.params.id;
  restaurant
    .findOne({
      where: {
        userId,
      },
    })
    .then((restData) => {
      const response = ApiResponse("1","Restaurant Data","",restData);
      return res.json(response);
    });
}
async function updateresturantcharge(req, res) {
  const userId = req.params.id;
  const deliveryCharge = req.body.deliveryCharge;
  restaurant
    .findOne({
      where: {
        userId,
      },
    })
    .then((restData) => {
      restData
        .update(
          {
            deliveryCharge,
          },
          {
            where: {
              userId,
            },
          }
        )
        .then((Data) => {
          const response = ApiResponse("Restaurant Data updated", "", Data);
          return res.json(response);
        });
    });
}
/*
        3. Change Order status
*/
async function changerOrderStatus(req, res) {
  const { orderStatus, orderId, userId } = req.body;
  const requiredFields = ["orderStatus", "orderId", "userId"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field.toUpperCase()} is required`,
        `Please provide a value for ${field.toUpperCase()}`,
        {}
      );
      return res.json(response);
    }
  }
  // new query
  const dd = await order.findOne({
    where: {
      id: orderId,
    },
  });
  dd.orderStatusId = orderStatus;
  dd.paymentRecieved = true;
  const result = await dd.save();

  // *******************************************
  // old query
  // const orderUpdated = await order.update([{ orderStatusId: orderStatus },{paymentRecieved:true}], { where: { id: orderId } });
  // console.log(orderUpdated);
  // return res.json(orderUpdated)
  if (result) {
    if (orderStatus === "12")
      orderHistory.create({
        time: new Date(),
        orderId,
        orderStatusId: orderStatus,
        cancelledBy: userId,
      });
    else
      orderHistory.create({
        time: new Date(),
        orderId,
        orderStatusId: orderStatus,
      });
    let orderData = await order.findByPk(orderId, {
      include: [
        {
          model: user,
          as: "customerId",
          attributes: ["deviceToken","language"],
        },
        {
          model: user,
          as: "DriverId",
          attributes: ["deviceToken","language"],
        },
        {
          model: orderCharge,
        },
        {
          model: restaurant,
          attributes: ["id"],
        },
      ],
    });
      const driverLang = orderData.DriverId.language
        const userLang = orderData.customerId.language

    // Restaurant accepts order
    //     1. Create an entry in wallet with all the earnings
    //     2. Send notification to customer
    //     3. Capture payment if is is by card
    //     4. Create entry that card payment is captured
    if (orderStatus === "2") {
      // When order is accepted --> Create entry in wallet Table with all the earnings
      /*
            orderRideSharing, deliveryType, orderId, adminEarning, driverEarning, 
                userCharge, restaurantEarning, driverId, userId, restId 
            */
      orderPlaceTransaction(
        false,
        orderData.deliveryTypeId,
        orderId,
        orderData.orderCharge.adminEarnings,
        orderData.orderCharge.driverEarnings,
        orderData.total,
        orderData.orderCharge.restaurantEarnings,
        orderData.driverId,
        orderData.userId,
        orderData.restaurantId,
        orderData.currencyUnitId
      );

      if (orderData.deliveryTypeId === 1) {
        
        let to = [`${orderData.DriverId.deviceToken}`];
        let notification = {
          title: "Order accepted by restaurant",
          body: "Your order will be prepared soon",
        };
        sendNotification(to, notification,driverLang);
        to = [`${orderData.customerId.deviceToken}`];
        notification = {
          title: "Order accepted by restaurant",
          body: "Your order will be prepared soon",
        };
        let data = {
          deliveryTime: "20-30",
        };
        sendNotification(to, notification, data,userLang);
      } else {
          
        let to = [`${orderData.customerId.deviceToken}`];
        let notification = {
          title: "Order accepted by restaurant",
          body: "Your order will be prepared soon",
           data: {
          deliveryTime: "20-30"
  },
        };
      
        sendNotification(to, notification,userLang);
      }
      // Initiate payment if payment method is online; create an entry with admin recieved and user paid.
      /*
            paymentByCard, adminReceived, UserPaid, 
                driverPaid, restReceived, driverReceived, food, orderId, userId, driverId, restId, deliveryMode
            */
      // if (orderData.paymentMethodId === 1) {
      paymentTransaction(
        true,
        orderData.total,
        orderData.total,
        0,
        0,
        0,
        false,
        orderId,
        orderData.userId,
        0,
        0,
        "",
        orderData.currencyUnitId
      );
      // }
    }
    //Send notification to customer when food is being prepared
    if (orderStatus === "3") {
      
      let to = [`${orderData.customerId.deviceToken}`];
      let notification = {
        title: "Order is preparing",
        body: "Your food is being prepared",
      };
      sendNotification(to, notification,userLang);

      if (orderData.deliveryTypeId === 1) {
        
        let to = [`${orderData.DriverId.deviceToken}`];
        let notification = {
          title: "Order is preparing",
          body: "Food is being prepared",
        };
        sendNotification(to, notification,driverLang);
        to = [`${orderData.customerId.deviceToken}`];
        notification = {
          title: "Order is preparing",
          body: "Your food is being prepared",
        };
        sendNotification(to, notification,userLang);
      } else {
        let to = [`${orderData.customerId.deviceToken}`];
        let notification = {
          title: "Order is preparing",
          body: "Your food is being prepared",
        };
        sendNotification(to, notification,userLang);
      }
    }
    //Send notification to driver when food is prepared
    if (orderStatus === "4") {
      //in Case of delivery send notification to driver
      if (orderData.deliveryTypeId === 1) {
        let to = [`${orderData.DriverId.deviceToken}`];
        let notification = {
          title: "Order prepared",
          body: "Pick up your food",
        };
        sendNotification(to, notification,driverLang);
      } else {
        let to = [`${orderData.customerId.deviceToken}`];
        let notification = {
          title: "Order prepared",
          body: "Pick up your food",
        };
        sendNotification(to, notification,userLang);
      }
    }
    // Commit transaction that user paid and resturant received in case of self pickup from restaurant
    // & payment mode is COD
    /*
    
            paymentByCard, adminReceived, UserPaid, 
                driverPaid, restReceived, driverReceived, food, orderId, userId, driverId, restId, deliveryMode
        */
    // if (orderStatus === '7' && orderData.paymentMethodId === 2) {
    //     paymentTransaction(false, 0, orderData.orderCharge.total,
    //         0, orderData.orderCharge.total, 0, false, orderId, orderData.userId, 0, orderData.restaurant.id, ''
    //     )
    // }
    // send notification to both in case of cancel
  if (orderStatus === "12") {
  // Notify the driver in their preferred language
  if (orderData.DriverId && orderData.DriverId.deviceToken) {
    let driverTo = [`${orderData.DriverId.deviceToken}`];
    let driverNotification = {
      title: "Order cancelled",
      body: "Restaurant is unable to process your order. Please try later",
    };
    const driverLang = orderData.DriverId.language;
    sendNotification(driverTo, driverNotification, driverLang);
  }

  // Notify the customer in their preferred language
  if (orderData.customerId && orderData.customerId.deviceToken) {
    let customerTo = [`${orderData.customerId.deviceToken}`];
    let customerNotification = {
      title: "Order cancelled",
      body: "Restaurant is unable to process your order. Please try later",
    };
    const userLang = orderData.customerId.language;
    sendNotification(customerTo, customerNotification, userLang);
  }
}

    const response = ApiResponse("1", "Order Status changed", "", orderData);
    return res.json(response);
  } else {
    const response = ApiResponse("0", "Something went wrong", "Error", {});
    return res.json(response);
  }
  // 12 is for cancelled
}

//Module 4 - Products
/*
        1. Assign Menu Category to Restaurant
*/
async function assignMCToRest(req, res) {
  const { restId, mcId } = req.body;
  const requiredFields = ["restId", "mcId"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field.toUpperCase()} is required`,
        `Please provide a value for ${field.toUpperCase()}`,
        {}
      );
      return res.json(response);
    }
  }
  const exist = await R_MCLink.findOne({
    where: {
      menuCategoryId: mcId,
      restaurantId: restId,
    },
  });
  if (exist)
    throw new CustomException(
      "This menu category for the following restaurant already exists",
      "Please try again"
    );
  R_MCLink.create({
    menuCategoryId: mcId,
    restaurantId: restId,
  })
    .then((data) => {
      const response = ApiResponse(
        "1",
        "Menu Category Added to restaurant",
        "",
        {}
      );
      return res.json(response);
    })
    .catch((err) => {
      const response = ApiResponse(
        "1",
        "Failed to Menu Category to restaurant",
        "",
        {}
      );
      return res.json(response);
    });
}

async function assignCuisineToRest(req, res) {
  const { restId, cuisineId } = req.body;
  const requiredFields = ["restId", "cuisineId"];

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Validate required fields
    for (const field of requiredFields) {
      if (!req.body[field]) {
        await t.rollback(); // Rollback the transaction
        const response = ApiResponse(
          "0",
          `${field.toUpperCase()} is required`,
          `Please provide a value for ${field.toUpperCase()}`,
          {}
        );
        return res.json(response);
      }
    }

    // Check if the cuisine already exists for the restaurant
    const exist = await R_CLink.findOne({
      where: {
        cuisineId: cuisineId,
        restaurantId: restId,
      },
      transaction: t // Add transaction context
    });

    if (exist) {
      await t.rollback(); // Rollback the transaction if already exists
      const response = ApiResponse(
        "0",
        "This cuisine for the following restaurant already exists",
        "Please try again",
        {}
      );
      return res.json(response);
    }

    // Assign the cuisine to the restaurant
    await R_CLink.create({
      cuisineId: cuisineId,
      restaurantId: restId,
    }, { transaction: t }); // Create with transaction context

    await t.commit(); // Commit the transaction if successful
    const response = ApiResponse("1", "Cuisine Added to restaurant", "", {});
    return res.json(response);
  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs
    const response = ApiResponse(
      "0",
      "Failed to add cuisine to restaurant",
      err.message,
      {}
    );
    return res.json(response);
  }
}


//Module 4 - Earnings
/*
        1. Restaurant Earning by ID
*/
async function restaunarntEarning(req, res) {
  const restId = req.params.id;
  const earningData = await order.findAll({
    where: {
      restaurantId: restId,
      orderStatusId: 7,
    },
    include: [
      {
        model: orderCharge,
        attributes: ["restaurantEarnings"],
      },
      {
        model: wallet,
      },
    ],
    attributes: ["id", "total"],
  });
  const walletData = await wallet.findAll({
    where: {
      restaurantId: restId,
    },
    attributes: ["amount"],
  });
  const restaurantData = await restaurant.findByPk(restId, {
    include: {
      model: unit,
      as: "currencyUnitID",
      attributes: ["symbol"],
    },
    attributes: ["id"],
  });
  //return res.json(walletData);
  let totalSales = earningData.reduce(
    (pVal, cVal) => pVal + parseFloat(cVal.total),
    0
  );
  let totalSalesAfterCommission = earningData.reduce(
    (pVal, cVal) => pVal + parseFloat(cVal.orderCharge.restaurantEarnings),
    0
  );
  // The negative balance indicates --> has to receive , +ve indicates has to pay
  let balance = walletData.reduce((pVal, cVal) => pVal + cVal.amount, 0);
  let data = {
    totalSales: totalSales.toFixed(2),
    totalSalesAfterCommission: totalSalesAfterCommission.toFixed(2),
    // reversing the symbol as +ve shows --> has to received & vice versa
    balance: -1 * balance.toFixed(2),
    unit: restaurantData.currencyUnitID.symbol,
  };
  const response = ApiResponse("1", "Earnings Data", "", data);
  return res.json(response);
}

/*
        2. Request for payout
*/
async function requestPayout(req, res) {
  const { amount, message, restId } = req.body;
  const requiredFields = ["amount", "message", "restId"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field.toUpperCase()} is required`,
        `Please provide a value for ${field.toUpperCase()}`,
        {}
      );
      return res.json(response);
    }
  }
  const restaurantData = await restaurant.findByPk(restId, {
    include: {
      model: unit,
      as: "currencyUnitID",
      attributes: ["id", "symbol"],
    },
    attributes: ["currencyUnitId"],
  });
  // TODO Change the minimum payout to dynamic value
  if (amount < 150) {
    const response = ApiResponse(
      "0",
      "Request cannot be processed",
      `Minimum payout amount is ${restaurantData.currencyUnitID.symbol}150`,
      {}
    );
    return res.json(response);
  }

  let transactionId = uuid.v1();
  payout
    .create({
      amount,
      status: "pending",
      transactionId,
      message: message ? message : null,
      restaurantId: restId,
      unitId: restaurantData.currencyUnitId,
    })
    .then((data) => {
      const response = ApiResponse("1", "Payout request generated", "", {});
      return res.json(response);
    });
}
/*
        3. get all payout requests
*/
async function getAllPayoutsByRestId(req, res) {
  const restId = req.params.id;
  const allPayouts = await payout.findAll({
    where: {
      restaurantId: restId,
    },
    include: {
      model: unit,
      attributes: ["symbol"],
    },
    attributes: [
      "id",
      "amount",
      "status",
      "transactionId",
      "message",
      "createdAt",
    ],
  });
  const response = ApiResponse("1", "Payout request generated", "", allPayouts);
  return res.json(response);
}

//Module 5 - DashBoard
/*
    1. Dash Board stats & bar graph
*/
async function dashBoardStats(req, res) {
  const userId = req.params.id;
  const allData = await restaurant.findAll({
    where: {
      userId,
    },
    include: [
      {
        model: order,
        attributes: ["id", "status", "total", "orderStatusId"],
      },
      {
        model: unit,
        as: "currencyUnitID",
        attributes: ["symbol"],
      },
    ],
    attributes: ["id"],
  });
  let allEarnings = 0,
    completedOrders = 0,
    allOrders = 0,
    onGoingOrders = 0,
    cancelledOrders = 0;
  allData.map((ele) => {
    //All Earnings
    let tempOrders = ele.orders.filter((order) => order.orderStatusId !== 12);
    let restEarnings = tempOrders.reduce(
      (pVal, cVal) => pVal + parseFloat(cVal.total),
      0
    );
    allEarnings = allEarnings + restEarnings;
    //
    let restCompletedOrders = ele.orders.filter(
      (order) => order.orderStatusId === 7
    );
    completedOrders = completedOrders + restCompletedOrders.length;

    allOrders = allOrders + ele.orders.length;

    let restonGoingOrders = ele.orders.filter(
      (order) => order.orderStatusId !== 7 && order.orderStatusId !== 12
    );
    //console.log(restonGoingOrders)
    onGoingOrders = onGoingOrders + restonGoingOrders.length;

    let restcancelledOrders = ele.orders.filter(
      (order) => order.orderStatusId === 12
    );
    cancelledOrders = cancelledOrders + restcancelledOrders.length;
  });

  const data = {
    allEarnings: allEarnings.toFixed(2),
    completedOrders,
    allOrders,
    onGoingOrders,
    cancelledOrders,
    stores: allData.length,
    unit: allData[0].currencyUnitID ? allData[0].currencyUnitID.symbol : "N/A",
  };
  const response = ApiResponse("1", "Dashboard Status", "", data);
  return res.json(response);
}
async function tablebookings(req, res) {
  const userId = req.params.id;
  restaurant
    .findOne({
      where: {
        userId,
      },
    })
    .then((restdata) => {
      const restaurantId = restdata.id;
      tableBooking
        .findAll({
          where: {
            restaurantId,
          },
        })
        .then((data) => {
          const response = ApiResponse(
            "1",
            "Table Booking for the Restaurant",
            "",
            data
          );
          return res.json(response);
        });
    });
}
async function accepttablebooking(req, res) {
  const { id } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const data = await tableBooking.update(
      {
        status: true,
      },
      {
        where: { id },
        transaction: t, // Add transaction context
      }
    );

    if (data[0] === 0) {
      // If no rows were affected, rollback the transaction
      await t.rollback();
      const response = ApiResponse(
        "0",
        "Table Booking not found or already accepted",
        "",
        {}
      );
      return res.json(response);
    }

    await t.commit(); // Commit the transaction if successful
    const response = ApiResponse(
      "1",
      "Table Booking accepted for the Restaurant",
      "",
      data
    );
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    const response = ApiResponse(
      "0",
      "Failed to accept table booking",
      error.message,
      {}
    );
    return res.json(response);
  }
}

async function rejecttablebooking(req, res) {
  const id = req.params.id;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const data = await tableBooking.update(
      {
        status: false,
      },
      {
        where: { id },
        transaction: t, // Add transaction context
      }
    );

    if (data[0] === 0) {
      // If no rows were affected, rollback the transaction
      await t.rollback();
      const response = ApiResponse(
        "0",
        "Table Booking not found or already rejected",
        "",
        {}
      );
      return res.json(response);
    }

    await t.commit(); // Commit the transaction if successful
    const response = ApiResponse(
      "1",
      "Table Booking rejected for the Restaurant",
      "",
      data
    );
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    const response = ApiResponse(
      "0",
      "Failed to reject table booking",
      error.message,
      {}
    );
    return res.json(response);
  }
}

/*
    2. Dash Board previous year earnings
*/
async function dashBoardYearlyEarn(req, res) {
  const userId = req.params.id;
  let monthArr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const allData = await restaurant.findAll({
    where: {
      userId,
    },
    include: [
      {
        model: order,
        where: {
          orderStatusId: 7,
        },
        attributes: ["id", "scheduleDate", "total", "orderStatusId"],
      },
      {
        model: unit,
        as: "currencyUnitID",
        attributes: ["symbol"],
      },
    ],
    attributes: ["id"],
  });
  let months = [],
    earnWithMonths = [],
    outMonths = [];
  let cDate = new Date();
  // Running a loop to get eranings for past 11 months
  for (let i = 0; i <= 11; i++) {
    let oneMonthStart = new Date(cDate.getFullYear(), cDate.getMonth() - i, 0);
    let oneMonthEnd = new Date(cDate.getFullYear(), cDate.getMonth() - i, 0);
    oneMonthStart.setDate(1);
    oneMonthStart.setHours(0, 0, 1);
    oneMonthEnd.setHours(23, 59, 0);
    let mStart = oneMonthStart.toString();
    let mEnd = oneMonthEnd.toString();
    let totalEarnings = 0;
    allData.map((ele) => {
      let oneMonthData = ele.orders.filter(
        (b) =>
          Date.parse(oneMonthStart) < Date.parse(b.scheduleDate) &&
          Date.parse(b.scheduleDate) < Date.parse(oneMonthEnd)
      );
      let restWiseEarnings = oneMonthData.reduce(
        (pVal, cVal) => pVal + parseFloat(cVal.total),
        0
      );
      //console.log('rest wiese' , restWiseEarnings);
      totalEarnings = totalEarnings + restWiseEarnings;
    });
    //console.log(oneMonthStart.getMonth())
    let tmpObj = totalEarnings.toFixed(2);
    earnWithMonths.push(tmpObj);
    outMonths.push(
      `${monthArr[oneMonthStart.getMonth()]} ${oneMonthStart.getFullYear()}`
    );
    //console.log('Month Start', mStart, 'Month End',mEnd )
  }
  // get earnings of current month
  let date = new Date(cDate);
  let currentDate = date.getDate();
  let startOfCurrentMonth = new Date(
    cDate.getTime() - (currentDate - 1) * 24 * 60 * 60 * 1000
  );
  //console.log(startOfCurrentMonth.toString())
  let currtotalEarnings = 0;
  allData.map((ele) => {
    let oneMonthData = ele.orders.filter(
      (b) =>
        Date.parse(startOfCurrentMonth) < Date.parse(b.scheduleDate) &&
        Date.parse(b.scheduleDate) < Date.parse(date)
    );
    let restWiseEarnings = oneMonthData.reduce(
      (pVal, cVal) => pVal + parseFloat(cVal.total),
      0
    );
    currtotalEarnings = currtotalEarnings + restWiseEarnings;
  });
  let tmpObj = currtotalEarnings.toFixed(2);
  earnWithMonths.unshift(tmpObj);
  outMonths.unshift(`${monthArr[date.getMonth()]} ${date.getFullYear()}`);
  const data = {
    earnWithMonths,
    outMonths,
    unit: allData,
  };
  const response = ApiResponse("1", "Earning of previous years", "", data);
  return res.json(response);
}

async function updateAddOnCategory(req, res) {
  const { id, name } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const check = await collection.findOne({
      where: { id: id },
      transaction: t, // Add transaction context
    });

    if (check) {
      check.title = name;

      await check.save({ transaction: t }); // Save with transaction context

      await t.commit(); // Commit the transaction if successful

      const response = ApiResponse("1", "Updated successfully!", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback the transaction if not found

      const response = ApiResponse("0", "Not found!", "", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}


async function updateUserProfile(req, res) {
  const { firstName, lastName, email, countryCode, phoneNum } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const data = await user.findOne({
      where: { id: req.user.id },
      transaction: t, // Add transaction context
    });

    if (data) {
      // Update user profile fields
      data.firstName = firstName;
      data.lastName = lastName;
      data.email = email;
      data.countryCode = countryCode;
      data.phoneNum = phoneNum;

      await data.save({ transaction: t }); // Save with transaction context

      await t.commit(); // Commit the transaction if successful

      const response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback the transaction if user not found

      const response = ApiResponse("0", "User not found!", "", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}


// async function completedOrders(req, res) {
//   const status = await orderStatus.findOne({
//     where: {
//       name: "Delivered",
//     },
//   });
//   const cancelledStatus = await orderStatus.findOne({
//     where: {
//       name: "Cancelled",
//     },
//   });
// //   const type = await orderType.findOne({
// //     where: {
// //       type: "Normal",
// //     },
// //   });
//   const reject = await orderStatus.findOne({
//     where: {
//       name: "Reject",
//     },
//   });
//   const orderData = await order.findAll({
//     where: [
//     //   {
//     //     orderTypeId: type.id,
//     //   },
//       {
//         restaurantId: req.params.restaurantId,
//       },
//       {
//         orderStatusId: status.id,
//       },
//     ],
//     include: [
//          {model:orderType},
//       {
//         model: orderCharge,
//       },
//       {
//         model: user,
//         attributes: ["id", "userName"],
//       },
//     ],
//   });
//   const cancelledOrder = await order.findAll({
//     where: [
//       {
//         restaurantId: req.params.restaurantId,
//       },
//       {
//         orderStatusId: cancelledStatus.id,
//       },
//     ],
//     include: [
//         {model:orderType},
//       {
//         model: orderCharge,
//       },
//       {
//         model: user,
//         attributes: ["id", "userName"],
//       },
//     ],
//   });
//   const rejectedOrders = await order.findAll({
//     where: [
//       {
//         restaurantId: req.params.restaurantId,
//       },
//       {
//         orderStatusId: reject.id,
//       },
//     ],
//     include: [
//          {model:orderType},
//       {
//         model: orderCharge,
//       },
//       {
//         model: user,
//         attributes: ["id", "userName"],
//       },
//     ],
//   });
//   const data = {
//     completedOrder: orderData,
//     cancelledOrder: cancelledOrder,
//     rejectOrders:rejectedOrders
//   };
//   const response = ApiResponse("1", "Completed Order", "", data);
//   return res.json(response);
// }
async function completedOrders(req, res) {
  // Fetch all relevant statuses in a single query
  const statuses = await orderStatus.findAll({
    where: {
      name: ["Delivered", "Cancelled", "Reject"],
    },
  });

  // Map statuses by name for easier access
  const statusMap = {};
  statuses.forEach(status => {
    statusMap[status.name] = status.id;
  });

  // Define the conditions for each order status
  const orderConditions = [
    { key: 'completedOrder', statusId: statusMap['Delivered'] },
    { key: 'cancelledOrder', statusId: statusMap['Cancelled'] },
    { key: 'rejectOrders', statusId: statusMap['Reject'] }
  ];

  const results = await Promise.all(orderConditions.map(async condition => {
    return {
      [condition.key]: await order.findAll({
        where: {
          restaurantId: req.params.restaurantId,
          orderStatusId: condition.statusId,
        },
        include: [
          { model: orderType },
          { model: orderCharge },
          {
            model: user,
            attributes: ["id", "userName"],
          },
        ],
      })
    };
  }));

  // Combine the results into a single object
  const data = Object.assign({}, ...results);

  const response = ApiResponse("1", "Completed Order", "", data);
  return res.json(response);
}


// async function activeOrders(req, res) {
//   const { restaurantId } = req.params;
//   const Accepted = await orderStatus.findOne({
//     where: {
//       name: "Accepted",
//     },
//   });
//   const Preparing = await orderStatus.findOne({
//     where: {
//       name: "Preparing",
//     },
//   });
//   const readyForDelivery = await orderStatus.findOne({
//     where: {
//       name: "Ready for delivery",
//     },
//   });
//   const way = await orderStatus.findOne({
//     where: {
//       name: "On the way",
//     },
//   });
//   const pickup = await orderStatus.findOne({
//     where: {
//       name: "Food Pickedup",
//     },
//   });
//   const AcceptedByDriver = await orderStatus.findOne({
//     where: {
//       name: "Accepted by Driver",
//     },
//   });
//   let status_list = [
//     Accepted.id,
//     Preparing.id,
//     readyForDelivery.id,
//     way.id,
//     pickup.id,
//     AcceptedByDriver.id,
//   ];

//   const orderData = await order.findAll({
//     where: {
//       restaurantId: restaurantId,
//       orderStatusId: {
//         [sequelize.Op.in]: status_list,
//       },
//     },
//     include: [
//       {
//         model: orderCharge,
//       },
//       {
//         model: user,
//         attributes: ["id", "userName", "email", "countryCode", "phoneNum"],
//       },
//       {
//         model: orderStatus,
//       },
//     ],
//   });
//   const response = ApiResponse("1", "Active Orders", "", orderData);
//   return res.json(response);
// }
async function activeOrders(req, res) {
  const { restaurantId } = req.params;

  // Fetch all relevant statuses in a single query
  const statuses = await orderStatus.findAll({
    where: {
      name: [
        "Accepted", 
        "Preparing", 
        "Ready for delivery", 
        "On the way", 
        "Food Pickedup", 
        "Accepted by Driver"
      ],
    },
    attributes: ["id"], // Only fetch the 'id' attribute to minimize data load
  });

  // Extract the IDs from the statuses
  const statusIds = statuses.map(status => status.id);

  // Fetch the orders with the relevant status IDs
  const orderData = await order.findAll({
    where: {
      restaurantId: restaurantId,
      orderStatusId: {
        [sequelize.Op.in]: statusIds,
      },
    },
    include: [
      {
        model: orderCharge,
      },
      {
        model: user,
        attributes: ["id", "userName", "email", "countryCode", "phoneNum"],
      },
      {
        model: orderStatus,
      },
    ],
  });

  const response = ApiResponse("1", "Active Orders", "", orderData);
  return res.json(response);
}


async function getRating(req, res) {
  const ratings = await restaurantRating.findAll({
    where: {
      restaurantId: req.params.restaurantId,
    },
    include: [
      {
        model: order,
        attributes: ["orderNum"],
      },
      {
        model: user,
        attributes: ["id", "userName", "firstName", "lastName"],
      },
    ],
  });

  const averageRating = await restaurantRating.findAll({
    attributes: [
      [sequelize.fn("AVG", sequelize.col("value")), "averageRating"],
    ],
    where: {
      restaurantId: req.params.restaurantId,
    },
  });
  const data = {
    averageRating: Number(averageRating[0]?.dataValues?.averageRating).toFixed(
      2
    ),
    ratings: ratings,
  };
  const response = ApiResponse("1", "Rating", "", data);
  return res.json(response);
}

async function acceptBookTableRequest(req, res) {
  const { tableBookingId } = req.body;
  try {
    const status = await orderStatus.findOne({
      where: {
        name: "Accepted",
      },
    });
    const table = await tableBooking.findOne({
      where: {
        id: tableBookingId,
      },
      include: [
        {
          model: restaurant,
          attributes: ["id", "businessName"],include:{model:user,attributes:['ip',"id"]}
        },
        {
          model: user,
          attributes: ["id", "deviceToken","ip","language"],
        },
      ],
    });
    if (table) {
      table.orderStatusId = status.id;
      table
        .save()
        .then(async(dat) => {
            
            homeData(table.restaurantId).then((dat)=>{
             let eventDataForRetailer = {
              type: "acceptBookTableRequest",
              data: {
                status: "1",
                message: "Data",
                error: "",
                data: dat,
              },
            };
            sendEvent(table?.restaurant?.user?.id,eventDataForRetailer)
        })
        .catch((error)=>{
            console.log(error)
        })
        const userLanguage = table?.user?.language
            
          singleNotification(
            formatTokens(table?.user?.deviceToken),
            "Accept Request",
            `Your Request for Table booking is accepted by ${table?.restaurant?.businessName} restaurant`,{},userLanguage
          );
          const response = ApiResponse("1", "Accepted Request", "", {});
          return res.json(response);
        })
        .catch((error) => {
          const response = ApiResponse("0", error.message, "Error", {});
          return res.json(response);
        });
    } else {
      const response = ApiResponse("0", "Not found", "Error", {});
      return res.json(response);
    }
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
async function rejectBookTableRequest(req, res) {
  const { tableBookingId } = req.body;
  try {
    const status = await orderStatus.findOne({
      where: {
        name: "Cancelled",
      },
    });
    const table = await tableBooking.findOne({
      where: {
        id: tableBookingId,
      },
      include: [
        {
          model: restaurant,
          attributes: ["id", "businessName"],include:{model:user,attributes:['ip','id']}
        },
        {
          model: user,
          attributes: ["id", "deviceToken","language"],
        },
      ],
    });
    if (table) {
      table.orderStatusId = status.id;
      table
        .save()
        .then(async(dat) => {
             homeData(table.restaurantId).then((dat)=>{
                     let eventDataForRetailer = {
                      type: "rejectBookTableRequest",
                      data: {
                        status: "1",
                        message: "Data",
                        error: "",
                        data: dat,
                      },
                    };
                    sendEvent(table?.restaurant?.user?.id,eventDataForRetailer)
                })
                .catch((error)=>{
                    console.log(error)
                })
                const userLang = table?.user?.language
          singleNotification(
            formatTokens(table?.user?.deviceToken),
            "Cancelled Request",
            `Your Request for Table booking is Cancelled by ${table?.restaurant?.businessName} restaurant`,userLang
          );
          const response = ApiResponse("1", "Cancelled Request", "", {});
          return res.json(response);
        })
        .catch((error) => {
          const response = ApiResponse("0", error.message, "Error", {});
          return res.json(response);
        });
    }
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

// async function getTableBookings(req, res) {
//   const placed = await orderStatus.findOne({
//     where: {
//       name: "Placed",
//     },
//   });
//   const noShow = await orderStatus.findOne({
//     where: {
//       name: "No Show",
//     },
//   });
//   const Accepted = await orderStatus.findOne({
//     where: {
//       name: "Accepted",
//     },
//   });
//   const Cancelled = await orderStatus.findOne({
//     where: {
//       name: "Cancelled",
//     },
//   });
//   const Delivered = await orderStatus.findOne({
//     where: {
//       name: "Delivered",
//     },
//   });
//   const currentDateTime = new Date();
//  const placedOrders = await tableBooking.findAll({
//   where: {
//     restaurantId: req.body.restaurantId,
//     orderStatusId: {
//       [Op.in]: [Accepted.id],
//     },
//     // [Op.and]: [
//     //   literal(`STR_TO_DATE(CONCAT(date, ' ', time), '%m-%d-%Y %h:%i %p') > NOW()`)
//     // ]
//   },
//   include: [
//     {
//       model: user,
//       attributes: ["id", "userName"],
//     },
//   ],
// });

//   const acceptedOrders = await tableBooking.findAll({
//   where: {
//     restaurantId: req.body.restaurantId,
//     orderStatusId: {
//       [Op.in]: [Delivered.id, Cancelled.id,noShow.id],
//     },
//     //  [Op.and]: [
//     //   literal(`STR_TO_DATE(CONCAT(date, ' ', time), '%m-%d-%Y %h:%i %p') < NOW()`)
//     // ]
//   },
//   include: [
//     {
//       model: orderStatus,
//       attributes: ["name"],
//     },
//     {
//       model: user,
//       attributes: ["id", "userName"],
//     },
//   ],
// });
//   const data = {
//     activeBookings: placedOrders,
//     completedBookings: acceptedOrders,
//   };
//   const response = ApiResponse("1", "Restaurant Table Bookings", "", data);
//   return res.json(response);
// }
async function getTableBookings(req, res) {
  const { restaurantId } = req.body;

  // Fetch all relevant statuses in a single query
  const statuses = await orderStatus.findAll({
    where: {
      name: ["Placed", "No Show", "Accepted", "Cancelled", "Delivered"],
    },
    attributes: ["id", "name"], // Fetch both 'id' and 'name' for easy reference
  });

  // Map statuses by name for easier access
  const statusMap = {};
  statuses.forEach(status => {
    statusMap[status.name] = status.id;
  });

  const currentDateTime = new Date();

  // Query for placed orders (active bookings)
  const placedOrders = await tableBooking.findAll({
    where: {
      restaurantId: restaurantId,
      orderStatusId: statusMap["Accepted"],
      // Uncomment and adjust the condition if date-time filtering is required
      // [Op.and]: [
      //   literal(`STR_TO_DATE(CONCAT(date, ' ', time), '%m-%d-%Y %h:%i %p') > NOW()`)
      // ]
    },
    include: [
      {
        model: user,
        attributes: ["id", "userName"],
      },
    ],
  });

  // Query for completed orders (completed bookings)
  const acceptedOrders = await tableBooking.findAll({
    where: {
      restaurantId: restaurantId,
      orderStatusId: {
        [Op.in]: [
          statusMap["Delivered"], 
          statusMap["Cancelled"], 
          statusMap["No Show"]
        ],
      },
      // Uncomment and adjust the condition if date-time filtering is required
      // [Op.and]: [
      //   literal(`STR_TO_DATE(CONCAT(date, ' ', time), '%m-%d-%Y %h:%i %p') < NOW()`)
      // ]
    },
    include: [
      {
        model: orderStatus,
        attributes: ["name"],
      },
      {
        model: user,
        attributes: ["id", "userName"],
      },
    ],
  });

  const data = {
    activeBookings: placedOrders,
    completedBookings: acceptedOrders,
  };

  const response = ApiResponse("1", "Restaurant Table Bookings", "", data);
  return res.json(response);
}
async function addDriver(req, res) {
  const {
    firstName,
    lastName,
    email,
    countryCode,
    phoneNum,
    password,
    restaurantId,
  } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Check if the email is already taken
    const dd = await user.findOne({
      where: { email: email },
      transaction: t, // Add transaction context
    });

    if (dd) {
      await t.rollback(); // Rollback the transaction
      const response = ApiResponse("0", "Email already taken", "", {});
      return res.json(response);
    }

    // Check if the phone number is already taken
    const phoneCheck = await user.findOne({
      where: { countryCode: countryCode, phoneNum: phoneNum },
      transaction: t, // Add transaction context
    });

    if (phoneCheck) {
      await t.rollback(); // Rollback the transaction
      const response = ApiResponse("0", "Phone number already taken", "", {});
      return res.json(response);
    }

    // Process the file path for the driver's profile photo
    let tmpPath = req.file.path;
    let path = tmpPath.replace(/\\/g, "/");

    // Find the driver user type
    const driverTypeStatus = await userType.findOne({
      where: { name: "Driver" },
      transaction: t, // Add transaction context
    });

    // Create a new driver user
    const newDriver = await user.create({
      firstName,
      lastName,
      email,
      countryCode,
      verifiedAt: Date.now(),
      phoneNum,
      userTypeId: driverTypeStatus.id,
      status: 1,
      password: await bcrypt.hash(password, 10),
    }, { transaction: t }); // Create with transaction context

    // Find the service type
    const service_type = await serviceType.findOne({
      where: { name: "Food delivery" },
      transaction: t, // Add transaction context
    });

    // Create the driver's details
    await driverDetails.create({
      profilePhoto: path,
      serviceTypeId: service_type.id,
      userId: newDriver.id,
      status: true,
    }, { transaction: t }); // Create with transaction context

    // Associate the driver with the restaurant
    await restaurantDriver.create({
      restaurantId: restaurantId,
      userId: newDriver.id,
      status: true,
    }, { transaction: t }); // Create with transaction context

    await t.commit(); // Commit the transaction if successful

    const response = ApiResponse("1", "Driver added successfully", "", {
      driverId: newDriver.id,
    });
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function addDriverZone(req, res) {
  const { countryId, cityId, zoneId, language, driverId } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const zz = new driverZone({
      countryId: countryId,
      cityId: cityId,
      language: language,
      userId: driverId,
      status: 1,
      zoneId: zoneId,
    });

    await zz.save({ transaction: t }); // Save with transaction context

    await t.commit(); // Commit the transaction if successful

    const response = ApiResponse("1", "Zone added successfully", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function getData(req, res) {
  const zonesData = await zone.findAll({
    where: {
      status: true,
    },
    attributes: ["id", "name"],
  });
  const countries = await country.findAll({
    where: {
      status: true,
    },
    include: {
      model: city,
      where: {
        status: true,
      },
    },
  });
  const data = {
    zones: zonesData,
    countries,
  };
  const response = ApiResponse("1", "Data", "", data);
  return res.json(response);
}

async function getVehicleType(req, res) {
  const types = await vehicleType.findAll({
    where: {
      status: true,
    },
  });
  let data = {
    types,
  };
  const response = ApiResponse("1", "Data", "", data);
  return res.json(response);
}

async function addDriverLicense(req, res) {
  const { licFrontPhoto, licBackPhoto } = req.files;
  const { licIssueDate, licExpiryDate, licNum, driverId } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const check = await driverDetails.findOne({
      where: {
        userId: driverId,
        status: true,
      },
      transaction: t, // Add transaction context
    });

    if (check) {
      if (licFrontPhoto) {
        let licFrontPhotoTmp = licFrontPhoto[0].path;
        let licFrontPhotoPath = licFrontPhotoTmp.replace(/\\/g, "/");
        check.licFrontPhoto = licFrontPhotoPath;
      }
      if (licBackPhoto) {
        let licBackPhotoTmp = licBackPhoto[0].path;
        let licBackPhotoPath = licBackPhotoTmp.replace(/\\/g, "/");
        check.licBackPhoto = licBackPhotoPath;
      }
      check.licIssueDate = licIssueDate;
      check.licExpiryDate = licExpiryDate;
      check.licNum = licNum;
      check.userId = driverId;
      check.status = true;

      await check.save({ transaction: t }); // Save with transaction context

    } else {
      const newDetails = new driverDetails();
      if (licFrontPhoto) {
        let licFrontPhotoTmp = licFrontPhoto[0].path;
        let licFrontPhotoPath = licFrontPhotoTmp.replace(/\\/g, "/");
        newDetails.licFrontPhoto = licFrontPhotoPath;
      }
      if (licBackPhoto) {
        let licBackPhotoTmp = licBackPhoto[0].path;
        let licBackPhotoPath = licBackPhotoTmp.replace(/\\/g, "/");
        newDetails.licBackPhoto = licBackPhotoPath;
      }
      newDetails.licIssueDate = licIssueDate;
      newDetails.licExpiryDate = licExpiryDate;
      newDetails.licNum = licNum;
      newDetails.userId = driverId;
      newDetails.status = true;

      await newDetails.save({ transaction: t }); // Save with transaction context
    }

    await t.commit(); // Commit the transaction if successful

    const response = ApiResponse("1", "License added successfully", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function addDriverAddress(req, res) {
  const { streetAddress, building, city, state, zipCode, lat, lng, driverId } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const check = await address.findOne({
      where: {
        lat: lat,
        lng: lng,
        userId: driverId,
        status: true,
      },
      transaction: t, // Add transaction context
    });

    if (check) {
      // Update existing address
      check.streetAddress = streetAddress;
      check.building = building;
      check.city = city;
      check.state = state;
      check.zipCode = zipCode;

      await check.save({ transaction: t }); // Save with transaction context

    } else {
      // Create new address
      const newAddress = await address.create({
        streetAddress,
        building,
        city,
        state,
        zipCode,
        lat,
        lng,
        userId: driverId,
        status: true,
      }, { transaction: t }); // Create with transaction context
    }

    await t.commit(); // Commit the transaction if successful

    const response = ApiResponse("1", "Address added successfully", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function addVehicleDetails(req, res) {
  const { make, model, year, registrationNum, color, driverId, vehicleTypeId } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Process image paths
    const frontimagePath = req.files["front"][0].path.replace(/\\/g, "/");
    const backimagePath = req.files["back"][0].path.replace(/\\/g, "/");
    const leftimagePath = req.files["left"][0].path.replace(/\\/g, "/");
    const rightimagePath = req.files["right"][0].path.replace(/\\/g, "/");
    const docfrontimagePath = req.files["document_front"][0].path.replace(/\\/g, "/");
    const docbackimagePath = req.files["document_back"][0].path.replace(/\\/g, "/");

    // Check if vehicle details already exist for this driver
    const detail = await vehicleDetails.findOne({
      where: {
        userId: driverId,
        status: true,
      },
      transaction: t, // Add transaction context
    });

    if (detail) {
      // Update existing vehicle images
      await vehicleImages.update(
        { image: frontimagePath, uploadTime: Date.now(), status: true },
        { where: { vehicleDetailId: detail.id, name: "front" }, transaction: t }
      );

      await vehicleImages.update(
        { image: backimagePath, uploadTime: Date.now(), status: true },
        { where: { vehicleDetailId: detail.id, name: "back" }, transaction: t }
      );

      await vehicleImages.update(
        { image: leftimagePath, uploadTime: Date.now(), status: true },
        { where: { vehicleDetailId: detail.id, name: "left" }, transaction: t }
      );

      await vehicleImages.update(
        { image: rightimagePath, uploadTime: Date.now(), status: true },
        { where: { vehicleDetailId: detail.id, name: "right" }, transaction: t }
      );

      await vehicleImages.update(
        { image: docfrontimagePath, uploadTime: Date.now(), status: true },
        { where: { vehicleDetailId: detail.id, name: "document front" }, transaction: t }
      );

      await vehicleImages.update(
        { image: docbackimagePath, uploadTime: Date.now(), status: true },
        { where: { vehicleDetailId: detail.id, name: "document back" }, transaction: t }
      );

    } else {
      // Create new vehicle details
      const newDetail = await vehicleDetails.create({
        model,
        make,
        year,
        registrationNum,
        color,
        vehicleTypeId,
        userId: driverId,
        status: true,
      }, { transaction: t }); // Create with transaction context

      // Create new vehicle images
      await vehicleImages.bulkCreate([
        { name: "front", image: frontimagePath, uploadTime: Date.now(), status: true, vehicleDetailId: newDetail.id },
        { name: "back", image: backimagePath, uploadTime: Date.now(), status: true, vehicleDetailId: newDetail.id },
        { name: "left", image: leftimagePath, uploadTime: Date.now(), status: true, vehicleDetailId: newDetail.id },
        { name: "right", image: rightimagePath, uploadTime: Date.now(), status: true, vehicleDetailId: newDetail.id },
        { name: "document front", image: docfrontimagePath, uploadTime: Date.now(), status: true, vehicleDetailId: newDetail.id },
        { name: "document back", image: docbackimagePath, uploadTime: Date.now(), status: true, vehicleDetailId: newDetail.id }
      ], { transaction: t }); // Create with transaction context
    }

    await t.commit(); // Commit the transaction if successful

    const response = ApiResponse("1","Vehicle Details Added successfully","", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function getProductByIdApi(req, res) {
  const { rpId } = req.body;
  try {
    const productData = await R_PLink.findOne({
      where: {
        id: rpId,
      },
      include: [
          {model:R_MCLink,attributes:['id'],include:{model:menuCategory}},
        {
          model: productCollections,
          attributes: ["id"],
          include: {
            model: collection,
            attributes: ["id", "title"],
            include: {
              model: collectionAddons,
              attributes: [
                "id",
                "maxAllowed",
                "minAllowed",
                "isPaid",
                "isAvaiable",
                "price",
              ],
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          },
        },
      ],
    });

    let rr = ApiResponse("1", "Product Data", "", productData);
    return res.json(rr);

  } catch (error) {
      console.log(error)
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function inDeliverOrders(req, res) {
    
    let type = await deliveryType.findOne({where:{name:"COD"}});
  const status = await orderStatus.findOne({
    where: {
      name: "Food Pickedup",
    },
  });
  const onWay = await orderStatus.findOne({
    where: {
      name: "On the way",
    },
  });
  const arrived = await orderStatus.findOne({
    where: {
      name: "Food Arrived",
    },
  });
  const restData = await restaurant.findOne({
    where: {
      userId: req.user.id,
    },
  });
  const orders = await order.findAll({
  where: {
    orderStatusId: {
      [Op.in]: [status.id,onWay.id,arrived.id] // orderStatusId is in [5, 6, 7]
    },
    restaurantId: restData.id
  },
  include: [
      {model:user,as:"DriverId",attributes:['id','firstName','lastName','countryCode','phoneNum','email','image']},
    {
      model: user,
      attributes: ["id", "userName", "firstName", "lastName", "email","countryCode","phoneNum"],
    },
    {
      model: address,
      as: "dropOffID",
    },
    {
         model: orderItems,
         attributes:['unitPrice','total','quantity'],
          include: [
            {
              model: R_PLink,
              attributes:['name','description','image','bannerImage','originalPrice','deliveryPrice'],
            },
            {
              model: orderAddOns,
              attributes:['total','qty'],
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          ],
    }
  ],
});

  const fireBaseData = await axios.get(process.env.FIREBASE_URL);
  let list = [];
  for (var i = 0; i < orders.length; i++) {
    let driverData = fireBaseData?.data[orders[i]?.driverId];
    const etaText = await eta_text(
      driverData?.lat,
      driverData?.lng,
      orders[i]?.dropOffID?.lat,
      orders[i]?.dropOffID?.lng,
    
    );
    let obj = {
      id: orders[i].id,
      orderNum: orders[i].orderNum,
      scheduleDate: orders[i].scheduleDate,
      distance: orders[i].distance,
      subTotal: orders[i].subTotal,
      user: orders[i].user,
      deliveryTime: etaText ? etaText : "10 mints",
      driver:orders[i].DriverId ? orders[i].DriverId:null,
      items :  orders[i].orderItems
    };
    list.push(obj);
  }
  let data = {
    orders: list,
  };
  const response = ApiResponse("1", "In Deliver Orders", "", data);
  return res.json(response);
}

async function sendNotificationToFreelanceDriver(req, res) {
     try {
        // let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let restaurantId = req.params?.restaurantId;
        let orderId = req.params?.orderId;
        // Find driver user type
        const type = await userType.findOne({
          where: {
            name: "Driver",
          },
        });
        // Find zone and related drivers
        const getZone = await zoneRestaurants.findOne({
          where: {
            restaurantId: restaurantId,
          },
          include: {
            model: zone,
          },
        });
        const zoneDrivers = await driverZone.findAll({
          where: {
            zoneId: getZone?.zone?.id,
          },
          include: {
            model: user,
            attributes:['id','userName','firstName','lastName','email','countryCode','phoneNum','driverType'],
            where: {
              driverType: "Freelancer",
              userTypeId: type.id,
            },
          },
        });
        // Fetch order details
        const orderData = await order.findOne({
          where: {
            id: orderId,
          },
          include: [{
            model: address,
            as: "dropOffID",
          }, {
            model: restaurant,
          }, {
            model: user,
            attributes: ["id", "deviceToken","language"],
          }, ],
        });
        // Calculate estimated time
        const estTime = await eta_text(orderData.restaurant.lat, orderData.restaurant.lng, orderData.dropOffID.lat, orderData.dropOffID.lng);
        // Prepare notification data
        const notiData = {
          orderId: orderData.id,
          restaurantName: orderData.restaurant.businessName,
          estEarning: "23.5", // Adjust as per your calculation method
          dropOffAddress: orderData.dropOffID.streetAddress,
          pickUpAddress: orderData?.restaurant?.address,
          orderApplication: orderData.businessType,
          distance: estTime,
          orderNum: orderData.orderNum,
          orderType: orderData.deliveryTypeId,
        };
        // Prepare event data
        const eventData = {
          type: "assignDriver",
          data: {
            data: notiData
          },
        };
        const list = [];
        let fireBase = await axios.get(process.env.FIREBASE_URL);
        // Send events to each driver
        zoneDrivers.forEach((driver) => {
          if (fireBase?.data[driver.user.id]) {
            
            let driverLocation =  fireBase?.data[driver.user.id];
           
            let getDistance = distance(orderData.restaurant.lat,orderData?.restaurant.lng,driverLocation.lat,driverLocation.lng);
            
            if(parseFloat(getDistance) < parseFloat(orderData?.restaurant?.deliveryRadius)) {
                 if (driver.user.deviceToken) {
              const tokens = formatTokens(driver.user.deviceToken);
              tokens.forEach((token) => {
                list.push(token);
              });
            }
            if (fireBase) {
              if (fireBase.data[driver?.user?.id]) {
                sendEvent(driver.user.id, eventData);
              }
            }
            }
           
          }
        });
        // Send event to order recipient
        sendEvent(orderData?.user?.id, eventData);
        // Send notification to drivers
        const notification = {
          title: "A new Job Arrived",
          body: `New Order Request ID: ${orderId}`,
        };
        sendNotification(list, notification, notiData,driver.user.language);
      } catch (error) {
          return res.json(error.message)
        console.log(error);
      }
//   try {
//     const { restaurantId, orderId } = req.params;

//     // Find driver user type
//     const type = await userType.findOne({
//       where: {
//         name: "Driver",
//       },
//     });

//     // Find zone and related drivers
//     const getZone = await zoneRestaurants.findOne({
//       where: {
//         restaurantId: restaurantId,
//       },
//       include: {
//         model: zone,
//       },
//     });

//     const zoneDrivers = await driverZone.findAll({
//       where: {
//         zoneId: getZone?.zone?.id,
//       },
//       include: {
//         model: user,
//         where: {
//           driverType: "Freelancer",
//           userTypeId: type.id,
//         },
//       },
//     });

//     // Fetch order details
//     const orderData = await order.findOne({
//       where: {
//         id: orderId,
//       },
//       include: [
//         {
//           model: address,
//           as: "dropOffID",
//         },
//         {
//           model: restaurant,
//         },
//         {
//           model: user,
//           attributes: ["id", "deviceToken"],
//         },
//       ],
//     });

//     // Calculate estimated time
//     const estTime = await eta_text(
//       orderData.restaurant.lat,
//       orderData.restaurant.lng,
//       orderData.dropOffID.lat,
//       orderData.dropOffID.lng
//     );

//     // Prepare notification data
//     const notiData = {
//       orderId: orderData.id,
//       restaurantName: orderData.restaurant.businessName,
//       estEarning: "23.5", // Adjust as per your calculation method
//       dropOffAddress: orderData.dropOffID.streetAddress,
//       pickUpAddress: orderData?.restaurant?.address,
//       orderApplication: orderData.businessType,
//       distance: estTime,
//       orderNum: orderData.orderNum,
//       orderType: orderData.deliveryTypeId,
//     };

//     // Prepare event data
//     const eventData = {
//       type: "assignDriver",
//       data: { data: notiData },
//     };

//     const list = [];
//     let fireBase = await axios.get(process.env.FIREBASE_URL);
//     // Send events to each driver
//     try{
//         zoneDrivers.forEach((driver) => {
//       if (driver.user.deviceToken) {
//         const tokens = formatTokens(driver.user.deviceToken);
//         tokens.forEach((token) => {
//           list.push(token);
//         });
//         if(fireBase){
//             if(fireBase.data[driver?.user?.id]){
//                 sendEvent(driver.user.id, eventData);
//             }
//         }
        
//       }
//     });
//     }
//     catch(error){
//         console.log(error)
//     }
//     // Send event to order recipient
//     sendEvent(orderData?.user?.id, eventData);

//     // Send notification to drivers
//     const notification = {
//       title: "A new Job Arrived",
//       body: `New Order Request ID: ${orderId}`,
//     };
//     sendNotification(list, notification, notiData);

//     // Respond with success message
//     const response = ApiResponse(
//       "1",
//       "Request sent to all Freelance Drivers",
//       "",
//       {}
//     );
//     return res.json(response);
//   } catch (error) {
//     console.error("Error in sendNotificationToFreelanceDriver:", error);
//     return res.status(500).json({
//       error: "Internal Server Error",
//     });
//   }
}

async function openCloseRestaurant(req, res) {
  const { restaurantId } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const rest = await restaurant.findOne({
      where: { id: restaurantId },
      transaction: t, // Add transaction context
    });

    if (rest) {
      // Toggle the restaurant's open/close status
      rest.isOpen = !rest.isOpen;

      const updatedRestaurant = await rest.save({ transaction: t }); // Save with transaction context

      await t.commit(); // Commit the transaction if successful

      const data = {
        isOpen: updatedRestaurant.isOpen,
      };
      const response = ApiResponse(
        "1",
        updatedRestaurant.isOpen
          ? "Restaurant opened successfully"
          : "Restaurant closed successfully",
        "",
        data
      );
      return res.json(response);
    } else {
      await t.rollback(); // Rollback the transaction if restaurant is not found

      const response = ApiResponse("0", "Restaurant not found", "Error", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


// RESTAURANT PANEL APIS

async function addProductStock(req, res) {
  const { restaurantId, RPLinkId, stock } = req.body;
  const requiredFields = ["restaurantId", "RPLinkId", "stock"];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      const response = ApiResponse(
        "0",
        `${field} is required`,
        `Please provide a value for ${field}`,
        {}
      );
      return res.json(response);
    }
  }
  let dd = new productStock();
  dd.stock = stock;
  dd.currentStock = stock;
  dd.date = Date.now();
  dd.status = true;
  dd.restaurantId = restaurantId;
  dd.RPLinkId = RPLinkId;
  dd.save()
    .then((dat) => {
      let response = ApiResponse("1", "Stock added successfully", "", {});
      return res.json(response);
    })
    .catch((error) => {
      const response = ApiResponse("0", error.message, "Error", {});
      return res.json(response);
    });
}

async function analytics(req, res) {
  const { restaurantId } = req.params;
  const { from, to } = req.body;
  let cancelledStatus = await orderStatus.findOne({
    where: {
      name: "Cancelled",
    },
  });
  let DeliveredStatus = await orderStatus.findOne({
    where: {
      name: "Delivered",
    },
  });
  let type = await deliveryType.findOne({
    where: {
      name: "Delivery",
    },
  });
  let pickupType = await deliveryType.findOne({
    where: {
      name: "Self-Pickup",
    },
  });

  let today = new Date(); // Get today's date
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let todayDayOfWeek = today.getDay(); // Get the day of the week for today
  let todayMidnight = new Date(today);
  todayMidnight.setHours(0, 0, 0, 0); // Set time to midnight for today
  let currentDate = new Date(today);
  let previousWeekOrders = [];
  let weeklyOrderAmount = [];
  let weekTotalAmount = 0;
  let noOfOrdersInWeek = 0;
  let lossValue = 0;
  let weeklyLossValue = 0;
  let deliveryCharges = [];
  
  if (from != "" && to != "") {
    today = new Date(req.body.to);

    todayMidnight = new Date(today);
    todayDayOfWeek = today.getDay();
    todayMidnight.setHours(0, 0, 0, 0);
    currentDate = new Date(today);
  }

  //  return res.json(today)
  for (let i = 0; i < 7; i++) {
    // Loop through each day of the week, 7 days in total
    currentDate.setDate(today.getDate() - 7 + i); // Adjusting the date for previous week
    const formattedDate = currentDate.toISOString().split("T")[0];
    

    const successOrders = await order.count({
      where: {
        restaurantId: restaurantId,
        orderStatusId: DeliveredStatus.id,
        createdAt: {
          [Op.gte]: currentDate, // Orders from current day
          [Op.lt]: new Date(currentDate.getTime() + 86400000), // Orders before next day
        },
      },
    });
    const orderCount = await order.count({
      where: {
        restaurantId: restaurantId,
        orderStatusId: {
          [Op.ne]: cancelledStatus.id, // OrderStatusId not equal to 3
        },
        createdAt: {
          [Op.gte]: currentDate, // Orders from current day
          [Op.lt]: new Date(currentDate.getTime() + 86400000), // Orders before next day
        },
      },
    });
    const cancelOrders = await order.count({
      where: {
        orderStatusId: cancelledStatus.id,
        restaurantId: restaurantId,
        createdAt: {
          [Op.gte]: currentDate, // Orders from current day
          [Op.lt]: new Date(currentDate.getTime() + 86400000), // Orders before next day
        },
      },
    });
    const restaurantEarnings = await order.count({
      where: {
        restaurantId: restaurantId,
        orderStatusId: DeliveredStatus.id,
        createdAt: {
          [Op.gte]: currentDate, // Orders from current day
          [Op.lt]: new Date(currentDate.getTime() + 86400000), // Orders before next day
        },
      },
    });
    // return res.json(restaurantEarnings)
    const restaurantDeliveryCharges = await order.sum(
      "orderCharge.restaurantDeliveryCharges",
      {
        where: {
          restaurantId: restaurantId,

          orderStatusId: DeliveredStatus.id,
          createdAt: {
            [Op.gte]: currentDate, // Orders from current day
            [Op.lt]: new Date(currentDate.getTime() + 86400000), // Orders before next day
          },
        },
        include: [
          {
            model: orderCharge,

            attributes: [],
          },
        ],
      }
    );
    // const restaurantDeliveryCharges = await order.sum(
    //   "orderCharge.restaurantDeliveryCharges",
    //   {
    //     where: {
    //       restaurantId: restaurantId,

    //       orderStatusId: DeliveredStatus.id,
    //       createdAt: {
    //         [Op.gte]: currentDate, // Orders from current day
    //         [Op.lt]: new Date(currentDate.getTime() + 86400000), // Orders before next day
    //       },
    //     },
    //     include: [
    //       {
    //         model: orderCharge,

    //         attributes: [],
    //       },
    //     ],
    //   }
    // );

    const restaurantEarningsForCancelledOrders = await order.sum(
      "orderCharge.restaurantEarnings",
      {
        where: {
          restaurantId: restaurantId,
          orderStatusId: cancelledStatus.id,

          createdAt: {
            [Op.gte]: currentDate, // Orders from current day
            [Op.lt]: new Date(currentDate.getTime() + 86400000 + 1), // Orders before next day
          },
        },
        include: [
          {
            model: orderCharge,

            attributes: [],
          },
        ],
      }
    );
    const restaurantDeliveryChargesForCancelledOrders = await order.sum(
      "orderCharge.restaurantDeliveryCharges",
      {
        where: {
          restaurantId: restaurantId,
          orderStatusId: cancelledStatus.id,
          createdAt: {
            [Op.gte]: currentDate, // Orders from current day
            [Op.lt]: new Date(currentDate.getTime() + 86400000 + 1), // Orders before next day
          },
        },
        include: [
          {
            model: orderCharge,
            attributes: [],
          },
        ],
      }
    );
    const driverDeliveryCharges = await order.findAll({
 attributes:[],
  where: {
    restaurantId: restaurantId,
    orderStatusId: DeliveredStatus.id,
    createdAt: {
      [Op.gte]: currentDate, // Orders from the current day
      [Op.lt]: new Date(currentDate.getTime() + 86400000), // Orders before the next day
    },
  },
  include: [
    {
      model: orderCharge,
      attributes: ['deliveryFees'],
    },
    {model:user,as:"DriverId",attributes:[],where:{driverType:"Restaurant"},required:true}
   
  ],
});
    if(driverDeliveryCharges.length > 0){
        deliveryCharges.push(driverDeliveryCharges)
    }




    lossValue =
      parseInt(restaurantDeliveryChargesForCancelledOrders) +
      parseInt(restaurantEarningsForCancelledOrders);

    weeklyOrderValue =
      parseInt(restaurantDeliveryCharges) + parseInt(restaurantEarnings);
    noOfOrdersInWeek = noOfOrdersInWeek + orderCount;
    weekTotalAmount =
      weekTotalAmount + (weeklyOrderValue ? weeklyOrderValue : 0);
    weeklyLossValue = weeklyLossValue + (lossValue ? lossValue : 0);
    // return res.json(weeklyOrderValue)
    previousWeekOrders.push({
      day: formattedDate,
      successOrders,
      cancelOrders,
    });
    weeklyOrderAmount.push({
      day: formattedDate,
      value: weeklyOrderValue ? weeklyOrderValue.toString() : "0",
      lossValue: lossValue ? lossValue.toString() : "0",
    });
  }
  let totalDeliveryFees = 0;

    // Iterate through the order list
    deliveryCharges?.forEach(orderArray => {
      orderArray?.forEach(order => {
        // Check if 'orderCharge' exists and if 'deliveryFees' is a valid number
        if (order.orderCharge && order.orderCharge.deliveryFees) {
          const deliveryFee = parseFloat(order.orderCharge.deliveryFees);
          if (!isNaN(deliveryFee)) {
            totalDeliveryFees += deliveryFee;
          }
        }
      });
    });

  const cancelOrders = await order.count({
    where: {
      orderStatusId: cancelledStatus.id,
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
  });
  const totalOrders = await order.count({
    where: {
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
  });
  const orderCount = await order.count({
    where: {
      restaurantId: restaurantId,
      orderStatusId: {
        [Op.ne]: cancelledStatus.id, // OrderStatusId not equal to 3
      },
      createdAt: {
        [Op.gte]: currentDate, // Orders from current day
        [Op.lt]: new Date(currentDate.getTime() + 86400000), // Orders before next day
      },
    },
  });
  const successOrders = await order.count({
    where: {
      restaurantId: restaurantId,
      orderStatusId: DeliveredStatus.id,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
  });

  const deliveryTypeOrders = await order.count({
    where: [
      {
        restaurantId: restaurantId,
      },
      {
        deliveryTypeId: type.id,
      },
    ],
  });
  const pickupTypeOrders = await order.count({
    where: [
      {
        restaurantId: restaurantId,
      },
      {
        deliveryTypeId: pickupType.id,
      },
    ],
  });

  let uniqueDates = {};
  let uniqueWeeklyOrders = {};
  uniqueDates = previousWeekOrders.filter((item) => {
    if (!uniqueDates[item.day]) {
      uniqueDates[item.day] = true;
      return true;
    }
    return false;
  });
  uniqueWeeklyOrders = weeklyOrderAmount.filter((item) => {
    if (!uniqueWeeklyOrders[item.day]) {
      uniqueWeeklyOrders[item.day] = true;
      return true;
    }
    return false;
  });

  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14); // Date for two weeks ago
  const threeWeeksAgo = new Date(today);
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21); // Date for three weeks ago

  const previousWeektotalAmount = await order.sum("total", {
    where: {
      restaurantId: restaurantId,
      orderStatusId: DeliveredStatus.id,
      createdAt: {
        [Op.between]: [threeWeeksAgo, twoWeeksAgo], // Using Sequelize's between operator
      },
    },
  });
  const previousWeekrestaurantDeliveryCharges = await order.sum(
    "orderCharge.restaurantDeliveryCharges",
    {
      where: {
        restaurantId: restaurantId,

        orderStatusId: DeliveredStatus.id,
        createdAt: {
          [Op.between]: [threeWeeksAgo, twoWeeksAgo], // Using Sequelize's between operator
        },
      },
      include: [
        {
          model: orderCharge,

          attributes: [],
        },
      ],
    }
  );
  const previousWeekrestaurantEarnings = await order.sum(
    "orderCharge.restaurantEarnings",
    {
      where: {
        restaurantId: restaurantId,
        orderStatusId: DeliveredStatus.id,
        createdAt: {
          [Op.between]: [threeWeeksAgo, twoWeeksAgo], // Using Sequelize's between operator
        },
      },
      include: [
        {
          model: orderCharge,

          attributes: [],
        },
      ],
    }
  );
  const previousWeekcancelOrders = await order.count({
    where: {
      orderStatusId: cancelledStatus.id,
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [threeWeeksAgo, twoWeeksAgo],
      },
    },
  });

  const totalAmount = await order.sum("total", {
    where: {
      restaurantId: restaurantId,
      orderStatusId: DeliveredStatus.id,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
  });
  const restaurantDeliveryCharges = await order.sum(
    "orderCharge.restaurantDeliveryCharges",
    {
      where: {
        restaurantId: restaurantId,

        orderStatusId: DeliveredStatus.id,
        createdAt: {
          [Op.between]: [oneWeekAgo, today],
        },
      },
      include: [
        {
          model: orderCharge,

          attributes: [],
        },
      ],
    }
  );
  const restaurantEarnings = await order.sum("orderCharge.restaurantEarnings", {
    where: {
      restaurantId: restaurantId,
      orderStatusId: DeliveredStatus.id,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
    include: [
      {
        model: orderCharge,

        attributes: [],
      },
    ],
  });

  let weeklyTotalAmount = Number(
    restaurantEarnings + restaurantDeliveryCharges
  ).toFixed(1);
  let previousWeekTotalAmount = Number(
    previousWeekrestaurantDeliveryCharges + previousWeekrestaurantEarnings
  ).toFixed(1);
  let percentage =
    ((parseFloat(weeklyTotalAmount) - parseFloat(previousWeekTotalAmount)) /
      parseFloat(previousWeekTotalAmount)) *
    100;

  let totalAmountPercentage =
    ((parseFloat(totalAmount) - parseFloat(previousWeektotalAmount)) /
      parseFloat(previousWeektotalAmount)) *
    100;
  let cancelOrderPercentage =
    ((parseFloat(cancelOrders) - parseFloat(previousWeekcancelOrders)) /
      parseFloat(previousWeekcancelOrders)) *
    100;
  let data = {
    totalAmountPercentage:
      parseInt(previousWeektotalAmount) > 0 ? totalAmountPercentage : 0,
    cancelOrderPercentage:
      previousWeekcancelOrders > 0 ? cancelOrderPercentage : 0,
    weekPercentage: parseInt(previousWeekTotalAmount) > 0 ? percentage : 0,
    cancelledOrders: cancelOrders.toString(),
    totalOrders: successOrders.toString(),
    successOrders: successOrders.toString(),
    totalAmount: Number(totalAmount).toFixed(1).toString(),
    // totalAmount: earnings ? Number() : "0.00",

    deliveryTypeOrdersPercentage:totalOrders.length > 0 ?  Number(
      (deliveryTypeOrders * 100) / totalOrders
    ).toFixed(1) : "0",
    pickupTypeOrdersPercentage:
      pickupTypeOrders > 0
        ? Number((pickupTypeOrders * 100) / totalOrders)
            .toFixed(1)
            .toString()
        : "0",
    weekTotalAmount: Number(parseFloat(weeklyTotalAmount) + parseFloat(totalDeliveryFees)).toFixed(1),

    weeklyLossValue: weeklyLossValue.toString(),
    weeklyAverageValue:
      successOrders > 0
        ? Number(
            (parseInt(weeklyTotalAmount) + parseInt(totalDeliveryFees)) / successOrders
          )
            .toFixed(1)
            .toString()
        : "0",
    previousWeekOrders: uniqueDates,
    weeklyOrderAmount: uniqueWeeklyOrders,
  };
  let response = ApiResponse("1", "Analytics Data", "", data);
  return res.json(response);
}



async function hourlyInsight(req, res) {
  const { restaurantId } = req.params;
  const { date } = req.body;
  let today = new Date(date); // Current date
  today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

  const cancelledStatus = await orderStatus.findOne({
    where: {
      name: "Cancelled",
    },
  });

  let weeklyData = [];

  // Loop through each day of the previous week
  for (let i = 0; i < 7; i++) {
    let startDate = new Date(today);
    startDate.setDate(today.getDate() - i); // Subtract 'i' days to get previous days

    let endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999); // Set time to the end of the day

    let orderData = await order.findAll({
      include: {
        model: orderCharge,
      },
      where: {
        orderStatusId: {
          [Op.ne]: cancelledStatus.id, // OrderStatusId not equal to 3
        },
        restaurantId: restaurantId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    let hourlyOrderData = {};

    // Initialize hourlyOrderData
    for (let hour = 0; hour < 24; hour++) {
      hourlyOrderData[hour] = {
        totalOrders: 0,
        totalAmount: 0,
      };
    }

    // Calculate total orders and amount for each hour
    orderData.forEach((order) => {
      let hour = new Date(order.createdAt).getHours();
      hourlyOrderData[hour].totalOrders++;
      hourlyOrderData[hour].totalAmount +=
        parseFloat(order?.orderCharge?.restaurantEarnings) +
        parseFloat(order?.orderCharge?.restaurantDeliveryCharges);
    });

    // Push hourly data to weeklyData
    weeklyData.push({
      date: startDate.toDateString(),
      hourlyData: Object.keys(hourlyOrderData).map((hour) => ({
        hour: hour.toString(),
        totalOrders: hourlyOrderData[hour].totalOrders.toString(),
        totalAmount: hourlyOrderData[hour]?.totalAmount?.toFixed(2),
      })),
    });
  }

  let data = {
    data: weeklyData,
  };
  let respp = ApiResponse("1", "Hourly Insight", "", data);
  return res.json(respp);
}

async function completeTableBooking(req, res) {
  const { id, status } = req.body;
  const statusId = await orderStatus.findOne({
    where: {
      name: status,
    },
  });
  if (status) {
    let orderData = await tableBooking.findOne({
      where: {
        id: id,
      },
      include: {
        model: user,
      },
    });
    if (orderData) {
      orderData.orderStatusId = statusId.id;
      const userLang = orderData?.user?.language
      orderData
        .save()
        .then((dat) => {
          singleNotification(
            orderData?.user?.deviceToken,
            "Order Status Changed",
            `Table Booking ID : ${id} status has been changed to ${status}!`,
            {},userLang
          );
          let response = ApiResponse(
            "1",
            `Table Booking ID : ${id} status has been changed to ${status}!`,
            "",
            {}
          );
          return res.json(response);
        })
        .catch((error) => {
          let response = ApiResponse("0", error.message, "Error", {});
          return res.json(response);
        });
    } else {
      let response = ApiResponse("0", "Order not found!", "Error", {});
      return res.json(response);
    }
  } else {
    let response = ApiResponse("0", "Status not found!", "", {});
    return res.json(response);
  }
}

async function menuPerformance(req, res) {
  const { restaurantId } = req.params;
  const { from, to } = req.body;
  const fromDate = from;
  const toDate = to;

  const rmcData = await R_MCLink.findAll({
    where: {
      status: true,
      restaurantId: restaurantId,
    },
    include: {
      model: R_PLink,
    },
  });

  let totalRPLinks = 0;
  let totalRPLinksWithImage = 0;
  let productWithDescriptions = 0;

  const orders = await order.findAll({
    where: {
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [fromDate, toDate],
      },
    },
    attributes: ["total"],
    include: { model: address, as: "dropOffID", attributes: ["id", "zipCode"] },
  });

  const result = {};

  orders.forEach((order) => {
    const zipCode = order.dropOffID?.zipCode; // Safe access
    const total = parseFloat(order.total) || 0; // Default to 0 if NaN

    if (zipCode) {
      if (result[zipCode]) {
        result[zipCode].zipCode = zipCode;
        result[zipCode].count++;
        result[zipCode].totalSum += total;
      } else {
        result[zipCode] = { count: 1, totalSum: total };
      }
    }
  });

  const resultArray = Object.keys(result).map((zipCode) => ({
    zipCode: zipCode,
    count: result[zipCode]?.count ? result[zipCode].count.toString() : "0",
    totalSum: result[zipCode]?.totalSum ? Number(result[zipCode].totalSum).toFixed(2) : "0.00",
    averageTotal: result[zipCode]?.count > 0
      ? (Number(result[zipCode]?.totalSum) / result[zipCode].count).toFixed(1).toString()
      : "0.0",
  }));

  let itemList = [];

  for (const rmc of rmcData) {
    totalRPLinks += rmc.R_PLinks.length || 0;
    totalRPLinksWithImage += rmc.R_PLinks.filter(link => link.image !== null).length || 0;
    productWithDescriptions += rmc.R_PLinks.filter(link => link.description !== null).length || 0;

    if (rmc.R_PLinks.length > 0) {
      for (const rp of rmc.R_PLinks) {
        const items = await orderItems.findAll({
          where: { RPLinkId: rp.id },
          attributes: ["id"],
          include: {
            model: orderAddOns,
            attributes: ["id"],
            include: { model: addOn, attributes: ["price"] },
          },
        });

        let addOnPrice = 0;

        items.forEach(item => {
          item.orderAddOns.forEach(addOn => {
            addOnPrice += addOn?.addOn?.price || 0; // Default to 0 if undefined
          });
        });

        let obj = {
          id: rp.id.toString(),
          name: rp.name,
          sold: rp.sold ? rp.sold.toString() : "0",
          revenue: ((rp.sold || 0) * (parseInt(rp.originalPrice) || 0)).toString(),
          averagePrice: (rp.sold && rp.sold > 0)
            ? Number((parseInt(rp.originalPrice) + parseInt(addOnPrice)) / rp.sold).toFixed(1).toString()
            : "0.0",
        };
        itemList.push(obj);
      }
    }
  }

  const productsWithImages = totalRPLinks > 0 ? (totalRPLinksWithImage * 100) / totalRPLinks : 0;
  const productsWithDescription = totalRPLinks > 0 ? (productWithDescriptions * 100) / totalRPLinks : 0;

  const data = {
    orderToAcceptDurations: 40,
    productsWithImages,
    productsWithDescription,
    totalRPLinks,
    productPerformance: itemList,
    deliveryAreaPerformance: resultArray,
  };

  const response = ApiResponse("1", "Menu Performance Data", "", data);
  return res.json(response);
}

async function postOrderInsight(req, res) {
  const { restaurantId } = req.params;
  const { from, to } = req.body;

  // Calculate the start and end dates for the previous week
  const today = new Date(to);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  let status = await orderStatus.findOne({ where: { name: "Preparing" } });
  let scheduledMode = await orderMode.findOne({ where: { name: "Scheduled" } });
  let normalMode = await orderMode.findOne({ where: { name: "Standard" } });

  // Fetch orders for each day of the previous week
  const orders = await order.findAll({
    attributes: ["id", "createdAt"],
    where: {
      orderModeId: normalMode.id,
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
    include: [
      {
        model: orderItems,
        attributes: ["id"],
        include: {
          model: orderAddOns,
          attributes: ["id"],
          include: { model: addOn, attributes: ["price"] },
        },
      },
      {
        model: orderHistory,
        attributes: ["id", "time"],
        include: {
          model: orderStatus,
          where: {
            [Op.or]: [
              { name: "Placed" },
              { name: "Accepted" },
              { name: "Ready for delivery" },
              { name: "On the way" },
              { name: "Food Pickedup" },
              { name: "Delivered" },
              { name: "Food Arrived" },
              { name: "Food Pickedup" },
              { name: "Accepted by Driver" },
            ],
          },
          attributes: ["id", "name"],
        },
      },
    ],
  });
  const ordersByDay = {};
  let currentDate = new Date(oneWeekAgo);
  let endDate = new Date(today);

  // Initialize objects to store total time difference and order count for each day
  const totalTimeDifferenceByDay = {};
  const orderCountByDay = {};
  const estDeliveryTimeOrders = [];
  // Iterate over each day of the previous week and initialize default values
  while (currentDate <= endDate) {
    const currentDateString = currentDate.toDateString();
    ordersByDay[currentDateString] = [];
    totalTimeDifferenceByDay[currentDateString] = 0;
    orderCountByDay[currentDateString] = 0;
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  // Add orders to respective days and calculate time difference and order count
  orders.forEach((order) => {
    const placedTime = new Date(order.createdAt);
    const orderDate = placedTime.toDateString();
    ordersByDay[orderDate].push(order);

    const placedHistory = order.orderHistories.find(
      (history) => history.orderStatus.name === "Placed"
    );
    const acceptedHistory = order.orderHistories.find(
      (history) => history.orderStatus.name === "Accepted"
    );

    if (placedHistory && acceptedHistory) {
      const placedTime = new Date(placedHistory.time);
      const acceptedTime = new Date(acceptedHistory.time);
      const timeDifference = acceptedTime - placedTime; // Time difference in milliseconds

      // Accumulate the time difference and order count for the current day
      totalTimeDifferenceByDay[orderDate] += timeDifference;
      orderCountByDay[orderDate]++;
    }
  });

  // Calculate average order accept time in minutes and add number of orders for each day
  const averageAcceptTimeAndOrdersByDay = {};
  const millisecondsInMinute = 1000 * 60; // Conversion factor from milliseconds to minutes
  for (const day in totalTimeDifferenceByDay) {
    const totalTimeInMinutes = totalTimeDifferenceByDay[day]
      ? totalTimeDifferenceByDay[day] / millisecondsInMinute
      : 0;
    const averageAcceptTime = orderCountByDay[day]
      ? totalTimeInMinutes / orderCountByDay[day]
      : 0;
    const numberOfOrders = orderCountByDay[day] || 0;
    averageAcceptTimeAndOrdersByDay[day] = {
      averageAcceptTime: averageAcceptTime,
      numberOfOrders: numberOfOrders,
    };
  }
  const resultList = Object.keys(averageAcceptTimeAndOrdersByDay).map((day) => {
    return {
      date: day,
      averageAcceptTimeInMinutes:
        averageAcceptTimeAndOrdersByDay[day].numberOfOrders > 0
          ? Number(
              averageAcceptTimeAndOrdersByDay[day].averageAcceptTime /
                averageAcceptTimeAndOrdersByDay[day].numberOfOrders
            )
              .toFixed(1)
              .toString()
          : "0.0",
      numberOfOrders: Number(
        averageAcceptTimeAndOrdersByDay[day].numberOfOrders
      )
        .toFixed(1)
        .toString(),
    };
  });

  // CALCULATE THE GRAPH DATA FOR ESTIMATED DELIVERY TIME
  currentDate = new Date(oneWeekAgo);
  endDate = new Date(today);
  while (currentDate <= endDate) {
    const currentDateString = currentDate.toDateString();
    let totalMinutes = 0;
    let numberOfOrders = 0;

    // Calculate total time spent and number of orders for the current day
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt).toDateString();
      if (orderDate === currentDateString) {
        order.orderHistories.forEach((history, index) => {
          if (index < order.orderHistories.length - 1) {
            const currentStatus = history.orderStatus.name;
            const nextHistory = order.orderHistories[index + 1];
            const currentTime = new Date(history.time);
            const nextTime = new Date(nextHistory.time);
            const timeDifference = (nextTime - currentTime) / (1000 * 60); // Convert to minutes
            totalMinutes += timeDifference;
          }
        });
        numberOfOrders++;
      }
    });
    // Calculate average accept time for the current day
    const averageAcceptTimeInMinutes =
      numberOfOrders > 0 ? totalMinutes / numberOfOrders : 0;
    // Add the day's data to the response array
    estDeliveryTimeOrders.push({
      date: currentDateString,
      estDeliveryTime: averageAcceptTimeInMinutes.toFixed(1), // Round to 1 decimal place
      numberOfOrders: numberOfOrders.toFixed(1), // Round to 1 decimal place
    });

    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  let data = {
    orderToAccept: resultList,
    estDeliveryTimeOrders,
  };
  let response = ApiResponse("1", "Post Order In Sight", "", data);
  return res.json(response);
}
async function customerExperience(req, res) {
  const { restaurantId } = req.params;
  const { from, to } = req.body;
  const today = new Date(to);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  let orders = await order.findAll({
    include: [{ model: orderCharge, attributes: ["tip"] }],
    where: {
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
    attributes: ["id", "createdAt"],
  });

  const dateRange = [];
  for (let d = new Date(oneWeekAgo); d <= today; d.setDate(d.getDate() + 1)) {
    dateRange.push(new Date(d).toISOString().split("T")[0]);
  }

  // Initialize tips for each date with 0
  const groupedOrders = dateRange.reduce((acc, date) => {
    acc[date] = {
      date: date,
      tip: 0,
    };
    return acc;
  }, {});

  // Update tip values if orders exist for that date
  orders.forEach((order) => {
    const date = order.dataValues.createdAt.toISOString().split("T")[0];
    const tip = order.dataValues.orderCharge
      ? order.dataValues.orderCharge.tip
      : 0;
    groupedOrders[date].tip += tip;
  });

  const weeklyTips = Object.values(groupedOrders);

  let totalVisits = await order.count({
    where: {
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
  });
  const previousWeekDates = [];
  // const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    previousWeekDates.push(date.toISOString().split("T")[0]);
  }
  // Create an object to store the count of orders for each day
  const orderCountPerDay = {};
  // Initialize counts for all previous week days to zero
  previousWeekDates.forEach((date) => {
    orderCountPerDay[date] = 0;
  });
  // Iterate over each order
  orders.forEach((order) => {
    // Extract the date from createdAt timestamp
    const date = new Date(order.createdAt).toISOString().split("T")[0];

    // Increment the count for the day in the orderCountPerDay object
    orderCountPerDay[date]++;
  });

  // Retrieve ratings for the previous week
  let ratings = await restaurantRating.findAll({
    where: {
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
  });
  // Group ratings by day and calculate average rating
  const ratingsByDay = {};
  const averageRatingByDay = {};
  // Initialize average rating as 0 for each day
  const daysInWeek = 7;
  for (let i = 0; i < daysInWeek; i++) {
    const day = new Date(oneWeekAgo);
    day.setDate(oneWeekAgo.getDate() + i);
    const formattedDay = day.toISOString().split("T")[0];
    ratingsByDay[formattedDay] = [];
    averageRatingByDay[formattedDay] = "0.0";
  }
  // Group ratings by day
  ratings.forEach((rating) => {
    const day = rating.createdAt.toISOString().split("T")[0]; // Extracting date without time
    if (!ratingsByDay[day]) {
      ratingsByDay[day] = []; // Initialize the array if it doesn't exist
    }
    ratingsByDay[day].push(rating);
  });
  // Calculate average rating for each day
  for (const day in ratingsByDay) {
    const totalRatings = ratingsByDay[day].length;
    if (totalRatings > 0) {
      const totalRatingValue = ratingsByDay[day].reduce(
        (sum, rating) => sum + rating.value,
        0
      );
      const averageRating = totalRatingValue / totalRatings;
      averageRatingByDay[day] = averageRating.toFixed(1); // Round to 1 decimal place
    }
  }
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14); // Date for two weeks ago
  const threeWeeksAgo = new Date(today);
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21); // Date for three weeks ago
  const averageValue = await restaurantRating.findAll({
    attributes: [[sequelize.fn("AVG", sequelize.col("value")), "averageValue"]],
    where: {
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
  });
  const previousWeekaverageValue = await restaurantRating.findAll({
    attributes: [[sequelize.fn("AVG", sequelize.col("value")), "averageValue"]],
    where: {
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [threeWeeksAgo, twoWeeksAgo],
      },
    },
  });
  let previousWeekRating =
    previousWeekaverageValue[0]?.dataValues?.averageValue;
  const ratingList = Object.entries(averageRatingByDay).map(
    ([date, value]) => ({ date, value })
  );
  const noOfCustomers = Object.entries(orderCountPerDay).map(
    ([date, value]) => ({ date, value })
  );

  let ratingPercentage =
    ((parseFloat(averageValue[0]?.dataValues?.averageValue) -
      parseFloat(previousWeekaverageValue)) /
      parseFloat(previousWeekaverageValue)) *
    100;

  let data = {
    ratingPercentage: ratingPercentage ? ratingPercentage : 0,
    totalVisits: totalVisits,
    noOfCustomers: noOfCustomers,
    weeklyTips: weeklyTips,
    averageRating: averageValue[0]?.dataValues?.averageValue,

    daywiseRating: ratingList,
  };
  let response = ApiResponse("1", "Review Score", "", data);
  return res.json(response);
}

async function orderToAccept(req, res) {
  const { restaurantId } = req.params;
  const { from, to } = req.body;
  const today = new Date(to);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  let orders = await order.findAll({
    include: { model: orderCharge, attributes: ["tip"] },
    where: {
      restaurantId: restaurantId,
      createdAt: {
        [Op.between]: [oneWeekAgo, today],
      },
    },
    attributes: ["id", "createdAt"],
  });
  let totalOrders = await order.count({
    where: { restaurantId: restaurantId },
  });
  // Initialize an object to hold orders and tips per day
  const ordersAndTipsPerDay = {};
  let totalTip = 0;
  // Iterate through the orders and calculate orders and tips per day
  orders.forEach((order) => {
    totalTip = totalTip + (order.orderCharge ? order?.orderCharge?.tip : 0);
    const dateStr = order.createdAt.toDateString();
    const tip = order.orderCharge ? order.orderCharge.tip : 0;
    if (!ordersAndTipsPerDay[dateStr]) {
      ordersAndTipsPerDay[dateStr] = {
        numberOfOrders: 1,
        tip: tip,
      };
    } else {
      ordersAndTipsPerDay[dateStr].numberOfOrders++;
      ordersAndTipsPerDay[dateStr].tip += tip;
    }
  });
  // Loop through all days of the previous week and fill in missing days with 0 orders and tip
  let currentDate = new Date(oneWeekAgo);
  const response = [];
  while (currentDate <= today) {
    const dateStr = currentDate.toDateString();
    const data = ordersAndTipsPerDay[dateStr] || { numberOfOrders: 0, tip: 0 };
    response.push({
      date: dateStr,
      numberOfOrders: data.numberOfOrders,
      tip: data.tip,
    });
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }
  let data = {
    orderToAccept: response,
    orderPercentage: (parseInt(orders.length) * 100) / parseInt(totalOrders),
    totalTip,
  };
  let dd = ApiResponse("1", "Order to accept", "", data);
  return res.json(dd);
}

async function orderByNewCustomers(req, res) {
  const { restaurantId } = req.params;
  const { from, to } = req.body;
  const today = new Date(to);
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  let orders = await order.findAll({
    include: {
      model: user,
      where: {
        createdAt: {
          [Op.between]: [oneWeekAgo, today],
        },
      },
      attributes: ["createdAt"],
    },
    where: {
      restaurantId: restaurantId,
    },
    attributes: ["id"],
  });
  let returningOrders = await order.findAll({
    include: {
      model: user,

      attributes: ["createdAt"],
    },
    where: {
      restaurantId: restaurantId,
    },
    attributes: ["id"],
  });
  // Initialize an object to hold orders by user creation date
  const ordersByUserCreationDate = {};
  const ordersByUserReturning = {};
  // Iterate through the orders and group them by user creation date
  orders.forEach((order) => {
    const userCreationDate = order.user.createdAt.toDateString();
    if (!ordersByUserCreationDate[userCreationDate]) {
      ordersByUserCreationDate[userCreationDate] = [];
    }
    ordersByUserCreationDate[userCreationDate].push({
      id: order.id,
      createdAt: order.createdAt,
    });
  });
  returningOrders.forEach((order) => {
    const userCreationDate = order.user.createdAt.toDateString();
    if (!ordersByUserReturning[userCreationDate]) {
      ordersByUserReturning[userCreationDate] = [];
    }
    ordersByUserReturning[userCreationDate].push({
      id: order.id,
      createdAt: order.createdAt,
    });
  });
  // return res.json(ordersByUserReturning)
  // Create an array of all dates within the range
  const allDates = [];
  let currentDate = new Date(oneWeekAgo);
  while (currentDate <= today) {
    allDates.push(currentDate.toDateString());
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }
  // Populate the response with zero orders for dates with no orders
  const response = allDates.map((date) => ({
    date: date,
    orders:
      (ordersByUserCreationDate[date] &&
        ordersByUserCreationDate[date].length) ||
      0,
  }));
  const returningResponse = allDates.map((date) => ({
    date: date,
    orders:
      (ordersByUserReturning[date] && ordersByUserReturning[date].length) || 0,
  }));
  let totalOrders = parseInt(returningOrders.length) + parseInt(orders.length);
  let data = {
    totalOrdersbyNewCustomers: (orders.length * 100) / totalOrders,
    totalOrdersbyReturningCustomers:
      (returningOrders.length * 100) / totalOrders,
    totalOrders: totalOrders,
    ordersByNewCustomers: response,
    ordersByReturningCustomers: returningResponse,
  };

  let dd = ApiResponse("1", "Data", "", data);
  return res.json(dd);
}

async function courierDashboard(req, res) {
  const { restaurantId } = req.params;
  let placedStatus = await orderStatus.findOne({where:{name:"Placed"}});
  let codMethod = await paymentMethod.findOne({where:{name:"COD"}});
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

const statuses = await orderStatus.findAll({
            where: {
                name: {
                    [Op.in]: [
                        "Placed",
                        "Accepted by Driver",
                        "Preparing",
                        "Food Arrived",
                        "Ready for delivery",
                        "Accepted",
                        "On the way",
                        "Food Pickedup",
                        "Delivered"
                    ],
                    
                },
            },
        });
         const statusIds = statuses.map((status) => status.id);

  const orderList = await order.findAll({
    attributes: ["id", "orderNum", "total"],
    include: [
      { model: restaurant, attributes: ["id", "lat", "lng"] },
      {
        model: address,
        as: "dropOffID",
        attributes: [
          "id",
          "lat",
          "lng",
          "title",
          "building",
          "streetAddress",
          "city",
          "state",
          "zipCode",
        ],
      },
    ],
    limit: 10,
    where: {
         [sequelize.Op.or]: [
          {
            paymentMethodId: codMethod.id,
          },
          {
            [sequelize.Op.and]: [
              { paymentRecieved: true },
              { paymentConfirmed: true },
            ],
          },
        ],
      restaurantId: restaurantId,
      driverId: null,
      orderStatusId: { [Op.in]: statusIds },
     
      // createdAt: {
      //   [Op.gte]: today
      // }
    },
  });

  let todayList = [];
  let courierList = [];
  const zoneRest = await zoneRestaurants.findOne({
    where: { restaurantId: restaurantId },
    include: {
      model: zone,
      attributes: ["id"],
      include: {
        model: zoneDetails,
        attributes: ["id"],
        include: { model: unit, as: "currencyUnit" },
      },
    },
  });
  let restDrivers = await restaurantDriver.findAll({
    where: { restaurantId: restaurantId },
    include: {
      model: user,
      attributes: ["id", "firstName", "lastName", "email"],
    },
  });

  for (const order of orderList) {
    const estTime = await eta_text(
      order.restaurant.lat,
      order.restaurant.lng,
      order.dropOffID.lat,
      order.dropOffID.lng
    );
    let obj = {
      orderId: order.id,
      estTime: estTime,
      total: order.total,
      currency: zoneRest?.restaurant?.zone?.zoneDetails?.currencyUnit?.symbol,
      orderNum: order.orderNum,
      dropOffAddress: order.dropOffID,
      paid: order.paymentConfirmed && order.paymentRecieved ? true : false,
    };

    todayList.push(obj);
  }

  let fireBase = await axios.get(process.env.FIREBASE_URL);


  for (const driver of restDrivers) {
  if (fireBase.data) {
    let dd = fireBase.data[driver?.user?.id];
    if (dd) {
       
      let driverAccept = await orderStatus.findOne({ where: { name: "Accepted by Driver" } });
      let ontheWay = await orderStatus.findOne({ where: { name: "On the way" } });
      let pickedUp = await orderStatus.findOne({ where: { name: "Food Pickedup" } });

      let orderData = await order.findOne({
          include:[{model:address,as:"dropOffID",attributes:['lat','lng','streetAddress']}],
          attributes:['id','orderNum'],
        where: {
          driverId: driver?.user?.id,
          orderStatusId: {
            [Op.in]: [driverAccept.id, ontheWay.id, pickedUp.id]
          }
        }
      });
      const estTime = await eta_text(
         dd?.lat,
         dd?.lng,
         parseFloat(order.dropOffID?.lat),
         parseFloat(order.dropOffID?.lng)
        );

      if(orderData){
           let obj = {
              
            courier: driver?.user,
            location: fireBase.data[driver?.user?.id],
            orderData: orderData,
            estTime:estTime,
            address:orderData?.dropOffID?.streetAddress
          };
          courierList.push(obj);
      }
    }
  }
}

  let data = {
    orderToday: todayList,
    acitveCourier: courierList,
  };
  const response = ApiResponse("1", "Courier Dashboard ", "", data);
  return res.json(response);
}

async function getConfiguration(req, res) {
  try {
    const { restaurantId } = req.params;

    // Fetch restaurant data and check for errors
    let restData = await restaurant.findOne({ where: { id: restaurantId }, attributes: ['city'] });
  
    if (!restData) {
      return res.json(ApiResponse("0", "Restaurant not found", "", {}));
    }

    // Fetch city data using Op.like for name matching and check for errors
   let cityData = await city.findOne({
  where: {
    name: {
      [Op.like]: `%${restData.city.trim()}%`
    }
  }
});
    if (!cityData) {
      return res.json(ApiResponse("0", "City is missing", "", {}));
    }

    // Fetch configuration for the restaurant
    const config = await configuration.findOne({ where: { restaurantId: restaurantId } });
    if (!config) {
      return res.json(ApiResponse("0", "Sorry, configuration not found", "", {}));
    }

    // Fetch promotions for the city
    let promotions = await banner.findAll({
      where: { status: true, cityId: cityData.id },
      attributes: ['id','title', 'type','startDate','endDate','description'],
      include:{model:restaurantOffers,attributes:['status'],include:{model:restaurant,attributes:['id']}}
    });
    // return res.json(promotions)
const formattedData = promotions.map(item => ({
  id: item.id,
  title: item.title,
  type: item.type,
  startDate: item.startDate,
  endDate: item.endDate,
  description: item.description,
  // Determine status based on restaurantOffers
  status:
    item.restaurantOffers.length === 0
      ? false // If restaurantOffers is empty, set status to false
      : item.restaurantOffers[0]?.status ?? false // If status is null or undefined, set it to false
}));

    let data = {
      config,
      promotions:formattedData
    };

    let response = ApiResponse("1", "Data fetched successfully", "", data);
    return res.json(response);
  } catch (error) {
    // Catch any error and return a generic error response
    console.error("Error in getConfiguration:", error);
    return res.json(ApiResponse("0", "An error occurred while fetching configuration", error.message, {}));
  }
}

async function changeConfiguration(req, res) {
    const { restaurantId, name, value } = req.body;
    let config = await configuration.findOne({ where: { restaurantId: restaurantId } });
    if (config) {
            config[name] = value;
            // Save the updated config
            config.save()
                .then(dat => {
                    let response = ApiResponse("1", "Status Updated", "", {});
                    return res.json(response);
                })
                .catch((error) => {
                    let response = ApiResponse("0", error.message, "", {});
                    return res.json(response);
                });
    } else {
        let response = ApiResponse("0", "Sorry, configuration not found", "", {});
        return res.json(response);
    }
}

async function changeProductStatus(req, res) {
  const { productId, status } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    let data = await R_PLink.findOne({
      where: { id: productId },
      transaction: t, // Add transaction context
    });

    if (data) {
      data.status = status;
      await data.save({ transaction: t }); // Save with transaction context=
      await t.commit(); // Commit the transaction if successful
      let response = ApiResponse("1", "Status Updated", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback the transaction if product not found
      let response = ApiResponse("0", "Not found!", "", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    let response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}


async function getDirector(req,res){
    const restaurantId = req.params.restaurantId;
    let data = await director.findOne({where:{restaurantId : restaurantId}});
    if(data){
        let response = ApiResponse("1","Direcotr data","",data);
        return res.json(response);
    }
    else{
        let response = ApiResponse("0","No Director found","",{});
        return res.json(response);
    }
}

async function updateDirector(req, res) {
  const {
    directorId,
    bankName,
    accountHolderName,
    accountNo,
    IBAN,
    swiftCode,
    bankAddress,
    bankCountry,
    streetAddress,
    zip,
    city,
    country,
  } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    let data = await director.findOne({
      where: { id: directorId },
      transaction: t, // Add transaction context
    });
    if (data) {
      // Update director details
      data.bankName = bankName;
      data.accountHolderName = accountHolderName;
      data.accountNo = accountNo;
      data.IBAN = IBAN;
      data.swiftCode = swiftCode;
      data.bankAddress = bankAddress;
      data.bankCountry = bankCountry;
      data.streetAddress = streetAddress;
      data.zip = zip;
      data.city = city;
      data.country = country;

      await data.save({ transaction: t }); // Save with transaction context

      await t.commit(); // Commit the transaction if successful

      let response = ApiResponse("1", "Update data successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback the transaction if director not found

      let response = ApiResponse("0", "Director not found", "Error", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function send_invitation(req, res) {
  const { restaurantId, countryCode, phoneNum } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Find the user type for 'driver'
    let type = await userType.findOne({
      where: { name: 'driver' },
      transaction: t, // Add transaction context
    });

    // Find the driver based on the provided country code and phone number
    let driver = await user.findOne({
      where: {
        countryCode: countryCode,
        phoneNum: phoneNum,
        status: true,
        userTypeId: type.id,
      },
      transaction: t, // Add transaction context
    });

    if (driver) {
      // Create and save the invitation
      let int = new invitation();
      int.userId = driver.id;
      int.restaurantId = restaurantId;
      int.status = true;

      await int.save({ transaction: t }); // Save with transaction context

      await t.commit(); // Commit the transaction if successful

      let response = ApiResponse("1", "Invitation sent successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback the transaction if the driver is not found

      let response = ApiResponse("0", "Sorry, driver not found!", "Error", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function get_invitations(req,res){
    let {restaurantId} = req.params;
    
    let data = await invitation.findAll({where:{restaurantId  : restaurantId},attributes:['id','createdAt'],include:[{model:user,attributes:['id','email','firstName','lastName']}]});
    let response = ApiResponse("1","All Invitations","",data);
    return res.json(response);
}

async function restaurantCusines(req,res){
    const { restaurantId } = req.params;
    let cc = await cusineRestaurant.findAll({where:{restaurantId:restaurantId},attributes:[],include:{model:cuisine,attributes:['id','name','image']}});
    let response = ApiResponse("1","Restaurant Cusinese","",{data:cc});
    return res.json(response);
}
async function allCuisines(req,res){
    const { restaurantId } = req.params;
    let restData = await restaurant.findOne({where:{id:restaurantId},attributes:['businessType']});
    let cc = await cuisine.findAll({where:{status:true,businessType:restData?.businessType}});
    let response = ApiResponse("1","All Cusinese","",{data:cc});
    return res.json(response);
}

async function assignCuisine(req, res) {
  const { restaurantId, cuisineId } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Check if the cuisine is already assigned to the restaurant
    let check = await cusineRestaurant.findOne({
      where: {
        cuisineId: cuisineId,
        restaurantId: restaurantId,
        status: true,
      },
      transaction: t, // Add transaction context
    });

    if (check) {
      // Update existing assignment if it exists
      check.status = true;

      await check.save({ transaction: t }); // Save with transaction context

      await t.commit(); // Commit the transaction if successful

      const response = ApiResponse("1", "Cuisine assigned successfully", "", {});
      return res.json(response);
    } else {
      // Create a new cuisine assignment if it doesn't exist
      let newAssignment = await cusineRestaurant.create({
        restaurantId: restaurantId,
        cuisineId: cuisineId,
        status: true,
      }, { transaction: t }); // Create with transaction context

      await t.commit(); // Commit the transaction if successful

      const response = ApiResponse("1", "Cuisine assigned successfully", "", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function removeCuisine(req, res) {
  const { restaurantId, cuisineId } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    let check = await cusineRestaurant.findOne({
      where: { cuisineId: cuisineId, restaurantId: restaurantId, status: true },
      transaction: t, // Add transaction context
    });

    if (check) {
      await check.destroy({ transaction: t }); // Destroy with transaction context

      await t.commit(); // Commit the transaction if successful

      let response = ApiResponse("1", "Cuisine removed successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback the transaction if the cuisine is not found

      let response = ApiResponse("0", "Not found", "Error", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function getProductById(rpId) {
  try {
    const productData = await R_PLink.findOne({
      where: { id: rpId },
      include: [
        {
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
        },
        {
          model: R_MCLink,
          include: {
            model: restaurant,
          },
        },
      ],
    });
    

    if (!productData) {
      throw new Error('Product not found');
    }

    const zonedetails = await zoneRestaurants.findOne({
      where: { restaurantId: productData.R_MCLink.restaurant.id },
      include: {
        model: zone,
        include: {
          model: zoneDetails,
          include: [
            { model: unit, as: 'currencyUnit' },
            { model: unit, as: 'distanceUnit' },
          ],
        },
      },
    });

    const currencySign = zonedetails?.zone?.zoneDetail?.currencyUnit?.symbol ?? 'USD';

    const productCollectionsPromise = productCollections.findAll({ where: { RPLinkId: rpId } });

    // Use a map to group add-ons by collection
    const collectionMap = new Map();

    for (const productAddon of productData.productAddons) {
      const collection = productAddon.addOn.collectionAddon.collection;
      const proCollection = await productCollections.findOne({ where: { RPLinkId: rpId, collectionId: collection.id } });
      if (!proCollection) {
        throw new Error(`Product collection not found for collection ID ${collection.id}`);
      }

      const addon = {
        id: productAddon.addOn.id,
        collectionAddonId: collection.id,
        name: productAddon.addOn.name,
        minAllowed: productAddon.addOn.collectionAddon.minAllowed,
        maxAllowed: productAddon.addOn.collectionAddon.maxAllowed,
        status: productAddon.addOn.collectionAddon.status,
        isPaid: productAddon.isPaid,
        price: productAddon.price,
        isAvaiable: productAddon.isAvaiable,
      };
      if (productAddon.isAvaiable) {
        if (collectionMap.has(collection.id)) {
          collectionMap.get(collection.id).addons.push(addon);
        } else {
          collectionMap.set(collection.id, {
            category: {
              name: collection.title,
              id: collection.id,
              maxAllowed: proCollection.maxAllowed,
              minAllowed: proCollection.minAllowed,
            },
            addons: [addon],
          });
        }
      }
    }
    const addOnArr = Array.from(collectionMap.values());
    const retObj = {
      RPLinkId: productData.id,
      countryOfOrigin: productData.countryOfOrigin,
      ingredients: productData.ingredients,
      allergies: productData.allergies,
      nutrients: productData.nutrients,
      image: productData.image,
      bannerImage: productData.bannerImage,
      name: productData.name,
      isPopular: productData.isPopular,
      description: productData.description,
      currencySign: currencySign,
      originalPrice: productData.originalPrice.toString(),
      discountPrice: productData.discountPrice.toString(),
      addOnArr: addOnArr,
    };
    return retObj;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error to propagate it further
  }
}
function addZeroBefore(n) {
  return (n < 10 ? "0" : "") + n;
}

async function getRestaurantDetails(req, res) {
  const { restaurantId } = req.params;
  try {
    const restaurantData = await restaurant.findOne({
      where: { id: restaurantId },
      include: [
        {
          model: zoneRestaurants,
          include: {
            model: zone,
            include: {
              model: zoneDetails,
              include: [
                { model: unit, as: "currencyUnit" },
                { model: unit, as: "distanceUnit" },
              ],
            },
          },
        },
        {
          model: time,
          attributes: ["name", "startAt", "endAt", "day","status"],
        },
        {
          model: restaurant_cultery,
          attributes: ["id"],
          include: { model: cutlery },
        },
        { model: unit, as: "distanceUnitID" },
        { model: unit, as: "currencyUnitID" },
        { model: deliveryFee },
        {
          model: restaurantRating,
          include: { model: user },
        },
        {
          model: R_MCLink,
          include: [
            { model: menuCategory },
            {
              model: R_PLink,
              where: { status: true, isAvailable: true },
            },
          ],
        },
        { model: paymentMethod, attributes: ["id", "name"] },
      ],
    });

    const deliveryChargeDefault = await defaultValues.findOne({
      where: { name: "deliveryCharge" },
    });

    let deliveryCharges = restaurantData.zoneRestaurant.zone.zoneDetail
      ? restaurantData.zoneRestaurant.zone.zoneDetail.maxDeliveryCharges
      : deliveryChargeDefault.value;

    const serviceDefault = await defaultValues.findOne({
      where: { name: "serviceCharges" },
    });

    const serviceChargesType = await defaultValues.findOne({
      where: { name: "serviceChargesType" },
    });

    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    function formatDateForDisplay(date) {
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };
      const formattedDate = new Date(date).toLocaleDateString("en-US", options);
      const [month, day, year] = formattedDate.split("/");
      const rearrangedDate = `${day}-${month}-${year}`;
      return rearrangedDate;
    }

    const responseWithDate = restaurantData?.times?.map((day) => {
      const today = new Date();
      const currentDay = today.getDay();
      const daysToAdd = (day.day - currentDay + 7) % 7;
      const dateForDay = new Date(today.setDate(today.getDate() + daysToAdd));
      return {
        ...day,
        date: formatDateForDisplay(dateForDay),
        dayName: daysOfWeek[day.day],
      };
    });

    var time_list = [];
    for (var i = 0; i < responseWithDate?.length; i++) {
      let obj = {
        name: responseWithDate[i]?.dataValues?.name,
        startAt: responseWithDate[i]?.dataValues?.startAt,
        endAt: responseWithDate[i]?.dataValues?.endAt,
        day: responseWithDate[i]?.dataValues?.day,
        date: responseWithDate[i]?.date,
      };
      time_list.push(obj);
    }

    let feedbackData = restaurantData.restaurantRatings;
    let feedbackArr = [];
    let restAvgRate = 0;

    feedbackData.map((fb, idx) => {
      restAvgRate += fb.value;
      let date = new Date(fb.at);
      if (fb.comment !== "") {
        let outObj = {
          rate: fb.value,
          text: fb.comment,
          userName: `${fb.user?.firstName} ${fb.user?.lastName}`,
          at: date.toDateString(),
        };
        feedbackArr.push(outObj);
      }
    });
    let avgRate = restAvgRate === 0 ? "0.0" : restAvgRate / feedbackData.length;

    let opHours = restaurantData?.openingTime?.getHours();
    let opFormat = opHours < 12 ? "AM" : "PM";
    opHours = addZeroBefore(opHours % 12 || 12);
    let opMins = restaurantData.openingTime?.getMinutes();
    opMins = addZeroBefore(opMins);
    let opTime = `${opHours}:${opMins}`;
    
    let clHours = restaurantData.closingTime?.getHours();
    let clFormat = clHours < 12 ? "AM" : "PM";
    clHours = addZeroBefore(clHours % 12 || 12);
    let clMins = restaurantData.closingTime?.getMinutes();
    clMins = addZeroBefore(clMins);
    let clTime = `${clHours}:${clMins}`;

    let menuCategories = [];
    products = [];

    for (const mc of restaurantData.R_MCLinks) {
      for (const pr of mc.R_PLinks) {
        let obj = {
          r_pId: pr.id,
          name: pr?.name,
          description: pr.description,
          image: pr.image,
          originalPrice: pr.originalPrice,
          discountPrice: pr.discountPrice,
          isPopular: pr.isPopular == null ? false : pr.isPopular,
        };
        let dd = await getProductById(pr.id);
        if(dd){
           products.push(dd); 
        }
      }
      if (mc.menuCategory.status) {
        let outObj = {
          r_mcId: mc.id,
          name: mc.menuCategory?.name,
          iconImage: mc.menuCategory?.image,
          products: products,
        };
        menuCategories.push(outObj);
      }
      products = [];
    }
    const restType = await orderApplication.findOne({
      where: { id: restaurantData.businessType },
    });

    let getConfiguration = await configuration.findOne({
      where: { restaurantId: restaurantId },
    });

    // Determine if the restaurant is currently open
      const now = new Date();
    const currentDay = now.getDay(); // Current day of the week (0 = Sunday, 1 = Monday, etc.)
    const currentTime = now.getHours() * 100 + now.getMinutes(); // Current time in minutes
    
    let completelyClosed = false; // Default to closed
    
    responseWithDate.forEach((day) => {
      if (parseInt(day.day) === currentDay) { // Check if today's opening hours match the current day
        const [startHours, startMinutes] = day.startAt.split(":").map(Number); // Extract start time
        const [endHours, endMinutes] = day.endAt.split(":").map(Number); // Extract end time
        const startTime = startHours * 100 + startMinutes; // Convert start time to minutes
        const endTime = endHours * 100 + endMinutes; // Convert end time to minutes
    
        // Check if the current time is within the opening hours
        if (currentTime >= startTime && currentTime <= endTime) {
          completelyClosed = false; // Restaurant is open
        }
      }
    });
    let retObj = {
      id: restaurantData.id,
      businessEmail: restaurantData.businessEmail,
      name: restaurantData.businessName,
      coverImage: restaurantData.image,
      description: restaurantData.description,
      isRushMode: restaurantData.isRushMode,
      VAT: restaurantData?.VATpercent || 0,
      logo: restaurantData.logo,
      rating: `${avgRate}`,
      numOfReviews: `${feedbackArr.length}`,
      location: `${restaurantData.address} ${restaurantData.zipCode} ${restaurantData.city}`,
      lat: restaurantData.lat,
      lng: restaurantData.lng,
      getConfiguration: getConfiguration ? {
        isGroupOrder: {
          isGroupOrder: getConfiguration?.isGroupOrder,
        },
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
          isClose_schedule_pickupOrders: getConfiguration?.isClose_schedule_pickupOrders,
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
      } : null,
      timings: restaurantData?.openingTime == null
        ? "Opening & Closing Time not set yet"
        : `${opTime} ${opFormat} - ${clTime} ${clFormat}`,
      times: time_list,
      deliveryTime: `${restaurantData.approxDeliveryTime} mins`,
      minOrderAmount: `${restaurantData.currencyUnitID?.symbol}${restaurantData.minOrderAmount}`,
      paymentMethod: restaurantData?.paymentMethod ?? {},
      menuCategories: menuCategories,
      currencyUnit: `${restaurantData.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol}`,
      reviews: feedbackArr,
      cultery_list: restaurantData?.restaurant_culteries || [],
      cultery_status: restaurantData.restaurant_culteries ? true : false,
      serviceChargeType: restaurantData.serviceChargesType || serviceChargesType.value,
      service_charges: restaurantData.serviceCharges || serviceDefault.value,
      deliveryCharge: deliveryCharges,
      distanceUnitID: restaurantData.zoneRestaurant?.zone?.zoneDetail?.distanceUnit,
      restType: restType?.name,
      isOpen: restaurantData.isOpen ? true : false,
      deliveryRadius: restaurantData?.distanceUnitID?.symbol === "km"
        ? restaurantData.deliveryRadius * 1000
        : restaurantData.deliveryRadius * 1609,
      completeClosed: completelyClosed,
    };
 
    const response = ApiResponse(
      "1",
      `All Information of restaurant ID ${restaurantId}`,
      "",
      retObj
    );
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function orderArcheive(req, res) {
    try {
        const { restaurantId } = req.params;
        
        // Check if restaurantId is valid
        if (!restaurantId) {
            return res.json(ApiResponse("0", "Invalid restaurant ID", "Restaurant ID is required", {}));
        }

        let deliveredStatus = await orderStatus.findOne({ where: { name: "Delivered" } });

        if (!deliveredStatus) {
            return res.json(ApiResponse("0", "Delivered status not found", "Invalid order status", {}));
        }

        // Fetch all orders with the delivered status
        let orders = await order.findAll({
            where: { restaurantId: restaurantId, orderStatusId: deliveredStatus.id },
            include: [{ model: orderCharge } ,{model:deliveryType},{model:address,as:"dropOffID",attributes:['city']}]
        });
        if (!orders.length) {
            return res.json(ApiResponse("0", "No orders found", "No delivered orders found for this restaurant", {}));
        }
        // Separate orders into two lists: tips and onlinePayments
        let tipsList = [];
        let onlinePaymentsList = [];
        let archieveList = [];
        orders.forEach(order => {
            let tipAmount = order?.orderCharge?.tip ? order.orderCharge.tip.toString() : "0";
            let tipItem = {
                tipDate: order.createdAt ? order.createdAt.toISOString() : "",
                tipAmount: tipAmount,
                orderNum: order.orderNum ? order.orderNum.toString() : "",
                totalAmount: order.total ? order.total.toString() : "0",
                orderId: order.id ? order.id.toString() : ""
            };
            tipsList.push(tipItem);
            let arc = {
                orderId : order.id,
                orderNum : order.orderNum,
                date : order.createdAt,
                amount : order.total,
                city : order?.dropOffID?.city,
                deliveryType : order?.deliveryType?.name,
                deliveryTypeId : order?.deliveryType?.id,
            };
            archieveList.push(arc);
            let paymentItem = {
                date: order.createdAt ? order.createdAt.toISOString() : "",
                amount: order.orderCharge?.total ? order.orderCharge.total.toString() : "0",
                orderNum: order.orderNum ? order.orderNum.toString() : "",
                orderId: order.id ? order.id.toString() : "",
                creationDate: order.createdAt ? order.createdAt.toISOString() : ""
            };
            onlinePaymentsList.push(paymentItem);
        });

        let data = {
            tips: tipsList,
            onlinePayments: onlinePaymentsList,
            orderArchieve:archieveList,
        };

        let response = ApiResponse("1", "Order Archive", "", data);
        return res.json(response);
    } catch (error) {
        return res.json(ApiResponse("0", "Error", error.message, {}));
    }
}

async function addRestaurantDeliveryArea(req, res) {
  const { restaurantId, coordinates } = req.body;

  // Validate that coordinates is an array of arrays [latitude, longitude]
  if (!Array.isArray(coordinates) || !coordinates.length) {
    return res.json(ApiResponse("0", "Invalid coordinates", "", {}));
  }

  // Convert the coordinates directly (no need to split)
  const polygon = coordinates.map(coord => [parseFloat(coord[0]), parseFloat(coord[1])]);

  // Ensure the first and last coordinate are the same to close the polygon
  if (polygon[0][0] !== polygon[polygon.length - 1][0] ||
      polygon[0][1] !== polygon[polygon.length - 1][1]) {
    polygon.push([polygon[0][0], polygon[0][1]]);
  }

  try {
    let restData = await restaurant.findOne({ where: { id: restaurantId } });
    if (!restData) {
      return res.json(ApiResponse("0", "Restaurant not found", "", {}));
    }
    // Save coordinates as a GeoJSON polygon
    restData.coordinates = {
      type: 'Polygon',
      coordinates: [polygon],
    };

    await restData.save();
    return res.json(ApiResponse("1", "Added successfully", "", {}));
  } catch (error) {
    return res.json(ApiResponse("0", "Error saving coordinates", error.message, {}));
  }
}

async function getRestaurantArea(req,res){
    const {restaurantId } = req.params;
    let restData = await restaurant.findOne({where:{id:restaurantId},attributes:['city','country','lat','lng','address','zipCode','coordinates']});
    return res.json(ApiResponse("1","data","",{restData}));
}

async function sendInvitationToDriver(req, res) {
    
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const { countryCode, phoneNum, restaurantId } = req.body;

    // Fetch driver type
    const driverType = await userType.findOne({
      where: { name: "driver" },
      transaction: t
    });

    if (!driverType) {
      await t.rollback();
      return res.json(ApiResponse("0", "Driver type not found", "", {}));
    }

    // Find the driver
    const driver = await user.findOne({
      where: { countryCode: countryCode, phoneNum: phoneNum, userTypeId: driverType.id },
      transaction: t
    });
   
    if (!driver) {
      await t.rollback();
      return res.json(ApiResponse("0", "Sorry! No driver exists with this phone number", "", {}));
    }

    // Find the restaurant
    const restaurantData = await restaurant.findOne({
      where: { id: restaurantId },
      transaction: t
    });

    // Check if the driver is already linked to the restaurant
    const checkRest = await restaurantDriver.findOne({
      where: { userId: driver.id, restaurantId: restaurantId }
    });
    if (checkRest) {
      return res.json(ApiResponse("0", "This driver is already linked with you", "", {}));
    }

    if (!restaurantData) {
      await t.rollback();
      return res.json(ApiResponse("0", "Restaurant not found", "", {}));
    }

    // Prepare notification data
    const noti_data = {
        driverId : driver.id,
        restaurantId : restaurantData.id,
        firstName : driver.firstName,
        lastName : driver.lastName,
        businessName : restaurantData.businessName,
    };

    // Send notification


    const driverTokens = formatTokens(driver.deviceToken);
     const driverLang = driver.language
  await singleNotification(driverTokens, "Invitation", `You are invited by ${restaurantData.businessName} restaurant`, noti_data,driverLang)
  .then(response => console.log("Notification sent successfully:", response))
  .catch(error => console.error("Notification Error:", error.message));

    
    // let eventData = {
    //       type: "Invitation",
    //       data: {
    //         status: "1",
    //         message: "Data",
    //         error: "",
    //         data: {
    //             driverId : driver.id.toString(),
    //             firstName: driver?.firstName,
    //             lastName: driver?.lastName,
    //             restaurantId : restaurantId.toString(),
    //             businessName : restaurantData.businessName,
                
    //         },
    //       },
    //     };
    //     sendEvent(driver?.id,eventData)

    const email = driver.email; // Assuming driver object has an email field
    const htmlContent = `
      <h1>Invitation to Join ${restaurantData.businessName}</h1>
      <p>Hello ${driver.firstName},</p>
      <p>You have been invited by <strong>${restaurantData.businessName}</strong> to join their team as a driver.</p>
      <p>Please click the link below to accept the invitation:</p>
      <a href="http://example.com/accept-invitation?driverId=${driver.id}&restaurantId=${restaurantData.id}">Accept Invitation</a>
      <p>Thank you!</p>
      <p>${restaurantData.businessName}</p>
    `;

    transporter.sendMail(
      {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: `Invitation from ${restaurantData.businessName}`,
        text: `You are invited by ${restaurantData.businessName} to join as a driver.`,
        html: htmlContent, // HTML content for the email
      },
      async (error, info) => {
        if (error) {
          console.log(error);
        }

        // Check if the invitation already exists
        const existingInvitation = await invitation.findOne({
          where: { userId: driver.id, restaurantId: restaurantId },
          transaction: t
        });

        if (!existingInvitation) {
          await invitation.create({
            userId: driver.id,
            restaurantId: restaurantId,
            status: true
          }, { transaction: t });
        }

        // Commit transaction
        await t.commit();
        return res.json(ApiResponse("1", "Invitation sent successfully", "", {}));
      }
    );

  } catch (error) {
    // Rollback transaction in case of error
    await t.rollback();
    return res.json(ApiResponse("0", error.message, "Error", {}));
  }
}

async function getPayouts(req, res) {
    const { restaurantId } = req.params;

    // Find all payouts for the restaurant with the associated unit model
    let data = await restaurantPayout.findAll({
        where: { restaurantId: restaurantId, status: process.env.SUCCESS },
        attributes: { exclude: ['unitId', 'updatedAt'] }, // Exclude unitId from the restaurantPayout attributes
        include: {
            model: unit,
            attributes: ['shortCode', 'symbol'] // Only include the shortCode and symbol fields from the unit model
        }
    });

    let status = await orderStatus.findOne({ where: { name: "Delivered" } });
    let type = await deliveryType.findOne({ where: { name: "Delivery" } });
    
    // Fetch orders with processing and card fees
    let orders = await order.findAll({
        where: { restaurantId: restaurantId, orderStatusId: status.id },
        attributes: [],
        include: { 
            model: orderCharge, 
            attributes: ['processingFee', 'cardFee', 'fine'] 
        }
    });

    // Fetch fine calculation orders
    let fineCalculation = await order.findAll({
        where: { restaurantId: restaurantId },
        attributes: [],
        include: { 
            model: orderCharge, 
            attributes: ['fine'] 
        }
    });
  
    let earnings = await restaurantEarning.findOne({ where: { restaurantId: restaurantId } });
    let pendingPayouts = await restaurantPayout.count({ where: { restaurantId: restaurantId } });

    let totalProcessingFee = 0;
    let totalCardFee = 0;
    let restFind = 0;

    // Sum up the processing, card fees, and fines
    orders?.forEach((item) => {
        const processingFee = item.orderCharge.processingFee ? parseFloat(item.orderCharge.processingFee) : 0;
        const cardFee = item.orderCharge.cardFee ? parseFloat(item.orderCharge.cardFee) : 0;
      
        totalProcessingFee += processingFee;
        totalCardFee += cardFee;
    });

    fineCalculation?.forEach((item) => {
        const fine = item?.orderCharge?.fine ? parseFloat(item?.orderCharge?.fine) : 0;
        restFind += fine || 0; // Add a null check on fine and default to 0 if it's null
    });
    
    // Fetch total delivery fees of drivers
    let deliveryFeesofDrivers = await driverPayout.sum('amount', {
        where: { restaurantId: restaurantId, status: process.env.PENDING }
    });

    // Return the final response
    return res.json(
        ApiResponse("1", "Payouts", "", {
            data,
            totalEarning: earnings.totalEarning,
            availableBalance: earnings?.availableBalance,
            pendingPayouts,
            totalProcessingFee: Number(totalProcessingFee).toFixed(2),
            totalCardFee: Number(totalCardFee).toFixed(2),
            deliveryFee: Number(deliveryFeesofDrivers).toFixed(2),
            fine: Number(restFind).toFixed(2)
        })
    );
}


async function pendingPayouts(req, res) {
    const { restaurantId } = req.params;
    let data = await restaurantPayout.findAll({
        where: { restaurantId: restaurantId,status:process.env.PENDING },
        attributes: { exclude: ['unitId','updatedAt'] }, 
        include: {
            model: unit,
            attributes: ['shortCode', 'symbol'] 
        }
    });
    return res.json(ApiResponse("1", "Payouts", "", { data }));
}
async function failedPayouts(req, res) {
    const { restaurantId } = req.params;

    // Find all payouts for the restaurant with the associated unit model
    let data = await restaurantPayout.findAll({
        where: { restaurantId: restaurantId,status:process.env.FAILED },
        attributes: { exclude: ['unitId','updatedAt'] }, 
        include: {
            model: unit,
            attributes: ['shortCode', 'symbol'] 
        }
    });
    return res.json(ApiResponse("1", "Payouts", "", { data }));
}


async function addPayout(req,res){
    const { amount , note ,accountNo,restaurantId,currencyUnitId} = req.body;
    let chechEarning = await restaurantEarning.findOne({where:{restaurantId : restaurantId}});
    if(parseFloat(chechEarning.availableBalance) > parseFloat(amount)){
        await restaurantPayout.create({
        amount:amount,
        note:note,
        accountNo:accountNo,
        restaurantId : restaurantId,
        unitId:currencyUnitId,
        status:process.env.PENDING
    });
    
    return res.json(ApiResponse("1","Added successfully","",{}));
    }
    else{
        return res.json(ApiResponse("0","You don't have enough available balance","",{}));
    }
}

async function driversPayouts(req, res) {
  try {
    const { restaurantId } = req.params;

    // Validate restaurantId
    if (!restaurantId) {
      return res.status(400).json(ApiResponse("0", "Restaurant ID is required", ""));
    }

    // Define status mappings (ensure these environment variables are correctly set)
    const REJECT_STATUS = process.env.REJECT;
    const SUCCESS_STATUS = process.env.SUCCESS;
    const PENDING_STATUS = process.env.PENDING;

    // Common include configuration for all queries
    const includeConfig = [
      {
        model: user, // Ensure 'User' matches your Sequelize model
        attributes: ['id', 'firstName', 'lastName', 'email'],
        include:{model: driverEarning,attributes:['availableBalance']}
      },
    ];

    // Fetch rejected payouts
    const rejectedPayouts = await driverPayout.findAll({
      where: {
        restaurantId: restaurantId,
        status: REJECT_STATUS,
      },
      include: includeConfig,
    });

    // Fetch successful payouts
    const successPayouts = await driverPayout.findAll({
      where: {
        restaurantId: restaurantId,
        status: SUCCESS_STATUS,
      },
      include: includeConfig,
    });

    // Fetch pending payouts
    const pendingPayouts = await driverPayout.findAll({
      where: {
        restaurantId: restaurantId,
        status: PENDING_STATUS,
      },
      include: includeConfig,
    });

    // Structure the response data
    const responseData = {
      rejectedPayouts,
      successPayouts,
      pendingPayouts,
    };

    // Send the successful response
    return res.json(ApiResponse("1", "Payouts fetched successfully", "", responseData));

  } catch (error) {
    console.error("Error fetching driver payouts:", error.message);
    return res.status(500).json(ApiResponse("0", "Internal Server Error", error.message));
  }
}

async function acceptDriverPayout(req,res){
    const { amount,payoutId,restaurantId } = req.body;
    let earning = await restaurantEarning.findOne({where:{restaurantId: restaurantId}});
    if(earning){
        if(parseFloat(earning.availableBalance) > parseFloat(amount)){
            let payout = await driverPayout.findOne({where:{id:payoutId}});
            payout.status = process.env.SUCCESS;
            await payout.save();
            
            earning.availableBalance = parseFloat(earning.availableBalance) - parseFloat(amount);
            await earning.save();
            
            let dEarning = await driverEarning.findOne({where:{userId : payout.userId}});
            if(dEarning){
                dEarning.totalEarning = parseFloat(dEarning.totalEarning) + parseFloat(amount);
                dEarning.availableBalance = parseFloat(dEarning.availableBalance) + parseFloat(amount);
                await dEarning.save();
            }
            
            let comm = await driverCommission.findOne({where:{restaurantId : restaurantId,userId:payout.userId}});
            if(comm){
                comm.amount = parseFloat(comm.amount) - parseFloat(amount);
                await comm.save();
            }
            
            return res.json(ApiResponse("1","Payout completed successfully","",{}));
        }
        else{
            return res.json(ApiResponse("0","You don't have enough balance","",{}));
        }
    }
    else
    {
        return res.json(ApiResponse("0","Restaurant Earning not found!","",{}));
    }
}

async function rejectPayout(req,res){
    const { payoutId } = req.body;
    let data = await driverPayout.findOne({where:{id:payoutId}});
    if(data){
        data.status = process.env.REJECT;
        await data.save();
    }
    return res.json(ApiResponse("1","Payout rejected!","",{}));
}

async function blockDriver(req,res){
    const { id } =  req.body;
    let dd = await restaurantDriver.findOne({where:{id:id}});
    if(dd){
        dd.status = false;
        await dd.save();
        return res.json(ApiResponse("1","Driver Blocked","",{}));
    }
    else{
        return res.json(ApiResponse("0","Not Found!","",{}));
    }
}
async function activateDriver(req,res){
    const { id } =  req.body;
    let dd = await restaurantDriver.findOne({where:{id:id}});
    if(dd){
        dd.status = true;
        await dd.save();
        return res.json(ApiResponse("1","Driver Activated","",{}));
    }
    else{
        return res.json(ApiResponse("0","Not Found!","",{}));
    }
}

 async function addPromotion(req,res){
     const { bannerId , restaurantId , status} = req.body;
     let data = await restaurantOffers.findOne({where:{bannerId,restaurantId}});
     if(data){
         data.status = status;
         await data.save();
         return res.json(ApiResponse("1","Status updated successfully","",{}));
     }
     else{
         await restaurantOffers.create({
             restaurantId,
             bannerId,
             status
         });
         return res.json(ApiResponse("1","Status updated successfully","",{}));
     }
 }
 
 async function addLanguage(req,res){
     const { restaurantId,language } = req.body;
     let check = await menuCategoryLanguage.findOne({where:{restaurantId:restaurantId}});
     if(check){
         check.language = language;
         check.status = true;
         await check.save();
     }
     else{
         await menuCategoryLanguage.create({
             restaurantId:restaurantId,
             language:language,
             status:true
         })
     }
     
     return res.json(ApiResponse("1","Menu Category Language updated","",{}));
 }
 
 async function changeLanguage(req,res){
     const { restaurantId, language } = req.body;
     let restData = await restaurant.findOne({where:{id:restaurantId}});
     if(restData){
         let userData = await user.findOne({where:{id:restData?.userId}});
         if(userData){
             userData.language = language;
             await userData.save();
         }
     }
     return res.json(ApiResponse("1","Updated successfully","",{}));
 }
 
async function addBanner(req, res) {
    const {
        title,
        description,
        type,
        dimension,
        startDate,
        endDate,
        restaurantId,
        bannerType,
        productIds,
        discountAmount,
        discountType,
        minimumOrderValue,
        RPLinkIds,
        excludeIds,
        capMaxDiscount,
        deliveryTypeId,
        exDescription,
        allProducts,
        isAdult,
        
        radius,
        freeDeliveryIds,
        
        buyItemId,
        getItemId
        
        
        
       
    } = req.body;
    console.log(req.body)

    try {
        // Check if a banner with the same title already exists
        let checkTitle = await restaurantBanners.count({
            where: { title: title, restaurantId: restaurantId }
        });

        if (checkTitle > 0) {
            return res.json(ApiResponse("0", "Already exists with this title", "", {}));
        }

        // Get the business type of the restaurant
        let restType = await restaurant.findOne({
            where: { id: restaurantId },
            attributes: ['businessType']
        });

        // Create a new restaurant banner entry
        let add = new restaurantBanners();
        add.title = title;
        add.description = description;
        add.dimension = dimension;
        add.startDate = startDate;
        add.endDate = endDate;
        add.restaurantId = restaurantId;
        add.bannerType = bannerType;
        add.status = true;
        add.deliveryTypeId = deliveryTypeId;
        add.exDescription = exDescription;
        add.businessType = restType?.businessType;
        add.isAdult = isAdult;

        // If an image is uploaded, save the path
        if (req.file) {
            let imagePathTemp = req.file.path;
            let imagePath = imagePathTemp.replace(/\\/g, "/");
            add.image = imagePath;
        }

        // Save the new banner
        await add.save();

        if (bannerType === process.env.DISCOUNT) {
            // Check and delete existing discount details if any
            let existingDiscountDetails = await discountDetail.findOne({
                where: { restaurantBannerId: add.id }
            });

            if (existingDiscountDetails) {
                // Delete existing discount products
                await discountProducts.destroy({
                    where: { discountDetailId: existingDiscountDetails.id }
                });

                // Delete the existing discount details
                await discountDetail.destroy({
                    where: { restaurantBannerId: add.id }
                });
            }

            // Add the new discount details
            let details = new discountDetail();
            details.discountValue = discountAmount;
            details.discountType = discountType;
            details.minimumOrderValue = minimumOrderValue;
            details.capMaxDiscount = capMaxDiscount;
            details.restaurantBannerId = add.id;
            details.allProducts = allProducts;

            await details.save();
            if(!allProducts){
               if (RPLinkIds.length > 0) {
                for (const rp of JSON.parse(RPLinkIds)) {
                    await discountProducts.create({
                        RPLinkId: rp,
                        discountDetailId: details.id,
                        status: true
                    });
                }
            } 
             if (excludeIds.length > 0) {
                for (const rp of JSON.parse(excludeIds)) {
                    await excludeProducts.create({
                        RPLinkId: rp,
                        discountDetailId: details.id,
                        status: true
                    });
                }
            }
            }
        }
        if (bannerType === process.env.FREEDELIVERY) {
            // Check and delete existing discount details if any
            let existingDiscountDetails = await freeDeliveryDetail.findOne({
                where: { restaurantBannerId: add.id }
            });

            if (existingDiscountDetails) {
              
                // Delete the existing discount details
                await freeDeliveryDetail.destroy({
                    where: { restaurantBannerId: add.id }
                });
            }

            // Add the new discount details
            let details = new freeDeliveryDetail();
            details.radius = radius;
            details.minimumOrderValue = minimumOrderValue;
            details.minimumOrderValue = minimumOrderValue;
            details.restaurantBannerId = add.id;
            details.allProducts = allProducts;

            await details.save();
            if(!allProducts){
                if (freeDeliveryIds.length > 0) {
                for (const rp of freeDeliveryIds) {
                    await freeDeliveryProducts.create({
                        RPLinkId: rp,
                        freeDeliveryDetailId : details.id,
                        status: true
                    });
                }
            }  
            }
        }
        if (bannerType === process.env.BOGO) {
            // Check and delete existing discount details if any
            let existingDiscountDetails = await bogoDetail.findOne({
                where: { restaurantBannerId: add.id }
            });
            if (existingDiscountDetails) {
              
                // Delete the existing discount details
                await bogoDetail.destroy({
                    where: { restaurantBannerId: add.id }
                });
            }
            // Add the new discount details
            let details = new bogoDetail();
            details.buyItem = buyItemId;
            details.getItem = getItemId;
            details.restaurantBannerId = add.id;
            await details.save();
        }
        return res.json(ApiResponse("1", "Added successfully", "", {}));
    } catch (error) {
        // If any error occurs, return the error response
        return res.json(ApiResponse("0", error.message, "", {}));
    }
}

 async function getAllBanners(req,res){
     const { restaurantId } = req.params;
     let banners = await restaurantBanner.findAll({where:{restaurantId : restaurantId}});
     return res.json(ApiResponse("1","Banner Data","",banners));
 }
 
 async function deleteBanner(req,res){
     const { bannerId } = req.body;
     await restaurantBanners.destroy({where:{id:bannerId}});
     return res.json(ApiResponse("1","Removed successfully","",{}));
 }
 
 async function changeStatusBanner(req,res){
     const { id } = req.body;
     let dd = await restaurantBanner.findOne({where:{id:id}});
     dd.status = !dd.status;
     dd.save();
     return res.json(ApiResponse("1","Status updated successfully","",{}));
 }
 
 async function getBanners(req,res){
     const { id } = req.params;
     let dd = await restaurantBanners.findAll({where:{restaurantId:id}});
     
     return res.json(ApiResponse("1","Banner Data","",{data:dd}));
 }
  async function updateBanner(req,res){
     const { id,title,description,dimension,startDate,endDate,restaurantId} = req.body;
      const t = await SequelizeDB.transaction(); // Start transaction
     try{
         
     
     let checkTitle =await restaurantBanners.findOne({where:{title : title,restaurantId : restaurantId },transaction:t});
     if(checkTitle){
         return res.json(ApiResponse("0","Already exists with this title","",{}));
     }
     
     let restType = await restaurant.findOne({where:{id:restaurantId},attributes:['businessType'],transaction:t});
     
     let add = await restaurantBanners.findOne({where:{id:id}});
     add.title = title;
     add.description = description;
     add.dimension = dimension;
     add.startDate = startDate;
     add.endDate = endDate;
     add.restaurantId = restaurantId;
     add.status = true;
     add.businessType = restType?.businessType;
     
     if(req.file){
        let imagePathTemp = req.file.path;
        let imagePath = imagePathTemp.replace(/\\/g, "/");
        add.image = imagePath;
     }
     await add.save({transaction:t});
     t.commit();
     return res.json(ApiResponse("1","Updated successfully","",{}));
     }
     catch(error){
         t.rollback();
         return res.json(ApiResponse("0",error.message,"",{}));
     }
 }


module.exports = {
  restSignUp,
  restSignIn,
  getAllRest,
  getAllProdByRest,
  getAllOrdersByRest,
  getRatingByRest,
  getNewOrders,
  getStatus,
  changerOrderStatus,
  assignMCToRest,
  restaunarntEarning,
  requestPayout,
  getAllPayoutsByRestId,
  dashBoardStats,
  dashBoardYearlyEarn,
  tablebookings,
  accepttablebooking,
  rejecttablebooking,
  resturantcharge,
  updateresturantcharge,
  assignCuisineToRest,
  getAllCuisineByRest,
  session,
  //   NEW APIS
  home,
  acceptOrder,
  restaurantDrivers,
  assignDriver,
  storeTime,
  updateStoreTime,
  orderDetails,
  activeOrders,
  completedOrders,
  updateRestaurant,
  updatePassword,
  enableRushMode,
  readyForPickup,
  addProduct,
  getProducts,
  editCategory,
  getAllCategory,
  addCategory,
  addCollection,
  addAddOns,
  getAllAddOnCategories,
  getAllAddOns,
  getRPLinkIds,
  updateAddOnCategory,
  updateAddOns,
  getRestaurantProfile,
  updateUserProfile,
  rejectOrder,
  completedOrders,
  activeOrders,
  getRestaurantDrivers,
  getRating,
  acceptBookTableRequest,
  rejectBookTableRequest,
  getTableBookings,
  deleteAddonCategory,
  getProductById,
  getProductByIdApi,
  removeCategory,
  editProduct,
  inDeliverOrders,
  getData,
  delivered,
  addDriver,
  addDriverZone,
  getVehicleType,
  addVehicleDetails,
  addDriverLicense,
  addDriverAddress,
  sendNotificationToFreelanceDriver,
  scheduleOrder_to_Outgoing,
  openCloseRestaurant,

  //RESTAURANT PANEL APIS
  addProductStock,
  analytics,
  completeTableBooking,
  hourlyInsight,
  menuPerformance,
  postOrderInsight,
  customerExperience,
  orderToAccept,
  orderByNewCustomers,
  courierDashboard,
  homeData,
  acceptOrderForSocket,
  assignDriverForSocket,
  getConfiguration,
  changeConfiguration,
  addDirector,
  changeProductStatus,
  getDirector,
  updateDirector,
  send_invitation,
  get_invitations,
  restaurantCusines,
  assignCuisine,
  removeCuisine,
  allCuisines,
  getRestaurantDetails,
  orderArcheive,
  addRestaurantDeliveryArea,
  getRestaurantArea,
  sendInvitationToDriver,
  getPayouts,
  pendingPayouts,
  failedPayouts,
  addPayout,
  driversPayouts,
  acceptDriverPayout,
  rejectPayout,
  blockDriver,
  activateDriver,
  addPromotion,
  addLanguage,
  changeLanguage,
  addBanner,
  getAllBanners,
  deleteBanner,
  changeStatusBanner,
  getBanners,
  updateBanner,
  getAdultsProducts
  
};
