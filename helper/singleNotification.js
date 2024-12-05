const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccount.json')
const translate = require('translate-google');


// Initialize Firebase Admin SDK using the service account JSON file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

// // // Function to send notification using Firebase Admin SDK
module.exports = async function sendNotification(to, title,body, data) {
  // Ensure `data` is an object and has string values
  const validData = data && typeof data === 'object' ? data : {}
  for (const key in validData) {
    if (typeof validData[key] !== 'string') {
      validData[key] = String(validData[key]) // Convert non-string values to strings
    }
  }
 let notification = {
     title:title,
     body:body,
 }
  const message = {
    tokens: to, // Use tokens for multiple devices
        notification: notification,
    data: validData, // Ensure data is a valid object
  }
  
  try {
    const response = await admin.messaging().sendEachForMulticast(message)
    
    console.log('Successfully sent message:', response)
  } catch (error) {
    console.error('Error sending message:', error)
  }
}
// module.exports = async function sendNotification(to, title, body, data = {}, language = "en") {
//   // If `data` is not provided or is not an object, set it to the `language` variable
//   const validData = (typeof data === 'object' && Object.keys(data).length > 0) ? data : { language };

//   // Ensure all values in `validData` are strings
//   for (const key in validData) {
//     if (typeof validData[key] !== 'string') {
//       validData[key] = String(validData[key]); // Convert non-string values to strings
//     }
//   }

//   // Check if `to` is a valid non-empty array
//   if (!Array.isArray(to) || to.length === 0) {
//     console.error('Error: Device tokens array is empty or not valid.');
//     return;
//   }

//   // Translate the title and body
//   try {
//     const [translatedTitle, translatedBody] = await Promise.all([
//       translate(title, { to: language }).catch((err) => {
//         console.error('Translation error for title:', err);
//         return title; // Fallback to original title if translation fails
//       }),
//       translate(body, { to: language }).catch((err) => {
//         console.error('Translation error for body:', err);
//         return body; // Fallback to original body if translation fails
//       }),
//     ]);

//     const notification = {
//       title: translatedTitle,
//       body: translatedBody,
//     };

//     const message = {
//       tokens: to, // Use tokens for multiple devices
//       notification: notification,
//       data: validData, // Ensure data is a valid object
//     };

//     const response = await admin.messaging().sendEachForMulticast(message);
//     console.log('Successfully sent message:', response);
//   } catch (error) {
//     console.error('Error sending or translating message:', error);
//   }
// };
