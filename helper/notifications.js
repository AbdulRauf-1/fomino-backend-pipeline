require('dotenv').config();
let FCM = require('fcm-node');
let fcm = new FCM(process.env.FIREBASE_SERVER_KEY);
const translate = require('translate-google');
// module.exports = async function sendNotification(to, notification, data) {
//     let message = {
//         registration_ids: to, 
//         notification,
//         data
//     };   
//     fcm.send(message,function (err, response) {
//         if (err) {
//             console.log(`${err}`)
//             //res.json(err);
//         } else {
//             console.log("Successfully sent with response: ", response);
//             //res.json(response);
//         }
//     });
// }


module.exports = async function sendNotification(to, notification, dataOrLanguage, language = "en") {
  let data = {};

  // Determine if the third parameter is data or language
  if (typeof dataOrLanguage === 'string') {
    // If it's a string, treat it as `language`
    language = dataOrLanguage;
  } else {
    // If it's an object, treat it as `data`
    data = dataOrLanguage;
  }

  try {
    // Check if `to` is a valid non-empty array
    if (!Array.isArray(to) || to.length === 0) {
      console.error('Error: Device tokens array is empty or not valid.');
      return;
    }

    let translatedTitle = notification.title;
    let translatedBody = notification.body;

    // Attempt to translate, with error handling
    try {
      console.log("Before translation:", notification.title, notification.body);
      console.log("Target language:", language);

      // Translate the title
      const translatedTitleResult = await translate(notification.title, { to: language });
      if (typeof translatedTitleResult === 'string') {
        translatedTitle = translatedTitleResult;
      }

      // Translate the body
      const translatedBodyResult = await translate(notification.body, { to: language });
      if (typeof translatedBodyResult === 'string') {
        translatedBody = translatedBodyResult;
      }

      console.log("Translated Title:", translatedTitle);
      console.log("Translated Body:", translatedBody);

    } catch (translateError) {
      console.error('Error translating message:', translateError);
      // Fallback to the original language if translation fails
    }

    // Construct the message payload
    const message = {
      registration_ids: to, // Use `registration_ids` for sending to multiple devices
      notification: {
        title: translatedTitle,
        body: translatedBody,
      },
      data: {
        ...notification.data, // Include any additional data from the notification object
        ...data // Merge additional data passed as a separate parameter
      }
    };

    // Send the notification using FCM
    fcm.send(message, (err, response) => {
      if (err) {
        console.log(`Error sending notification: ${err}`);
      } else {
        console.log("Successfully sent with response:", response);
      }
    });

  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

