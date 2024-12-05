const { restaurant, user, driverZone, order, orderMode, orderType, orderStatus, zoneRestaurants, tableBooking, orderHistory, orderItems, R_PLink, orderAddOns, addOn, configuration,address,paymentMethod } = require("../models"); // Adjust the path to your models
const axios = require("axios");
const getDistance = require("./distance"); // Make sure you have this function available
const eta_text = require("./eta_text");
const {formatTokens} = require("./getTokens");

const { Op,fn, col, literal } = require("sequelize");
const sequelize = require("sequelize");
async function restaurantHomeData(restId) {
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
          {model:user,as:"DriverId",attributes:['id','firstName','lastName','email','phoneNum','countryCode','image']},
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
           {model:user,as:"DriverId",attributes:['id','firstName','lastName','email','phoneNum','countryCode','image']},
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
           {model:user,as:"DriverId",attributes:['id','firstName','lastName','email','phoneNum','countryCode','image']},
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
      configuration: config,
      nearest_pickup_time: timeList.length > 0
        ? timeList[index] === ""
          ? "0"
          : timeList[index]
        : "5 minutes",
      isRushMode: userData.restaurants[0]?.isRushMode == null || userData.restaurants[0]?.isRushMode == false
        ? false
        : true,
      isOpen: userData?.restaurants[0]?.isOpen == null
        ? false
        : userData?.restaurants[0]?.isOpen,
      tableBookingsPlaced,
      tableBookingsAccepted,
    };
    return data;
  } catch (error) {
    console.error(error);
    return {};
  }
}


module.exports = { restaurantHomeData };
