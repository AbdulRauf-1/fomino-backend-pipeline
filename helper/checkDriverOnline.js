require("dotenv").config();
const axios = require("axios");

module.exports = async function (driverId) {
  try {
    const fireBase = await axios.get(process.env.FIREBASE_URL);
    // Check if data exists for the given driverId
    if (fireBase?.data && fireBase.data[driverId]) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    // Log the error and return false
    console.error("Error fetching data from Firebase:", error.message);
    return false;
  }
};
