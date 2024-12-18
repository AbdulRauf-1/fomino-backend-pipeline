const mysql = require('mysql2');
require("dotenv").config()
const dbConfig = {
    host: 'localhost',
    user: 'fomino_db',
    password: "GnewP@ss4131",
    database: "fomino_db",
  };
  const pool = mysql.createPool(dbConfig);


  // List of tables to empty
const tablesToEmpty = [
    'addOnCategories',
    'addOns',
    'addresses',
    'areaCharges',
    'Credits',
    'cuisines',
    'cutleries',
    'deliveryFees',
    'directors',
    'driverDetails',
    'driverRatings',
    'driverZones',
    'emailVerifications',
    'forgetPasswords',
    'menuCategories',
    'orderAddOns',
    'orderCharges',
    'orderCulteries',
    'orderGroups',
    'orderGroup_Items',
    'orderHistories',
    'orderItems',
    'restaurantEarnings',
    'driverEarnings',
    'orders',
    'orderItems',
    'payouts',
    'products',
    'pushNotifications',
    'P_AOLinks',
    'P_A_ACLinks',
    'restaurantDrivers',
    'restaurantRatings',
    'restaurants',
    'restaurant_culteries',
    // 'rolePermissions',
    // 'roles',
    'R_CLinks',
    'R_MCLinks',
    'R_PLinks',
    'tableBookings',
    'times',
    'users',
    'vehicleDetails',
    'vehicleImages',
    'vouchers',
    'wallets',
    'zoneRestaurants',
    'productCollections',
    'collections',
    'collectionAddons',
    'productCollections'
];


tablesToEmpty.forEach((table) => {
    const sql = `DELETE FROM ${table}`;
    
  
    pool.query(sql, (err, result) => {
      if (err) {
        console.error(`Error emptying ${table} table:`, err);
       
      } else {
        console.log(`${table} table emptied successfully.`);
        
      }
    });
  });