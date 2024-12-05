require("dotenv").config();
const { Server } = require("socket.io");
const {
  user,
  orderCharge,
  userType,
  restaurant,
  order,
  address,
  deliveryType,
  restaurantDriver,
  restaurantEarning,
  orderHistory,
  orderStatus,
  zoneRestaurants,
  orderMode,
  driverZone,
  configuration,
  zone,
  unAcknowledgedEvents,
  Credit,
} = require("./models");
const eta_text = require("./helper/eta_text");
const distance = require("./helper/distance");
const sendNotification = require("./helper/singleNotification");
const axios = require("axios");
const { Op } = require("sequelize");
const { restaurantHomeData } = require("./helper/retailerCommonFunctions"); // Import the homeData function
const { formatTokens } = require("./helper/getTokens"); // Import the homeData function
let ioInstance;
const initializeWebSocket = (server) => {
  const io = new Server(server);
  ioInstance = io;
  io.on("connection", async (socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on("message", async (message) => {
      try {
        let data = JSON.parse(message);
        const userId = data.userId;

        socket.join(userId);
        console.log(
          `User  ${userId} joined room *****************************  ${userId}`
        );
        console.log(
          `User  ${userId} joined room *****************************  ${userId}`
        );
        console.log(
          `User  ${userId} joined room *****************************  ${userId}`
        );
        console.log(
          `User  ${userId} joined room *****************************  ${userId}`
        );
        console.log(
          `User  ${userId} joined room *****************************  ${userId}`
        );
        // Log which rooms this socket is connected to
        console.log(`Socket ${socket.id} is connected to room: ${userId}`);
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("re-connect", async (message) => {
      console.log(message);
      let data = JSON.parse(message);
      const userId = data.userId;
      socket.join(userId);
      console.log(`User ${userId} re-connected again!!!!!`);

      // Fetch unacknowledged events from the database
      const rows = await unAcknowledgedEvents.findAll({
        where: {
          to: userId,
        },
      });

      rows.forEach((event) => {
        console.log(`🚀🚀 Resending Event:`, event);

        // Ensure event.data is parsed only if it's a string
        let eventData;
        try {
          eventData = {
            id: event.id,
            type: event.type,
            data:
              typeof event.data === "string"
                ? JSON.parse(event.data)
                : event.data,
            to: event.to,
          };
        } catch (err) {
          console.error(
            `Failed to parse event data for event ID ${event.id}:`,
            err
          );
          return; // Skip this event if parsing fails
        }

        ioInstance
          .to(event.to)
          .emit(event.type, eventData.data, async (ack) => {
            if (ack) {
              console.log(`Event acknowledged by ${event.to}`);
              await unAcknowledgedEvents.destroy({
                where: {
                  id: event.id,
                },
              });
            } else {
              console.log(`Event not acknowledged by ${event.to}`);
            }
          });
      });
    });
    socket.on("acceptIncommingOrder", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        console.log(incomingDataParsed);
        try {
          let acceptStatus = await orderStatus.findOne({
            where: {
              name: "Accepted",
            },
          });
          const status = await orderStatus.findOne({
            where: {
              name: "Preparing",
            },
          });
          const dd = await order.findOne({
            where: {
              id: incomingDataParsed.orderId,
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
                attributes: ["id", "deviceToken", "ip"],
              },
            ],
          });
          if (dd.orderStatusId === acceptStatus.id) {
            return {
              status: "0",
              message: "Already Accepted",
              error: "",
              data: {},
            };
          }
          const mode = await orderMode.findOne({
            where: {
              name: "Scheduled",
            },
          });
          // Update the order status
          dd.customTime = incomingDataParsed.customTime;
          if (dd.orderModeId == mode.id) {
            dd.orderStatusId = acceptStatus.id;
          } else {
            dd.orderStatusId = status.id;
          }
          await dd.save();
          // Create order history entries
          let time = Date.now();
          await orderHistory.create({
            time,
            orderId: dd.id,
            orderStatusId: acceptStatus.id,
          });
          if (dd.orderModeId != mode.id) {
            await orderHistory.create({
              time,
              orderId: dd.id,
              orderStatusId: status.id,
            });
          }
          // Fetch restaurant data
          const restData = await restaurant.findOne({
            where: {
              id: incomingDataParsed.restaurantId,
            },
            include: {
              model: user,
              attributes: ["ip", "id"],
            },
            attributes: ["approxDeliveryTime", "lat", "lng"],
          });

          // Calculate ETA
          let etaText = await eta_text(
            restData?.lat,
            restData?.lng,
            dd.dropOffID?.lat,
            dd.dropOffID?.lng
          );
          let etaValue = parseFloat(etaText.split(" ")[0]);
          dd.finalTime =
            parseInt(parseInt(incomingDataParsed.customTime) / 60) +
            parseInt(etaValue);
          await dd.save();
          let eventData = {
            eta_text:
              parseInt(parseInt(incomingDataParsed.customTime) / 60) +
              parseInt(etaValue),
            orderId: incomingDataParsed.orderId,
          };
          var eventDataForUser = {};
          if (dd.orderModeId == mode.id) {
            eventDataForUser = {
              type: "acceptScheduleOrder",
              data: {
                data: {
                  eta_text:
                    parseInt(parseInt(incomingDataParsed.customTime) / 60) +
                    parseInt(restData?.approxDeliveryTime),
                  orderId: incomingDataParsed.orderId,
                  scheduleDate: dd.scheduleDate,
                },
              },
            };
          } else {
            eventDataForUser = {
              type: "acceptOrder",
              data: {
                data: eventData,
              },
            };
          }
          // Use the imported restaurantHomeData function to get the latest data for the retailer
          let retailerHomeData = await restaurantHomeData(
            incomingDataParsed.restaurantId
          );
          const eventDataForRetailer = {
            type: "acceptOrder",
            data: {
              message: "Data",
              error: "",
              status: "1",
              data: retailerHomeData,
            },
          };
          // Send events to users
          sendEvent(dd?.user?.id, eventDataForUser);
          sendEvent(restData?.user?.id, eventDataForRetailer);
        } catch (error) {
          console.log("Error in acceptIncommingOrder:");
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("rejectIncomingOrder", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let orderId = incomingDataParsed?.orderId;
        let fineStatus = incomingDataParsed?.fineStatus;
        let comment = incomingDataParsed?.comment;
        let title = incomingDataParsed?.title;
        console.log(incomingDataParsed);
        const status = await orderStatus.findOne({
          where: {
            name: "Reject",
          },
        });
        const orderData = await order.findOne({
          where: {
            id: orderId,
          },
          include: [
            {
              model: user,
              attributes: ["id", "deviceToken", "ip"],
            },
            {
              model: restaurant,
              attributes: ["id"],
              include: {
                model: user,
                attributes: ["ip", "id"],
              },
            },
          ],
        });
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
              history.cancelledBy = orderData.userId;
              history
                .save()
                .then(async (his) => {
                  if (orderData.credits) {
                    if (parseInt(orderData.credits) > 0) {
                      let userCredits = await Credit.findOne({
                        where: {
                          userId: orderData.userId,
                        },
                      });
                      if (parseInt(userCredits.point) < 18) {
                        userCredits.point =
                          parseInt(userCredits.point) +
                            parseInt(orderData.credits) >
                          18
                            ? 18
                            : parseInt(userCredits.point) +
                              parseInt(orderData.credits);
                        await userCredits.save();
                      }
                    }
                  }

                  let chargeData = await orderCharge.findOne({
                    where: { orderId: orderData.id },
                  });
                  if (chargeData && fineStatus) {
                    chargeData.fine = 20;
                    await chargeData.save();

                    //on reject order, restaurant will be fine 20
                    let restEarning = await restaurantEarning.findOne({
                      where: { restaurantId: orderData?.restaurantId },
                    });
                    if (restEarning) {
                      restEarning.availableBalance =
                        parseInt(restEarning.availableBalance) - 20;
                      restEarning.totalEarning =
                        parseInt(restEarning.totalEarning) - 20;
                      await restEarning.save();
                    }
                  }
                  // send notification to customer that your order has been rejected
                  let notiBody = {
                    comment: comment,
                    title: title,
                    orderId: orderId,
                  };
                  let userTokens = formatTokens(orderData?.user?.deviceToken);
                  sendNotification(
                    userTokens,
                    "Order Rejected",
                    `Your Order ID : ${orderId} has rejected due to ${title}`,
                    notiBody
                  );
                  const eventData = {
                    type: "rejectOrder",
                    data: notiBody,
                  };
                  let restHomeData = await restaurantHomeData(
                    orderData.restaurantId
                  );
                  const restEventData = {
                    type: "rejectOrder",
                    data: {
                      status: "1",
                      message: "Home data",
                      error: "",
                      data: restHomeData,
                    },
                  };
                  sendEvent(orderData?.user?.id, eventData);
                  sendEvent(orderData?.restaurant?.user?.id, restEventData);
                })
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("EnableRushMode", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let restaurantId = incomingDataParsed?.restaurantId;
        let time = incomingDataParsed?.time;
        const rest = await restaurant.findOne({
          where: {
            id: restaurantId,
          },
          include: {
            model: user,
            attributes: ["id"],
          },
        });
        if (rest) {
          if (rest.isRushMode) {
            rest.isRushMode = false;
            rest.rushModeTime = 0;
            await rest.save();
          } else {
            rest.isRushMode = true;
            rest.rushModeTime = time;
            await rest.save();
          }
          const eventData = {
            type: "EnableRushMode",
            data: {
              status: "1",
              message: rest.isRushMode
                ? "Rush Mode Enable"
                : "Rush Mode Disable",
              error: "",
              data: {},
            },
          };
          sendEvent(rest?.user?.id, eventData);
        }
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("openCloseRestaurant", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let restaurantId = incomingDataParsed?.restaurantId;
        const rest = await restaurant.findOne({
          where: {
            id: restaurantId,
          },
          include: {
            model: user,
            attributes: ["id"],
          },
        });
        let data = {};
        if (rest) {
          rest.isOpen = rest.isOpen ? false : true;
          rest
            .save()
            .then((dat) => {
              data = {
                isOpen: dat.isOpen ? true : false,
              };
              const eventData = {
                type: "openCloseRestaurant",
                data: {
                  status: "1",
                  message: rest.isOpen
                    ? "Restaurant opened successfully"
                    : "Restaurant closed successfully",
                  error: "",
                  data: data,
                },
              };
              sendEvent(rest?.user?.id, eventData);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("sendNotificationToFreelanceDriver", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let restaurantId = incomingDataParsed?.restaurantId;
        let orderId = incomingDataParsed?.orderId;
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
            attributes: [
              "id",
              "userName",
              "firstName",
              "lastName",
              "email",
              "countryCode",
              "phoneNum",
              "driverType",
            ],
            where: {
              driverType: { [Op.or]: ["Freelancer"] },
              userTypeId: type.id,
            },
          },
        });

        const orderData = await order.findOne({
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
              attributes: ["id", "deviceToken", "language"],
            },
          ],
        });
        // Calculate estimated time
        const estTime = await eta_text(
          orderData.restaurant.lat,
          orderData.restaurant.lng,
          orderData.dropOffID.lat,
          orderData.dropOffID.lng
        );
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
          finalTime: orderData?.finalTime,
        };
        // Prepare event data
        const eventData = {
          type: "assignDriver",
          data: {
            data: notiData,
          },
        };
        const list = [];
        let fireBase = await axios.get(process.env.FIREBASE_URL);
        // Send events to each driver
        zoneDrivers.forEach(async (driver) => {
          if (fireBase?.data[driver.user.id]) {
            let driverLocation = fireBase?.data[driver.user.id];

            // Calculate distance
            let getDistance = distance(
              orderData?.restaurant?.lat,
              orderData?.restaurant?.lng,
              driverLocation?.lat,
              driverLocation?.lng
            );
            let driverDistance = await eta_text(
              orderData?.restaurant?.lat,
              orderData?.restaurant?.lng,
              driverLocation?.lat,
              driverLocation?.lng
            );
            
            // Check if the driver is within the delivery radius
            if (
              parseFloat(getDistance) <
              parseFloat(orderData?.restaurant?.deliveryRadius)
            ) {
              // Prepare the notification data for this driver
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
                getDistance: driverDistance, // Include calculated distance here
                finalTime: orderData?.finalTime,
              };

              // Prepare event data
              const eventData = {
                type: "assignDriver",
                data: {
                  data: notiData,
                },
              };

              // Collect device tokens if available
              if (driver.user.deviceToken) {
                const tokens = formatTokens(driver.user.deviceToken);
                tokens.forEach((token) => {
                  list.push(token);
                });
              }

              // Send event if the driver is in the Firebase data
              if (fireBase.data[driver?.user?.id]) {
                sendEvent(driver.user.id, eventData);
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
        sendNotification(list, notification, notiData, driver?.user?.language);
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("sendNotificationToRestaurantDriver", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let restaurantId = incomingDataParsed?.restaurantId;
        let orderId = incomingDataParsed?.orderId;
        // Find driver user type
        const type = await userType.findOne({
          where: {
            name: "Driver",
          },
        });
        const restDrivers = await restaurantDriver.findAll({
          where: {
            restaurantId: restaurantId,
            status: true,
          },
          include: {
            model: user,
            attributes: [
              "id",
              "userName",
              "firstName",
              "lastName",
              "email",
              "countryCode",
              "phoneNum",
              "driverType",
            ],
            where: {
              driverType: "Restaurant",
              userTypeId: type.id,
            },
          },
        });
        // Fetch order details
        const orderData = await order.findOne({
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
              attributes: ["id", "deviceToken"],
            },
          ],
        });
        // Calculate estimated time
        const estTime = await eta_text(
          orderData.restaurant.lat,
          orderData.restaurant.lng,
          orderData.dropOffID.lat,
          orderData.dropOffID.lng
        );
        let driverDistance = await eta_text(
          orderData?.restaurant?.lat,
          orderData?.restaurant?.lng,
          driverLocation?.lat,
          driverLocation?.lng
        );
        let ordercharge = await orderCharge.findOne({
          where: { orderId: orderData.id },
        });
        // Prepare notification data
        const notiData = {
          orderId: orderData.id,
          restaurantName: orderData.restaurant.businessName,
          //   estEarning: "25.4", // Adjust as per your calculation method
          estEarning: ordercharge?.deliveryFees?.toString(), // Adjust as per your calculation method
          dropOffAddress: orderData.dropOffID.streetAddress,
          pickUpAddress: orderData?.restaurant?.address,
          orderApplication: orderData.businessType,
          distance: estTime,
          orderNum: orderData.orderNum,
          orderType: orderData.deliveryTypeId,
          getDistance: driverDistance,
        };
        // Prepare event data
        const eventData = {
          type: "assignDriver",
          data: {
            data: notiData,
          },
        };
        const list = [];
        let fireBase = await axios.get(process.env.FIREBASE_URL);
        // Send events to each driver
        restDrivers.forEach((driver) => {
          if (fireBase?.data[driver.user.id]) {
            let driverLocation = fireBase?.data[driver.user.id];
            let getDistance = distance(
              orderData.restaurant.lat,
              orderData?.restaurant.lng,
              driverLocation.lat,
              driverLocation.lng
            );

            if (
              parseFloat(getDistance) <
              parseFloat(orderData?.restaurant?.deliveryRadius)
            ) {
              if (driver?.user?.deviceToken) {
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

        sendNotification(list, notification, notiData);
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("readyForPickup", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData);
        let orderId = incomingDataParsed?.orderId;

        const status = await orderStatus.findOne({
          where: { name: "Ready for delivery" },
        });
        const orderData = await order.findOne({
          where: { id: orderId },
          include: [
            {
              model: restaurant,
              include: { model: user, attributes: ["ip", "id"] },
            },
            { model: deliveryType },
            { model: address, as: "dropOffID" },
            { model: user },
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
                "language",
              ],
            },
          ],
        });

        const rejectStatus = await orderStatus.findOne({
          where: { name: "Cancelled" },
        });
        const deliveryStatus = await deliveryType.findOne({
          where: { name: "Delivery" },
        });

        if (orderData) {
          if (orderData.orderStatusId == rejectStatus.id) {
            let restData = {
              type: "readyForPickup",
              data: {
                status: "0",
                message: `This order ID ${orderId} is already rejected by Driver`,
                error: "",
                data: {},
              },
            };
            sendEvent(orderData?.restaurant?.user?.id, restData);
            return;
          }

          if (
            orderData?.deliveryType?.name === "Delivery" &&
            orderData.driverId == null
          ) {
            let restData = {
              type: "readyForPickup",
              data: {
                status: "0",
                message:
                  "Please assign driver to Order before ready for delivery",
                error: "",
                data: {},
              },
            };
            sendEvent(orderData?.restaurant?.user?.id, restData);
            return;
          }

          orderData.orderStatusId = status.id;
          await orderData.save();

          const history = new orderHistory();
          history.time = Date.now();
          history.orderId = orderId;
          history.orderStatusId = status.id;
          await history.save();

          let lat = "";
          let lng = "";
          let etaValue = 0; // Ensure etaValue is defined in the correct scope

          if (orderData.deliveryTypeId == deliveryStatus.id) {
            console.log(
              `@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Delivery Type`
            );
            const estTime = await eta_text(
              orderData.restaurant.lat,
              orderData.restaurant.lng,
              orderData.dropOffID.lat,
              orderData.dropOffID.lng
            );
            etaValue = parseFloat(estTime.split(" ")[0]);
            let data = {
              estTime: etaValue,
              orderStatus: "Ready for delivery",
              orderId: orderData.id,
            };
            let eventData = {
              type: "readyForPickup",
              message: "Ready for pickup",
              error: "",
              data: data,
            };

            // Send to driver and customer
            sendEvent(orderData.driverId, eventData);
            sendEvent(orderData?.userId, eventData);

            restaurantHomeData(orderData.restaurantId).then((dat) => {
              let restData = {
                type: "readyForPickup",
                data: {
                  status: "1",
                  message: "home data",
                  error: "",
                  data: dat,
                },
              };
              sendEvent(orderData?.restaurant?.user?.id, restData);
            });

            let userTokens = formatTokens(orderData?.user?.deviceToken);
            sendNotification(
              userTokens,
              "Ready for Pickup",
              `Your Order ID ${orderId} is ready for Pickup`,
              data,
              orderData?.user?.language
            );
          } else {
            console.log(
              `@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Self Delivery Type`
            );
            const fireBase = await axios.get(process.env.FIREBASE_URL);
            if (fireBase?.data && fireBase.data[orderData.driverId]) {
              lat = fireBase.data[orderData.driverId].lat;
              lng = fireBase.data[orderData.driverId].lng;
            }
            const estTime = await eta_text(
              orderData.restaurant.lat,
              orderData.restaurant.lng,
              lat,
              lng
            );
            etaValue = parseFloat(estTime.split(" ")[0]);
            const data = {
              estTime: etaValue,
              orderId: orderData.id,
              orderStatus: "Ready for delivery",
            };

            let userTokens = formatTokens(orderData?.user?.deviceToken);
            sendNotification(
              userTokens,
              "Ready for Pickup",
              `Your Order ID ${orderId} is ready for Pickup`,
              data,
              orderData?.user?.language
            );

            let driverTokens = formatTokens(orderData?.DriverId?.deviceToken);
            sendNotification(
              driverTokens,
              "Ready for Pickup",
              `Your Order ID ${orderId} is ready for Pickup`,
              data,
              orderData?.DriverId?.language
            );
          }

          //   let userEvent = {
          //     type: "readyForPickup",
          //     data: {
          //       status: "1",
          //       message: "home data",
          //       error: "",
          //       data: { orderId: orderData.id, estTime: etaValue },
          //     },
          //   };
          //   sendEvent(orderData?.user?.id, userEvent);

          restaurantHomeData(orderData.restaurantId).then((dat) => {
            let restData = {
              type: "readyForPickup",
              data: {
                status: "1",
                message: "home data",
                error: "",
                data: dat,
              },
            };
            sendEvent(orderData?.restaurant?.user?.id, restData);
          });
        }
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("changeConfiguration", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let restaurantId = incomingDataParsed?.restaurantId;
        let name = incomingDataParsed?.name;
        let value = incomingDataParsed?.value;
        let config = await configuration.findOne({
          where: {
            restaurantId: restaurantId,
          },
          include: {
            model: restaurant,
            attributes: ["id"],
            include: {
              model: user,
              attributes: ["id"],
            },
          },
        });
        if (config) {
          config[name] = value;
          // Save the updated config
          config
            .save()
            .then(async (dat) => {
              const configData = await configuration.findOne({
                where: {
                  restaurantId: restaurantId,
                },
              });
              let restData = {
                type: "changeConfiguration",
                data: {
                  status: "1",
                  message: "Configuration Updated successfully",
                  error: "",
                  data: {
                    config: configData,
                  },
                },
              };
              sendEvent(config?.restaurant?.user?.id, restData);
            })
            .catch((error) => {
              let restData = {
                type: "changeConfiguration",
                data: {
                  status: "0",
                  message: error.message,
                  error: "",
                  data: {},
                },
              };
              sendEvent(config?.restaurant?.user?.id, restData);
            });
        } else {
          console.log("Not found");
        }
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("changeConfiguration", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let restaurantId = incomingDataParsed?.restaurantId;
        let name = incomingDataParsed?.name;
        let value = incomingDataParsed?.value;
        let config = await configuration.findOne({
          where: {
            restaurantId: restaurantId,
          },
          include: {
            model: restaurant,
            attributes: ["id"],
            include: {
              model: user,
              attributes: ["id"],
            },
          },
        });
        if (config) {
          config[name] = value;
          // Save the updated config
          config
            .save()
            .then(async (dat) => {
              const configData = await configuration.findOne({
                where: {
                  restaurantId: restaurantId,
                },
              });
              let restData = {
                type: "changeConfiguration",
                data: {
                  status: "1",
                  message: "Configuration Updated successfully",
                  error: "",
                  data: configData,
                },
              };
              sendEvent(config?.restaurant?.user?.id, restData);
            })
            .catch((error) => {
              let restData = {
                type: "changeConfiguration",
                data: {
                  status: "0",
                  message: error.message,
                  error: "",
                  data: {},
                },
              };
              sendEvent(config?.restaurant?.user?.id, restData);
            });
        } else {
          console.log("Not found");
        }
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("orderSeen", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let orderId = incomingDataParsed?.orderId;
        let orderData = await order.findOne({
          where: {
            id: orderId,
          },
          include: [
            {
              model: user,
              attributes: ["id"],
            },
          ],
        });
        let status = await orderStatus.findOne({
          where: {
            name: "Seen",
          },
        });
        let time = Date.now();
        await orderHistory.create({
          time,
          orderId: orderId,
          orderStatusId: status.id,
        });
        let eventData = {
          type: "orderSeen",
          data: {
            status: "1",
            message: "Order Seen by Restaurant",
            error: "",
            data: orderData,
          },
        };
        sendEvent(orderData?.user?.id, eventData);
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("delivered", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let orderId = incomingDataParsed?.orderId;
        let orderData = await order.findOne({
          where: {
            id: orderId,
          },
          include: [
            {
              model: restaurant,
              attributes: ["id"],
              include: {
                model: user,
                attributes: ["id"],
              },
            },
            {
              model: user,
              attributes: ["id"],
            },
          ],
        });
        let status = await orderStatus.findOne({
          where: {
            name: "Delivered",
          },
        });
        if (orderData.orderStatusId == status.id) {
          let eventData = {
            type: "delivered",
            data: {
              status: "1",
              message: "Order already delivered!",
              error: "",
              data: orderData,
            },
          };
          sendEvent(orderData?.restaurant?.user?.id, eventData);
        }
        let time = Date.now();
        await orderHistory.create({
          time,
          orderId: orderId,
          orderStatusId: status.id,
        });
        orderData.orderStatusId = status.id;
        orderData
          .save()
          .then(async (dat) => {
            let restHomeData = await restaurantHomeData(
              orderData?.restaurantId
            );
            let eventData = {
              type: "restaurantDelivered",
              data: {
                status: "1",
                message: "Order delivered",
                error: "",
                data: restHomeData,
              },
            };
            let eventDataForUser = {
              type: "restaurantDelivered",
              data: {
                status: "1",
                message: "Order delivered",
                error: "",
                data: {
                  orderId: orderId,
                },
              },
            };
            sendEvent(orderData?.user?.id, eventDataForUser);
            sendEvent(orderData?.restaurant?.user?.id, eventData);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("scheduleOrder_to_Outgoing", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let orderId = incomingDataParsed?.orderId;
        const orderData = await order.findOne({
          where: {
            id: orderId,
          },
          include: {
            model: restaurant,
            attributes: ["id", "approxDeliveryTime"],
            include: {
              model: user,
              attributes: ["id", "ip"],
            },
          },
        });
        if (orderData) {
          const mode = await orderMode.findOne({
            where: {
              name: "Scheduled",
            },
          });
          const status = await orderStatus.findOne({
            where: {
              name: "Preparing",
            },
          });
          orderData.orderStatusId = status.id;
          await orderData.save();
          let time = Date.now();
          await orderHistory.create({
            time,
            orderId: orderData.id,
            orderStatusId: status.id,
          });
          try {
            const dat = await restaurantHomeData(orderData.restaurantId);
            let eventDataForRetailer = {
              type: "rejectBookTableRequest",
              data: {
                status: "1",
                message: "Data",
                error: "",
                data: dat,
              },
            };
            let eventDataForUser = {
              type: "scheduleOrder_to_Outgoing",
              data: {
                status: "1",
                message: "Data",
                error: "",
                data: {
                  orderId: orderData.id,
                  eta_text:
                    orderData?.customTime / 60 +
                    parseInt(orderData?.restaurant?.approxDeliveryTime),
                },
              },
            };
            sendEvent(orderData?.restaurant?.user?.id, eventDataForRetailer);
            sendEvent(orderData?.userId, eventDataForUser);
          } catch (error) {
            console.log("Error in restaurantHomeData:", error);
          }
        } else {
          console.log("Order data not found");
        }
      } catch (error) {
        console.log("Error:", error);
      }
    });
    socket.on("addPreparingTimeForOrder", async (incomingData) => {
      try {
        let incomingDataParsed = JSON.parse(incomingData); // Renamed to avoid conflict
        let orderId = incomingDataParsed?.orderId;
        let time = incomingDataParsed?.time;
        let orderData = await order.findOne({ where: { id: orderId } });
        let eventDataForUser = {
          type: "addPreparingTimeForOrder",
          data: {
            status: "1",
            message: "Order Time",
            error: "",
            data: {
              time: time,
              orderId: orderId,
            },
          },
        };
        sendEvent(orderData?.user?.id, eventDataForUser);
      } catch (error) {
        console.log("Error:", error);
      }
    });
    socket.on("disconnect", () => {
      console.log(
        `Client ${socket.id} ################################### disconnected`
      );
    });
  });
  return io;
};

const sendEvent = async (userId, eventData) => {
  try {
    console.log(`Event data being sent:`, eventData);
    console.log(`Event data being sent to:`, userId.toString());
    // Ensure that the data is an object and not a string or array
    const dataToSend = JSON.stringify(eventData.data); // Assuming this is already an object
    ioInstance
      .to(userId.toString())
      .emit(eventData.type, dataToSend, async (ack) => {
        console.log(`$$$$$$$$$$$$$$ acklowdge : ${ack}`);
        if (ack) {
          console.log(`${eventData.type} acknowledged by ${userId}`);
        } else {
          console.log(`${eventData.type} not acknowledged by ${userId}`);
          await unAcknowledgedEvents.create({
            to: userId,
            type: eventData.type,
            data: JSON.stringify(dataToSend), // Store as string in DB
          });
          // console.log(`Event ${eventData.type} stored for user ${userId}`);
        }
      });
  } catch (error) {
    console.log(`Error while sending event: ${error}`);
  }
};
module.exports = {
  initializeWebSocket,
  sendEvent,
};
