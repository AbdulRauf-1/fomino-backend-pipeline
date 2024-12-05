const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express();
const adyenController = require('../controllers/adyenPaymentController');
const asyncMiddleware = require('../middlewares/async');

router.post('/card',  asyncMiddleware(adyenController.adyenPaymentbyCard));
router.post('/paymentByDropIn',  asyncMiddleware(adyenController.paymentByDropIn));
router.get('/getPaymentMethods',  asyncMiddleware(adyenController.getPaymentMethods));
router.post('/paymentWithStoredCard',  asyncMiddleware(adyenController.paymentWithStoredCard));

module.exports = router;