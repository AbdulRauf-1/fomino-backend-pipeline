require("./instrument.js");
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const db = require("./models");
const error = require("./middlewares/error");
const {  user,order,wallet } = require("./models");
const { initializeWebSocket } = require("./socket_io");
// const { initializeWebSocket } = require("./socket");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const driverRouter = require("./routes/driver");
const restaurantRouter = require("./routes/restaurant");
const frontSite = require("./routes/frontsite");
const retailerRoute = require("./routes/retailer");
const adyenRoute = require("./routes/adyen");
const retailerController = require("./controllers/retailer");
const rateLimit = require('express-rate-limit');
const app = express();
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');




const server = http.createServer(app);

const setCorsHeaders = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS"); // Allow specific HTTP methods
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // Allow specific headers
  next();
};

// Define the rate limiting rule
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the middleware function to set CORS headers for all routes
app.use(setCorsHeaders);
// Apply the rate limiter to all requests
// app.use(limiter);
app.use('/Public', express.static(path.join(__dirname, 'Public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.use("/users", userRouter);
app.use("/admin", adminRouter);
app.use("/driver", driverRouter);
app.use("/restaurant", restaurantRouter);
app.use("/frontsite", frontSite);
app.use("/retailer", retailerRoute);
app.use("/adyen", adyenRoute);


initializeWebSocket(server);

app.get('/order/:orderId/:paymentProvider', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'adyen.html'));
});
app.get('/adyen/:orderId/:paymentProvider', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'web.html'));
});
app.get('/status/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'success.html'));
});
app.get('/status/failed', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'failed.html'));
});


app.use(error);

app.post('/webhooks/adyen', async (req, res) => {
    const notification = req.body;
    
    try {
        console.log("Received webhook notification:", notification);

        // Handle the notification type
        if (notification.notificationItems) {
            notification.notificationItems.forEach(async(item) => {
                const eventCode = item.NotificationRequestItem.eventCode;
                const pspReference = item.NotificationRequestItem.pspReference;
                const merchantReference = item.NotificationRequestItem.merchantReference;

                console.log(`Received event ${eventCode} for payment ${pspReference} with merchant reference ${merchantReference}`);

                // Process the event accordingly
                 if (eventCode === 'AUTHORISATION') {
                    // Assuming merchantReference is the orderId
                    const orderId = merchantReference;
                    let orderData = await order.findOne({where:{id:orderId}});
                    if(orderData){
                        let checkWallet = await wallet.findOne({where:{orderId : orderId}});
                        if(checkWallet){
                            checkWallet.paymentType = "Card";
                            checkWallet.amount = parseFloat(orderData.total);
                            checkWallet.at = Date.now();
                            checkWallet.transactionId = pspReference;
                            await checkWallet.save();
                        }
                        else{
                            let newWallet = new wallet();
                            newWallet.orderId = orderId;
                            newWallet.restaurantId = orderData.restaurantId;
                            newWallet.paymentType = "Card";
                            newWallet.amount = parseFloat(orderData.total);
                            newWallet.at = Date.now();
                            newWallet.transactionId = pspReference;
                            newWallet.userId = orderData.userId;
                            newWallet.currencyUnitId  = orderData.currencyUnitId ;
                            await newWallet.save();
                        }
                    }

                    // Payment was authorized, store the pspReference or update order status
                    console.log(`Payment authorized for orderId: ${orderId}`);

                    // Update your database here with orderId and pspReference
                }
                // Handle other event codes like CAPTURE, REFUND, etc.
            });
        }

        // Respond to Adyen to acknowledge receipt of the notification
        res.status(200).send('[accepted]');
    } catch (error) {
        console.error('Error handling webhook notification:', error);
        res.status(500).send('[error]');
    }
});
// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

        
          
// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

db.sequelize.sync().then(() => {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Starting the server at port ${PORT} ...`);
  });
});




