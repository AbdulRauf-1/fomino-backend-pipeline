// driverHoursHelper.js

const { sequelize, driverRestaurantHours,driverHourlyEarnings } = require('../models');
const { Op } = require("sequelize");

// Function to log the pickup time
async function logPickup(userId, restaurantId, orderId, startTime) {
    try {
        await driverRestaurantHours.create({
            userId: userId,
            restaurantId: restaurantId,
            orderId: orderId,
            startTime: startTime,
            status: false // Initial status indicating order is in progress
        });
        console.log(`Pickup logged for Order ID: ${orderId}`);
    } catch (error) {
        console.error("Error logging pickup:", error);
        throw error;
    }
}
async function addDeliveryTimeToEarnings(driverId, deliveryTime) {
    try {
        // Find or create the record for the driver
        const [record, created] = await driverHourlyEarnings.findOrCreate({
            where: { userId: driverId },
            defaults: { time: 0 },
        });

        // Update the time by adding deliveryTime to existing time
        record.time += deliveryTime;
        record.status = true;
        await record.save();
    } catch (error) {
        console.error('Error updating driver hourly earnings:', error);
        throw error;
    }
}
// Function to log the delivery time
async function logDelivery(orderId, endTime) {
    try {
        // Find the record to get startTime and userId (driverId)
        const deliveryRecord = await driverRestaurantHours.findOne({
            where: { orderId: orderId, status: false },
        });

        if (!deliveryRecord) {
            console.log(`No ongoing delivery found for Order ID: ${orderId}`);
            return;
        }

        const { startTime, userId } = deliveryRecord;

        // Update endTime and set status to true
        await driverRestaurantHours.update(
            { endTime: endTime, status: true },
            { where: { orderId: orderId, status: false } }
        );

        // Calculate the delivery duration in hours
        const durationInMinutes = Math.abs(new Date(endTime) - new Date(startTime)) / (1000 * 60);
        const durationInHours = durationInMinutes / 60;

        // Add the duration to the driverHourlyEarning time
        await addDeliveryTimeToEarnings(userId, durationInHours);

        console.log(`Delivery logged and time added for Order ID: ${orderId}`);
    } catch (error) {
        console.error("Error logging delivery:", error);
        throw error;
    }
}


// Function to calculate total hours for a driver per restaurant
async function calculateTotalHours(userId, restaurantId, key) {
  try {
    const today = new Date();
    let startDate, endDate;

    // Determine the date range based on the key
    if (key === "Today") {
      startDate = new Date(today.setHours(0, 0, 0, 0)); // Start of today
      endDate = new Date(today.setHours(23, 59, 59, 999)); // End of today
    } else if (key === "Weekly") {
      startDate = new Date(today.setDate(today.getDate() - today.getDay())); // Start of the week
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today); // End of the week
    } else if (key === "Monthly") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the month
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End of the month
      endDate.setHours(23, 59, 59, 999);
    } else if (key === "Overall") {
      // No date range for "Overall"
      startDate = null;
      endDate = null;
    }

    // Build the query conditions
    let hoursCondition = {
      userId: userId,
      restaurantId: restaurantId,
      status: true, // Only completed deliveries
    };

    // Apply date range if startDate and endDate are defined
    if (startDate && endDate) {
      hoursCondition.startTime = { [Op.between]: [startDate, endDate] };
    }

    // Fetch total hours based on date range and completed status
    const result = await driverRestaurantHours.findAll({
      where: hoursCondition,
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('TIMESTAMPDIFF(MINUTE, startTime, endTime) / 60')), 'total_hours'],
      ],
      raw: true,
    });

    const totalHours = result[0].total_hours || 0;

    return parseFloat(Number(totalHours).toFixed(2)); // Return hours up to 2 decimal points
  } catch (error) {
    console.error("Error calculating total hours:", error);
    throw error;
  }
}




module.exports = {
    logPickup,
    logDelivery,
    calculateTotalHours
};
