require("dotenv").config();
//importing Models
const {
  appPage,
  rolePermissions,
  appLink,
  socialLink,
  charge,
  setting,
  zoneDetails,
  country,
  driverZone,
  city,
  Credit,
  director,
  orderCultery,
  driverCommission,
  productCollections,
  collection,
  
  cusineRestaurant,
  collectionAddons,
  zoneRestaurants,
  zone,
  orderType,
zoneDeliveryFeeType,
  user,
  cutlery,
  userType,
  driverEarning,
  role,
  restaurant_cultery,
  addressType,
  menuCategory,
  cuisine,
  paymentMethod,
  deliveryType,
  deliveryFeeType,
  unit,
  restaurant,
  deliveryFee,
  addOnCategory,
  addOn,
  product,
  R_PLink,
  P_AOLink,
  defaultValues,
  R_CLink,
  voucher,
  R_MCLink,
  vehicleType,
  wallet,
  order,
  orderStatus,
  driverDetails,
  serviceType,
  vehicleDetails,
  vehicleImages,
  driverRating,
  permissions,
  P_A_ACLink,
  orderApplication,
  orderMode,
  address,
  orderCharge,
  orderHistory,
  orderItems,
  orderAddOns,
  pushNotification,
  payout,
  restaurantRating,
  tableBooking,
  restaurantEarning,
    time,
    configuration,
    productAddons,
    driverPayout,
    restaurantPayout,
    banner,
    
    stampCard,
    stampCardRestaurants
} = require("../models");
// Importing Custom exception
const CustomException = require("../middlewares/errorObject");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const redis_Client = require("../routes/redis_connect");
const { sign } = require("jsonwebtoken");
const sendNotification = require("../helper/notifications");
const sequelize = require("sequelize");
const admin = require("firebase-admin");
const SequelizeDB = require('../SequelizeDB');
const fs = require('fs');
const API_KEY = "AIzaSyCMpAm-zhl2E4HupCiS3HEvkxi67gKZAG8";
// Initialize Firebase Admin SDK once
const axios = require("axios");
const moment = require('moment');
const ApiResponse = require("../helper/ApiResponse");
const GeoPoint = require('geopoint');
const { QueryTypes } = require('sequelize');
const { fn, col } = require('sequelize');
async function testing_link(req, res) {
  const link = "https://tedeep.page.link/shareText";
  const domainUriPrefix = `https://tedeep.page.link`;

  const dynamicLinkParams = {
    dynamicLinkInfo: {
      domainUriPrefix: domainUriPrefix,
      link: link,
      androidInfo: {
        androidPackageName: "com.example.deeplinking",
      },
      iosInfo: {
        iosBundleId: "com.example.ios",
      },
    },
    suffix: {
      option: "SHORT",
    },
  };

  try {
    const response = await axios.post(
      `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${API_KEY}`,
      dynamicLinkParams
    );
    console.log("Generated short link:", response.data);
    res.json({ shortLink: response.data });
  } catch (error) {
    console.error(
      "Error generating short link:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: error });
  }
}

async function getSpecificRestOrders(req,res){
    const { restId } = req.params;
    let orders = await order.findAll({where:{restaurantId :restId}})
    let data = {
        orders
    };
    let response = ApiResponse("1","data","",data);
    return res.json(response)
}
async function getRestOrders(req,res){
    const { restId } = req.params;
    let orders = await order.findAll({where:{restaurantId :restId}})
    let data = {
        orders
    };
    let response = ApiResponse("1","data","",data);
    return res.json(response)
}
async function get_all_culteries(req,res){
    let culteries = await cutlery.findAll({});
    let data = {
        culteries
    };
    let response = ApiResponse("1","data","",data);
    return res.json(response)
}

async function get_all_business_types(req, res) {
  const types = await orderApplication.findAll({});
  return res.json(ApiResponse("1", "All Business Types", "", types));
}

async function all_order_applications(req, res) {
  const data = await orderApplication.findAll({});
  const response = ApiResponse("1", "All Order applications", "", data);
  return res.json(response);
}

//Module 1 - Auth
/*
        1. Add User Type
*/

async function addUserType(req, res) {
  const { name } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
    const dat = await userType.create({ name }, { transaction: t });

    await t.commit(); // Commit the transaction if successful

    const response = ApiResponse("1", "User type added successfully", "", {
      name: dat.name,
    });
    return res.json(response);

  } catch (err) {
    await t.rollback(); 

    const response = ApiResponse(
      "0",
      "Error in adding User Type",
      "Writing to database failed",
      {}
    );
    return res.json(response);
  }
}

/*
        2. Add Role
*/

async function addRole(req, res) {
  const { name } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    const exist = await role.findOne({ where: { name: name }, transaction: t }); 
    if (exist) {
      await t.rollback(); 
      const response = ApiResponse(
        "0",
        "The role with the same name already exists",
        "Please try some other name",
        {}
      );
      return res.json(response);
    }

    
    const dat = await role.create({ name, status: true }, { transaction: t }); 

    await t.commit(); 

    const response = ApiResponse("1", "Role added successfully", "", {
      name: dat.name,
    });
    return res.json(response);

  } catch (err) {
    await t.rollback(); 

    const response = ApiResponse(
      "0",
      "Error in adding Role",
      "Writing to database failed",
      {}
    );
    return res.json(response);
  }
}


/*
        4. Login Admin
*/
async function login(req, res) {
  const { email, password } = req.body;
  const userTypes = await userType.findOne({ where: { name: "Admin" } });

  const existUser = await user.findOne({
    where: { email: email, userTypeId: userTypes.id },
  });

  const perms = await rolePermissions.findAll({
    where: { roleId: existUser.roleId, status: true },
    attributes: [],
    include: { model: permissions, attributes: ["id", "title"] },
  });

  if (!existUser) {
    const response = ApiResponse(
      "0",
      "User not found",
      "No user exists against this email",
      {}
    );
    return res.json(response);
  }
  let isMatch = await bcrypt.compare(password, existUser.password);
  if (!isMatch) {
    const response = ApiResponse("0", "Bad Credentials", "Login Error", {});
    return res.json(response);
  }
  if (!existUser.status) {
    const response = ApiResponse(
      "0",
      "You are not authorized to login. Please contact admin",
      "Access denied",
      {}
    );
    return res.json(response);
  }
  const accessToken = sign(
    { id: existUser.id, email: existUser.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "1d" }
  );
  redis_Client.set(`fom${existUser.id}`, accessToken);
  const data = {
    id: existUser.id,
    name: `${existUser.firstName}${existUser.lastName}`,
    email: existUser.email,
    accessToken: accessToken,
    permissions: perms,
  };
  const response = ApiResponse("1", "Login successfull", "", data);
  return res.json(response);
}
/*
        5. logout Admin
*/
async function logout(req, res) {
  redis_Client
    .del(req.user.id)
    .then((upData) => {
      const response = ApiResponse("1", "Logout successfully", "", {});
      return res.json(response);
    })
    .catch((err) => {
      const response = ApiResponse(
        "0",
        "There is some error logging out. Please try again",
        {}
      );
      return res.json(response);
    });
}
/*
       6. Change password
*/
// async function changePassword(req, res) {
//   const { oldPassword, newPassword } = req.body;
//   const userId = req.user.id;
//   const currUser = await user.findOne({ where: { id: userId } });
//   bcrypt
//     .compare(oldPassword, currUser.password)
//     .then((match) => {
//       if (!match) {
//         const response = ApiResponse(
//           "0",
//           "Please enter correct password",
//           "Your old password is incorrect",
//           {}
//         );
//         return res.json(response);
//       }
//       bcrypt.hash(newPassword, 10).then((hashedPassword) => {
//         user
//           .update({ password: hashedPassword }, { where: { id: userId } })
//           .then((passData) => {
//             const response = ApiResponse(
//               "1",
//               "Password changed successfully",
//               "",
//               {}
//             );
//             return res.json(response);
//           });
//       });
//     })
//     .catch((err) => {
//       const response = ApiResponse("0", "Invalid data", err.message, {});
//       return res.json(response);
//     });
// }
async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const currUser = await user.findOne({ where: { id: userId }, transaction: t }); // Add transaction context

    const match = await bcrypt.compare(oldPassword, currUser.password);
    if (!match) {
      const response = ApiResponse(
        "0",
        "Please enter correct password",
        "Your old password is incorrect",
        {}
      );
      await t.rollback(); // Rollback transaction since the password check failed
      return res.json(response);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update(
      { password: hashedPassword },
      { where: { id: userId }, transaction: t } // Add transaction context
    );

    await t.commit(); // Commit the transaction if successful

    const response = ApiResponse("1", "Password changed successfully", "", {});
    return res.json(response);

  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", "Invalid data", err.message, {});
    return res.json(response);
  }
}
/*
       6. Get Currency Unit
*/
async function getUnits(req, res) {
  const userId = req.user.id;
  wallet
    .findAll({
      where: { userId },
      attributes: [
        [
          sequelize.fn("DISTINCT", sequelize.col("currencyUnitId")),
          "currencyUnitId",
        ],
      ],
    })
    .then((walletData) => {
      let outArr = walletData.map((ele) => {
        return ele.currencyUnitId;
      });
      unit
        .findAll({
          where: { id: { [Op.in]: outArr } },
        })
        .then((unitData) => {
          const response = ApiResponse("1", "Currency Units", "", unitData);
          return res.json(response);
        });
    })
    .catch((err) => {
      const response = ApiResponse("0", "Invalid Data", "", {});
      return res.json(response);
    });
}
/*
       6. Get Currency Unit
*/
async function getWallet(req, res) {
  const userId = req.user.id;
  const unitId = req.body.unitId;
  wallet
    .findAll({
      where: {
        [Op.and]: [{ userId }, { currencyUnitId: unitId }],
      },
    })
    .then((walletData) => {
      const response = ApiResponse("1", "Currency Units", "", walletData);
      return res.json(response);
    })
    .catch((err) => {
      const response = ApiResponse("0", "Invalid Data", err.message, {});
      return res.json(response);
    });
}

//Module 2 : Address
/*
        1. Add Address Label
*/
async function addAddressType(req, res) {
  const { name } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    const dat = await addressType.create({ name, status: true }, { transaction: t }); 

    await t.commit();

    const response = ApiResponse("1", "Address type added successfully", "", {
      name: dat.name,
    });
    return res.json(response);

  } catch (err) {
    await t.rollback(); 

    const response = ApiResponse(
      "0",
      "Error in adding Address Type",
      "Error",
      {}
    );
    return res.json(response);
  }
}
/*
        2. Get All Address labels which are active
*/
async function getAddressType(req, res) {
  const addressLabels = await addressType.findAll();
  const response = ApiResponse("1", "All Address labels", "", addressLabels);
  return res.json(response);
}

/*
        3. Delte Address labels which are active
*/
async function deleteAddressType(req, res) {
  const { addressTypeId } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
    await addressType.update(
      { status: false },
      { where: { id: addressTypeId }, transaction: t } 
    );

    await t.commit(); 

    const response = ApiResponse("1", "Address label deleted", "", {});
    return res.json(response);

  } catch (err) {
    await t.rollback();

    const response = ApiResponse(
      "0",
      "Error in deleting Address Type",
      "Error",
      {}
    );
    return res.json(response);
  }
}
/*
        4. Edit address Label
*/
async function editAddressType(req, res) {
  const { id, name } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    const exist = await addressType.findOne({
      where: { name: name, [Op.not]: [{ id: id }] },
      transaction: t
    });

    if (exist) {
      const response = ApiResponse(
        "0",
        "Address Type with this name already exists",
        "Please try some other name",
        {}
      );
      await t.rollback(); 
      return res.json(response);
    }

    
    await addressType.update({ name: name }, { where: { id: id }, transaction: t });

    await t.commit(); 

    const response = ApiResponse("1", "Address Type updated successfully", "", {});
    return res.json(response);

  } catch (err) {
    await t.rollback(); 

    const response = ApiResponse(
      "0",
      "Error in updating Address Type",
      "Error",
      {}
    );
    return res.json(response);
  }
}

// MODULE 3: Restuarant
/*
        1. Add Menu Category
*/
async function addMenuCategory(req, res) {
  const { name } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
    const businessTypeId = await orderApplication.findOne({
      where: { name: "restaurant" },
      transaction: t 
    });

    const menuCategoryExist = await menuCategory.findOne({
      where: { name: name },
      transaction: t 
    });

    if (menuCategoryExist) {
      const response = ApiResponse(
        "0",
        "Category with this name already exists",
        "Please try some other name",
        {}
      );
      await t.rollback(); 
      return res.json(response);
    }

    
    await menuCategory.create(
      { name, businessType: businessTypeId.name, status: true },
      { transaction: t } 
    );

    await t.commit(); 

    const response = ApiResponse("1", "Menu Category added successfully", "", {});
    return res.json(response);

  } catch (err) {
    await t.rollback();

    const response = ApiResponse(
      "0",
      "Error in adding menu category",
      "Error",
      {}
    );
    return res.json(response);
  }
}



async function addMenuCategoryStore(req, res) {
  const { name, businessType } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    const businessTypeId = await orderApplication.findOne({
      where: { name: "store" },
      transaction: t 
    });

   
    const menuCategoryExist = await menuCategory.findOne({
      where: { name: name },
      transaction: t 
    });

    if (menuCategoryExist) {
      const response = ApiResponse(
        "0",
        "Category with this name already exists",
        "Please try some other name",
        {}
      );
      await t.rollback();
      return res.json(response);
    }

   
    const dat = await menuCategory.create(
      { name, businessType: businessTypeId.id, status: true },
      { transaction: t } 
    );

    await t.commit(); 

    const response = ApiResponse("1", "Menu Category added successfully", "", {
      name: dat.name
    });
    return res.json(response);

  } catch (err) {
    await t.rollback();

    const response = ApiResponse(
      "0",
      "Error in adding menu category",
      "Error",
      {}
    );
    return res.json(response);
  }
}


async function get_module_types(req, res) {
  const types = await orderApplication.findAll({
    where: { name: { [Op.notLike]: "%taxi%" } },
  });
  const response = ApiResponse("1", "Modules types", "", types);
  return res.json(response);
}
/*
        2. Get All Menu Category
*/
async function allMenuCategories(req, res) {
  // Fetch the type for the business
  const type = await orderApplication.findOne({
    where: { name: "restaurant" },
  });

  // Fetch all menu categories with their related R_MCLinks and restaurant details
  const menuCategories = await menuCategory.findAll({
    where: { businessType: "restaurant" },
    order: [["id", "desc"]],
    include: [
      {
        model: R_MCLink,
        as: 'R_MCLinks',
        attributes: ["id"],
        include: [
          {
            model: restaurant,
            attributes: ["id", "businessName"],
          },
        ],
      },
    ],
  });

  let data = [];

  for (let i = 0; i < menuCategories.length; i++) {
    const category = menuCategories[i];
    const rmclink = category.R_MCLinks?.[0]; 
    const restaurantDetails = rmclink?.restaurant; 

    let obj = {
      id: category.id,
      name: category?.name,
      image: category?.image,
      status: category?.status,
      RMCLink: rmclink ? rmclink.id : null, 
      RestaurantId: restaurantDetails ? restaurantDetails.id : null, 
      RestaurantName: restaurantDetails ? restaurantDetails.businessName : null, 
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    data.push(obj);
  }

  const response = ApiResponse("1", "All Menu Categories", "", data);
  return res.json(response);
}

async function allMenuCategoriesStore(req, res) {
  const type = await orderApplication.findOne({
    where: { name: "store" },
  });
  const menuCategories = await menuCategory.findAll({
    where: { businessType: type.id },
    order: [["id", "desc"]],
  });
  let data = [];
  for (var i = 0; i < menuCategories.length; i++) {
    const type = await orderApplication.findOne({
      where: { id: menuCategories[i].businessType },
    });
    let obj = {
      id: menuCategories[i].id,
      name: menuCategories[i].name,
      businessType: type.name,
      status: menuCategories[i].status,
      createdAt: menuCategories[i].createdAt,
      updatedAt: menuCategories[i].updatedAt,
    };
    data.push(obj);
  }
  const response = ApiResponse("1", "All Menu Categories", "", data);
  return res.json(response);
}
/*
        2.1. Get active Menu Category
*/
async function activeMenuCategories(req, res) {
  const menuCategories = await menuCategory.findAll({
    where: { status: true },
  });
  let outArr = [];
  menuCategories.map((ele) => {
    let tmpObj = {
      id: ele.id,
      name: ele.name,
    };
    outArr.push(tmpObj);
  });
  const response = ApiResponse("1", "Active Menu Categories", "", outArr);
  return res.json(response);
}
/*
        3. Edit Menu Category
*/

async function editMenuCategories(req, res) {
  const { id, name, businessType } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
    const exist = await menuCategory.findOne({ where: { id: id }, transaction: t }); 

    if (exist) {
      if (exist.name === name && exist.businessType === businessType) {
        const response = ApiResponse(
          "0",
          "Menu Category with this name exists",
          "Please try some other name",
          {}
        );
        await t.rollback(); 
        return res.json(response);
      }

      
      exist.name = name;
      exist.businessType = businessType;
      await exist.save({ transaction: t }); 

      await t.commit(); 

      const response = ApiResponse(
        "1",
        "Menu Category updated successfully",
        "",
        {}
      );
      return res.json(response);

    } else {
      await t.rollback(); 
      const response = ApiResponse("0", "Menu Category not found", "Invalid ID", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); 

    const response = ApiResponse("0", "Something went wrong", "", {});
    return res.json(response);
  }
}

/*
        4. Change Status of Menu Category
*/
async function changeStatusMenuCategories(req, res) {
  const { status, id } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
    
    await menuCategory.update(
      { status: status },
      { where: { id: id }, transaction: t } 
    );

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Status updated successfully",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); 

    return res.json({
      status: "0",
      message: "Error in updating status",
      data: {},
      error: err.message,
    });
  }
}
/*
        5. Add cuisine
*/
// async function addCuisine(req, res) {
//   const { name, businessType } = req.body;
//   const businessTypeId = await orderApplication.findOne({
//     where: { name: "restaurant" },
//   });
//   // check if already exists
//   const cuisineExist = await cuisine.findOne({ where: { name: name } });
//   if (cuisineExist) {
//     const response = ApiResponse(
//       "0",
//       "Cuisine with this name exist",
//       "Please try some other name",
//       {}
//     );
//     return res.json(response);
//   }
//   //in path changing \\ to /
//   let tmpPath = req.file.path;
//   let path = tmpPath.replace(/\\/g, "/");
//   //return res.json(path)

//   newc = new cuisine();
//   newc.name = name;
//   newc.businessType = businessTypeId.id;
//   newc.status = true;
//   newc.image = path;
//   newc
//     .save()
//     .then((dat) => {
//       const response = ApiResponse("1", "Cuisine added successfully", "", {});
//       return res.json(response);
//     })
//     .catch((err) => {
//       const response = ApiResponse("0", "Error in adding Cuisine", "Error", {});
//       return res.json(response);
//     });
//   // cuisine.create({name,businessType:"2" ,status: true, image: path})
//   // .then(dat =>{
//   //     return res.json({
//   //         status: '1',
//   //         message: 'Cuisine added successfully',
//   //         data:{
//   //             name: dat.name,
//   //         },
//   //         error: '',
//   //     });
//   // })
//   // .catch(err=>{
//   //     return res.json({
//   //         status: '0',
//   //         message: 'Error in adding Cuisine',
//   //         data:[],
//   //         error: 'Writing to database failed',
//   //     });
//   // });
// }

async function addCuisineStore(req, res) {
  const { name, businessType } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
  
    const businessTypeId = await orderApplication.findOne({
      where: { name: "store" },
      transaction: t 
    });

    const cuisineExist = await cuisine.findOne({ where: { name: name }, transaction: t }); 

    if (cuisineExist) {
      const response = ApiResponse(
        "0",
        "Cuisine with this name exists",
        "Please try some other name",
        {}
      );
      await t.rollback(); 
      return res.json(response);
    }

  
    let tmpPath = req.file.path;
    let path = tmpPath.replace(/\\/g, "/");

    
    const newc = new cuisine();
    newc.name = name;
    newc.businessType = businessTypeId.id;
    newc.status = true;
    newc.image = path;

   
    await newc.save({ transaction: t });

    await t.commit();

    const response = ApiResponse("1", "Cuisine added successfully!", "", {
      name: newc.name,
    });
    return res.json(response);

  } catch (err) {
    await t.rollback(); 

    const response = ApiResponse("0", "Error in adding Cuisine", "Error", {});
    return res.json(response);
  }
}

/*
        6. Get All cuisines
*/
async function getRestaurantCuisines(req, res) {
  const type = await orderApplication.findOne({
    where: { name: "restaurant" },
  });
  const cuisineList = await R_CLink.findAll({
    where: [ { restaurantId: req.params.restaurantId }],
    include:{model:cuisine}
  });
  if (!cuisineList) {
    const response = ApiResponse(
      "0",
      "No data available",
      "Please add cusines to show here",
      {}
    );
    return res.json(response);
  }
 

  const response = ApiResponse("1", "List of Cuisine", "", cuisineList);
  return res.json(response);
}
async function getAllCuisines(req, res) {
  const type = await orderApplication.findOne({
    where: { name: "restaurant" },
  });
  const cuisineList = await cuisine.findAll({
    where: [ { businessType: type.id }],
  });
  if (!cuisineList) {
    const response = ApiResponse(
      "0",
      "No data available",
      "Please add cusines to show here",
      {}
    );
    return res.json(response);
  }
  let outArr = [];
  cuisineList.map((ele, id) => {
    let tmpObj = {
      id: ele.id,
      name: ele.name,
      path: ele.image,
      status: ele.status,
    };
    outArr.push(tmpObj);
  });
  const response = ApiResponse("1", "List of Cuisine", "", outArr);
  return res.json(response);
}
async function getAllCuisinesStore(req, res) {
  const type = await orderApplication.findOne({
    where: { name: "store" },
  });
  const cuisineList = await cuisine.findAll({
    where: [ { businessType: type.id }],
  });
  if (!cuisineList) {
    const response = ApiResponse(
      "0",
      "No data available",
      "Please add cuisines to show here",
      {}
    );
    return res.json(response);
  }

  const response = ApiResponse("1", "List of Cuisine", "", cuisineList);
  return res.json(response);
}
async function restAddOns(req, res) {
  try {
    const type = await orderApplication.findOne({
      where: { name: "restaurant" },
    });

    const list = await addOn.findAll({
      where: [{ status: true }, { orderApplicationName: type.id }],
      include: [
        {
          model: restaurant,
          attributes: ["businessName","businessType"],
          include: [
            {
              model: zoneRestaurants,
              attributes:["zoneId"],
              include: [
                {
                  model: zone,
                  attributes: ["id"],
                  include: [
                    {
                      model: zoneDetails,
                      attributes:["currencyUnitId"],
                      include: [
                        {
                          model: unit,
                          as: "currencyUnit",
                          attributes:["symbol"]
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        
        },
        {
          model: collectionAddons,
          attributes: ["collectionId"],
          include: [
            {
              model: collection,
              attributes: ["title"],
            },
          ],
        },
      ],
    });

    if (!list || list.length === 0) {
      const response = ApiResponse(
        "0",
        "No data available",
        "Please add cuisines to show here",
        {}
      );
      return res.json(response);
    }

    const response = ApiResponse("1", "List of Cuisine", "", list);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse(
      "0",
      "Error fetching data",
      error.message,
      {}
    );
    return res.json(response);
  }
}

async function storeAddOns(req, res) {
  const type = await orderApplication.findOne({
    where: { name: "store" },
  });
  const list = await addOn.findAll({
    where: [{ status: true }, { orderApplicationName: type.id }],
  });
  if (!list) {
    const response = ApiResponse(
      "0",
      "No data available",
      "Please add cuisines to show here",
      {}
    );
    return res.json(response);
  }
 
  const response = ApiResponse("1", "List of Cuisine", "", list);
  return res.json(response);
}
/*
        2.1. Get active Menu Category
*/
async function getActiveCuisines(req, res) {
  // return res.json(req.params.restId)
  const restaurant_cusines = await R_CLink.findAll({
    where: [{ restaurantId: req.params.restId }],
    include: [{ model: cuisine }],
  });
  const cuisineList = await cuisine.findAll({
    where: [{ status: true }, { businessType: 1 }],
  });
  let outArr = [];
  cuisineList.map((ele) => {
    let tmpObj = {
      id: ele.id,
      name: ele.name,
    };
    outArr.push(tmpObj);
  });
  const data = {
    data: outArr,
    restaurant_cusines: restaurant_cusines,
  };
  const response = ApiResponse("1", "Active Cuisines", "", data);
  return res.json(response);
}
/*
        7. Edit cuisines
*/
async function editCuisine(req, res) {
  const { id, name } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    const exist = await cuisine.findOne({
      where: { name: name, id: { [Op.ne]: id } },
      transaction: t 
    });

    if (exist) {
      const response = ApiResponse(
        "0",
        "Cuisine with this name already exists",
        "Error",
        {}
      );
      await t.rollback(); 
      return res.json(response);
    }

    let updateData = { name: name };

   
    if (req.file) {
      let tmpPath = req.file.path;
      let path = tmpPath.replace(/\\/g, "/");
      updateData.image = path;
    }

    
    await cuisine.update(updateData, { where: { id: id }, transaction: t }); 

    await t.commit(); 

    const response = ApiResponse(
      "1",
      "Cuisine updated successfully",
      "",
      {}
    );
    return res.json(response);

  } catch (error) {
    await t.rollback();

    const response = ApiResponse("0", "Something went wrong", "Error", {});
    return res.json(response);
  }
}





async function addCuisine(req, res) {
  const t = await SequelizeDB.transaction(); 

  try {
    const { name, restaurantId } = req.body;

   
    let type = await restaurant.findOne({
      where: { id: restaurantId },
      attributes: ['businessType'],
      transaction: t 
    });

   
    let check = await cuisine.findOne({
      where: { name: name, businessType: type.businessType },
      transaction: t 
    });

    if (check) {
      let response = ApiResponse("0", "Already exists with this name", {});
      await t.rollback();
      return res.json(response);
    }

    // Create a new cuisine
    let cus = new cuisine();
    cus.name = name;
    cus.businessType = type.businessType;

    // Handle image path replacement
    let tmpPath = req.file.path;
    let path = tmpPath.replace(/\\/g, "/");
    cus.image = path;

    // Save cuisine with transaction context
    await cus.save({ transaction: t });

    // Create a new cuisine-restaurant mapping
    let cusRest = new cusineRestaurant();
    cusRest.cusineId = cus.id;
    cusRest.restaurantId = restaurantId;
    cusRest.status = true;

    
    await cusRest.save({ transaction: t });

    await t.commit();

    let response = ApiResponse("1", "Added successfully", "", {});
    return res.json(response);

  } catch (error) {
    await t.rollback();

    let response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}



/*
        8. Change status of cuisine
*/

async function changeCuisineStatus(req, res) {
  const { id, status } = req.body;
  const t = await SequelizeDB.transaction();

  try {
    await cuisine.update(
      { status: status },
      { where: { id: id }, transaction: t } 
    );

    await t.commit(); 

    const response = ApiResponse("1", "Status updated successfully", "", {});
    return res.json(response);

  } catch (err) {
    await t.rollback(); 

    const response = ApiResponse("0", "Error in updating status", "Error", {});
    return res.json(response);
  }
}

/*
        9. Add Delivery Type
*/

async function addPaymentMethod(req, res) {
  const { name } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
 
    const methodExist = await paymentMethod.findOne({
      where: { name: name },
      transaction: t // Add transaction context
    });

    if (methodExist) {
      const response = ApiResponse(
        "0",
        "This payment method already exists",
        "Please try some other name",
        {}
      );
      await t.rollback(); 
      return res.json(response);
    }

    
    const dat = await paymentMethod.create(
      { name, status: true },
      { transaction: t } 
    );

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Payment method added successfully",
      data: {
        name: dat.name,
      },
      error: "",
    });

  } catch (err) {
    await t.rollback(); 

    return res.json({
      status: "0",
      message: "Error in adding payment method",
      data: [],
      error: "Writing to database failed",
    });
  }
}


/*
        10. Get All Payment Methods
*/
async function getAllPaymentMethods(req, res) {
  const paymentList = await paymentMethod.findAll();
  return res.json({
    status: "1",
    message: "List of Cuisine",
    data: paymentList,
    error: "",
  });
}
/*
        10.1. Get active payment methods
*/
async function getactivePaymentMethods(req, res) {
  const paymentList = await paymentMethod.findAll({ where: { status: true } });
  let outArr = [];
  paymentList.map((ele) => {
    let tmpObj = {
      id: ele.id,
      name: ele.name,
    };
    outArr.push(tmpObj);
  });
  return res.json({
    status: "1",
    message: "Active Payment methods",
    data: outArr,
    error: "",
  });
}
/*
        11. Edit payment methods
*/


async function editPaymentMethod(req, res) {
  const { id, name } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
  
    const exist = await paymentMethod.findOne({
      where: { name: name, id: { [Op.ne]: id } },
      transaction: t 
    });

    if (exist) {
      await t.rollback(); 
      return res.json({
        status: "0",
        message: "Payment Method with this name already exists",
        data: {},
        error: "",
      });
    }

    await paymentMethod.update(
      { name: name },
      { where: { id: id }, transaction: t } 
    );

    await t.commit();

    return res.json({
      status: "1",
      message: "Payment Method updated successfully",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); 

    return res.json({
      status: "0",
      message: "Error in updating Payment Method",
      data: {},
      error: err.message,
    });
  }
}

/*
        12. Change Status of payment method
*/

async function changePaymentMethodStatus(req, res) {
  const { id, status } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
    
    await paymentMethod.update(
      { status: status },
      { where: { id: id }, transaction: t } 
    );

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Status updated successfully",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); 

    return res.json({
      status: "0",
      message: "Error in updating status",
      data: {},
      error: err.message,
    });
  }
}

/*
        13. Add Delivery Type
*/

async function addDeliveryType(req, res) {
  const { name } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    const typeExist = await deliveryType.findOne({
      where: { name: name },
      transaction: t // Add transaction context
    });

    if (typeExist) {
      await t.rollback(); 
      throw new CustomException(
        "This delivery type already exists",
        "Please try some other name"
      );
    }

    
    const dat = await deliveryType.create(
      { name: name, status: true },
      { transaction: t } 
    );

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Delivery Type added successfully",
      data: {
        name: dat.name,
      },
      error: "",
    });

  } catch (err) {
    await t.rollback(); 

    return res.json({
      status: "0",
      message: "Error in adding Delivery Type",
      data: [],
      error: err.message || "Writing to database failed",
    });
  }
}


/*
        14. Get All Delivery Types
*/
/*
        14.1. Get active Delivery Types
*/
async function activeDeliveryTypes(req, res) {
  const list = await deliveryType.findAll({ where: { status: true } });
  let outArr = [];
  list.map((ele) => {
    let tmpObj = {
      id: ele.id,
      name: ele.name,
    };
    outArr.push(tmpObj);
  });
  return res.json({
    status: "1",
    message: "Active Payment methods",
    data: outArr,
    error: "",
  });
}
/*
        15. Edit delivery type
*/
/*
        16. Change delivery type Status
*/

/*
        17. Add Delivery Fee Type
*/

async function addDeliveryFeeType(req, res) {
  const { name } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    const typeExist = await deliveryFeeType.findOne({
      where: { name: name },
      transaction: t 
    });

    if (typeExist) {
      await t.rollback(); 
      throw new CustomException(
        "This delivery fee type already exists",
        "Please try some other name"
      );
    }

   
    const dat = await deliveryFeeType.create(
      { name, status: true },
      { transaction: t } 
    );

    await t.commit();

    return res.json({
      status: "1",
      message: "Delivery Fee Type added successfully",
      data: {
        name: dat.name,
      },
      error: "",
    });

  } catch (err) {
    await t.rollback();

    return res.json({
      status: "0",
      message: "Error in adding Delivery Fee Type",
      data: [],
      error: err.message || "Writing to database failed",
    });
  }
}

/*
        18. Get All Delivery Fee Type
*/
/*
        18.1. Get active Delivery Fee Type
*/
async function activeDeliveryFeeType(req, res) {
  const list = await deliveryFeeType.findAll({ where: { status: true } });
  let outArr = [];
  list.map((ele) => {
    let tmpObj = {
      id: ele.id,
      name: ele.name,
    };
    outArr.push(tmpObj);
  });
  return res.json({
    status: "1",
    message: "Active Delivery Fee Type",
    data: outArr,
    error: "",
  });
}
/*
        19. Edit Delivery Fee Type
*/
/*
        20. Change Status of Delivery Fee Type
*/

/*
        13. Add unit
*/

async function addUnit(req, res) {
  const { name, type, symbol } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    const typeExist = await unit.findOne({
      where: { name: name },
      transaction: t // Add transaction context
    });

    if (typeExist) {
      await t.rollback(); 
      throw new CustomException(
        "This unit already exists",
        "Please try some other name"
      );
    }

   
    const dat = await unit.create(
      { name, type, symbol, status: true },
      { transaction: t } 
    );

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Unit added successfully",
      data: {
        name: dat.name,
        symbol: dat.symbol,
        type: dat.type,
      },
      error: "",
    });

  } catch (err) {
    await t.rollback(); 

    return res.json({
      status: "0",
      message: "Error in adding unit",
      data: [],
      error: err.message || "Writing to database failed",
    });
  }
}

/*
        14. Get All units
*/
async function getAllUnits(req, res) {
  const listOfUnits = await unit.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  let currencyUnits = listOfUnits.filter((ele) => ele.type === "currency");
  let distanceUnits = listOfUnits.filter((ele) => ele.type === "distance");

  return res.json({
    status: "1",
    message: "Active Delivery Fee Type",
    data: {
      currencyUnits,
      distanceUnits,
    },
    error: "",
  });
}
async function getAllActiveUnits(req, res) {
  const listOfUnits = await unit.findAll({
    where: { status: true },
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  let currencyUnits = listOfUnits.filter((ele) => ele.type === "currency");
  let distanceUnits = listOfUnits.filter((ele) => ele.type === "distance");

  return res.json({
    status: "1",
    message: "Active Delivery Fee Type",
    data: {
      currencyUnits,
      distanceUnits,
    },
    error: "",
  });
}
/*
        15. Get specific unit by type
*/
async function getSpecificUnits(req, res) {
  const type = req.params.type;
  const list = await unit.findAll({ where: { type: type, status: true } });
  let outArr = [];
  list.map((ele) => {
    let tmpObj = {
      id: ele.id,
      name: `${ele.name}(${ele.symbol})`,
    };
    outArr.push(tmpObj);
  });
  return res.json({
    status: "1",
    message: `Active units of ${type}`,
    data: outArr,
    error: "",
  });
}
/*
        15. Edit unit
*/


async function editUnit(req, res) {
  const { id, name, type, symbol } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
    
    const exist = await unit.findOne({
      where: { name: name, id: { [Op.ne]: id } },
      transaction: t 
    });

    if (exist) {
      await t.rollback(); 
      throw new CustomException(
        "Unit with this name exists",
        "Please try some other name"
      );
    }

  
    await unit.update(
      { name: name, type: type, symbol: symbol },
      { where: { id: id }, transaction: t } 
    );

    await t.commit();

    return res.json({
      status: "1",
      message: "Unit updated successfully",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); 

    return res.json({
      status: "0",
      message: "Error in updating unit",
      data: {},
      error: err.message,
    });
  }
}

/*
        15. Change status of Unit
*/

async function changeUnitStatus(req, res) {
  const { id, status } = req.body;
  const t = await SequelizeDB.transaction();

  try {
  
    const data = await unit.findOne({ where: { id: id }, transaction: t });

    if (data) {
     
      data.status = status;

      
      await data.save({ transaction: t });

      await t.commit(); 

      const response = ApiResponse("1", "Status Updated successfully", "", {});
      return res.json(response);

    } else {
      await t.rollback();

      const response = ApiResponse("0", "Sorry, not found", "", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function updateUnit(req, res) {
  const { id, name, symbol, shortcode } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    const data = await unit.findOne({ where: { id: id }, transaction: t });

    if (data) {
     
      data.name = name;
      data.symbol = symbol;
      data.shortcode = shortcode;

     
      await data.save({ transaction: t });

      await t.commit(); 

      const response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);

    } else {
      await t.rollback(); 

      const response = ApiResponse("0", "Sorry, not found", "", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); 

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

/*
        16. Add restaurant
*/

async function addRestaurant(req, res) {
  const t = await SequelizeDB.transaction(); 

  try {
    const {
      businessName,
      businessEmail,
      firstName,
      lastName,
      password,
      email,
      countryCode,
      phoneNum,
      city,
      lat,
      lng,
      zipCode,
      description,
      address,
      approxDeliveryTime,
      packingFee,
      zoneId
    } = req.body;

    const checkUser = await user.findOne({
      where: { [Op.or]: [{ email: email }, { phoneNum: phoneNum }] },
      transaction: t 
    });

    if (checkUser) {
      await t.rollback(); 
      return res.json({
        status: "0",
        message: "Email or Phone already taken",
        data: {},
        error: "Email or Phone already taken",
      });
    }

  
    const exist = await restaurant.findOne({
      where: { businessName: businessName },
      transaction: t
    });

    if (exist) {
      await t.rollback(); 
      let response = ApiResponse("0", "Restaurant with this business Name already exist", "", {});
      return res.json(response);
    }

   
    const restType = await userType.findOne({ where: { name: 'Retailer' }, transaction: t });
    const newUser = new user();
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.email = email;
    newUser.phoneNum = phoneNum;
    newUser.countryCode = countryCode;
    newUser.status = 1;
    newUser.userTypeId = restType.id;
    newUser.password = await bcrypt.hash(password, 10);
    await newUser.save({ transaction: t });

   
    let logoPathTemp = req.files.logo[0].path;
    let logoPath = logoPathTemp.replace(/\\/g, "/");
    let imagePathTemp = req.files.coverImage[0].path;
    let imagePath = imagePathTemp.replace(/\\/g, "/");

    // Fetch default values
    const deliveryCharge = await defaultValues.findOne({ where: { name: "deliveryCharge" }, transaction: t });
    const businessTypeId = await defaultValues.findOne({ where: { name: "businessType" }, transaction: t });
    const serviceChargesTypeId = await defaultValues.findOne({ where: { name: "serviceChargesType" }, transaction: t });
    const serviceCharges = await defaultValues.findOne({ where: { name: "serviceCharges" }, transaction: t });
    const deliveryFeeTypeId = await defaultValues.findOne({ where: { name: "deliveryFeeTypeId" }, transaction: t });
    const deliveryTypeId = await defaultValues.findOne({ where: { name: "deliveryTypeId" }, transaction: t });
    const paymentMethodId = await defaultValues.findOne({ where: { name: "paymentMethodId" }, transaction: t });
    const deliveryRadius = await defaultValues.findOne({ where: { name: "deliveryRadius" }, transaction: t });
    const deliveryFeeFixed = await defaultValues.findOne({ where: { name: "deliveryFeeFixed" }, transaction: t });
    const distanceUnitId = await defaultValues.findOne({ where: { name: "distanceUnitId" }, transaction: t });
    const comission = await defaultValues.findOne({ where: { name: "comission" }, transaction: t });
    const closingTime = await defaultValues.findOne({ where: { name: "closingTime" }, transaction: t });
    const openingTime = await defaultValues.findOne({ where: { name: "openingTime" }, transaction: t });
    const minOrderAmount = await defaultValues.findOne({ where: { name: "minOrderAmount" }, transaction: t });
    const VATpercent = await defaultValues.findOne({ where: { name: "VATpercent" }, transaction: t });
    const pricesIncludeVAT = await defaultValues.findOne({ where: { name: "pricesIncludeVAT" }, transaction: t });

   
    await restaurant.create({
      deliveryTypeId: deliveryTypeId.value,
      distanceUnitId: distanceUnitId.value,
      deliveryCharge: deliveryCharge.value,
      comission: comission.value,
      businessName,
      businessEmail,
      businessType: businessTypeId.id,
      email,
      countryCode,
      phoneNum,
      city,
      paymentMethodId: paymentMethodId.value,
      lat,
      lng,
      zipCode,
      description,
      serviceChargesType: serviceChargesTypeId.value,
      address,
      logo: logoPath,
      image: imagePath,
      openingTime: openingTime.value,
      closingTime: closingTime.value,
      approxDeliveryTime,
      deliveryFeeFixed: deliveryFeeFixed.value,
      minOrderAmount: minOrderAmount.value,
      packingFee,
      deliveryRadius: deliveryRadius.value,
      comission: comission.value,
      deliveryTypeId: deliveryTypeId.value,
      deliveryFeeTypeId: deliveryFeeFixed.value,
      status: true,
      pricesIncludeVAT: pricesIncludeVAT.value,
      VATpercent: VATpercent.value,
      userId: newUser.id
    }, { transaction: t });

    await t.commit();

    return res.json({
      status: "1",
      message: "Restaurant Added successfully",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); 

    let response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}

/*
        17. Get All restaurants
*/
async function getAllRestaurants(req, res) {
 const type = await orderApplication.findOne({where:{name:"restaurant"}});
  const list = await restaurant.findAll({where:{businessType:type.id}});
  let outArr = [];
  list.map((ele) => {
    let opTime = new Date(ele.openingTime);
    let clTime = new Date(ele.closingTime);
    let cAt = new Date(ele.createdAt);
    let tmpObj = {
      id: ele.id,
      logo: ele.logo,
      businessName: ele.businessName,
      city: ele.city,
      ownerName: ele.name,
      isOpen: ele.isOpen,
      temporaryClosed: ele.temporaryClosed ? true : false,
      rushModeTime: ele.rushModeTime,
      isRushMode: ele.isRushMode ? true : false,
      status: ele.status,
      operatingTime: `${opTime.toLocaleTimeString(
        "en-US"
      )} - ${clTime.toLocaleTimeString("en-US")}`,
      joinedAt: cAt.toLocaleDateString("en-US"),
    };
    outArr.push(tmpObj);
  });
  return res.json({
    status: "1",
    message: "All restaurants",
    data: outArr,
    error: "",
  });
}
async function getAllStores(req, res) {
  const type = await orderApplication.findOne({where:{name:"store"}});
  
  const list = await restaurant.findAll({where:{businessType:type?.id}});
  let outArr = [];
  list.map((ele) => {
    let opTime = new Date(ele.openingTime);
    let clTime = new Date(ele.closingTime);
    let cAt = new Date(ele.createdAt);
    let tmpObj = {
      id: ele.id,
      logo: ele.logo,
      businessName: ele.businessName,
      city: ele.city,
      ownerName: ele.name,
      status: ele.status,
      operatingTime: `${opTime.toLocaleTimeString(
        "en-US"
      )} - ${clTime.toLocaleTimeString("en-US")} `,
      joinedAt: cAt.toLocaleDateString("en-US"),
    };
    outArr.push(tmpObj);
  });
  return res.json({
    status: "1",
    message: "All restaurants",
    data: outArr,
    error: "",
  });
}
async function getAllRelatedRestaurants(req, res) {
  const unitId = req.body.unitId;
  const list = await restaurant.findAll({ where: { unitId } });
  let outArr = [];
  list.map((ele) => {
    let opTime = new Date(ele.openingTime);
    let clTime = new Date(ele.closingTime);
    let cAt = new Date(ele.createdAt);
    let tmpObj = {
      id: ele.id,
      logo: ele.logo,
      businessName: ele.businessName,
      city: ele.city,
      ownerName: ele.name,
      status: ele.status,
      operatingTime: `${opTime.toLocaleTimeString(
        "en-US"
      )} - ${clTime.toLocaleTimeString("en-US")} `,
      joinedAt: cAt.toLocaleDateString("en-US"),
    };
    outArr.push(tmpObj);
  });
  return res.json({
    status: "1",
    message: "All restaurants",
    data: outArr,
    error: "",
  });
}
/*
        18. Update Restaurant
*/
//18.1 General
//get
async function getResGeneral(req, res) {
  const id = req.params.id;
  const resData = await restaurant.findOne({ where: { id: id } });
  let opTime = new Date(resData.openingTime);
  let clTime = new Date(resData.closingTime);
  let outObj = {
    id: resData.id,
    businessEmail: resData.businessEmail,
    businessName: resData.businessName,
    description: resData.description,
    logo: resData.logo,
    countryCode: resData.countryCode,
    phoneNum: resData.phoneNum,
    openingTime: opTime.toLocaleTimeString("en-US"),
    closingTime: clTime.toLocaleTimeString("en-US"),
    certificateCode: resData.certificateCode,
  };
  return res.json({
    status: "1",
    message: "Restaurant General Data",
    data: outObj,
    error: "",
  });
}
//update
async function editResGeneral(req, res) {
  const {
    businessName,
    description,
    businessEmail,
    countryCode,
    phoneNum,
    openingTime,
    closingTime,
    certificateCode,
    id,
  } = req.body;

  const t = await SequelizeDB.transaction(); 

  try {
   
    let logoPathTemp = req.files.logo && req.files.logo[0].path ? req.files.logo[0].path : null;
    let logoPath = logoPathTemp ? logoPathTemp.replace(/\\/g, "/") : null;

    let imagePathTemp = req.files.coverImage && req.files.coverImage[0].path ? req.files.coverImage[0].path : null;
    let imagePath = imagePathTemp ? imagePathTemp.replace(/\\/g, "/") : null;

    if (!id) {
      await t.rollback(); 
      let response = ApiResponse("0", "Restaurant ID is required", "", {});
      return res.json(response);
    }

    const rest = await restaurant.findOne({ where: { id: id }, transaction: t });

    if (rest) {
      // Update the restaurant details
      rest.businessName = businessName;
      rest.description = description;
      rest.businessEmail = businessEmail;
      rest.countryCode = countryCode;
      rest.phoneNum = phoneNum;
      rest.closingTime = closingTime;
      rest.openingTime = openingTime;
      rest.certificateCode = certificateCode;
      if (logoPath) rest.logo = logoPath;
      if (imagePath) rest.image = imagePath;

      // Save the changes within the transaction
      await rest.save({ transaction: t });

      await t.commit(); // Commit the transaction if successful

      return res.json({
        status: "1",
        message: "General Data Updated",
        data: { rest },
        error: "",
      });

    } else {
      await t.rollback(); // Rollback if the restaurant is not found
      let response = ApiResponse("0", "Restaurant not found", "", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    return res.json({
      status: "0",
      message: error.message,
      data: {},
      error: "Error",
    });
  }
}

//18.2 Meta Data
//get
async function getResMetaData(req, res) {
  const id = req.params.id;
  const resData = await restaurant.findOne({ where: { id: id },include:[
      {model:user,attributes:['firstName','lastName','userName','countryCode','phoneNum','email','image']},
      {model:director}, { model: deliveryType },
      { model: deliveryFeeType },
      { model: deliveryFee },
      {model: time},
      {model: configuration},
      { model: zoneRestaurants,include:{model:zone ,attributes:['id'],include:{model:zoneDetails,include:[{ model: unit, as: "distanceUnit"},{ model: unit, as: "currencyUnit"}],attributes:['id']} } },] });
  
    let rmc = await R_MCLink.findAll({attributes:[],where:{restaurantId:id},include:[{model:menuCategory,attributes:['name']},{model:R_PLink}]});
      const times = resData?.times ? resData.times.map(time => ({
      name: time?.name,
      startAt: time?.startAt,
      endAt: time?.endAt
    })) : [];
  let outObj = {
      general:{
          businessName:resData.businessName,
          businessEmail:resData.businessEmail,
          openingTime:resData.openingTime,
          closingTime:resData.closingTime,
          coverImage:resData.image ?resData.image:null ,
          logo:resData.logo,
          phoneNum:resData.phoneNum,
          countryCode:resData.countryCode,
          certificateCode:resData.certificateCode,
          description:resData.description,
          owner : resData?.user
          
      },
      metaData:{
          address: resData.address,
            city: resData.city,
            lat: resData.lat,
            lng: resData.lng,
            zipCode: resData.zipCode,
            deliveryRadius: resData.deliveryRadius,
            approxDeliveryTime: `${resData.approxDeliveryTime}`,
            isPureVeg: resData.isPureVeg,
            isFeatured: resData.isFeatured,
            coordinates: resData.coordinates
      },
    charges:{
        minOrderAmount:resData?.minOrderAmount,
        packingFee:resData?.packingFee,
        comission:resData?.comission,
        pricesIncludeVAT:resData?.pricesIncludeVAT,
        VATpercent:resData?.VATpercent,
    },
    menuSetting:{
        rmc,
         distanceUnit: resData?.zoneRestaurant?.zone?.zoneDetail?.distanceUnit?.name,
    currencyUnit: resData?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol,
    },
    bankDetails:{
        bankDetails:resData?.director
    },
    deliveryData:{
        
    deliveryTypeId: resData.deliveryTypeId,
    deliveryTypeName: resData.deliveryType.name,
    deliveryFeeTypeId: resData.deliveryFeeTypeId,
    deliveryFeeTypeName: resData?.deliveryFeeType?.name,
    deliveryFeeValues: resData.deliveryFee,
    // deliveryFee:
    //   resData.deliveryFeeTypeId === 2
    //     ? resData.deliveryFee
    //     : { deliveryFeeFixed: resData.deliveryFeeFixed },
    distanceUnit: resData?.zoneRestaurant?.zone?.zoneDetail?.distanceUnit?.name,
    currencyUnit: resData?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol,
    deliveryFeeFixed: resData?.deliveryFeeFixed,
 
    },
     timeData: {
      times: times
    },
   
     configuration:resData.configuration
    
  };
  return res.json({
    status: "1",
    message: "Restaurant Meta Data",
    data: outObj,
    error: "",
  });
}
//update
async function editResMetaData(req, res) {
  const {
    address,
    city,
    lat,
    lng,
    zipCode,
    deliveryRadius,
    approxDeliveryTime,
    isPureVeg,
    isFeatured,
    id,
  } = req.body;

  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Find the restaurant by ID
    const rest = await restaurant.findOne({ where: { id: id }, transaction: t });

    if (rest) {
      // Update the restaurant metadata
      rest.city = city;
      rest.address = address;
      rest.lat = lat;
      rest.lng = lng;
      rest.zipCode = zipCode;
      rest.deliveryRadius = deliveryRadius;
      rest.isPureVeg = isPureVeg;
      rest.isFeatured = isFeatured;
      if (approxDeliveryTime) {
        rest.approxDeliveryTime = approxDeliveryTime;
      }

      // Save the changes within the transaction
      await rest.save({ transaction: t });

      await t.commit(); // Commit the transaction if successful

      const response = ApiResponse("1", "Restaurant Updated Successfully", "", {});
      return res.json(response);

    } else {
      await t.rollback(); // Rollback if the restaurant is not found

      const response = ApiResponse("0", "Sorry! Restaurant not found", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

//18.3 Delivery Settings
//get
async function getResDeliverySettings(req, res) {
  const id = req.params.id;
  const resData = await restaurant.findOne({
    where: { id: id },
    include: [
      { model: deliveryType },
      { model: deliveryFeeType },
      { model: deliveryFee },
      { model: zoneRestaurants,include:{model:zone ,attributes:['id'],include:{model:zoneDetails,include:[{ model: unit, as: "distanceUnit"},{ model: unit, as: "currencyUnit"}],attributes:['id']} } },
    //   { model: unit, as: "distanceUnitID" },
    //   { model: unit, as: "currencyUnitID" },
    ],
  });
  let outObj = {
    deliveryTypeId: resData.deliveryTypeId,
    deliveryTypeName: resData.deliveryType.name,
    deliveryFeeTypeId: resData.deliveryFeeTypeId,
    deliveryFeeTypeName: resData.deliveryFeeType.name,
    deliveryFeeValues: resData.deliveryFee,
    // deliveryFee:
    //   resData.deliveryFeeTypeId === 2
    //     ? resData.deliveryFee
    //     : { deliveryFeeFixed: resData.deliveryFeeFixed },
    distanceUnit: resData?.zoneRestaurant?.zone?.zoneDetail?.distanceUnit?.name,
    currencyUnit: resData?.zoneRestaurant?.zone?.zoneDetail?.currencyUnit?.symbol,
    deliveryFeeFixed: resData?.deliveryFeeFixed,
  };
  return res.json({
    status: "1",
    message: "Restaurant Delivery Settings",
    data: outObj,
    error: "",
  });
}
//update

async function editResDeliverySettings(req, res) {
  const {
    deliveryTypeId,
    deliveryFeeTypeId,
    deliveryFeeFixed,
    baseCharge,
    baseDistance,
    chargePerExtraUnit,
    extraUnitDistance,
    id,
  } = req.body;

  const t = await SequelizeDB.transaction();

  try {
   
    let restData = await restaurant.findOne({ where: { id: id }, transaction: t });

    if (restData) {
     
      restData.deliveryTypeId = deliveryTypeId;
      restData.deliveryFeeTypeId = deliveryFeeTypeId;
      restData.deliveryFeeFixed = deliveryFeeFixed;

      
      await restData.save({ transaction: t });

      // Check conditions for handling delivery fee details
      if (parseInt(deliveryTypeId) === 1 || parseInt(deliveryTypeId) === 3) {
        if (parseInt(deliveryFeeTypeId) === 2) {
          // Check for existing delivery fee record
          let deliveryData = await deliveryFee.findOne({
            where: { restaurantId: restData.id },
            transaction: t
          });

          if (deliveryData) {
            // Update existing delivery fee details
            deliveryData.baseCharge = baseCharge;
            deliveryData.baseDistance = baseDistance;
            deliveryData.chargePerExtraUnit = chargePerExtraUnit;
            deliveryData.extraUnitDistance = extraUnitDistance;

            await deliveryData.save({ transaction: t });
          } else {
            // Create new delivery fee details
            let newData = new deliveryFee();
            newData.baseCharge = baseCharge;
            newData.baseDistance = baseDistance;
            newData.chargePerExtraUnit = chargePerExtraUnit;
            newData.extraUnitDistance = extraUnitDistance;
            newData.restaurantId = restData.id;

            await newData.save({ transaction: t });
          }
        }
      }

      await t.commit(); 

      let response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);

    } else {
      await t.rollback();
      let response = ApiResponse("0", "Restaurant not found!", "", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); 

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

//18.4 Delivery Settings
//get
async function getResPaymentSettings(req, res) {
  const id = req.params.id;
  const resData = await restaurant.findOne({
    where: { id: id },
    include: [{ model: paymentMethod }, { model: unit, as: "currencyUnitID" }],
  });
  //return res.json(resData);
  let outObj = {
    paymentMethodId: resData.paymentMethodId,
    paymentMethodName: resData.paymentMethod.name,
    distanceUnit: resData.currencyUnitID,
  };
  return res.json({
    status: "1",
    message: "Restaurant Payment Settings",
    data: outObj,
    error: "",
  });
}
//update
async function editResPaymentSettings(req, res) {
  const { paymentMethodId, distanceUnitId, id } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    await restaurant.update(
      { paymentMethodId, distanceUnitId },
      { where: { id: id }, transaction: t } 
    );

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Restaurant Payment Settings Updated",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback();

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}

//18.5 Charges
//get
async function getResCharges(req, res) {
  const id = req.params.id;
  const resData = await restaurant.findOne({ where: { id: id } });
  //return res.json(resData);
  let outObj = {
    minOrderAmount: resData.minOrderAmount,
    packingFee: resData.packingFee,
    comission: resData.comission,
    pricesIncludeVAT: resData.pricesIncludeVAT,
    VATpercent: resData.VATpercent,
  };
  return res.json({
    status: "1",
    message: "Restaurant Payment Settings",
    data: outObj,
    error: "",
  });
}
//update
async function editResCharges(req, res) {
  const {
    minOrderAmount,
    packingFee,
    comission,
    pricesIncludeVAT,
    VATpercent,
    id,
  } = req.body;

  const t = await SequelizeDB.transaction(); 

  try {
    
    await restaurant.update(
      { minOrderAmount, packingFee, comission, pricesIncludeVAT, VATpercent },
      { where: { id: id }, transaction: t } 
    );

    await t.commit();

    return res.json({
      status: "1",
      message: "Restaurant Charges Updated",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback();

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}

//18.6 Charges
//get
async function getResImages(req, res) {
  const id = req.params.id;
  const resData = await restaurant.findOne({ where: { id: id } });
  //return res.json(resData);
  let outObj = {
    businessName: resData.businessName,
    logo: resData.logo,
    image: resData.image,
  };
  return res.json({
    status: "1",
    message: "Restaurant Payment Settings",
    data: outObj,
    error: "",
  });
}
//update
async function editResImages(req, res) {
  const { id } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    let logoPathTemp = req.files.logo[0].path;
    let logoPath = logoPathTemp.replace(/\\/g, "/");
    let imagePathTemp = req.files.coverImage[0].path;
    let imagePath = imagePathTemp.replace(/\\/g, "/");

  
    await restaurant.update(
      { logo: logoPath, image: imagePath },
      { where: { id: id }, transaction: t } 
    );

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Restaurant Images Updated",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); 

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}


/*
        19. Change Restaurant Status
*/


async function changeRestaurantStatus(req, res) {
  const { status, id } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
    
    await restaurant.update(
      { status: status },
      { where: { id: id }, transaction: t } 
    );

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Restaurant status updated",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); 

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}

/*
        20. Get menu settings (Link of restaurant with Menu Categories & Cuisines)
*/
async function getMenuSettings(req, res) {
  const id = req.params.id;
  const mCListRaw = await R_MCLink.findAll({
    where: { restaurantId: id },
    include: [
      { model: menuCategory, attributes: ["name"] },
      { model: R_PLink, attributes: ["name", "image", "discountPrice"] },
    ],
    attributes: ["id"],
  });
  //return res.json(mCListRaw);
  const cListRaw = await R_CLink.findAll({
    where: { restaurantId: id },
    include: [{ model: cuisine }],
  });
  let mCList = [],
    cList = [];
  // mCListRaw.map(ele=>{
  //     let tmpObj = {
  //         mCId: ele.menuCategory.id,
  //         name: ele.menuCategory.name
  //     };
  //     mCList.push(tmpObj);
  // });
  cListRaw.map((ele) => {
    let tmpObj = {
      cId: ele.cuisine.id,
      name: ele.cuisine.name,
    };
    cList.push(tmpObj);
  });

  return res.json({
    status: "1",
    message: "Menu Settings",
    data: {
      menuCategories: mCListRaw,
      cuisines: cList,
    },
    error: "",
  });
}
/*
        21. Edit / Update / Add Menu setting to a restaurant
*/

async function updateMenuSettings(req, res) {
  const { mCIds, cIds, id } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    await R_MCLink.destroy({ where: { restaurantId: id }, transaction: t });
    await R_CLink.destroy({ where: { restaurantId: id }, transaction: t });

    
    await R_MCLink.bulkCreate(mCIds, { transaction: t });
    await R_CLink.bulkCreate(cIds, { transaction: t });

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Menu setting updated",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback();

    return res.json({
      status: "0",
      message: "Error in updating menu settings",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}


async function updatecuisineSettings(req, res) {
  const { cIds, id } = req.body;
  let destroyC = await R_CLink.destroy({ where: { restaurantId: id } });
  R_CLink.bulkCreate(cIds);
  return res.json({
    status: "1",
    message: "Cuisines setting updated",
    data: {},
    error: "",
  });
}


//Module 4 -  Products
/*
        1. Get All restaurants for Adding Product
*/
async function allRestaurantsforProd(req, res) {
  const orderApp = await orderApplication.findOne({
    where: { name: "restaurant" },
  });
  const restData = await restaurant.findAll({
    where: [{ status: true }, { businessType: orderApp.id }],
    attributes: ["id", "businessName"],
  });
  return res.json({
    status: "1",
    message: "All active restaurants for adding products ",
    data: restData,
    error: "",
  });
}

/*
        1. Get All Stores for Adding Product
*/
async function allStoresforProd(req, res) {
  const orderApp = await orderApplication.findOne({
    where: { name: "store" },
  });
  const restData = await restaurant.findAll({
    where: [{ status: true }, { businessType: orderApp.id }],
    attributes: ["id", "businessName"],
  });
  return res.json({
    status: "1",
    message: "All active restaurants for adding products ",
    data: restData,
    error: "",
  });
}
/*
        2. Get All menucategories of restaurant for Adding Product
*/
async function menuCategoriesOfRestaurant(req, res) {
  const restaurantId = req.params.id;
  const menuCatData = await R_MCLink.findAll({
    where: { restaurantId: restaurantId },
    include: { model: menuCategory, attributes: ["name"] },
    attributes: ["id"],
  });
  return res.json({
    status: "1",
    message: "Menu Categories for restaurant",
    data: menuCatData,
    error: "",
  });
}

/*
        3. Add product
*/

async function addProduct(req, res) {
  const {
    name,
    description,
    originalPrice,
    discountPrice,
    discountValue,
    currencyUnitId,
    discountLimit,
    isPopular,
    isNew,
    isRecommended,
    isAdult,
    RMCLinkId,
  } = req.body;

  const t = await SequelizeDB.transaction(); 

  try {
  
    let imagePathTemp = req.file.path;
    let imagePath = imagePathTemp.replace(/\\/g, "/");

 
    const productData = await product.create({}, { transaction: t });

   
    await R_PLink.create(
      {
        name,
        description,
        originalPrice,
        image: imagePath,
        status: true,
        discountPrice,
        discountValue,
        currencyUnitId,
        discountLimit,
        isPopular,
        isNew,
        isRecommended,
        isAdult,
        RMCLinkId,
        productId: productData.id,
      },
      { transaction: t }
    );

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Product added successfully",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback();

    return res.json({
      status: "0",
      message: "Error in adding Product",
      data: [],
      error: `${err.message}. Writing to database failed`,
    });
  }
}


/*
        4. Get all products
*/
async function getAllProducts(req, res) {
//   const type = await orderApplication.findOne({
//     where: { name: "restaurant" },
//   });
//   let restIds = [];
//   const rests = await restaurant.findAll({
//     where: [{ status: true }, { businessType: type.id }],
//   });

//   rests.map((rst) => {
//     restIds.push(rst.id);
//   });

//   var rmcIds = [];
//   const rmcLink = await R_MCLink.findAll({
//     where: { restaurantId: { [Op.in]: restIds } },
//   });
//   rmcLink.map((rmc) => {
//     rmcIds.push(rmc.id);
//   });


const productData = await R_PLink.findAll({
  include: [
    {
      model: R_MCLink,
      attributes: ['id'],
      include: [
        { model: menuCategory, attributes: ['name'] },
        { model: restaurant, attributes: ['businessName'] }
      ]
    },
      {
          model: productCollections,
          include: {
            model: collection,
            include: {
              model: collectionAddons,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          },
        },
  ],
  attributes: [
    "id",
    "name",
    "image",
    "originalPrice",
    "isPopular",
    "isNew",
    "isRecommended",
    "isAdult",
  ],
});
  return res.json({
    status: "1",
    message: "All Products",
    data: productData,
    error: "",
  });

  // const productsData = await R_PLink.findAll({
  //   include: {
  //     model: R_MCLink,
  //     include: [
  //       { model: menuCategory, attributes: ["id", "name"] },
  //       {
  //         model: restaurant,
  //         where: { businessType: type.id },
  //         include: {
  //           model: unit,
  //           as: "currencyUnitID",
  //           attributes: ["symbol"],
  //         },
  //         attributes: ["id", "businessName"],
  //       },
  //     ],
  //     attributes: ["id"],
  //   },
  //   attributes: [
  //     "id",
  //     "name",
  //     "image",
  //     "originalPrice",
  //     "isPopular",
  //     "isNew",
  //     "isRecommended",
  //     "isAdult",
  //   ],
  // });
  // return res.json({
  //   status: "1",
  //   message: "All Products",
  //   data: productsData,
  //   error: "",
  // });
}
async function getAllProductsStore(req, res) {
  const type = await orderApplication.findOne({
    where: { name: "store" },
  });
  let restIds = [];
  const rests = await restaurant.findAll({
    where: [{ status: true }, { businessType: type.id }],
  });

  rests.map((rst) => {
    restIds.push(rst.id);
  });

  var rmcIds = [];
  const rmcLink = await R_MCLink.findAll({
    where: { restaurantId: { [Op.in]: restIds } },
   
  });
  rmcLink.map((rmc) => {
    rmcIds.push(rmc.id);
  });

  const productData = await R_PLink.findAll({
    where: { RMCLinkId: { [Op.in]: rmcIds } },
    attributes: [
      "id",
      "name",
      "image",
      "originalPrice",
      "isPopular",
      "isNew",
      "isRecommended",
      "isAdult",
    ],
     include: [
    {
      model: R_MCLink,
      attributes: ['id'],
      include: [
        { model: menuCategory, attributes: ['name'] },
        { model: restaurant, attributes: ['businessName'] }
      ]
    },
     
        {
          model: productCollections,
          include: {
            model: collection,
            include: {
              model: collectionAddons,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          },
        },
  ],
  });
  return res.json({
    status: "1",
    message: "All Products",
    data: productData,
    error: "",
  });
  

  //   const type = await orderApplication.findOne({ where: { name: "store" } });
  //   const productsData = await R_PLink.findAll({
  //     include: {
  //       model: R_MCLink,
  //       include: [
  //         { model: menuCategory, attributes: ["id", "name"] },
  //         {
  //           model: restaurant,
  //           where: { businessType: type.id },
  //           include: {
  //             model: unit,
  //             as: "currencyUnitID",
  //             attributes: ["symbol"],
  //           },
  //           attributes: ["id", "businessName"],
  //         },
  //       ],
  //       attributes: ["id"],
  //     },
  //     attributes: [
  //       "id",
  //       "name",
  //       "image",
  //       "originalPrice",
  //       "isPopular",
  //       "isNew",
  //       "isRecommended",
  //       "isAdult",
  //     ],
  //   });
  //   return res.json({
  //     status: "1",
  //     message: "All Products",
  //     data: productsData,
  //     error: "",
  //   });
}

/*
        5. Get product details by ID
*/

async function getProductbyId(req, res) {
    
   let rpId = req.params.id;

  try {
    const productData = await R_PLink.findOne({
      where: {
        id: rpId,
      },
      include: [
        {
          model: productCollections,
          include: {
            model: collection,
            include: {
              model: collectionAddons,
              include: {
                model: addOn,
                attributes: ["id", "name"],
              },
            },
          },
        },
        {
          model: P_AOLink,

          include: [
            {
              model: addOnCategory,
              where: {
                status: true,
              },
            },
            {
              model: P_A_ACLink,
              where: {
                status: true,
              },
              required: false,
              include: {
                model: addOn,
              },
            },
          ],
          where: {
            status: true,
          },
          required: false,
        },
        {
          model: R_MCLink,

          include: {
            model: restaurant,
          },
        },
      ],
    });
   
    let addOnArr = [];
    const zonedetails = await zoneRestaurants.findOne({
      where: {
        restaurantId: productData.R_MCLink.restaurant.id,
      },
      include: {
        model: zone,
        include: {
          model: zoneDetails,
          include: [
            {
              model: unit,
              as: "currencyUnit",
            },
            {
              model: unit,
              as: "distanceUnit",
            },
          ],
        },
      },
    });
    //   return res.json(zonedetails)
    if (!productData) {
      return {};
    }

    //   return res.json(productData);
    let currencySign =
      zonedetails.zone.zoneDetail?.currencyUnit?.symbol ?? "USD";
    if (productData) {
      if (productData?.productCollections.length > 0) {
        for (const cat of productData?.productCollections) {
          let category = {
            name: cat?.collection?.title,
            id: cat?.collection?.id,
            maxAllowed: cat?.collection?.maxAllowed,
            minAllowed: cat?.collection?.minAllowed,
          };
          let addList = [];
          for (const add of cat?.collection?.collectionAddons) {
            addList.push({
              id: add?.addOn?.id,
              collectionAddonId: cat?.collection?.id,
              name: add?.addOn?.name,
              minAllowed: add.minAllowed,
              maxAllowed: add.maxAllowed,
              status: add.status,
              isPaid: add.isPaid,
              price: add.price,
              isAvailable: add.isAvaiable,
            });
          }
          addOnArr.push({
            category,
            addons: addList,
          });
        }
      }
    }

    let retObj = {
      RPLinkId: productData.id,
      countryOfOrigin: productData.countryOfOrigin,
      ingredients: productData.ingredients,
      allergies: productData.allergies,
      nutrients: productData.nutrients,
      image: productData.image,
      name: productData?.name,
      isPopular: productData?.isPopular,
      description: productData.description,
      currencySign: `${currencySign}`,
      originalPrice: `${productData.originalPrice}`,
      discountPrice: `${productData.discountPrice} `,
      addOnArr: addOnArr,
    };
    
    const response = ApiResponse("1", "Product Details", "", retObj);
    return res.json(response);
  } catch (error) {
    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}
/*
        6. Add AddOn category
*/


async function addAddonCategory(req, res) {
  const { name } = req.body;
  const t = await SequelizeDB.transaction();

  try {
    console.log(req.body);

  
    const typeExist = await addOnCategory.findOne({
      where: { name: name },
      transaction: t // Add transaction context
    });

    if (typeExist) {
      await t.rollback();
      throw new CustomException(
        "This AddOn category already exists",
        "Please try some other name"
      );
    }

    // Create new AddOn category
    const dat = await addOnCategory.create(
      { name, orderApplicationName: "restaurant", status: true },
      { transaction: t } // Add transaction context
    );

    await t.commit(); // Commit the transaction if successful

    return res.json({
      status: "1",
      message: "AddOn added successfully",
      data: {
        name: dat.name,
      },
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs

    return res.json({
      status: "0",
      message: "Error in adding AddOn",
      data: [],
      error: `${err.message}. Writing to database failed`,
    });
  }
}

async function addOnCategoryRest(req, res) {
 
    let type = await orderApplication.findOne({where:{name:"restaurant"}});
    let coll = await collection.findAll({include:{model:restaurant,where:{businessType:type.id}}});
    let list = [];
    coll.map((dat)=>{
        list.push({
          id: dat.id,
          title:dat.title,  
          minAllowed:dat.minAllowed,  
          maxAllowed:dat.maxAllowed,  
          status:dat.status,  
          restaurant:dat?.restaurant?.businessName,  
        })
    })
    let response = ApiResponse("1","data","",{list});
    
    return res.json(response)
    
}
async function addOnCategoryStore(req, res) {
 
    let type = await orderApplication.findOne({where:{name:"store"}});
    let coll = await collection.findAll({include:{model:restaurant,where:{businessType:type.id}}});
    let list = [];
    coll.map((dat)=>{
        list.push({
          title:dat.title,  
          minAllowed:dat.minAllowed,  
          maxAllowed:dat.maxAllowed,  
          status:dat.status,  
          restaurant:dat?.restaurant?.businessName,  
        })
    })
    let response = ApiResponse("1","data","",{list});
    
    return res.json(response)
    
}


async function addAddonCategoryStore(req, res) {
  const { name } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    const typeExist = await addOnCategory.findOne({
      where: { name: name },
      transaction: t 
    });

    if (typeExist) {
      await t.rollback(); 
      throw new CustomException(
        "This AddOn category already exists",
        "Please try some other name"
      );
    }

  
    const dat = await addOnCategory.create(
      { name, orderApplicationName: "store", status: true },
      { transaction: t } // Add transaction context
    );

    await t.commit(); // Commit the transaction if successful

    return res.json({
      status: "1",
      message: "AddOn added successfully",
      data: {
        name: dat.name,
      },
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs

    return res.json({
      status: "0",
      message: "Error in adding AddOn",
      data: [],
      error: `${err.message}. Writing to database failed`,
    });
  }
}


/*
        7. Get all AddOn categories 
*/
async function getAddOnCats(req, res) {
  const addOnCatsData = await addOnCategory.findAll({
    where: [{ status: true }, { orderApplicationName: "restaurant" }],
    attributes: ["id", "name"],
  });
  return res.json({
    status: "1",
    message: "Active AddOn Categories",
    data: addOnCatsData,
    error: "",
  });
}
async function getAddOnCatsStore(req, res) {
  const addOnCatsData = await addOnCategory.findAll({
    where: [{ status: true }, { orderApplicationName: "store" }],
    attributes: ["id", "name", "createdAt", "status"],
  });
  return res.json({
    status: "1",
    message: "Active AddOn Categories",
    data: addOnCatsData,
    error: "",
  });
}

/*
        8. Add AddOn for Restaurant
*/

async function addAddon(req, res) {
  const { name, addOnCategoryId } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
   
    const typeExist = await addOn.findOne({
      where: { name: name },
      transaction: t
    });

    if (typeExist) {
      await t.rollback(); 
      throw new CustomException(
        "This AddOn already exists",
        "Please try some other name"
      );
    }

    // Create new AddOn
    const dat = await addOn.create(
      {
        name,
        status: true,
        addOnCategoryId,
        orderApplicationName: "restaurant",
      },
      { transaction: t } // Add transaction context
    );

    await t.commit(); // Commit the transaction if successful

    return res.json({
      status: "1",
      message: "AddOn added successfully",
      data: {
        name: dat.name,
      },
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs

    return res.json({
      status: "0",
      message: "Error in adding AddOn",
      data: [],
      error: `${err.message}. Writing to database failed`,
    });
  }
}

/*
        8. Add AddOn for Store
*/

async function addaddonStore(req, res) {
  const { name, addOnCategoryId } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Check if the AddOn already exists
    const typeExist = await addOn.findOne({
      where: { name: name },
      transaction: t // Add transaction context
    });

    if (typeExist) {
      await t.rollback(); // Rollback if the AddOn already exists
      throw new CustomException(
        "This AddOn already exists",
        "Please try some other name"
      );
    }

    // Create new AddOn
    const dat = await addOn.create(
      {
        name,
        status: true,
        addOnCategoryId,
        orderApplicationName: "store",
      },
      { transaction: t } // Add transaction context
    );

    await t.commit(); // Commit the transaction if successful

    return res.json({
      status: "1",
      message: "AddOn added successfully",
      data: {
        name: dat.name,
      },
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs

    return res.json({
      status: "0",
      message: "Error in adding AddOn",
      data: [],
      error: `${err.message}. Writing to database failed`,
    });
  }
}

/*
        9. Get all AddOn categories 
*/
async function getAddOns(req, res) {
  const addOnCatsData = await addOn.findAll({
    where: { status: true },
    attributes: ["id", "name"],
  });
  return res.json({
    status: "1",
    message: "Active AddOn Categories",
    data: addOnCatsData,
    error: "",
  });
}

/*
        10. Assign Add On with category to product
*/
async function assignAddOnProd(req, res) {
  const {
    minAllowed,
    maxAllowed,
    displayText,
    RPLinkId,
    addOnCategoryId,
    addOnData,
  } = req.body;
  
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Create the P_AOLink entry
    const PAOLink = await P_AOLink.create(
      {
        minAllowed,
        maxAllowed,
        displayText,
        RPLinkId,
        addOnCategoryId,
        status: true,
      },
      { transaction: t } // Add transaction context
    );

    // Update addOnData with PAOLinkId and set status to true
    addOnData.forEach((ele) => {
      ele.PAOLinkId = PAOLink.id;
      ele.status = true;
    });

    // Bulk create addOnData entries in P_A_ACLink
    await P_A_ACLink.bulkCreate(addOnData, { transaction: t });

    await t.commit(); // Commit the transaction if successful

    return res.json({
      status: "1",
      message: "AddOn Added",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs

    return res.json({
      status: "0",
      message: "Error in adding AddOn",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}

/*
        11. Change Product Status
*/

async function changeProductStatus(req, res) {
  const id = req.params.id;
  const { status } = req.body;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Update the product's status
    await R_PLink.update(
      { status: status },
      { where: { id: id }, transaction: t } // Add transaction context
    );

    await t.commit(); // Commit the transaction if successful

    return res.json({
      status: "1",
      message: "Product status updated",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs

    return res.json({
      status: "0",
      message: "Error in updating product status",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}


/*
        12. Update Product details
*/

async function updateProduct(req, res) {
  const {
    name,
    description,
    originalPrice,
    discountPrice,
    isPopular,
    isNew,
    isRecommended,
    isAdult,
    RMCLinkId,
  } = req.body;

  const id = req.params.id;
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    let updateData = {
      name,
      description,
      originalPrice,
      discountPrice,
      isPopular,
      isNew,
      isRecommended,
      isAdult,
      RMCLinkId,
    };

    // If image is updated as well
    if (req.file) {
      let imagePathTemp = req.file.path;
      let imagePath = imagePathTemp.replace(/\\/g, "/");
      updateData.image = imagePath;
    }

    // Update the product details
    await R_PLink.update(updateData, {
      where: { id: id },
      transaction: t // Add transaction context
    });

    await t.commit(); // Commit the transaction if successful

    return res.json({
      status: "1",
      message: "Product updated",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs

    return res.json({
      status: "0",
      message: "Error in updating product",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}

/*
        13. Update Product Add Ons
*/

async function updateProductAddOn(req, res) {
  const {
    minAllowed,
    maxAllowed,
    displayText,
    addOnCategoryId,
    P_AOLinkId,
    addOnData,
  } = req.body;
  
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Update the P_AOLink entry
    await P_AOLink.update(
      { minAllowed, maxAllowed, displayText, addOnCategoryId },
      { where: { id: P_AOLinkId }, transaction: t } // Add transaction context
    );

    // Bulk create or update addOnData entries
    await P_A_ACLink.bulkCreate(addOnData, {
      updateOnDuplicate: ["price", "status", "addOnId"],
      transaction: t // Add transaction context
    });

    await t.commit(); // Commit the transaction if successful

    return res.json({
      status: "1",
      message: "Product AddOns updated",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs

    return res.json({
      status: "0",
      message: "Error in updating Product AddOns",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}


/*
        14. Change Status/Deactivate Product Add On Category 
*/

async function changeStatusOfProdAddOnCat(req, res) {
  const { P_AOLinkId, status } = req.body;
  const t = await SequelizeDB.transaction(); 
  try {
 
    await P_AOLink.update(
      { status: status },
      { where: { id: P_AOLinkId }, transaction: t } 
    );

    await t.commit(); 

    return res.json({
      status: "1",
      message: "Add On Category status changed",
      data: {},
      error: {},
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction if any error occurs

    return res.json({
      status: "0",
      message: "Error updating status",
      data: {},
      error: `${err.message}`,
    });
  }
}


//Module 5 - Users
/*
        1. Get all users
*/
async function getAllUsers(req, res) {
  const usersData = await user.findAll({
    include:[ { model: userType }],
    order: [["id", "desc"]],
  });
  let outArr = [];
  usersData.map((dat) => {
    let retObj = {
      id: dat.id,
      name: `${dat?.firstName} ${dat?.lastName}`,
      email: dat.email,
      phoneNum: `${dat.countryCode}${dat.phoneNum}`,
      status: dat.status,
      role: dat.userType?.name,
      
    };
    outArr.push(retObj);
  });
  return res.json({
    status: "1",
    message: "All Users Data",
    data: outArr,
    error: "",
  });
}

/*
        2. Get all Customers
*/
async function getAllCustomers(req, res) {
  const customersData = await user.findAll({
    where: { userTypeId: 1 },
    include: { model: wallet },
    order: [["id", "desc"]],
  });
  let outArr = [];
  customersData.map((dat) => {
    // let balance = dat.wallets.reduce((previousValue, curentValue) => previousValue + curentValue.amount, 0);
    let retObj = {
      id: dat.id,
      name: `${dat.firstName} ${dat.lastName}`,
      email: dat.email,
      phoneNum: `${dat.countryCode}${dat.phoneNum}`,
      status: dat.status === true ? "Active" : "Inactive",
      // balance: `${balance}`
    };
    outArr.push(retObj);
  });
  return res.json({
    status: "1",
    message: "All Customers Data",
    data: outArr,
    error: "",
  });
}

/*
        3. Get all drivers
*/
async function getAllDrivers(req, res) {
  try {
    const driversData = await user.findAll({
      where: { userTypeId: 2 },
      include: [
            {model:driverZone,attributes:['id'],include:{model:zone,attributes:['id','name'],include:[{model:zoneDetails, attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],}]}},
        { model: wallet },
        { model: driverEarning, attributes: ['totalEarning', 'availableBalance'] },
      ],
      order: [["id", "desc"]],
    });

    let outArr = [];

    driversData.forEach((dat) => { 
      

      const earnings = dat.driverEarning || {};  

      let totalEarning = earnings.totalEarning || 0;
      let availableBalance = earnings.availableBalance || 0;

      let retObj = {
        id: dat.id,
        name: `${dat.firstName} ${dat.lastName}`,
        email: dat.email,
        phoneNum: `${dat.countryCode}${dat.phoneNum}`,
        status: dat.status === true ? "Active" : "Inactive",
        totalEarning: `${totalEarning}`,
        availableBalance: `${availableBalance}`,
        units:dat?.driverZone?.zone?.zoneDetail
      };
      outArr.push(retObj);
    });

    return res.json({
      status: "1",
      message: "All Drivers Data",
      data: outArr,
      error: "",
    });
  } catch (error) {
    return res.json({
      status: "0",
      message: "Failed to retrieve drivers data",
      data: [],
      error: error.message,
    });
  }
}

/*
        4. Get all Employees
*/
async function getAllEmployees(req, res) {
  const employeesData = await user.findAll({
    where: { userTypeId: 4 },
    include: { model: role },
    order: [["id", "desc"]],
  });
//   return res.json(employeesData)
  let outArr = [];
  employeesData.map((dat) => {
    let retObj = {
      id: dat.id,
      name: `${dat.firstName} ${dat.lastName}`,
      email: dat.email,
      phoneNum: `${dat.countryCode}${dat.phoneNum}`,
      status: dat.status === true ? "Active" : "Inactive",
      role: dat.roleId ? dat.role.name : "Role not assigned",
    };
    outArr.push(retObj);
  });
  return res.json({
    status: "1",
    message: "All Employees Data",
    data: outArr,
    error: "",
  });
}
/*
        5. Add User
*/
async function addUser(req, res) {
  const {
    firstName,
    lastName,
    email,
    countryCode,
    phoneNum,
    password,
    roleId,
    userTypeId,
  } = req.body;
  
  const t = await SequelizeDB.transaction(); // Start transaction

  try {
    // Check if user with the same email and phoneNum exists
    const userExist = await user.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { [Op.and]: [{ countryCode: countryCode }, { phonenum: phoneNum }] },
        ],
      },
      transaction: t, // Ensure it's part of the transaction
    });

    if (userExist) {
      if (email === userExist.email)
        throw new CustomException(
          "Users exists",
          "The email you entered is already taken"
        );
      else
        throw new CustomException(
          "Users exists",
          "The phone number you entered is already taken"
        );
    }

    // Hash password and create user within the transaction
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await user.create({
      firstName,
      lastName,
      email,
      status: true,
      countryCode,
      phoneNum,
      password: hashedPassword,
      userTypeId,
      roleId,
    }, { transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "New user added",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction on error

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}

/*
        6. Get all active Roles
*/

async function allRoles(req,res){
    const roles = await role.findAll({});
    const response = ApiResponse("1","roles","",roles);
    return res.json(response)
}

async function changeStatusOfRole(req, res) {
    const { roleId, status } = req.body;
    const t = await SequelizeDB.transaction(); // Start a transaction

    try {
        const dd = await role.findOne({ where: { id: roleId }, transaction: t });

        if (dd) {
            dd.status = status;
            await dd.save({ transaction: t }); // Save within the transaction

            await t.commit(); // Commit the transaction

            const response = ApiResponse("1", "Role Updated", "", {});
            return res.json(response);
        } else {
            throw new Error("Role not found");
        }
    } catch (error) {
        await t.rollback(); // Rollback the transaction in case of error

        const response = ApiResponse("0", error.message, "", {});
        return res.json(response);
    }
}


async function roleDetails(req,res){
    const rolepermissions = await rolePermissions.findAll({where:{roleId : req.body.roleId}});
    let list = [];
    if(rolepermissions.length > 0){
        rolepermissions.map((dat)=>{
            list.push(dat.permissionId)
        })
    }
    const response = ApiResponse("1","Role permissions","",list);
    return res.json(response);
}

async function getAllActiveRoles(req, res) {
  const rolesData = await role.findAll({
    where: { status: true },
    attributes: ["id", "name"],
    order: [["id", "desc"]],
  });
  return res.json({
    status: "1",
    message: "All Roles",
    data: rolesData,
    error: "",
  });
}

/*
        7. Get Customer & Employee Details using Id
*/


/*
        8. Get driver details using ID
*/
function countRatings(orders) {
    // Initialize the counts for each rating value
    const ratingCounts = {
        10: 0,
        8: 0,
        6: 0,
        4: 0,
        2: 0
    };

    // Loop through each order and count the ratings
    orders.forEach(order => {
        if (order.value && ratingCounts.hasOwnProperty(order.value)) {
            ratingCounts[order.value] += 1;
        }
    });

    return ratingCounts;
}
async function getDriverDetails(req, res) {
  const userId = req.params.id;
  const userData = await user.findOne({
    where: { id: userId },
    required: false,
    include: [
        {model:driverZone,attributes:['id'],include:{model:zone,attributes:['id','name'],include:[{model:city,attributes:['id','name'],include:{model:country,attributes:['id','name']}},{model:zoneDetails, attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],}]}},
      { model: userType, required: false, attributes: ["name"] },
      {
        model: wallet,
        include:{model:unit,as:"currencyUnit",attributes:['symbol','shortCode']},
        required: false,
        attributes: ["id", "paymentType", "amount", "at"],
      },
      {
        model: driverDetails,
        required: false,
        where: { status: true },
        include: { model: serviceType, required: false, attributes: ["name"] },
        attributes: [
          "id",
          "profilePhoto",
          "licIssueDate",
          "licExpiryDate",
          "licNum",
          "licFrontPhoto",
          "licBackPhoto",
        ],
      },
      {
        model: vehicleDetails,
        required: false,
        where: { status: true },
        include: [
          { model: vehicleType, required: false, attributes: ["id", "name"] },
          {
            model: vehicleImages,
            as: "vehicleImages",
            attributes: ["name", "image"],
           
          },
          
        ],
        attributes: ["id", "make", "model", "registrationNum", "color"],
      },
    ],
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
      "status",
      "dob",
      "driverType",
      "language"
    ],
  });
  
  const allOrders = await order.findAll({
    where: { driverId: userId },
    include: [
      { model: orderStatus, attributes: ["name"] },
      {
        model: restaurant,
        include: {
        model: zoneRestaurants,
        attributes:['id'],
        include: {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        },
      },
        attributes: ["businessName"],
      },
    ],
    attributes: ["id", "orderNum", "scheduleDate", "total"],
  });
  // return res.json(allOrders)
  let riderRatings = await driverRating.findAll({
    where: { driverId: userId },
    include: [{ model: order, attributes: ["orderNum"] },{model:user,as:"userID",attributes:['firstName','lastName',"userName"]}],
    attributes: ["id", "value", "comment", "orderId","createdAt"],
  });
  //
  let balance = await driverEarning.findOne({where:{userId:userId}});
  let riderAvgRate = riderRatings.reduce(
    (previousValue, curentValue) => previousValue + curentValue.value,
    0
  );
  let avgRate = riderAvgRate / riderRatings.length;
  avgRate = avgRate ? avgRate.toFixed(2) : "No Rating";
  
  let commissions = await driverCommission.findAll({where:{userId:userId},attributes:['amount','distance'],include:[{model:restaurant,attributes:['businessName','id']}]});
  let outObj = {
    id: userData.id,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    countryCode: userData.countryCode,
    phoneNum: userData.phoneNum,
    status: userData.status,
    userType: userData.userType.name,
    driverUnits: userData?.driverZone?.zone?.zoneDetail,
    availableBalance: balance ? balance?.availableBalance : 0.0,
    totalEarning: balance ? balance?.totalEarning : 0.0,
    avgRate,
    transactions: userData?.wallets ? userData?.wallets : [],
    driverDetails: userData.driverDetails,
    vehicleDetails: userData.vehicleDetails,
    countRating:countRatings(riderRatings),
    feedbacks: riderRatings,
    allOrders:allOrders,
    commissions:commissions,
    dob:userData?.dob ?? "",
    language : userData?.language ?? "en",
    driverType : userData?.driverType ?? "",
    zoneName :  userData?.driverZone?.zone?.name,
    city:userData?.driverZone?.zone?.city?.name,
    country:userData?.driverZone?.zone?.city?.country?.name,
  };
  return res.json({
    status: "1",
    message: "Driver Details",
    data: outObj,
    error: "",
  });
}
/*
        9. Update user details
*/
async function updateUserDetails(req, res) {
  const { firstName, lastName, email, countryCode, phoneNum, password,language,dob,driverType } = req.body;
  const userId = parseInt(req.params.id);
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check if the email is already taken by another user
    const existEmail = await user.findOne({ where: { email: email }, transaction: t });
    if (existEmail && existEmail.id !== userId) {
      throw new CustomException("Users exists", "The email you entered is already taken");
    }

    // Check if the phone number is already taken by another user
    const existPhone = await user.findOne({
      where: { [Op.and]: [{ countryCode: countryCode }, { phonenum: phoneNum }] },
      transaction: t
    });
    if (existPhone && existPhone.id !== userId) {
      throw new CustomException("Users exists", "The phone number you entered is already taken");
    }

    // Fetch the user by ID
    let userData = await user.findOne({ where: { id: userId }, transaction: t });
    if (!userData) {
      await t.rollback(); // Rollback the transaction if the user is not found
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Update user details
    userData.firstName = firstName;
    userData.lastName = lastName;
    userData.email = email;
    userData.countryCode = `+${countryCode}`;
    userData.phoneNum = phoneNum;
    userData.dob = dob;
    userData.language = language;
    userData.driverType = driverType;
    
    if (password) {
      let hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
    }

    await userData.save({ transaction: t }); // Save user data within the transaction

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "User Information updated",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}

/*
        10. Ban User (Change user status to false)
*/
async function banUser(req, res) {
  const userId = req.params.id;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update user status in the database
    await user.update({ status: false }, { where: { id: userId }, transaction: t });

    // Now, delete the user's Redis data
    // Fetch the deviceToken(s) or keys associated with the user
    const redisKeys = await redis_Client.hKeys(`fom${userId}`);
    
    if (redisKeys.length > 0) {
      // Loop through the keys and delete them from Redis
      await Promise.all(
        redisKeys.map(async (key) => {
          await redis_Client.hDel(`fom${userId}`, key); // Delete the key for the user
        })
      );
    }

    // Commit the transaction after both database update and Redis deletion
    await t.commit();

    return res.json({
      status: "1",
      message: "User banned and Redis data deleted",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database or Redis error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}


/*
        11. Approve User (Change user status to true)
*/
async function approveUser(req, res) {
  const userId = req.params.id;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update user status within the transaction
    await user.update({ status: true }, { where: { id: userId }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "User Approved",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}

/*
        12. Get all active Roles with userType
*/
async function allActiveRoleswithType(req, res) {
  const rolesData = await role.findAll({
    where: { status: true },
    attributes: ["id", "name"],
    order: [["id", "desc"]],
  });
  let outArr = [];
  let obj = {
    roleId: null,
    name: "Customer",
    userTypeId: 1,
  };
  outArr.push(obj);
  rolesData.map((role) => {
    let tmpObj = {
      roleId: role.id,
      name: role.name,
      userTypeId: 4,
    };
    outArr.push(tmpObj);
  });
  return res.json({
    status: "1",
    message: "All Active roles",
    data: outArr,
    error: "",
  });
}
/*
        13. Update role
*/
async function updateRole(req, res) {
  const { roleId, userTypeId } = req.body;
  const userId = req.params.id;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update the user's role and userTypeId within the transaction
    await user.update({ roleId: roleId, userTypeId: userTypeId }, { where: { id: userId }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Role updated",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}


/*
        14. Get all restaurant owners
*/
async function getAllRestOwners(req, res) {
 const businessType = await orderApplication.findOne({
    where: { name: "restaurant" },
    order: [["id", "desc"]],
  });
  let list = [];
  let restList = await restaurant.findAll({where:[{businessType:businessType.id}],attributes:['businessName'],include:{model:user,attributes:['id','firstName','lastName','email','countryCode','phoneNum','status']}});
  return res.json({
    status: "1",
    message: "All Restaurant Owners Data",
    data: restList,
    error: "",
  });
}
async function getAllStoreOwners(req, res) {
  const businessType = await orderApplication.findOne({
    where: { name: "store" },
    order: [["id", "desc"]],
  });
  let list = [];
  let restList = await restaurant.findAll({where:[{businessType:businessType.id}],attributes:['businessName'],include:{model:user,attributes:['id','firstName','lastName','email','countryCode','phoneNum','status']}});
  return res.json({
    status: "1",
    message: "All Stores Owners Data",
    data: restList,
    error: "",
  });
}
//Module 6
/*
        1. Get all add on categories
*/
async function getAllAddOnCats(req, res) {
  const addOnData = await addOnCategory.findAll({
    order: [["id", "desc"]],
    attributes: ["id", "name", "status", "createdAt"],
  });

  return res.json({
    status: "1",
    message: "All Add-On Categories",
    data: addOnData,
    error: "",
  });
}

/*
        2. Edit/ Update add on category
*/
async function updateAddOn(req, res) {
  let id = parseInt(req.params.id);
  let { name } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check if an add-on with the same name already exists
    const addOnData = await addOn.findOne({
      where: { name: name },
      attributes: ["id", "name"],
      transaction: t, // Include this in the transaction
    });

    if (addOnData && id !== addOnData.id) {
      throw new CustomException(
        "Add-on category with this name exists",
        "Please try some other name"
      );
    }

    // Update add-on within the transaction
    await addOn.update({ name: name }, { where: { id: id }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Add-On Category Updated",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}

/*
        3. Change status of Add On Category
*/
async function changeAddOnCatStatus(req, res) {
  let id = req.params.id;
  let { status } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update add-on category status within the transaction
    await addOnCategory.update({ status: status }, { where: { id: id }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Status Updated",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}


/*
        4. Get all add on categories
*/
async function getAllAddOn(req, res) {
  const addOnData = await addOn.findAll({
    where: { orderApplicationName: "restaurant" },
    attributes: ["id", "name", "status", "createdAt"],
  });
  return res.json({
    status: "1",
    message: "All Add-Ons",
    data: addOnData,
    error: "",
  });
}
async function getAllAddOnStore(req, res) {
  const addOnData = await addOn.findAll({
    where: { orderApplicationName: "store" },
    attributes: ["id", "name", "status", "createdAt"],
  });
  return res.json({
    status: "1",
    message: "All Add-Ons",
    data: addOnData,
    error: "",
  });
}

/*
        5. Edit/ Update add on category
*/
async function updateAddOnCat(req, res) {
  let id = parseInt(req.params.id);
  let { name } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check if an add-on category with the same name already exists
    const addOnData = await addOnCategory.findOne({
      where: { name: name },
      attributes: ["id", "name"],
      transaction: t, // Include in the transaction
    });

    if (addOnData && id !== addOnData.id) {
      throw new CustomException(
        "Add-on category with this name exists",
        "Please try some other name"
      );
    }

    // Update add-on category name within the transaction
    await addOnCategory.update({ name: name }, { where: { id: id }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Add-On Category Updated",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}

/*
        6. Change status of Add On Category
*/
async function changeAddOnStatus(req, res) {
  let id = req.params.id;
  let { status } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update add-on status within the transaction
    await addOn.update({ status: status }, { where: { id: id }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Status Updated",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}


// Module 7- Taxi App
//1. Add Vehicle Type
async function addVehicleType(req, res) {
  const { name ,maxCoverageArea,minCoverageArea} = req.body;
  let imagePathTemp = req.file.path;
  let imagePath = imagePathTemp.replace(/\\/g, "/");
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Create a new vehicle type within the transaction
    await vehicleType.create(
      { name,maxCoverageArea,minCoverageArea, status: true, image: imagePath, baseRate: 0, perUnitRate: 0 },
      { transaction: t }
    );

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Vehicle Added",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database Error",
      data: {},
      error: "Error adding to database",
    });
  }
}

async function updateVehicleType(req, res) {
  const { name, id,minCoverageArea,maxCoverageArea } = req.body;
  let imagePathTemp = req.file.path;
  let imagePath = imagePathTemp.replace(/\\/g, "/");
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Fetch the vehicle type within the transaction
    let type = await vehicleType.findOne({ where: { id: id }, transaction: t });

    if (type) {
      // Remove the old image if it exists
      if (type.image) {
        fs.unlink(type.image, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }

      // Update the vehicle type details
      type.name = name;
      type.image = imagePath;
      type.minCoverageArea = minCoverageArea;
      type.maxCoverageArea = maxCoverageArea;

      await type.save({ transaction: t }); // Save within the transaction

      await t.commit(); // Commit the transaction

      return res.json({
        status: "1",
        message: "Vehicle Type Updated",
        data: {},
        error: "",
      });
    } else {
      await t.rollback(); // Rollback the transaction if not found

      let response = ApiResponse("0", "Not found", {}, {});
      return res.json(response);
    }

  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database Error",
      data: {},
      error: "Error updating database",
    });
  }
}


// 2. Get All vehicle Types
async function getAllVehicles(req, res) {
  const allVehicles = await vehicleType.findAll({
    order: [["id", "desc"]],
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  return res.json({
    status: "1",
    message: "All Vehicles",
    data: allVehicles,
    error: "",
  });
}

//3. Change Status of vehicle
async function changeStatusVehicle(req, res) {
  let { status, vehicleId } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update the vehicle status within the transaction
    await vehicleType.update({ status: status }, { where: { id: vehicleId }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: `Vehicle status changed to ${status}`,
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database Error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}

//4. Update Vehicle
async function updateVehicle(req, res) {
  const { name, baseRate, perUnitRate, vehicleId } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    let updateData = { name, status: true, baseRate, perUnitRate };

    if (req.file) {
      let imagePathTemp = req.file.path;
      let imagePath = imagePathTemp.replace(/\\/g, "/");
      updateData.image = imagePath; // Include the image path if a new file is uploaded
    }

    // Update the vehicle type within the transaction
    await vehicleType.update(updateData, { where: { id: vehicleId }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Vehicle Updated",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database Error",
      data: {},
      error: "Error updating the database",
    });
  }
}


//Module 8- Orders
/*
        1. Get all orders
*/
async function getAllOrders(req, res) {
 // Calculate the date 30 days ago from today
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orderData = await order.findAll({
    where: {
      createdAt: {
        [Op.gte]: thirtyDaysAgo, // Greater than or equal to thirtyDaysAgo
      },
    },
    order: [["id", "desc"]],
    include: [
      { model: orderApplication, attributes: ["id", "name"] },
      { model: orderMode, attributes: ["name"] },
      { model: paymentMethod, attributes: ["name"] },
      { model: orderStatus, attributes: ["name"] },
      {
        model: restaurant,
        include: {
        model: zoneRestaurants,
        include:[ {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        }],
      },
        attributes: ["businessName"],
      },
      {
      model: user,
      as: "DriverId",
      attributes: [
        "firstName",
        "lastName",
        "countryCode",
        "phoneNum",
        "email",
        "driverType",
        "image"
      ],
    }
    ],
    attributes: ["id", "orderNum", "scheduleDate", "total"],
  });

  return res.json({
    status: "1",
    message: "Orders created in the last 30 days",
    data: orderData,
    error: "",
  });
}
async function filterOrders(req, res) {
  const { country, zoneId, city, businessType, startDate, endDate, driverType } = req.body;

  // Build the where clause based on the request body parameters
  const whereClause = {};
  if (country) {
    whereClause['$restaurant.country$'] = country;
  }
  if (zoneId) {
    whereClause['$restaurant.zoneRestaurant.zone.id$'] = zoneId;
  }
  if (city) {
    whereClause['$restaurant.city$'] = city;
  }
  if (businessType) {
    whereClause['$restaurant.businessType$'] = businessType;
  }
  if (startDate && endDate) {
    whereClause.createdAt = {
      [Op.between]: [new Date(startDate), new Date(endDate)], // Filter createdAt between startDate and endDate
    };
  } else if (startDate) {
    whereClause.createdAt = {
      [Op.gte]: new Date(startDate), // Filter createdAt greater than or equal to startDate
    };
  } else if (endDate) {
    whereClause.createdAt = {
      [Op.lte]: new Date(endDate), // Filter createdAt less than or equal to endDate
    };
  }
  if (driverType) {
    whereClause['$DriverId.driverType$'] = driverType;
  }

  // Fetch orders with applied filters
 
  const orderData = await order.findAll({
    where: whereClause,
    order: [['id', 'desc']],
   include: [
      { model: deliveryType },
      {
        model: user,
        as: "DriverId",
        attributes: ['id', 'userName', 'firstName', 'lastName', 'email', 'driverType']
      },
      { model: orderType },
      { model: orderStatus },
      { model: orderMode },
      
      { model: orderCharge },
      {
        model: user,
        attributes: ['firstName', 'lastName', 'userName']
      },
        
      {
        model: restaurant,
        attributes: ['businessName', 'packingFee'],
        include: {
          model: zoneRestaurants,
          include: {
            model: zone,
            attributes: ["id"],
            include: {
              model: zoneDetails,
              attributes: ["id"],
              include: [
                { model: unit, as: "distanceUnit" },
                { model: unit, as: "currencyUnit" },
              ],
            },
          },
        },
      },
    ],
    
  });

  return res.json({
    status: '1',
    message: 'Filtered Orders',
    data: {orders:orderData},
    error: '',
  });
}


async function getAllOrdersTaxi(req, res) {
  const orderData = await order.findAll({
    include: [
      {
        model: orderApplication,
        where: { name: "taxi" },
        attributes: ["id", "name"],
      },
      { model: orderMode, attributes: ["name"] },
      { model: paymentMethod, attributes: ["name"] },
      { model: orderStatus, attributes: ["name"] },
    ],
    attributes: ["id", "orderNum", "scheduleDate", "total"],
  });
  // return res.json(orderData)
  return res.json({
    status: "1",
    message: "All Orders Taxi",
    data: orderData,
    error: "",
  });
}
async function getScheduledOrdersTaxi(req, res) {
  const orderData = await order.findAll({
    include: [
      {
        model: orderApplication,
        where: { name: "taxi" },
        attributes: ["id", "name"],
      },
      { model: orderMode, where: { name: "Scheduled" }, attributes: ["name"] },
      { model: paymentMethod, attributes: ["name"] },
      { model: orderStatus, attributes: ["name"] },
    ],
    attributes: ["id", "orderNum", "scheduleDate", "total"],
  });
  // return res.json(orderData)
  return res.json({
    status: "1",
    message: "All Orders Taxi",
    data: orderData,
    error: "",
  });
}

async function getCompletedOrdersTaxi(req, res) {
  const orderData = await order.findAll({
    include: [
      {
        model: orderApplication,
        where: { name: "taxi" },
        attributes: ["id", "name"],
      },
      { model: orderMode, attributes: ["name"] },
      { model: paymentMethod, attributes: ["name"] },
      { model: orderStatus, where: { name: "Ride end" }, attributes: ["name"]},
    ],
    attributes: ["id", "orderNum", "scheduleDate", "total"],
  });
  // return res.json(orderData)
  return res.json({
    status: "1",
    message: "All Orders Taxi",
    data: orderData,
    error: "",
  });
}
/*
        2. Get Order Details by Id
*/
function calculateDeliveryTime(orderData) {
    let placedTime = null;
    let deliveredTime = null;

    // Loop through each order status entry
    orderData.forEach(entry => {
        if (entry.orderStatus.name === "Placed") {
            placedTime = new Date(entry.time);
        }
        if (entry.orderStatus.name === "Delivered") {
            deliveredTime = new Date(entry.time);
        }
    });

    // If the order is delivered, calculate the time difference
    if (placedTime && deliveredTime) {
        const timeDiff = (deliveredTime - placedTime) / (1000 * 60); // Convert milliseconds to minutes
        return ` ${Number(timeDiff).toFixed(0)} mints.`;
    } else {
        return "Not Delivered Yet";
    }
}
async function getOrderDetails(req, res) {
  let { orderId } = req.body;
  //if Application ID is 1 return food delivery Data
  
    const orderDetails = await order.findByPk(orderId, {
  include: [
      {model:driverRating,attributes:['value','comment']},
    {
      model: restaurant,
      attributes: ["businessName", "address","lat","lng","approxDeliveryTime",'logo','image',"rating","countryCode","phoneNum","isOpen"],
      include: [{model:time,attributes:['day','startAt','endAt']},{
        model: zoneRestaurants,
        include:[ {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        }],
      }],
    },
    {
      model: user,
      attributes: ["userName", "email", "countryCode", "phoneNum","image"],
    },
    {
      model: user,
      as: "DriverId",
      attributes: [
        "firstName",
        "lastName",
        "countryCode",
        "phoneNum",
        "email",
        "driverType",
        "image"
      ],
    },
    {
      model: address,
      as: "dropOffID",
      attributes: ["streetAddress", "city", "state", "lat", "lng"],
    },
    {
      model: orderStatus,
      attributes: ["name"],
    },
    {
      model: deliveryType,
      attributes: ["name"],
    },
    {
      model: orderType,
      attributes: ["type"],
    },
    {
      model: paymentMethod,
      attributes: ["name"],
    },
    {
      model: orderMode,
      attributes: ["name"],
    },
    {
      model: orderCharge,
    },
    {
      model: orderHistory,
      attributes: ["time"],
      include: [
        {
          model: orderStatus,
          attributes: ["name"],
        },
        {
          model: user,
          as: "cancelledBY",
          attributes: ["firstName", "lastName"],
        },
      ],
    },
    {model:orderCultery,attributes:['id'],include:{model:cutlery}},
    {
      model: orderItems,
      include: [
        { model: R_PLink },
        {
          model: orderAddOns,
          include: {
            model: addOn,
            include:{model:collectionAddons,attributes:['id'],include:{model:collection}}
          },
        },
      ],
    },
  ],
});

    const firebase_data = await axios.get(process.env.FIREBASE_URL);
    const driverLatLng = firebase_data.data?.[orderDetails?.driverId] || {};
   
    const response = ApiResponse("1","Order Details","",orderDetails);
   response.driverLatLng = driverLatLng;
   response.timeTaken = calculateDeliveryTime(orderDetails?.orderHistories);
    return res.json(response);
    
    
    
    
    //return res.json(orderDetails)
    let itemArr = [];
    orderDetails.orderItems.map((oi, idx) => {
      let itemPrice = parseFloat(oi.total);
      let addOnArr = [];
      //manipulating addons
      oi.orderAddOns.map((oao, ind) => {
        itemPrice = itemPrice + parseFloat(oao.total);
        let addOnObj = {
          name: oao.P_A_ACLink.addOn.name,
          price: oao.total,
        };
        addOnArr.push(addOnObj);
      });
      let itemObj = {
        itemName: oi.R_PLink.name,
        quantity: oi.quantity,
        itemPrice: itemPrice,
        addOns: addOnArr,
      };
      itemArr.push(itemObj);
    });
    //Calculation order complete time
    if (orderDetails.orderStatusId === 7) {
      //console.log(orderDetails.orderHistories[orderDetails.orderHistories.length-1].time)
      let startTime = new Date(orderDetails.orderHistories[0].time);
      let endTime = new Date(
        orderDetails.orderHistories[orderDetails.orderHistories.length - 1].time
      );
      var diff = Math.abs(endTime - startTime);
      diff = new Date(diff);
      //console.log('Time', diff.getMinutes())
    }
    let outObj = {
      orderNum: orderDetails.orderNum,
      restaurantName: orderDetails.restaurant.businessName,
      restaurantAddress: orderDetails.restaurant?.address,
      averageDeliveryTime: orderDetails.restaurant?.approxDeliveryTime,
      orderDate: orderDetails.scheduleDate,
      customerDetails: {
          userName : orderDetails.user?.userName,
       
        email: orderDetails.user.email,
        contact: `${orderDetails.user?.countryCode}${orderDetails?.user.phoneNum}`,
      },
      deliveryAddress: orderDetails.dropOffID?.streetAddress,
      status: orderDetails.orderStatus.name,
      orderType: orderDetails.deliveryType.name,
      paymentMethod: orderDetails.paymentMethod.name,
      note: orderDetails.note,
      paymentMethodName: orderDetails.paymentMethodName ?? "No Data",
      items: itemArr,
      unit: orderDetails.restaurant.currencyUnitID.symbol,
      subTotal: orderDetails.orderCharge.basketTotal,
      orderCharge : orderDetails.orderCharge,
      discount: orderDetails.orderCharge.discount,
      VAT: orderDetails.orderCharge.VAT,
      deliveryCharge: orderDetails.orderCharge.deliveryFees,
      serviceCharges: orderDetails.orderCharge.serviceCharges,
      total: orderDetails.orderCharge.total,
      storeEarnings: orderDetails.orderCharge.restaurantEarnings,
      driverEarnings: orderDetails.orderCharge.driverEarnings,
       driverName: `${orderDetails.DriverId?.firstName} ${orderDetails.DriverId?.lastName}`,
      driverPhone: `${orderDetails.DriverId?.countryCode} ${orderDetails.DriverId?.phoneNum}`,
      driverEmail: `${orderDetails.DriverId.email} `,
      driverType: `${orderDetails.DriverId.driverType} `,
      adminEarnings: orderDetails.orderCharge.adminEarnings,
      distRestToCust: orderDetails.distance,
      assignedDriverName: orderDetails.driverId
        ? `${orderDetails.DriverId?.firstName} ${orderDetails.DriverId?.lastName}`
        : "No driver assigned yet",
      assignedDriverPhoneNUm: orderDetails.driverId
        ? `${orderDetails.DriverId?.countryCode} ${orderDetails.DriverId?.phoneNum}`
        : "No driver assigned yet",
      OrderTimeStamps: orderDetails.orderHistories,
      OrderCompletedIn:
        orderDetails.orderStatusId === 7 ? diff.getMinutes() : "Incomplete",
      cancelledBy:
        orderDetails.orderStatusId === 12
          ? orderDetails.orderHistories[orderDetails.orderHistories.length - 1]
              .cancelledBY
            ? `${
                orderDetails.orderHistories[
                  orderDetails.orderHistories.length - 1
                ].cancelledBY.firstName
              } ${
                orderDetails.orderHistories[
                  orderDetails.orderHistories.length - 1
                ].cancelledBY.lastName
              }`
            : "Auto cancel"
          : "",
    };
    return res.json({
      status: "1",
      message: "Order details of Food",
      data: outObj,
      error: "",
    });
}
async function getCustEmpDetails(req, res) {
  const userId = req.params.id;
  const userData = await user.findOne({
    where: { id: userId },
    include: [
      { model: userType, attributes: ["name"] },
      { model: role },
      { model: Credit },
      { model: wallet, attributes: ["id", "paymentType", "amount", "at","orderId"],include:{model:order,attributes:['id'],include:{model:restaurant,attributes:['id'],include: {
        model: zoneRestaurants,attributes:['id'],
        include: {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        },
      }}} },
    ],
    attributes: [
      "id",
      "firstName",
      "password",
      "lastName",
      "email",
      "countryCode",
      "phoneNum",
      "status",
      "userTypeId",
      "roleId",
      "referalCode",
      "signedFrom",
      "image"
    ],
  });
  const orderData = await order.findAll({
    where: { userId: userId },
    include: [
      { model: orderStatus, attributes: ["name"] },
      {
        model: restaurant,
       include: {
        model: zoneRestaurants,
        include: {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        },
      },
        attributes: ["businessName"],
      },
    ],
    attributes: ["id", "orderNum", "orderStatusId", "scheduleDate", "total"],
  });
  
  let creditUsers = await user.findAll({where:{usedReferalCode:userData?.referalCode},attributes:['id','firstName','lastName','email','userName','countryCode','phoneNum'],include:{model:userType,attributes:['name']}});
  
   let driverzone = await driverZone.findOne({where:{userId : userId},include: {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        },})
       
  let userDetails = {
    id: `${userData.id}`,
    firstName: userData.firstName,
    password: userData.password,
    lastName: userData.lastName,
    email: userData.email,
    countryCode: userData.countryCode,
    phoneNum: userData.phoneNum,
    userType: userData.userType.name,
    units:driverzone?.zone?.zoneDetail,
    signedFrom: userData.userType.signedFrom ?? "email",
    credit: userData?.Credit,
    image:userData?.image ?? null,

    status: userData.status === true ? "Active" : "Inactive",
    
  };
  let userRole = userData.role?.name ?? "No Role";
  let balance = userData.wallets.reduce(
    (previousValue, curentValue) => previousValue + curentValue.amount,
    0
  );
  return res.json({
    status: "1",
    message: "User Details by ID",
    data: {
      userDetails,
      creditUsers:creditUsers,
      userRole,
      balance: balance.toFixed(2),
      transactions: userData.wallets,
      orderData,
    },
    error: "",
  });
}
// async function restAllOrders(req,res){
//     let type = await orderApplication.findOne({where:{name:"restaurant"}});
//     let orders = await order.findAll({include:[{model:user,as:"driverID",attributes:['id','userName','firstName','lastName','email','driverType']},{model:orderType},{model:orderStatus},{model:orderMode},{model:orderCharge},{model:user,attributes:['firstName','lastName','userName']},{model:restaurant,include: {
//         model: zoneRestaurants,
//         include: {
//           model: zone,
//           attributes: ["id"],
//           include: {
//             model: zoneDetails,
//             attributes: ["id"],
//             include: [
//               { model: unit, as: "distanceUnit" },
//               { model: unit, as: "currencyUnit" },
//             ],
//           },
//         },
//       },attributes:['businessName','packingFee'],where:{businessType:type.id}}]});
//     let data ={
//         orders
//     }
//     let response = ApiResponse("1","Restaurant All Orders","",data);
//     return res.json(response);
// }
//3. Update contact us email
async function contactUsEmail(req, res) {
  const { email } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update the email setting within the transaction
    await setting.update({ value: email }, { where: { content: "email" }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Email Updated",
      body: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database Error",
      body: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}

//3. Update contact us Phone

async function contactUsPhone(req, res) {
  const { phone } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update the phone setting within the transaction
    await setting.update({ value: phone }, { where: { content: "phone" }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Phone Updated",
      body: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database Error",
      body: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}
// Module 9 - Promotions
/* 
        1. Add Voucher
*/
async function addVoucher(req, res) {
  let {
    code,
    value,
    type,
    from,
    to,
    conditionalAmount,
    storeApplicable,
    unitId,
  } = req.body;

  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check if a voucher with the same code already exists
    const exist = await voucher.findOne({ where: { code: code }, transaction: t });
    if (exist) {
      throw new CustomException(
        "Voucher with same voucher-code already exists",
        "Please try some other name"
      );
    }

    storeApplicable = storeApplicable.toString();

    // Create the voucher within the transaction
    const data = await voucher.create(
      {
        code,
        value,
        type,
        from,
        to,
        conditionalAmount,
        storeApplicable,
        status: true,
        unitId,
      },
      { transaction: t }
    );

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Voucher Added",
      data: data,
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Error adding Voucher",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}

/*
        2. Get all vouchers
*/
async function getAllVouchers(req, res) {
  const AllVouchers = await voucher.findAll({
    attributes: [
      "id",
      "code",
      "value",
      "type",
      "to",
      "from",
      "storeApplicable",
      "status",
      "conditionalAmount",
    ],
  });
  
  
 return res.json({
    status: "1",
    message: "All Vouchers",
    data: AllVouchers,
    error: "",
  });
  // const resr =await  restaurant.findAll({
  //     where: {
  //       id: {
  //         [Op.or]: [1 , 2]
  //       }
  //     }
  //   })
  let allVouchers = AllVouchers.map((ele) => {
    if (ele.storeApplicable === "all") {
      ele.storeApplicable = "All restaurants";
    } else {
      let arr = ele.storeApplicable.split(",");
      ele.storeApplicable = arr.length.toString();
    }
    return ele;
  });
  return res.json({
    status: "1",
    message: "All Vouchers",
    data: allVouchers,
    error: "",
  });
}

/*
        3. Delete/Change Status of Voucher
*/
async function changeStatusOfVoucher(req, res) {
  let { status, voucherId } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update the voucher status within the transaction
    await voucher.update({ status: status }, { where: { id: voucherId }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: `Status changed to ${status}`,
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error
    return res.json({
      status: "0",
      message: "Database Error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}


/* 
        4. Update Voucher
*/
async function updateVoucher(req, res) {
  let {
    code,
    value,
    type,
    from,
    to,
    conditionalAmount,
    storeApplicable,
    status,
    voucherId,
  } = req.body;

  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check if a voucher with the same code already exists, excluding the current voucher
    const exist = await voucher.findOne({
      where: { code: code, [Op.not]: [{ id: voucherId }] },
      transaction: t, // Include this in the transaction
    });

    if (exist) {
      throw new CustomException(
        "Voucher with same voucher-code already exists",
        "Please try some other name"
      );
    }

    storeApplicable = storeApplicable.toString();

    // Update the voucher within the transaction
    await voucher.update(
      {
        code,
        value,
        type,
        from,
        to,
        conditionalAmount,
        status,
        storeApplicable,
      },
      { where: { id: voucherId }, transaction: t }
    );

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Voucher updated",
      data: {},
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Error updating Voucher",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}

/*
        5. Voucher associated restaurants
*/
async function voucherAssocaitedRest(req, res) {
  let voucherId = req.params.id;
  const voucherData = await voucher.findByPk(voucherId, {
    attributes: ["storeApplicable"],
  });
  let restArr =
    voucherData.storeApplicable === "all"
      ? "All restaurants"
      : voucherData.storeApplicable.split(",");
  if (restArr === "All restaurants") {
    return res.json({
      status: "1",
      message: "Associated Restaurants",
      body: {
        restData: "All restaurants",
      },
      error: "",
    });
  }
  const resr = await restaurant.findAll({
    where: { id: { [Op.or]: restArr } },
    attributes: ["businessName"],
  });
  return res.json({
    status: "1",
    message: "Associated Restaurants",
    body: {
      restData: resr,
    },
    error: "",
  });
}

/*
        6. Push Notifications 
*/
async function pushNotifications(req, res) {
  const { title, body, to } = req.body;
  let senderData = [];
  if (to === "all")
    senderData = await user.findAll({
      where: { status: true, [Op.or]: [{ userTypeId: 1 }, { userTypeId: 2 }] },
      attributes: ["deviceToken", "userTypeId"],
    });
  if (to === "users")
    senderData = await user.findAll({
      where: { status: true, userTypeId: 1 },
      attributes: ["deviceToken"],
    });
  if (to === "drivers")
    senderData = await user.findAll({
      where: { status: true, userTypeId: 2 },
      attributes: ["deviceToken"],
    });

  let DVS = [];
  senderData.map((ele) => {
    if (ele.deviceToken) DVS.push(ele.deviceToken);
  });
  let notification = {
    title: title,
    body: body,
  };
  sendNotification(DVS, notification);
  let dt = new Date();
  pushNotification.create({ at: dt, to, title, body });
  return res.json({
    status: "1",
    message: `Notification sent to ${to}`,
    data: "",
    error: "",
  });
}
/*
        7. Get all sent push notifications
*/
async function getAllPushNot(req, res) {
  const allNotData = await pushNotification.findAll({
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  return res.json({
    status: "1",
    message: "All Push Notifications",
    data: allNotData,
    error: "",
  });
}

// Module 10 - Dash Board
/*
        1.  Get dashbaord data Stats
*/
async function dashbaordStats(req, res) {
  // getting all users
  const allUsers = await user.findAll({
    where: { status: true, userTypeId: [1, 2] },
    attributes: ["userTypeId"],
  });
  //getting all restaurants
  const allRestaurants = await restaurant.findAll({
    where: { status: true },
    attributes: ["id"],
  });
  //getting all orders
  const allOrders = await order.findAll({ attributes: ["orderStatusId"] });
  let allCustomers = allUsers.filter((ele) => ele.userTypeId == 1);
  let allDrivers = allUsers.filter((ele) => ele.userTypeId == 2);
  let allCompletedOrders = allOrders.filter(
    (ele) =>
      ele.orderStatusId == 7 ||
      ele.orderStatusId == 10 ||
      ele.orderStatusId == 11
  );
  let allCancelledOrders = allOrders.filter((ele) => ele.orderStatusId == 12);
  let latest_users = await user.findAll({
    limit: 5,
    order: [["createdAt", "DESC"]],
  });

  let latest_orders = await order.findAll({
    limit: 5,
    include: [
      { model: unit, as: "currencyUnitID" },
      { model: orderStatus },
      { model: orderItems, include: { model: R_PLink, attributes: ["image"] } },
    ],
    order: [["createdAt", "DESC"]],
  });

  return res.json({
    status: "1",
    message: "Stats Admin",
    data: {
      numOfCustomers: allCustomers.length,
      numOfDrivers: allDrivers.length,
      numOfStores: allRestaurants.length,
      allCompletedOrders: allCompletedOrders.length,
      allCancelledOrders: allCancelledOrders.length,
      allOngoingOrders:
        allOrders.length -
        allCompletedOrders.length -
        allCancelledOrders.length,
      latest_users: latest_users,
      latest_orders: latest_orders,
    },
    error: "",
  });
}

/*
        2.  Get most rated items
*/
async function topItems(req, res) {
  const restByRatings = await restaurantRating.findAll({
    include: { model: restaurant, attributes: ["logo", "businessName"] },
    attributes: [[sequelize.fn("avg", sequelize.col("value")), "Ratings"]],
    group: ["restaurantId"],
    order: sequelize.literal("Ratings DESC"),
  });

  const driverByRatings = await Sequelize.query(
    "SELECT AVG(driverRatings.value) AS rating, driverRatings.driverId, (SELECT users.firstName FROM users WHERE users.id = driverRatings.driverId ) AS firstName, (SELECT driverDetails.profilePhoto FROM driverDetails WHERE driverDetails.userId = driverRatings.driverId ) AS profilePhoto FROM driverRatings GROUP BY driverRatings.driverId ORDER BY rating DESC",
    { type: sequelize.QueryTypes.SELECT }
  );
  //return res.json(driverByRatings)
  const mostSoldItems = await orderItems.findAll({
    include: { model: R_PLink, attributes: ["name", "image"] },
    attributes: [[sequelize.fn("sum", sequelize.col("quantity")), "prodQuan"]],
    group: "RPLinkId",
    order: sequelize.literal("prodQuan DESC"),
  });
  return res.json({
    status: "1",
    message: "Most Rated Data",
    data: {
      mostRatedRestaurant: restByRatings.splice(0, 5),
      mostRatedDrivers: driverByRatings.splice(0, 5),
      mostSoldItems: mostSoldItems.splice(0, 5),
    },
    error: "",
  });
}

// Module 11
/*
        1. Restaurant wise Earnings
*/
async function earningAllRestaurants(req, res) {
  const allRestaurants = await restaurant.findAll({
    include: [
      { model: unit, as: "currencyUnitID", attributes: ["symbol"] },
      {
        model: order,
        where: { orderStatusId: 7 },
        include: {
          model: orderCharge,
          attributes: ["adminEarnings", "restaurantEarnings"],
        },
        attributes: ["total"],
      },
      { model: wallet, attributes: ["amount"] },
    ],
    attributes: [
      "id",
      "businessName",
      "name",
      "address",
      "city",
      "logo",
      "comission",
    ],
  });
  let allRestaurantsData = [];
  allRestaurants.map((ele) => {
    let restEarningsBeforeComms = ele.orders.reduce(
      (pVal, cVal) => pVal + parseFloat(cVal.total),
      0
    );
    let restEarningsAfterComms = ele.orders.reduce(
      (pVal, cVal) => pVal + parseFloat(cVal.orderCharge.restaurantEarnings),
      0
    );
    let adminEarnings = ele.orders.reduce(
      (pVal, cVal) => pVal + parseFloat(cVal.orderCharge.adminEarnings),
      0
    );
    let balance = ele.wallets.reduce((pVal, cVal) => pVal + cVal.amount, 0);
    let restObj = {
      restId: ele.id,
      restName: ele.businessName,
      ownerName: ele.name,
      address: ele.address,
      city: ele.city,
      logo: ele.logo,
      adminCommission: `${ele.comission}%`,
      restUnit: ele.currencyUnitID.symbol,
      restEarningsBeforeComms: restEarningsBeforeComms.toFixed(2),
      restEarningsAfterComms: restEarningsAfterComms.toFixed(2),
      adminEarnings: adminEarnings.toFixed(2),
      // reversing the symbol as +ve shows --> restaurant has to receive & -ve shows --> restaurant has to pay
      balance: -1 * balance.toFixed(2),
    };
    allRestaurantsData.push(restObj);
  });
  return res.json({
    status: "1",
    message: "Restaurant wise earnings",
    data: allRestaurantsData,
    error: "",
  });
}
/*
        2. Restaurant wise payout requests uisng rest Id
*/
async function payoutRequestsByRest(req, res) {
  const restId = req.params.id;
  const allPayouts = await payout.findAll({
    where: { restaurantId: restId },
    include: { model: unit, attributes: ["symbol"] },
  });
  return res.json({
    status: "1",
    message: "All payout resuest by a restaurant",
    data: allPayouts,
    error: "",
  });
}

/*
        Get All Charges
*/
async function get_charges(req, res) {
  const data = await charge.findAll();
  return res.json({
    status: "1",
    message: "All Charges",
    data: data,
    error: "",
  });
}

/*
        Update Charge
*/
async function update_charge(req, res) {
  const chargeId = req.body.chargeId;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update the charge details within the transaction
    const data = await charge.update(
      {
        title: req.body.title,
        value: req.body.value,
        amount: req.body.amount,
      },
      {
        where: { id: chargeId },
        transaction: t, // Include in the transaction
      }
    );

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Charge Updated",
      data: data,
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Error updating charge",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}
/*
        Get Social Links
*/
async function get_social_links(req, res) {
  const data = await socialLink.findAll();
  return res.json({
    status: "1",
    message: "Social Links",
    data: data,
    error: "",
  });
}

/*
        Update Social Links
*/
async function update_social_links(req, res) {
  const { facebook, twitter, linkedin, instagram, whatsapp } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction
  try {
    // Update each social link within the transaction
    await socialLink.update({ link: facebook }, { where: { social: "facebook" }, transaction: t });
    await socialLink.update({ link: twitter }, { where: { social: "twitter" }, transaction: t });
    await socialLink.update({ link: instagram }, { where: { social: "instagram" }, transaction: t });
    await socialLink.update({ link: linkedin }, { where: { social: "linkedin" }, transaction: t });
    await socialLink.update({ link: whatsapp }, { where: { social: "whatsapp" }, transaction: t });
    const data = await socialLink.findAll({ transaction: t }); // Fetch updated data within the transaction

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Social Links Updated",
      data: data,
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Error updating social links",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}


/*
        Get App Links
*/
async function get_app_links(req, res) {
  const data = await appLink.findAll();
  return res.json({
    status: "1",
    message: "app Links",
    data: data,
    error: "",
  });
}

/*
        Update app Links
*/
async function update_app_links(req, res) {
  const { ios, andriod } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update the iOS and Android app links within the transaction
    await appLink.update({ link: ios }, { where: { app: "ios" }, transaction: t });
    await appLink.update({ link: andriod }, { where: { app: "andriod" }, transaction: t });
    const data = await appLink.findAll({ transaction: t }); // Fetch updated data within the transaction
    await t.commit(); // Commit the transaction
    return res.json({
      status: "1",
      message: "App Links Updated",
      data: data,
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of error
    return res.json({
      status: "0",
      message: "Error updating app links",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}


/*
        Get App Pages
*/
async function get_app_pages(req, res) {
  const data = await appPage.findAll();
  return res.json({
    status: "1",
    message: "app Pages",
    data: data,
    error: "",
  });
}

/*
        Update app Pages
*/
async function update_app_pages(req, res) {
  const { terms, policy, about } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update app pages within the transaction
    await appPage.update({ content: terms }, { where: { page: "terms" }, transaction: t });
    await appPage.update({ content: policy }, { where: { page: "policy" }, transaction: t });
    await appPage.update({ content: about }, { where: { page: "about" }, transaction: t });

    const data = await appPage.findAll({ transaction: t }); // Fetch updated data within the transaction

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "App Pages Updated",
      data: data,
      error: "",
    });

  } catch (err) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Error updating app pages",
      data: {},
      error: `${err.message}. Please try again later.`,
    });
  }
}


async function add_permission(req, res) {
  const { title } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check if the permission already exists within the transaction
    const check = await permissions.findOne({ where: { title: title }, transaction: t });
    if (check) {
      await t.rollback(); // Rollback the transaction if permission exists

      return res.json({
        status: "0",
        message: "Permission already exists",
        data: {},
        error: "",
      });
    }

    // Create and save the new permission within the transaction
    const perm = new permissions();
    perm.title = title;
    perm.status = true;
    
    await perm.save({ transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Added successfully!",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Error adding permission",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}


async function get_permissions(req, res) {
  const perm = await permissions.findAll({ order: [["id", "desc"]] });
  return res.json({
    status: "1",
    message: "All Permissions",
    data: perm,
    error: "",
  });
}

async function changePermissionStatus(req, res) {
  const { id, status } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the permission within the transaction
    const dd = await permissions.findOne({ where: { id: id }, transaction: t });
    if (dd) {
      dd.status = status;

      // Save the updated permission within the transaction
      await dd.save({ transaction: t });

      await t.commit(); // Commit the transaction

      const response = ApiResponse("1", "Status Updated successfully", {}, {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if the permission is not found
      return res.json({
        status: "0",
        message: "Permission not found",
        data: {},
        error: "",
      });
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: error.message,
      data: {},
      error: "",
    });
  }
}


async function updatePermission(req, res) {
  const { id, title } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the permission within the transaction
    const dd = await permissions.findOne({ where: { id: id }, transaction: t });

    if (dd) {
      dd.title = title;

      // Save the updated permission within the transaction
      await dd.save({ transaction: t });

      await t.commit(); // Commit the transaction

      const response = ApiResponse("1", "Permission Updated successfully", {}, {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if the permission is not found
      return res.json({
        status: "0",
        message: "Permission not found",
        data: {},
        error: "",
      });
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: error.message,
      data: {},
      error: "",
    });
  }
}


async function assign_permissions_to_role(req, res) {
  const { roleId, permissions } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find and delete existing role permissions within the transaction
    const toBeDeleted = await rolePermissions.findAll({ where: { roleId: roleId }, transaction: t });
    await Promise.all(toBeDeleted.map(record => record.destroy({ transaction: t })));

    // Loop through the permissions array and assign each one to the role
    for (let i = 0; i < permissions.length; i++) {
      const check = await rolePermissions.findOne({
        where: { roleId: roleId, permissionId: permissions[i] },
        transaction: t,
      });

      if (check) {
        check.status = true;
        await check.save({ transaction: t });
      } else {
        const perm = new rolePermissions();
        perm.roleId = roleId;
        perm.permissionId = permissions[i];
        perm.status = true;
        await perm.save({ transaction: t });
      }
    }

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Permissions assigned to Role",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Error assigning permissions to role",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}


async function get_role_permissions(req, res) {
  //get role id from params
  const { roleId } = req.params;
  const perm = await rolePermissions.findAll({
    where: [{ roleId: roleId }, { status: true }],
    attributes: ["id"],
    include: { model: permissions, attributes: ["id", "title"] },
  });
  return res.json({
    status: "1",
    message: "Permissions of Role",
    data: perm,
    error: "",
  });
}

async function update_role_permissions(req, res) {
  const { roleId, permissions } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find and delete old permissions within the transaction
    const old = await rolePermissions.findAll({ where: { roleId: roleId }, transaction: t });
    if (old.length > 0) {
      for (const oldPer of old) {
        await oldPer.destroy({ transaction: t });
      }
    }
    // Add new permissions within the transaction
    for (const permissionId of permissions) {
      const newPer = new rolePermissions();
      newPer.roleId = roleId;
      newPer.permissionId = permissionId;
      newPer.status = true;
      await newPer.save({ transaction: t });
    }

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: "Permissions Updated successfully",
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Error updating permissions",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}


async function getRestaurantProducts(req,res){
    const { restaurantId } = req.params;
    const rmc = await R_MCLink.findAll({where:{restaurantId:restaurantId},include:{model:R_PLink}});
    const data = {
        rmc:rmc
    };
    const response = ApiResponse("1","Restaurant Products","",data);
    return res.json(response)
    
}

async function restaurant_culteries(req,res){
    const data = await restaurant_cultery.findAll({where:{restaurantId:req.params.restaurantId},include:[{model:cutlery}]});
    const response = ApiResponse("1","Cultery data","",data);
    return res.json(response);
}

async function updateRestaurantCultery(req, res) {
  const { id, name } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the cutlery item within the transaction
    const data = await cutlery.findOne({ where: { status: true, id: id }, transaction: t });

    if (data) {
      // Update the image if a new file is uploaded
      if (req.file) {
        let tmpPath = req.file.path;
        let path = tmpPath.replace(/\\/g, "/");
        data.image = path;
      }
      // Update the name
      data.name = name;

      // Save the changes within the transaction
      await data.save({ transaction: t });

      await t.commit(); // Commit the transaction

      const response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);

    } else {
      await t.rollback(); // Rollback if not found
      const response = ApiResponse("0", "Sorry! Not found", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function updateRestaurantCuisine(req, res) {
  const { id, name } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the cuisine item within the transaction
    const data = await cuisine.findOne({ where: { status: true, id: id }, transaction: t });

    if (data) {
      // Update the image if a new file is uploaded
      if (req.file) {
        let tmpPath = req.file.path;
        let path = tmpPath.replace(/\\/g, "/");
        data.image = path;
      }

      // Update the name
      data.name = name;

      // Save the changes within the transaction
      await data.save({ transaction: t });

      await t.commit(); // Commit the transaction
      const response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);

    } else {
      await t.rollback(); // Rollback if not found
      const response = ApiResponse("0", "Sorry! Not found", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function updateDefaultValue(req, res) {
  const { id, value } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the default value within the transaction
    const data = await defaultValues.findOne({ where: { id: id }, transaction: t });

    if (data) {
      // Update the value
      data.value = value;

      // Save the changes within the transaction
      await data.save({ transaction: t });

      await t.commit(); // Commit the transaction

      const response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);

    } else {
      await t.rollback(); // Rollback if not found
      const response = ApiResponse("0", "Sorry! Not found", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function getAllDefaultValues(req,res){
    const data = await defaultValues.findAll({});
    return res.json(ApiResponse("1","All Default Values","",data));
}

async function getAllZones(req,res){
    let data = await zone.findAll({include:{model:zoneDetails}});
    const response = ApiResponse("1","All Zones","",data);
    return res.json(response);
}

async function addZone(req, res) {
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    const { 
      name, baseCharges, baseDistance, perKmCharges, maxDeliveryCharges, 
      adminComission, adminComissionOnDeliveryCharges, distanceUnitId, 
      currencyUnitId, cityId, arr 
    } = req.body;

    // Check if a zone with the same name already exists
    let check = await zone.findOne({ where: { name: name }, transaction: t });
    if (check) {
      await t.rollback(); // Rollback the transaction
      let response = ApiResponse("0", "Name already exists", "Error", {});
      return res.json(response);
    }

    // Process the coordinates and create a polygon
    const coordinatesString = arr.map(coord => coord.join(',')).join('),(');
    const value = coordinatesString;
    const polygon = [];
    let lastcord;
    value.split('),(').map((single_array, index) => {
      if (index === 0) {
        lastcord = single_array.split(',');
      }
      const coords = single_array.split(',');
      polygon.push(new GeoPoint(parseFloat(coords[0]), parseFloat(coords[1])));
    });
    polygon.push(new GeoPoint(parseFloat(lastcord[0]), parseFloat(lastcord[1])));

    // Create the new zone within the transaction
    const newZone = await zone.create({
      name: name,
      coordinates: {
        type: 'Polygon',
        coordinates: [polygon.map(point => [point.latitude(), point.longitude()])],
      },
    }, { transaction: t });

    if (newZone) {
      // Add zone details
      const details = new zoneDetails();
      details.baseCharges = baseCharges;
      details.baseDistance = baseDistance;
      details.perKmCharges = perKmCharges;
      details.maxDeliveryCharges = maxDeliveryCharges;
      details.adminComission = adminComission;
      details.adminComissionOnDeliveryCharges = adminComissionOnDeliveryCharges;
      details.distanceUnitId = distanceUnitId;
      details.currencyUnitId = currencyUnitId;
      details.zoneId = newZone.id;
      details.cityId = cityId;
      details.status = true;

      // Save zone details within the transaction
      await details.save({ transaction: t });
      await t.commit(); // Commit the transaction
      let response = ApiResponse("1", "Zone added successfully", "", {});
      return res.json(response);

    } else {
      await t.rollback(); // Rollback if zone creation failed
      let response = ApiResponse("0", "Something went wrong", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error
    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function changeZoneStatus(req, res) {
  const { zoneId, status } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the zone within the transaction
    let data = await zone.findOne({ where: { id: zoneId }, transaction: t });

    if (data) {
      // Update the status
      data.status = status;
      // Save the changes within the transaction
      await data.save({ transaction: t });
      await t.commit(); // Commit the transaction
      let response = ApiResponse("1", "Zone Status updated successfully", "", {});
      return res.json(response);

    } else {
      await t.rollback(); // Rollback if the zone is not found
      let response = ApiResponse("0", "Zone not found", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function updateZone(req, res) {
  const {
    name,
    baseCharges,
    baseDistance,
    perKmCharges,
    maxDeliveryCharges,
    adminComission,
    adminComissionOnDeliveryCharges,
    distanceUnitId,
    currencyUnitId,
    zoneId,
    arr,
  } = req.body;

  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the zone within the transaction
    let getZone = await zone.findOne({ where: { id: zoneId }, transaction: t });

    if (getZone) {
      // Update zone name and coordinates
      getZone.name = name;

      const coordinatesString = arr.map((coord) => coord.join(",")).join("),(");
      const value = coordinatesString;
      const polygon = [];
      let lastcord;

      value.split("),(").map((single_array, index) => {
        if (index === 0) {
          lastcord = single_array.split(",");
        }
        const coords = single_array.split(",");
        polygon.push(new GeoPoint(parseFloat(coords[0]), parseFloat(coords[1])));
      });

      polygon.push(new GeoPoint(parseFloat(lastcord[0]), parseFloat(lastcord[1])));

      getZone.coordinates = {
        type: "Polygon",
        coordinates: [polygon.map((point) => [point.latitude(), point.longitude()])],
      };

      // Save the zone updates within the transaction
      await getZone.save({ transaction: t });

      // Find and update zone details within the transaction
      let details = await zoneDetails.findOne({ where: { zoneId: getZone.id }, transaction: t });

      if (details) {
        details.baseCharges = baseCharges;
        details.baseDistance = baseDistance;
        details.perKmCharges = perKmCharges;
        details.maxDeliveryCharges = maxDeliveryCharges;
        details.adminComission = adminComission;
        details.adminComissionOnDeliveryCharges = adminComissionOnDeliveryCharges;
        details.distanceUnitId = distanceUnitId;
        details.currencyUnitId = currencyUnitId;

        // Save the updated details within the transaction
        await details.save({ transaction: t });

        await t.commit(); // Commit the transaction

        let response = ApiResponse("1", "Zone and its details updated successfully", "", {});
        return res.json(response);
      } else {
        await t.rollback(); // Rollback if zone details are not found
        let response = ApiResponse("0", "Zone is updated but details not found!", "Error", {});
        return res.json(response);
      }
    } else {
      await t.rollback(); // Rollback if the zone is not found
      let response = ApiResponse("0", "Sorry! Zone not found", "Error", {});
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function sendingNotification(req,res){
    
    const { to , title , body } = req.body;
    let noti = new pushNotification();
    noti.at = Date.now();
    const deviceTokens = [];
    if(to == "All"){
        let data = await user.findAll({where:[{status:true}],attributes:['deviceToken']});
       
    
        data.forEach(item => {
            if(item.deviceToken){
               const tokens = item.deviceToken
            .replace(/[\[\]']+/g, '') // Remove square brackets and single quotes
            .split(','); // Split the string into an array of tokens
            deviceTokens.push(...tokens); // Add the tokens to the deviceTokens list  
            }
       
            });
        // return res.json(deviceTokens)
       
        let noti_body = {
            title:title,
            body:body
        }
        sendNotification(deviceTokens,noti_body);
        noti.title = title;
        noti.body = body;
        noti.to = "All";
        await noti.save();
        
        let response = ApiResponse("1",`Notifications to all send successfully!`,"",{});
        return res.json(response);
    }
    else if(to == "Retailer"){
        let type = await userType.findOne({where:{name:to}});
        let data = await user.findAll({where:[{status:true},{userTypeId:type.id}],attributes:['deviceToken']});
        data.forEach(item => {
        const tokens = item.deviceToken
            .replace(/[\[\]']+/g, '') // Remove square brackets and single quotes
            .split(','); // Split the string into an array of tokens
            deviceTokens.push(...tokens); // Add the tokens to the deviceTokens list
        });
       
        let noti_body = {
            title:title,
            body:body
        }
        sendNotification(deviceTokens,noti_body);
        noti.title = title;
        noti.body = body;
        noti.to = type.name;
        await noti.save();
        
        let response = ApiResponse("1",`Notifications to ${type.name} send successfully!`,"",{});
        return res.json(response);
    }
    else if(to == "Driver"){
        let type = await userType.findOne({where:{name:to}});
        let data = await user.findAll({where:[{status:true},{userTypeId:type.id}],attributes:['deviceToken']});
        data.forEach(item => {
        const tokens = item.deviceToken
            .replace(/[\[\]']+/g, '') // Remove square brackets and single quotes
            .split(','); // Split the string into an array of tokens
            deviceTokens.push(...tokens); // Add the tokens to the deviceTokens list
        });
       
        let noti_body = {
            title:title,
            body:body
        }
        sendNotification(deviceTokens,noti_body);
        noti.title = title;
        noti.body = body;
        noti.to = type.name;
        await noti.save();
        
        let response = ApiResponse("1",`Notifications to ${type.name} send successfully!`,"",{});
        return res.json(response);
    }
    else if(to == "Customer"){
        let type = await userType.findOne({where:{name:to}});
        let data = await user.findAll({where:[{status:true},{userTypeId:type.id}],attributes:['deviceToken']});
        data.forEach(item => {
        const tokens = item.deviceToken
            .replace(/[\[\]']+/g, '') // Remove square brackets and single quotes
            .split(','); // Split the string into an array of tokens
            deviceTokens.push(...tokens); // Add the tokens to the deviceTokens list
        });
       
        let noti_body = {
            title:title,
            body:body
        }
        sendNotification(deviceTokens,noti_body);
        noti.title = title;
        noti.body = body;
        noti.to = type.name;
        await noti.save();
        
        let response = ApiResponse("1",`Notifications to ${type.name} send successfully!`,"",{});
        return res.json(response);
    }
}


async function getDataForAddingRestaurant(req,res){
    let zoneData = await zone.findAll({where:{status:true}});
    let data = {
        zones:zoneData
    };
    let response = ApiResponse("1","Data for adding Restaurant","",data);
    return res.json(response);
}

async function storeAllOrders(req,res){
    let type = await orderApplication.findOne({where:{name:"store"}});
    let orders = await order.findAll({include:[{model:orderStatus},{model:orderMode},{model:orderCharge},{model:user,attributes:['firstName','lastName','userName']},{model:restaurant,attributes:['businessName',"packingFee"],where:{businessType:type.id}}]});
//   return res.json(orders)
    let data ={
        orders
    }
    let response = ApiResponse("1","Store All Orders","",data);
    return res.json(response);
}
async function restAllOrders(req,res){
    let type = await orderApplication.findOne({where:{name:"restaurant"}});
    let orders = await order.findAll({include:[{model:deliveryType},{model:user,as:"DriverId",attributes:['id','userName','firstName','lastName','email','driverType']},{model:orderType},{model:orderStatus},{model:orderMode},{model:unit,as: "currencyUnitID", attributes: ["symbol"]},{model:orderCharge},{model:user,attributes:['firstName','lastName','userName']},{model:restaurant,attributes:['businessName','packingFee'], include: {        model: zoneRestaurants,        include: {          model: zone,          attributes: ["id"],          include: {            model: zoneDetails,            attributes: ["id"],            include: [              { model: unit, as: "distanceUnit" },              { model: unit, as: "currencyUnit" },            ],          },        },      },where:{businessType:type.id}}]});
    let data ={
        orders
    }
    let response = ApiResponse("1","Restaurant All Orders","",data);
    return res.json(response);
}
async function restAllDeliveredOrders(req,res){
    let type = await orderApplication.findOne({where:{name:"restaurant"}});
    let status = await orderStatus.findOne({where:{name:"Delivered"}});

    let orders = await order.findAll({where:{orderStatusId : status.id},include:[{model:deliveryType},{model:user,as:"DriverId",attributes:['id','userName','firstName','lastName','email','driverType']},{model:orderType},{model:orderStatus},{model:orderMode},{model:orderCharge},{model:user,attributes:['firstName','lastName','userName']},{model:restaurant,include: {
        model: zoneRestaurants,
        include: {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        },
      },attributes:['businessName','packingFee'],where:{businessType:type.id}}]});
    let data ={
        orders
    }
    let response = ApiResponse("1","Restaurant All Delivered Orders","",data);
    return res.json(response);
}
async function restAllCancelledOrders(req, res) {
    try {
        let type = await orderApplication.findOne({ where: { name: "restaurant" } });
        let status = await orderStatus.findOne({ where: { name: "Cancelled" } });
        let orders = await order.findAll({
            where: { orderStatusId: status.id },
            include: [
                {model:deliveryType},
                {model:user,as:"DriverId",attributes:['id','userName','firstName','lastName','email','driverType']},
                {model:orderType},
                { model: orderStatus },
                { model: orderMode },
                { model: orderCharge },
                { model: user, attributes: ['firstName', 'lastName', 'userName'] },
                {
                    model: restaurant,
                    attributes: ['businessName', 'packingFee'],
                    where: { businessType: type.id },
                    include: {
        model: zoneRestaurants,
        include: {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        },
      },
                }
            ]
        });
        let data = {
            orders
        };
        let response = ApiResponse("1", "Restaurant All Cancelled Orders", "", data);
        return res.json(response);
    } catch (error) {
        console.error(error);
        let response = ApiResponse("0", "Error occurred", "An error occurred while fetching cancelled orders", {});
        return res.json(response);
    }
}

async function storeAllDeliveredOrders(req, res) {
    try {
        let type = await orderApplication.findOne({ where: { name: "store" } });
        let status = await orderStatus.findOne({ where: { name: "Delivered" } });
        let orders = await order.findAll({
            where: { orderStatusId: status.id },
            include: [
                { model: orderStatus },
                { model: orderMode },
                { model: orderCharge },
                { model: user, attributes: ['firstName', 'lastName', 'userName'] },
                {
                    model: restaurant,
                    attributes: ['businessName', 'packingFee'],
                    where: { businessType: type.id }
                }
            ]
        });
        let data = {
            orders
        };
        let response = ApiResponse("1", "Restaurant All Delivered Orders", "", data);
        return res.json(response);
    } catch (error) {
        console.error(error);
        let response = ApiResponse("0", "Error occurred", "An error occurred while fetching delivered orders", {});
        return res.json(response);
    }
}

async function storeAllCancelledOrders(req, res) {
    try {
        let type = await orderApplication.findOne({ where: { name: "store" } });
        let status = await orderStatus.findOne({ where: { name: "Cancelled" } });
        let orders = await order.findAll({
            where: { orderStatusId: status.id },
            include: [
                { model: orderStatus },
                { model: orderMode },
                { model: orderCharge },
                { model: user, attributes: ['firstName', 'lastName', 'userName'] },
                {
                    model: restaurant,
                    attributes: ['businessName', 'packingFee'],
                    where: { businessType: type.id }
                }
            ]
        });
        let data = {
            orders
        };
        let response = ApiResponse("1", "Restaurant All Cancelled Orders", "", data);
        return res.json(response);
    } catch (error) {
        console.error(error);
        let response = ApiResponse("0", "Error occurred", "An error occurred while fetching cancelled orders", {});
        return res.json(response);
    }
}
async function storeAllScheduleOrders(req, res) {
    try {
        let type = await orderApplication.findOne({ where: { name: "store" } });
        let mode = await orderMode.findOne({ where: { name: "Scheduled" } });
        let orders = await order.findAll({
            where: { orderModeId: mode.id },
            include: [
                { model: orderStatus },
                { model: orderMode },
                { model: orderCharge },
                { model: user, attributes: ['firstName', 'lastName', 'userName'] },
                {
                    model: restaurant,
                    attributes: ['businessName', 'packingFee'],
                    where: { businessType: type.id }
                }
            ]
        });
        let data = {
            orders
        };
        let response = ApiResponse("1", "Restaurant All Schedule Orders", "", data);
        return res.json(response);
    } catch (error) {
        console.error(error);
        let response = ApiResponse("0", "Error occurred", "An error occurred while fetching cancelled orders", {});
        return res.json(response);
    }
}
async function restAllScheduleOrders(req, res) {
    try {
        let type = await orderApplication.findOne({ where: { name: "restaurant" } });
        let mode = await orderMode.findOne({ where: { name: "Scheduled" } });
        let orders = await order.findAll({
            where: { orderModeId: mode.id },
            include: [
                {model:deliveryType},
                {model:user,as:"DriverId",attributes:['id','userName','firstName','lastName','email','driverType']},{model:orderType},
                { model: orderStatus },
                { model: orderMode },
                { model: orderCharge },
                { model: user, attributes: ['firstName', 'lastName', 'userName'] },
                {
                    model: restaurant,
                    attributes: ['businessName', 'packingFee'],
                    where: { businessType: type.id },
                    include: {
        model: zoneRestaurants,
        include: {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        },
      },
                }
            ]
        });
        let data = {
            orders
        };
        let response = ApiResponse("1", "Restaurant All Schedule Orders", "", data);
        return res.json(response);
    } catch (error) {
        console.error(error);
        let response = ApiResponse("0", "Error occurred", "An error occurred while fetching cancelled orders", {});
        return res.json(response);
    }
}


async function all_earnings(req,res){
    
    let online_method = await paymentMethod.findOne({where:{name:"Adyen"}});
    let cod = await paymentMethod.findOne({where:{name:"COD"}});
    let deliveredStatus = await orderStatus.findOne({where:{name:"Delivered"}});
    
    //total earning
    // const total_earnings = await order.sum('total', {
    //   where: {
    //     orderStatusId: deliveredStatus.id
    //   }
    // });
    
    //total earning by cash on delivery
    // const total_earnings_by_cod = await order.sum('total', {
    //   where: {
    //     orderStatusId: deliveredStatus.id,
    //     paymentMethodId : cod.id
    //   }
    // });
    
    //total earning by online payment way
    // const total_online_earnings = await order.sum('total', {
    //   where: {
    //     orderStatusId: deliveredStatus.id,
    //     paymentMethodId : online_method.id
    //   }
    // });
    
    //admin earning by online way
    const admin_earning_online = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
        paymentMethodId : online_method.id
      },
      attributes:['id'],
      include:{model:orderCharge,attributes:['adminEarnings']}
    });
    const totalAdminEarningsOnline = admin_earning_online.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge.adminEarnings);
    }, 0);
    
    //admin overall earning
    const admin_total = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
        // paymentMethodId : online_method.id
      },
      attributes:['id'],
      include:{model:orderCharge,attributes:['adminEarnings']}
    });
    const admin_total_earning = admin_total.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge.adminEarnings);
    }, 0);
    
    //admin earning by cod
    const admin_earning_cod = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
        paymentMethodId : cod.id
      },
      attributes:['id'],
      include:{model:orderCharge,attributes:['adminEarnings']}
    });
    const totalAdminEarningsCOD = admin_earning_cod.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge.adminEarnings);
    }, 0);
    
    //total delivery charges 
    //  const delivery_charges = await order.findAll({
    //   where: {
    //     orderStatusId: deliveredStatus.id,
    //   },
    //   attributes:['id'],
    //   include:{model:orderCharge,attributes:['deliveryFees']}
    // });
    // const Total_deliveryFees = delivery_charges.reduce((sum, order) => {
    // return sum + parseFloat(order.orderCharge.deliveryFees);
    // }, 0);
    
    //Admin delivery charges 
     const admin_delivery_charges = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:{model:orderCharge,attributes:['adminDeliveryCharges']}
    });
    const admin_Total_deliveryFees = admin_delivery_charges.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge.adminDeliveryCharges);
    }, 0);
    
    //total services Charges 
     const service_charges = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:{model:orderCharge,attributes:['serviceCharges']}
    });
    const total_services_charges = service_charges.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge.serviceCharges);
    }, 0);
    
    //total discount 
    //  const discount = await order.findAll({
    //   where: {
    //     orderStatusId: deliveredStatus.id,
    //   },
    //   attributes:['id'],
    //   include:{model:orderCharge,attributes:['discount']}
    // });
    // const total_discount = discount.reduce((sum, order) => {
    // return sum + parseFloat(order.orderCharge.discount);
    // }, 0);
    
    let data = {
        // total_earnings,
        // total_earnings_by_cod,
        // total_online_earnings,
        totalAdminEarningsOnline,
        totalAdminEarningsCOD,
        // Total_deliveryFees,
        admin_Total_deliveryFees,
        // admin_delivery_charges_paid_to_drivers:parseFloat(Total_deliveryFees) - parseFloat(admin_Total_deliveryFees),
        total_services_charges,
        admin_total_earning
        // total_discount
    }
    let response = ApiResponse("1","Earning Details","",data);
    return res.json(response)
}

async function get_profile(req,res){
    let userId = req.user.id;
    let userData = await user.findOne({where:{id:userId},attributes:['id','firstName','lastName',"email",'countryCode','phoneNum']});
    let response = ApiResponse("1","Profile","",{userData});
    return res.json(response);
}

async function update_profile(req, res) {
  const { userId, firstName, password, lastName, countryCode, phoneNum, email } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the user within the transaction
    let userData = await user.findOne({ where: { id: userId }, transaction: t });

    if (userData) {
      // Update user details
      userData.firstName = firstName;
      userData.lastName = lastName;
      userData.email = email;
      userData.countryCode = countryCode;
      userData.phoneNum = phoneNum;

      // Hash and update the password if provided
      if (password) {
        userData.password = await bcrypt.hash(password, 10);
      }

      // Save the updated user data within the transaction
      await userData.save({ transaction: t });

      await t.commit(); // Commit the transaction

      let response = ApiResponse("1", "Profile updated successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if the user is not found
      let response = ApiResponse("0", "User not found", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function restaurant_earnings(req,res){
    
    let type = await orderApplication.findOne({where:{name:"restaurant"}});
    let online_method = await paymentMethod.findOne({where:{name:"Adyen"}});
    let cod = await paymentMethod.findOne({where:{name:"COD"}});
    let deliveredStatus = await orderStatus.findOne({where:{name:"Delivered"}});
    
    // Restaurant Earning by Online method
    const online = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
        paymentMethodId : online_method.id
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['restaurantEarnings']},{model:restaurant,where:{businessType:type.id}}]
    });
    const online_earnings = online.reduce((sum, order) => {
    return sum + parseFloat(order?.orderCharge?.restaurantEarnings);
    }, 0);
    
    // Restaurant Earning by COD
    const cod_payment = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
        paymentMethodId : cod.id
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['restaurantEarnings']},{model:restaurant,where:{businessType:type.id}}]
    });
    const cod_earnings = cod_payment.reduce((sum, order) => {
    return sum + parseFloat(order?.orderCharge?.restaurantEarnings);
    }, 0);
    
    // Restaurant Driver earning
    const drivers_orders = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
        
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['driverEarnings']},{model:user,as:"DriverId",where:{driverType:"Restaurant"},attributes:['driverType']},{model:restaurant,where:{businessType:type.id}}]
    });
    // return res.json(drivers_orders)
    const driver_earnings = drivers_orders.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge.driverEarnings);
    }, 0);
    
    
    // Restaurant packing Fee
    const packingFee = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['packingFee']},{model:restaurant,where:{businessType:type.id}}]
    });
    const rest_packing_fee = packingFee?.reduce((sum, order) => {
    return sum + parseFloat(order?.orderCharge?.packingFee);
    }, 0);
    
    
    let data = {
        online_earnings,
        cod_earnings,
        driver_earnings,
        rest_packing_fee
    };
    let response = ApiResponse("1","Restaurant Earning","",data);
    return res.json(response);
}
async function store_earnings(req,res){
    
    let type = await orderApplication.findOne({where:{name:"store"}});
    let online_method = await paymentMethod.findOne({where:{name:"Adyen"}});
    let cod = await paymentMethod.findOne({where:{name:"COD"}});
    let deliveredStatus = await orderStatus.findOne({where:{name:"Delivered"}});
    
    // Restaurant Earning by Online method
    const online = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
        paymentMethodId : online_method.id
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['restaurantEarnings']},{model:restaurant,where:{businessType:type.id}}]
    });
    const online_earnings = online.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge.restaurantEarnings);
    }, 0);
    
    // Restaurant Earning by COD
    const cod_payment = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
        paymentMethodId : cod.id
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['restaurantEarnings']},{model:restaurant,where:{businessType:type.id}}]
    });
    const cod_earnings = cod_payment.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge.restaurantEarnings);
    }, 0);
    
    // Restaurant Driver earning
    const drivers_orders = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
        
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['driverEarnings']},{model:user,as:"DriverId",where:{driverType:"Restaurant"},attributes:['driverType']},{model:restaurant,where:{businessType:type.id}}]
    });
    // return res.json(drivers_orders)
    const driver_earnings = drivers_orders.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge.driverEarnings);
    }, 0);
    
    
    // Restaurant packing Fee
    const packingFee = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['packingFee']},{model:restaurant,where:{businessType:type.id}}]
    });
    const rest_packing_fee = packingFee.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge.packingFee);
    }, 0);
    
    
    let data = {
        online_earnings,
        cod_earnings,
        driver_earnings,
        store_packing_fee:rest_packing_fee
    };
    let response = ApiResponse("1","Store Earning","",data);
    return res.json(response);
}


async function driver_earnings(req,res){
    let online_method = await paymentMethod.findOne({where:{name:"Payrexx"}});
    let cod = await paymentMethod.findOne({where:{name:"COD"}});
    let deliveredStatus = await orderStatus.findOne({where:{name:"Delivered"}});
    
    // OverAll delviery Charges
    const online = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['deliveryFees']}]
    });
    const deliveryFees = online.reduce((sum, order) => {
    return sum + parseFloat(order?.orderCharge?.deliveryFees);
    }, 0);
    
    // Admin delviery Charges
    const adminCharges = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['adminDeliveryCharges']}]
    });
    const adminDeliveryCharges = adminCharges.reduce((sum, order) => {
    return sum + parseFloat(order?.orderCharge?.adminDeliveryCharges);
    }, 0);
    
    // Admin delviery Charges from Feelancer Drivers
    const adminCommision_freelancer = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['adminDeliveryCharges']},{model:user,as:"DriverId",where:{driverType:"Freelancer"},attributes:['driverType']}]
    });
    const adminCommision_from_freelancer_driver = adminCommision_freelancer.reduce((sum, order) => {
    return sum + parseFloat(order?.orderCharge?.adminDeliveryCharges);
    }, 0);
    
    
    // Admin delviery Charges from Restaurant Drivers
    const adminCommision_restauarnt = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['adminDeliveryCharges']},{model:user,as:"DriverId",where:{driverType:"Restaurant"},attributes:['driverType']}]
    });
    const adminCommision_from_restaurant_driver = adminCommision_restauarnt.reduce((sum, order) => {
    return sum + parseFloat(order?.orderCharge?.adminDeliveryCharges);
    }, 0);
    
    // Earnig by Tips
    const tipCharges = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['tip']}]
    });
    const tip_earning = tipCharges.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge?.tip);
    }, 0);
    
    // overall driver earnings
    const driverEarnings = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['driverEarnings']}]
    });
    const overall_driver_earnings = driverEarnings.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge?.driverEarnings);
    }, 0);

    // Restaurant Driver earning
    const drivers_orders = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['driverEarnings']},{model:user,as:"DriverId",where:{driverType:"Restaurant"},attributes:['driverType']}]
    });
    // return res.json(drivers_orders)
    const driver_earnings = drivers_orders.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge?.driverEarnings);
    }, 0);
    
    // Freelance Driver earning
    const freelancer_drivers = await order.findAll({
      where: {
        orderStatusId: deliveredStatus.id,
      },
      attributes:['id'],
      include:[{model:orderCharge,attributes:['driverEarnings']},{model:user,as:"DriverId",where:{driverType:"Freelancer"},attributes:['driverType']}]
    });
    // return res.json(drivers_orders)
    const freelance_earnings = freelancer_drivers.reduce((sum, order) => {
    return sum + parseFloat(order.orderCharge?.driverEarnings);
    }, 0);
    
    let data = {
        overall_driver_earnings,
        overall_delivery_fees:deliveryFees,
        earning_from_delivery_charges :deliveryFees !=null ? parseFloat(deliveryFees) - parseFloat(adminDeliveryCharges) : 0.0,
        tip_earning,
        store_driver_earning:driver_earnings,
        freelance_earnings,
        adminDeliveryCharges,
        adminCommision_from_freelancer_driver,
        adminCommision_from_restaurant_driver
    }
    let response = ApiResponse("1","Delivery Fee","",data);
    return res.json(response);
}

async function restaurantReports(req, res) {
    try {
        // Fetch necessary details
        const type = await orderApplication.findOne({ where: { name: "restaurant" } });
        const cod = await paymentMethod.findOne({ where: { name: "COD" } });
        const online = await paymentMethod.findOne({ where: { name: "Adyen" } });
        const deliveredStatus = await orderStatus.findOne({ where: { name: 'delivered' } });
        const cancelStatus = await orderStatus.findOne({ where: { name: 'Cancelled' } });
        let totalOrdersAmount = 0;

        // Fetch all orders with their orderCharge and restaurantEarnings
        const orders = await order.findAll({
            include: [
                { model: restaurant, where: { businessType: type.id } },
                { model: orderCharge, attributes: ['restaurantEarnings'] }
            ],
            attributes: ['id', 'createdAt']
        });

        // Initialize an array to store the monthly earnings
        const monthlyEarnings = new Array(12).fill(0);
        const monthlyCounts = new Array(12).fill(0);

        // Sum the restaurantEarnings for each month
        orders.forEach(order => {
            
            totalOrdersAmount = totalOrdersAmount + parseFloat(order?.total);
            const date = new Date(order.createdAt);
            const month = date.getUTCMonth(); // getUTCMonth returns month index (0-11)
            if (order.orderCharge && order.orderCharge.restaurantEarnings) {
                monthlyEarnings[month] += parseFloat(order.orderCharge.restaurantEarnings);
            }
            monthlyCounts[month]++;
        });

        // Create the monthly data structure
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthlyData = monthNames.map((month, index) => ({
            month,
            ordersCount: monthlyCounts[index],
            restaurantEarnings: monthlyEarnings[index].toFixed(2)
        }));
        

        const totalRestaurants = await restaurant.count({ where: { businessType: type.id } });

        // Calculate totals for online and COD orders
        const [onlineOrders, codOrders] = await Promise.all([
            order.findAll({
                attributes: ['total'],
                where: { paymentMethodId: online.id },
                include: { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
            }),
            order.findAll({
                attributes: ['total'],
                where: { paymentMethodId: cod.id },
                include: { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
            })
        ]);

        const calculateTotal = orders => orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

        const onlineTotals = calculateTotal(onlineOrders);
        const codTotals = calculateTotal(codOrders);

        // Calculate earnings for complete, not complete, and cancelled orders
        const [completeOrders, cancelledOrders, notCompleteOrders] = await Promise.all([
            order.findAll({
                attributes: ['id'],
                where: { orderStatusId: deliveredStatus.id },
                include: [
                    { model: orderCharge, attributes: ['restaurantEarnings'] },
                    { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
                ]
            }),
            order.findAll({
                attributes: ['id'],
                where: { orderStatusId: cancelStatus.id },
                include: [
                    { model: orderCharge, attributes: ['restaurantEarnings'] },
                    { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
                ]
            }),
            order.findAll({
                attributes: ['id'],
                where: { orderStatusId: { [Op.notIn]: [deliveredStatus.id, cancelStatus.id] } },
                include: [
                    { model: orderCharge, attributes: ['restaurantEarnings'] },
                    { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
                ]
            })
        ]);

        const calculateEarnings = orders => orders.reduce((sum, order) => {
            if (order.orderCharge && order.orderCharge.restaurantEarnings) {
                return sum + parseFloat(order.orderCharge.restaurantEarnings);
            }
            return sum;
        }, 0);

        const completeEarnings = calculateEarnings(completeOrders);
        const cancelledOrdersEarning = calculateEarnings(cancelledOrders);
        const notCompleteEarning = calculateEarnings(notCompleteOrders);

        // Calculate total discount given
        const discountOrders = await order.findAll({
            attributes: ['id'],
            include: [
                { model: orderCharge, attributes: ['discount'] },
                { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
            ]
        });

        const discountAmount = discountOrders.reduce((sum, order) => {
            if (order.orderCharge && order.orderCharge.discount) {
                return sum + parseFloat(order.orderCharge.discount);
            }
            return sum;
        }, 0);
        
         const averageOrderValue = await order.findAll({
          include: {
            model: restaurant,
            attributes: [],
            where: { businessType: type.id }
          },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('total')), 'averageTotal']
          ],
          raw: true
        });
        const data = {
            summary_reports:{
                totalRegisteredRestaurants:totalRestaurants,
                newItems:25,
                totalOrders: orders.length,
                deliveredOrders:completeOrders.length,
                pickupOrders:notCompleteOrders.length,
                totalPayment: onlineTotals + codTotals,
                onlineTotals,
                codTotals,
                averageOrderValue:averageOrderValue[0]?.averageTotal,
            },
            sales_reports:{
                gross_sales:4380,
                total_tax:234,
                 totalOrdersAmount:totalOrdersAmount ? totalOrdersAmount : 0.0,
                total_commissions:723,
                 deliveredOrders:completeOrders.length,
                pickupOrders:notCompleteOrders.length
                
                
            },
            orderReports: {
                totalOrders: orders.length,
                totalOrdersAmount:totalOrdersAmount ? totalOrdersAmount : 0.0,
                completeOrdersEarning: completeEarnings,
                notCompleteEarning,
                cancelledOrdersEarning,
                discountAmount,
                  deliveredOrders:completeOrders.length,
                pickupOrders:notCompleteOrders.length
            },
            monthlyData
        };

        const response = ApiResponse("1", "Restaurant Reports", "", data);
        return res.json(response);
    } catch (error) {
        console.error(error);
        const response = ApiResponse("0", "Error generating restaurant reports", error.message);
        return res.status(500).json(response);
    }
}
async function storeReports(req,res){
  
     try {
        // Fetch necessary details
        const type = await orderApplication.findOne({ where: { name: "store" } });
        const cod = await paymentMethod.findOne({ where: { name: "COD" } });
        const online = await paymentMethod.findOne({ where: { name: "Adyen" } });
        const deliveredStatus = await orderStatus.findOne({ where: { name: 'delivered' } });
        const cancelStatus = await orderStatus.findOne({ where: { name: 'Cancelled' } });
        let totalOrdersAmount = 0;

        // Fetch all orders with their orderCharge and restaurantEarnings
        const orders = await order.findAll({
            include: [
                { model: restaurant, where: { businessType: type.id } },
                { model: orderCharge, attributes: ['restaurantEarnings'] }
            ],
            attributes: ['id', 'createdAt']
        });

        // Initialize an array to store the monthly earnings
        const monthlyEarnings = new Array(12).fill(0);
        const monthlyCounts = new Array(12).fill(0);

        // Sum the restaurantEarnings for each month
        orders.forEach(order => {
            
            totalOrdersAmount = totalOrdersAmount + parseFloat(order?.total);
            const date = new Date(order.createdAt);
            const month = date.getUTCMonth(); // getUTCMonth returns month index (0-11)
            if (order.orderCharge && order.orderCharge.restaurantEarnings) {
                monthlyEarnings[month] += parseFloat(order.orderCharge.restaurantEarnings);
            }
            monthlyCounts[month]++;
        });

        // Create the monthly data structure
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthlyData = monthNames.map((month, index) => ({
            month,
            ordersCount: monthlyCounts[index],
            restaurantEarnings: monthlyEarnings[index].toFixed(2)
        }));
        

        const totalRestaurants = await restaurant.count({ where: { businessType: type.id } });

        // Calculate totals for online and COD orders
        const [onlineOrders, codOrders] = await Promise.all([
            order.findAll({
                attributes: ['total'],
                where: { paymentMethodId: online.id },
                include: { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
            }),
            order.findAll({
                attributes: ['total'],
                where: { paymentMethodId: cod.id },
                include: { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
            })
        ]);

        const calculateTotal = orders => orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

        const onlineTotals = calculateTotal(onlineOrders);
        const codTotals = calculateTotal(codOrders);

        // Calculate earnings for complete, not complete, and cancelled orders
        const [completeOrders, cancelledOrders, notCompleteOrders] = await Promise.all([
            order.findAll({
                attributes: ['id'],
                where: { orderStatusId: deliveredStatus.id },
                include: [
                    { model: orderCharge, attributes: ['restaurantEarnings'] },
                    { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
                ]
            }),
            order.findAll({
                attributes: ['id'],
                where: { orderStatusId: cancelStatus.id },
                include: [
                    { model: orderCharge, attributes: ['restaurantEarnings'] },
                    { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
                ]
            }),
            order.findAll({
                attributes: ['id'],
                where: { orderStatusId: { [Op.notIn]: [deliveredStatus.id, cancelStatus.id] } },
                include: [
                    { model: orderCharge, attributes: ['restaurantEarnings'] },
                    { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
                ]
            })
        ]);

        const calculateEarnings = orders => orders.reduce((sum, order) => {
            if (order.orderCharge && order.orderCharge.restaurantEarnings) {
                return sum + parseFloat(order.orderCharge.restaurantEarnings);
            }
            return sum;
        }, 0);

        const completeEarnings = calculateEarnings(completeOrders);
        const cancelledOrdersEarning = calculateEarnings(cancelledOrders);
        const notCompleteEarning = calculateEarnings(notCompleteOrders);

        // Calculate total discount given
        const discountOrders = await order.findAll({
            attributes: ['id'],
            include: [
                { model: orderCharge, attributes: ['discount'] },
                { model: restaurant, attributes: ['id'], where: { businessType: type.id } }
            ]
        });

        const discountAmount = discountOrders.reduce((sum, order) => {
            if (order.orderCharge && order.orderCharge.discount) {
                return sum + parseFloat(order.orderCharge.discount);
            }
            return sum;
        }, 0);
        
         const averageOrderValue = await order.findAll({
          include: {
            model: restaurant,
            attributes: [],
            where: { businessType: type.id }
          },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('total')), 'averageTotal']
          ],
          raw: true
        });
        

        const data = {
            summary_reports:{
                totalRegisteredRestaurants:totalRestaurants,
                newItems:25,
                totalOrders: orders.length,
                deliveredOrders:completeOrders.length,
                pickupOrders:notCompleteOrders.length,
                totalPayment: onlineTotals + codTotals,
                onlineTotals,
                codTotals,
                averageOrderValue:averageOrderValue[0]?.averageTotal,
            },
            sales_reports:{
                gross_sales:4380,
                total_tax:234,
                 totalOrdersAmount:totalOrdersAmount ? totalOrdersAmount : 0.0,
                total_commissions:723,
                 deliveredOrders:completeOrders.length,
                pickupOrders:notCompleteOrders.length
                
                
            },
            orderReports: {
                totalOrders: orders.length,
                totalOrdersAmount:totalOrdersAmount ? totalOrdersAmount : 0.0,
                completeOrdersEarning: completeEarnings,
                notCompleteEarning,
                cancelledOrdersEarning,
                discountAmount,
                  deliveredOrders:completeOrders.length,
                pickupOrders:notCompleteOrders.length
            },
            monthlyData
        };

        const response = ApiResponse("1", "Restaurant Reports", "", data);
        return res.json(response);
    } catch (error) {
        console.error(error);
        const response = ApiResponse("0", "Error generating restaurant reports", error.message);
        return res.status(500).json(response);
    }
}

async function getCountries(req,res){
    
    let countries = await country.findAll({});
    let data = {
        countries
    };
    let response = ApiResponse("1","All Countries","",data);
    return res.json(response)
}

async function addCountry(req, res) {
  const { name, shortName } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check if the country with the same name already exists within the transaction
    const check = await country.findOne({ where: { name: name }, transaction: t });
    if (check) {
      await t.rollback(); // Rollback the transaction
      let response = ApiResponse("0", "Already exist with this name", "Error", {});
      return res.json(response);
    }

    // Get the image path from the uploaded file
    let imagePathTemp = req.file.path;
    let imagePath = imagePathTemp.replace(/\\/g, "/");

    // Create and save the new country within the transaction
    let count = new country();
    count.name = name;
    count.shortName = shortName;
    count.flag = imagePath;
    count.status = true;

    await count.save({ transaction: t });

    await t.commit(); // Commit the transaction

    let response = ApiResponse("1", "Added successfully", "", {});
    return res.json(response);

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function changeCountryStatus(req, res) {
  const { id, status } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the country within the transaction
    let count = await country.findOne({ where: { id: id }, transaction: t });

    if (count) {
      // Update the status
      count.status = status;

      // Save the changes within the transaction
      await count.save({ transaction: t });

      await t.commit(); // Commit the transaction

      let response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if the country is not found

      let response = ApiResponse("0", "Not found!", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function editCountry(req, res) {
  const { id, name, shortName } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the country within the transaction
    let data = await country.findOne({ where: { id: id }, transaction: t });

    if (data) {
      const previousImage = data.flag; // Store the previous image path

      // Update country details
      data.name = name;
      data.shortName = shortName;

      if (req.file) {
        // Handle uploading of new image
        let imagePathTemp = req.file.path;
        let imagePath = imagePathTemp.replace(/\\/g, "/");
        data.flag = imagePath;

        // Delete previous image if it exists
        if (previousImage) {
          try {
            fs.unlinkSync(previousImage);
          } catch (error) {
            console.error("Error deleting previous image:", error);
            // Log the error but continue with the process
          }
        }
      }

      // Save the changes within the transaction
      await data.save({ transaction: t });

      await t.commit(); // Commit the transaction

      let response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if the country is not found
      let response = ApiResponse("0", "Not found", "", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}


async function getCities(req,res){
    
    const cities = await city.findAll({include:{model:country}});
    let response = ApiResponse("1","All Cities","",cities);
    return res.json(response);
}

async function addCity(req, res) {
  const { name, lat, lng, countryId } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check if a city with the same name already exists within the transaction
    const check = await city.findOne({ where: { name: name }, transaction: t });
    if (check) {
      await t.rollback(); // Rollback the transaction
      let response = ApiResponse("0", "Already exists", "", {});
      return res.json(response);
    }

    // Create and save the new city within the transaction
    let dd = new city();
    dd.name = name;
    dd.lat = lat;
    dd.lng = lng;
    dd.countryId = countryId;
    dd.status = true;

    await dd.save({ transaction: t });

    await t.commit(); // Commit the transaction

    let response = ApiResponse("1", "Added successfully", "", {});
    return res.json(response);

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}

async function editCity(req, res) {
  const { name, lat, lng, countryId, cityId } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check if the city exists within the transaction
    const check = await city.findOne({ where: { id: cityId }, transaction: t });
    if (check) {
      // Update city details
      check.name = name;
      check.lat = lat;
      check.lng = lng;
      check.countryId = countryId;
      check.status = true;

      // Save the changes within the transaction
      await check.save({ transaction: t });

      await t.commit(); // Commit the transaction

      let response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if the city is not found

      let response = ApiResponse("0", "Not found", "", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}


async function changeStatusofCity(req, res) {
  const { status, cityId } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check if the city exists within the transaction
    const check = await city.findOne({ where: { id: cityId }, transaction: t });

    if (check) {
      // Update the city's status
      check.status = status;

      // Save the changes within the transaction
      await check.save({ transaction: t });

      await t.commit(); // Commit the transaction

      let response = ApiResponse("1", "Status updated successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if the city is not found

      let response = ApiResponse("0", "Not found", "", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}


async function addSetting(req, res) {
  const { content, value } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update the setting value within the transaction
    const [affectedRows] = await setting.update(
      { value: value },
      { where: { content: content }, transaction: t }
    );

    if (affectedRows > 0) {
      await t.commit(); // Commit the transaction
      let response = ApiResponse('1', 'Updated successfully', '', {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if no matching records are found
      let response = ApiResponse('0', 'No matching records found', 'Error', {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse('0', error.message, 'Error', {});
    return res.json(response);
  }
}

async function updateSetting(req, res) {
  const { id, value } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the setting within the transaction
    let check = await setting.findOne({ where: { id: id }, transaction: t });

    if (check) {
      // Update the value
      check.value = value;

      // Save the updated setting within the transaction
      await check.save({ transaction: t });

      await t.commit(); // Commit the transaction

      let response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if the setting is not found

      let response = ApiResponse("0", "Not found", "", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function getSetting(req, res) {
    
    let data = await setting.findAll({
            where: {
                [Op.or]: [
                    { content: "Terms and Conditions" },
                    { content: "Privacy and Policy" }
                ]
            }
        });
    let response = ApiResponse("1","Settings","",data);
    return res.json(response)
}

async function customerReports(req,res){
    
    // Get the current date and the date 2 days ago
    const currentDate = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(currentDate.getDate() - 2);
    
    const getMonthName = (date) => {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
        return months[date.getMonth()];
    }
   
    const ordersPerMonth = {
        "January": 0, "February": 0, "March": 0, "April": 0, "May": 0,
        "June": 0, "July": 0, "August": 0, "September": 0, "October": 0,
        "November": 0, "December": 0
    };



    let usertype = await userType.findOne({where:{name:"Customer"},attributes:['id']});
    let totalUsers = await user.count({where:{userTypeId : usertype.id}});
    
    let returningCustomers = await user.findAll({
      where: {
        userTypeId: usertype.id,
        createdAt: {
          [Op.lte]: twoDaysAgo
        }
      },
      attributes: ['id']
    });
    const returningCustomersIds = returningCustomers.map(item => item.id);
    let newUsers = await user.findAll({
      where: {
        userTypeId: usertype.id,
        createdAt: {
          [Op.between]: [twoDaysAgo, currentDate]
        }
      },
      attributes:['id']
    });
    const newUsersIds = newUsers.map(item => item.id);
    
    let returningOrders = await order.findAll({where:{userId:returningCustomersIds},attributes:['id','total','orderNum','createdAt']});
    let newOrders = await order.findAll({where:{userId:newUsersIds},attributes:['id','total','orderNum','createdAt']});
    
     // Loop through the orders and count them by month
    returningOrders.forEach(order => {
        const createdAt = new Date(order.createdAt);
        const monthName = getMonthName(createdAt);
        ordersPerMonth[monthName]++;
    });

    const returningCustomersOrders = Object.keys(ordersPerMonth).map(month => {
        return { [month]: ordersPerMonth[month] };
    });
    
    newOrders.forEach(order => {
        const createdAt = new Date(order.createdAt);
        const monthName = getMonthName(createdAt);
        ordersPerMonth[monthName]++;
    });
    
    const newCustomersOrders = Object.keys(ordersPerMonth).map(month => {
        return { [month]: ordersPerMonth[month] };
    });
    let data = {
        totalUsers,
        newUsers:newUsers.length,
        ordersByReturningCustomers :returningOrders.length,
        ordersByNewCustomers :newOrders.length,
        totalOrders : returningOrders?.length + newOrders?.length,
        returningCustomers : returningCustomers.length,
        returningCustomersOrders,
        newCustomersOrders
    }
    let response = ApiResponse("1","Customer Reports","",data);
    return res.json(response)
}

async function orderMetrics(req,res){
    
        let delivery = await deliveryType.findOne({where:{name:"Delivery"}});
        let pickup = await deliveryType.findOne({where:{name:"Self-Pickup"}});
        let schedule = await orderMode.findOne({where:{name:"Scheduled"}});
        let complete = await orderStatus.findOne({where:{name:"Delivered"}});
        let Placed = await orderStatus.findOne({where:{name:"Placed"}});
        let pickupStatus = await orderStatus.findOne({where:{name:"Food Pickedup"}});
        let Preparing = await orderStatus.findOne({where:{name:"Preparing"}});
        let Cancelled = await orderStatus.findOne({where:{name:"Cancelled"}});
        let rest = await orderApplication.findOne({where:{name:"restaurant"}});
        let store = await orderApplication.findOne({where:{name:"store"}});
        
    
        let totalOrders = await order.count({});
        let PlacedOrders = await order.count({where:{orderStatusId : Placed.id}});
        let pickOrders = await order.count({where:{orderStatusId : pickupStatus.id}});
        let PreparingOrders = await order.count({where:{orderStatusId : Preparing.id}});
        let deliveryOrders = await order.count({where:{deliveryTypeId : delivery.id}});
        let selfPickupOrders = await order.count({where:{deliveryTypeId : pickup.id}});
        let scheduleOrders = await order.count({where:{orderModeId : schedule.id}});
        let completeOrders = await order.count({where:{orderStatusId : complete.id}});
        let cancelOrders = await order.count({where:{orderStatusId : Cancelled.id}});
        
        let restTotalOrders = await order.findAll({attributes:['total'],include:[{model:restaurant,attributes:['id'],where:{businessType:rest.id}}]});
        let restCompleteOrders = await order.findAll({where:{orderStatusId:complete.id},include:[{model:restaurant,where:{businessType:rest.id}}]});
        let restCancelledOrders = await order.findAll({where:{orderStatusId:Cancelled.id},include:[{model:restaurant,where:{businessType:rest.id}}]});
        let restPendingOrders = await order.findAll({
          where: { orderStatusId: { [Op.notIn]: [Cancelled.id, complete.id] } },
          include: [{
            model: restaurant,
            where: { businessType: rest.id }
          }]
        });
        
        const sum = restTotalOrders.reduce((acc, obj) => acc + parseFloat(obj.total), 0);
        const restAverageOrder = sum / restTotalOrders.length;
        
        //STORE
        let storeTotalOrders = await order.findAll({attributes:['total'],include:[{model:restaurant,attributes:['id'],where:{businessType:store.id}}]});
        let storeCompleteOrders = await order.findAll({where:{orderStatusId:complete.id},include:[{model:restaurant,where:{businessType:store.id}}]});
        let storeCancelledOrders = await order.findAll({where:{orderStatusId:Cancelled.id},include:[{model:restaurant,where:{businessType:store.id}}]});
        let storePendingOrders = await order.findAll({
          where: { orderStatusId: { [Op.notIn]: [Cancelled.id, complete.id] } },
          include: [{
            model: restaurant,
            where: { businessType: store.id }
          }]
        });
        
        const storesum = storeTotalOrders.reduce((acc, obj) => acc + parseFloat(obj.total), 0);
        const storeAverageOrder = storesum / storeTotalOrders.length;
        let data = {
            totalOrders,
            deliveryOrders,
            pickOrders,
            scheduleOrders,
            completeOrders,
            cancelOrders,
            PlacedOrders,
            selfPickupOrders,
            cancelOrders,
            PreparingOrders,
            
            restTotalOrders : restTotalOrders ? restTotalOrders.length:0,
            restCompleteOrders : restCompleteOrders ? restCompleteOrders.length :0,
            restCancelledOrders :restCancelledOrders? restCancelledOrders.length : 0,
            restPendingOrders : restPendingOrders ? restPendingOrders.length : 0,
            restAverageOrder:restAverageOrder ? restAverageOrder : 0,
            
            storeTotalOrders : storeTotalOrders ? storeTotalOrders.length:0,
            storeCompleteOrders : storeCompleteOrders ? storeCompleteOrders.length :0,
            storeCancelledOrders :storeCancelledOrders? storeCancelledOrders.length : 0,
            storePendingOrders : storePendingOrders ? storePendingOrders.length : 0,
            storeAverageOrder:storeAverageOrder ? storeAverageOrder : 0,
        }
        let response = ApiResponse("1","Order metrixs","",data);
        return res.json(response)
}

async function salesReports(req,res){
        
        let delivery = await deliveryType.findOne({where:{name:"Delivery"}});
        let selfpickup = await deliveryType.findOne({where:{name:"Self-Pickup"}});
        let complete = await orderStatus.findOne({where:{name:"Delivered"}});
        let rest = await orderApplication.findOne({where:{name:"restaurant"}});
        let store = await orderApplication.findOne({where:{name:"store"}});
        
        let totalSales = await order.sum('total', {});
        let restaurantSales = await order.findAll({include:[{model:restaurant,where:{businessType:rest.id}},{model:orderCharge,attributes:['restaurantEarnings']}],attributes:['id']});
        
        const totalRestaurantSales = restaurantSales.reduce((total, order) => {
            const earnings = order.orderCharge ? parseFloat(order.orderCharge.restaurantEarnings) : 0;
            return total + earnings;
        }, 0);
        let storeSales = await order.findAll({include:[{model:restaurant,where:{businessType:store.id}},{model:orderCharge,attributes:['restaurantEarnings']}],attributes:['id']});
        const totalStoreSales = storeSales.reduce((total, order) => {
            const earnings = order.orderCharge ? parseFloat(order.orderCharge.restaurantEarnings) : 0;
            return total + earnings;
        }, 0);
        let deliveryOrdersTotal = await order.sum('total', {where: {deliveryTypeId: delivery.id,orderStatusId: complete.id}});
        let selfpickupOrdersTotal = await order.sum('total', {where: {deliveryTypeId: selfpickup.id,orderStatusId: complete.id}});
        
        
        let totalOrders = await order.findAll({});
        
        const getMonthName = (date) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ];
            return months[date.getMonth()];
        }
        const ordersPerMonth = {
            "January": 0, "February": 0, "March": 0, "April": 0, "May": 0,
            "June": 0, "July": 0, "August": 0, "September": 0, "October": 0,
            "November": 0, "December": 0
        };
        // Loop through the orders and count them by month
        totalOrders.forEach(order => {
            const createdAt = new Date(order.createdAt);
            const monthName = getMonthName(createdAt);
            ordersPerMonth[monthName]++;
        });
    
        const graphData = Object.keys(ordersPerMonth).map(month => {
            return { [month]: ordersPerMonth[month] };
        });
        let totalEarning = parseFloat(deliveryOrdersTotal) + parseFloat(selfpickupOrdersTotal);
        let data = {
            totalSales:totalSales ? totalSales : 0,
            totalRestaurantSales:totalRestaurantSales ? totalRestaurantSales :0,
            totalStoreSales:totalStoreSales ? totalStoreSales :0,
            totalEarning : totalEarning ? totalEarning : 0,
            deliveryOrdersEarnings:deliveryOrdersTotal ? deliveryOrdersTotal : 0,
            selfpickupOrdersEarnings:selfpickupOrdersTotal ? selfpickupOrdersTotal : 0,
            totalOrdersCount:totalOrders ? totalOrders.length : 0,
            averageTotal:parseFloat(totalSales) / parseFloat(totalOrders.length),
            totalOrders:graphData,
        }
        let response = ApiResponse("1","Sales Reports","",data);
        return res.json(response);
}

async function updateDirector(req, res) {
  let { 
    id, firstName, lastName, bankName, accountHolderName, accountNo, IBAN, 
    swiftCode, bankAddress, bankCountry, streetAddress, zip, city, country 
  } = req.body;
  
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the director within the transaction
    let dir = await director.findOne({ where: { id: id }, transaction: t });

    if (dir) {
      // Update the director's details
      dir.firstName = firstName;
      dir.lastName = lastName;
      dir.bankName = bankName;
      dir.accountHolderName = accountHolderName;
      dir.accountNo = accountNo;
      dir.IBAN = IBAN;
      dir.swiftCode = swiftCode;
      dir.bankAddress = bankAddress;
      dir.bankCountry = bankCountry;
      dir.streetAddress = streetAddress;
      dir.zip = zip;
      dir.city = city;
      dir.country = country;

      // Save the updated director details within the transaction
      await dir.save({ transaction: t });

      await t.commit(); // Commit the transaction

      let response = ApiResponse("1", "Updated successfully", "", {});
      return res.json(response);

    } else {
      await t.rollback(); // Rollback if the director is not found

      let response = ApiResponse("0", "Director not found", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function currentOrders(req, res) {
  try {
    // Get the status ID for "Placed" orders
    const status = await orderStatus.findOne({ where: { name: "Placed" } });
    if (!status) {
      const response = ApiResponse("0", "Order status 'Placed' not found", {});
      return res.status(404).json(response);
    } // Get today's date and the next day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    // Fetch orders with the "Placed" status for today, in descending order by createdAt
    const orders = await order.findAll({
      where: {
        orderStatusId: status.id,
        createdAt: { [Op.gte]: today, [Op.lt]: tomorrow },
      },
      include:[{
          model:restaurant,
          attributes:["name"]
      }],
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: [
          "updatedAt",
          "dropOffId",
          "pickUpId",
          "vehicleTypeId",
          "restaurantId",
          "deliveryTypeId",
          "orderApplicationId",
          "orderModeId",
          "orderStatusId",
          "orderTypeId",
          "paymentMethodId",
        ],
      },
    });
    // Send response with the fetched orders
    const response = ApiResponse("1", "Current Orders", { orders });
    return res.json(response);
  } catch (error) {
    console.error("Error fetching current orders:", error);
    const response = ApiResponse("0", "Internal server error", {});
    return res.status(500).json(response);
  }
}

async function zoneActiveDrivers(req, res) {
  const { zoneId } = req.body;
  const statuses = await orderStatus.findAll({
    where: { name: ["Placed", "Reject", "Cancelled", "Accepted", "Delivered", "Accepted by Driver", "Food Picked up", "On the way"] },
  });

  const statusMap = statuses.reduce((map, status) => {
    map[status.name] = status.id;
    return map;
  }, {});

  
  const getOrders = (driverCondition, statusCondition) => {
    return order.findAll({
      where: {
        driverId: driverCondition,
        orderStatusId: statusCondition,
      },
      include: [{
        model: restaurant,
        required: true,
        include: [{
          model: zoneRestaurants,
          required: true,
          where: { zoneId },
          include: [{ model: zone, attributes: ['id', 'name'] }]
        }]
      }]
    });
  };

  
  const [zoneData, zoneDetail, fireBaseResponse, unassignedOrders, assignedOrders] = await Promise.all([
    driverZone.findAll({
      where: { zoneId },
      include: { model: user, attributes: ['id', 'userName', 'firstName', 'lastName', 'email'] },
    }),
    zone.findOne({ where: { id: zoneId }, attributes: ['id', 'name', 'coordinates'] }),
    axios.get(process.env.FIREBASE_URL),
    getOrders(null, { [Op.notIn]: [statusMap["Placed"], statusMap["Reject"], statusMap["Cancelled"], statusMap["Delivered"]] }),
    getOrders({ [Op.ne]: null }, { [Op.notIn]: [statusMap["Placed"], statusMap["Reject"], statusMap["Cancelled"], statusMap["Delivered"]] })
  ]);

  const fireBaseData = fireBaseResponse.data;

  const activeDrivers = [];
  const inactiveDrivers = [];
  let driversWithOrders = 0;
  let driversWithoutOrders = 0;

  for (const driver of zoneData) {
    const driverId = driver?.user?.id;
    const driverLocation = fireBaseData[driverId];

    if (driverLocation) {
      const [orderData, hasActiveOrder] = await Promise.all([
        order.findOne({
          include: { model: address, as: "dropOffID", include: [{ model: user, attributes: ["userName", "firstName", "lastName"] }] },
          where: {
            driverId,
            orderStatusId: { [Op.notIn]: [statusMap["Placed"], statusMap["Reject"], statusMap["Cancelled"], statusMap["Accepted"], statusMap["Delivered"]] },
          },
        }),
        order.findOne({
          where: {
            driverId,
            orderStatusId: { [Op.in]: [statusMap["Accepted by Driver"], statusMap["Food Picked up"], statusMap["On the way"]] },
          },
        })
      ]);

      activeDrivers.push({
        courier: driver?.user,
        location: driverLocation,
        assigned: Boolean(orderData),
        orderData: orderData || {},
        hasActiveOrder: Boolean(hasActiveOrder),
        zoneDetail: {
          name: zoneDetail.name,
          coordinates: zoneDetail.coordinates,
        }
      });

      if (orderData) {
        driversWithOrders++;
      } else {
        driversWithoutOrders++;
      }
    } else {
      inactiveDrivers.push(driver?.user);
    }
  }

  const data = {
    activeDrivers,
    totalActiveDrivers: activeDrivers.length,
    totalInactiveDrivers: inactiveDrivers.length,
    driversWithOrders,
    driversWithoutOrders,
    totalUnassignedOrders: unassignedOrders.length,
    totalAssignedOrders: assignedOrders.length
  };

  const response = ApiResponse("1", "Active Drivers", "", data);
  return res.json(response);
}


async function overAllEarning(req, res) {
  try {
    const { country, city, zoneId, storeType, startDate, endDate } = req.query;

    const currentYear = new Date().getFullYear();
    const defaultStartDate = new Date(currentYear, 0, 1);
    const defaultEndDate = new Date(currentYear, 11, 31);

    const whereOrder = {
      createdAt: {
        [Op.between]: [new Date(startDate || defaultStartDate), new Date(endDate || defaultEndDate)]
      }
    };

    const calculateEarnings = (earnings) => {
      let totalAdminEarnings = 0;
      let totalAdminDeliveryCharges = 0;
      let totalDriverEarnings = 0;
      let totalRestaurantEarnings = 0;
      let totalRestaurantDeliveryCharges = 0;
      let totalDeliveryCharges = 0;
      let totalAdminDeliveryChargesSum = 0;
      let totalServiceCharges = 0;
      let totalDiscount = 0; 

      let earningsStoreDrivers = 0;
      let earningsFreelanceDrivers = 0;

      earnings.forEach(order => {
        totalAdminEarnings += parseFloat(order.adminEarnings) || 0;
        totalAdminDeliveryCharges += parseFloat(order.adminDeliveryCharges) || 0;
        totalDriverEarnings += parseFloat(order.driverEarnings) || 0;
        totalRestaurantEarnings += parseFloat(order.restaurantEarnings) || 0;
        totalRestaurantDeliveryCharges += parseFloat(order.restaurantDeliveryCharges) || 0;
        totalDeliveryCharges += parseFloat(order.deliveryFees) || 0;
        totalAdminDeliveryChargesSum += parseFloat(order.adminDeliveryCharges) || 0;
        totalServiceCharges += parseFloat(order.serviceCharges) || 0;
        totalDiscount += parseFloat(order.discount) || 0; 

        if (order.order && order.order.user) {
          if (order.order.user.driverType === 'Restaurant') {
            earningsStoreDrivers += (parseFloat(order.deliveryFees) || 0) - (parseFloat(order.adminDeliveryCharges) || 0);
          } else if (order.order.user.driverType === 'Freelancer') {
            earningsFreelanceDrivers += ((parseFloat(order.deliveryFees) || 0) + 
                                         (parseFloat(order.tip) || 0) + 
                                         (parseFloat(order.additionalTip) || 0)) - 
                                         (parseFloat(order.adminDeliveryCharges) || 0);
          }
        }
      });

      return {
        totalAdminEarnings,
        totalAdminDeliveryCharges,
        totalDriverEarnings,
        totalRestaurantEarnings,
        totalRestaurantDeliveryCharges,
        totalDeliveryCharges,
        totalAdminDeliveryChargesSum,
        totalServiceCharges,
        totalDiscount, 
        earningsStoreDrivers,   
        earningsFreelanceDrivers  
      };
    };

    const includeOrder = {
      model: order,
      as: 'order',
      include: [{
        model: restaurant,
        as: 'restaurant',
        attributes: ['country', 'city'],
        include: [{
          model: zoneRestaurants,
          attributes: ['zoneId'],
          where: zoneId ? { zoneId: zoneId } : {},  
          include: [{
            model: zone,
            as: 'zone',
            attributes: ['id', 'name'],
          }]
        }],
        where: {}
      },
      {
        model: orderApplication,
        as: 'orderApplication',
        attributes: ['name'],
        where: storeType ? { name: storeType } : {}
      },
      {
        model: user,
        as: 'user',
        attributes: ['driverType'],  
      }]
    };

    if (country) includeOrder.include[0].where.country = country;
    if (city) includeOrder.include[0].where.city = city;

    const earnings = await orderCharge.findAll({
      attributes: [
        "adminEarnings",
        "adminDeliveryCharges",
        "driverEarnings",
        "restaurantEarnings",
        "restaurantDeliveryCharges",
        "deliveryFees",
        "tip",  
        "additionalTip",
        "serviceCharges",
        "discount"  
      ],
      include: [includeOrder],
      where: whereOrder
    });

    const {
      totalAdminEarnings,
      totalAdminDeliveryCharges,
      totalDriverEarnings,
      totalRestaurantEarnings,
      totalRestaurantDeliveryCharges,
      totalDeliveryCharges,
      totalAdminDeliveryChargesSum,
      totalServiceCharges,
      totalDiscount,  
      earningsStoreDrivers,
      earningsFreelanceDrivers
    } = calculateEarnings(earnings);

    const codOrders = await order.findAll({
      where: { paymentMethodId: 2, ...whereOrder },
      include: includeOrder.include
    });

    const codOrderIds = codOrders.map(order => order.id);
    const codEarnings = await orderCharge.findAll({
      where: { orderId: codOrderIds },
      attributes: [
        "adminEarnings",
        "adminDeliveryCharges",
        "driverEarnings",
        "restaurantEarnings",
        "restaurantDeliveryCharges"
      ]
    });

    const codTotals = calculateEarnings(codEarnings);
    const totalEarningsCOD = codTotals.totalAdminEarnings + codTotals.totalAdminDeliveryCharges +
      codTotals.totalDriverEarnings + codTotals.totalRestaurantEarnings + codTotals.totalRestaurantDeliveryCharges;

    const onlineOrders = await order.findAll({
      where: { paymentMethodId: 1, ...whereOrder },
      include: includeOrder.include
    });

    const onlineOrderIds = onlineOrders.map(order => order.id);
    const onlineEarnings = await orderCharge.findAll({
      where: { orderId: onlineOrderIds },
      attributes: [
        "adminEarnings",
        "adminDeliveryCharges",
        "driverEarnings",
        "restaurantEarnings",
        "restaurantDeliveryCharges"
      ]
    });

    const onlineTotals = calculateEarnings(onlineEarnings);
    const totalEarningsOnline = onlineTotals.totalAdminEarnings + onlineTotals.totalAdminDeliveryCharges +
      onlineTotals.totalDriverEarnings + onlineTotals.totalRestaurantEarnings + onlineTotals.totalRestaurantDeliveryCharges;

    const totalDeliveryFeePaidToDrivers = totalDeliveryCharges - totalAdminDeliveryChargesSum;

    const data = {
      totalAdminEarnings: parseFloat(totalAdminEarnings.toFixed(2)),
      totalEarnings: parseFloat((totalAdminEarnings + totalAdminDeliveryCharges + totalDriverEarnings + totalRestaurantEarnings + totalRestaurantDeliveryCharges).toFixed(2)),
      totalEarningsCOD: parseFloat(totalEarningsCOD.toFixed(2)),
      totalEarningsOnline: parseFloat(totalEarningsOnline.toFixed(2)),
      adminRevenueEarningsOnline: parseFloat((onlineTotals.totalAdminEarnings + onlineTotals.totalAdminDeliveryCharges).toFixed(2)),
      adminRevenueEarningsCOD: parseFloat((codTotals.totalAdminEarnings + codTotals.totalAdminDeliveryCharges).toFixed(2)),
      totalDeliveryCharges: parseFloat(totalDeliveryCharges.toFixed(2)),
      TotalDeliveryFeePaidtoDrivers: parseFloat(totalDeliveryFeePaidToDrivers.toFixed(2)),
      TotaladminDeliveryCharges: parseFloat(totalAdminDeliveryChargesSum.toFixed(2)),
      totalDriverEarnings: parseFloat(totalDriverEarnings.toFixed(2)),
      totalServiceCharges: parseFloat(totalServiceCharges.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),  // Adding total discount to the response
      AdminCommissionFromDeliveryFee: parseFloat(totalAdminDeliveryCharges.toFixed(2)),  
      earningsStoreDrivers: parseFloat(earningsStoreDrivers.toFixed(2)), 
      earningsFreelanceDrivers: parseFloat(earningsFreelanceDrivers.toFixed(2)) 
    };

    const response = ApiResponse("1", "Overall Earnings", "", data);
    return res.json(response);

  } catch (error) {
    console.error("Error calculating overall earnings:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

async function restAllRejectedOrders(req, res) {
  
    const restrejectedOrders = await order.findAll({
      include: [
          {model:deliveryType},
          {model:user,as:"DriverId",attributes:['id','userName','firstName','lastName','email','driverType']},{model:orderType},
          {
        model:orderStatus,
        attributes: ["name"],
        where: {
            name: "Reject"
        },
       

    },{
      model:orderApplication,
      where: { name: "restaurant" },attributes:["name"]
    },
     {
      model: restaurant,
      attributes:["name","deliveryFeeFixed","packingFee","serviceCharges"],
      include: {
        model: zoneRestaurants,
        include: {
          model: zone,
          attributes: ["id"],
          include: {
            model: zoneDetails,
            attributes: ["id"],
            include: [
              { model: unit, as: "distanceUnit" },
              { model: unit, as: "currencyUnit" },
            ],
          },
        },
      },
     
    },
    {
      model:orderMode,
      attributes:["name"]
    },
    {
     model:orderCharge,
     attributes:["driverEarnings","restaurantEarnings","adminDeliveryCharges","discount"]
    },
    {
      model:user,
      attributes:["firstName","lastName"]
    }
    
    ]
    });
   
    let response = ApiResponse("1","Restaurant Rejected Orders","",restrejectedOrders);
    return res.json(response)
   
  } 

async function getTableBooking(req,res){
    
    let data = await tableBooking.findAll({include:[{
        model:orderStatus},
        {model:user,attributes:['id','userName','email','countryCode','phoneNum']},
        {model:restaurant}]});
        let response = ApiResponse("1","Table Bookings","",{data});
        return res.json(response);
}
async function storeAllRejectedOrders(req,res){
  const storerejectedOrders = await order.findAll({
    include: [{
      model:orderStatus,
      attributes: ["name"],
      where: {
          name: "Cancelled"
      },
  },{
    model:orderApplication,
    where: { name: "store" },attributes:["name"]
  }]
  });
 
  let response = ApiResponse("1","Store Rejected Orders","",storerejectedOrders);
  return res.json(response)
}
async function getBookingById(req,res){
  const {id} = req.params
  const bookingData  = await tableBooking.findOne({where:{id},include:[{model:orderStatus},{model:user,attributes:['id','userName','email','countryCode','phoneNum']},{model:restaurant}]})
  let response = ApiResponse("1","Booking Details","",bookingData);
  return res.json(response)
 
}
async function getTotalOrdersByType(req, res) {
  const orderTypes = ['restaurant', 'store'];

  const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const queries = orderTypes.map(async (orderType) => {
      const monthlyOrders = await order.findAll({
          attributes: [
              [sequelize.fn('MONTH', sequelize.col('order.createdAt')), 'month'],
              [sequelize.fn('COUNT', sequelize.col('order.id')), 'totalOrders'],
          ],
          where: {
              '$orderApplication.name$': orderType,
          },
          include: [{
              model: orderApplication,
              attributes: [],
              where: { name: orderType },
          }],
          group: [
              sequelize.fn('MONTH', sequelize.col('order.createdAt'))
          ],
          order: [
              [sequelize.fn('MONTH', sequelize.col('order.createdAt')), 'ASC']
          ],
      });

      const allMonths = monthNames.map((month, index) => ({
          month,
          totalOrders: 0,
      }));

      monthlyOrders.forEach(order => {
          const monthIndex = order.dataValues.month - 1;
          allMonths[monthIndex].totalOrders = order.dataValues.totalOrders;
      });

      const totalOrders = monthlyOrders.reduce((acc, order) => acc + order.dataValues.totalOrders, 0);

      return {
          orderType,
          data: {
              monthlyOrders: allMonths,
              totalOrders,
          },
      };
  });

  const resultsArray = await Promise.all(queries);

  const results = resultsArray.reduce((acc, result) => {
      acc[result.orderType] = result.data;
      return acc;
  }, {});

  let response = ApiResponse("1", "Total Orders by Type", "", results);

  return res.json(response);
}
async function allpayoutrequest(req,res){

  const allPayouts = await payout.findAll({

    include: [{ model: unit, attributes: ["symbol"] },{model:restaurant}],
  });
  let response = ApiResponse("1", "All Payout Requests", "", allPayouts);

  return res.json(response);
}
async function getZones(req,res){
  const zoneData = await zone.findAll({attributes:['id','name']})
  let response = ApiResponse("1", "All Zone", "", zoneData);
  return res.json(response);

}
async function getZoneRestaurant(req,res){
  const {zoneId} = req.params
  const zoneData = await zoneRestaurants.findAll({where:{zoneId:zoneId},attributes:["restaurantId","zoneId"],include:[{model:restaurant}]})
  let response = ApiResponse("1", "Zone Restaurants", "", zoneData);
  return res.json(response);

}

async function getTotalOrdersByRestaurant(req, res) {
  
  const { restId } = req.params;
  const orderType = "restaurant";

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthlyOrders = await order.findAll({
    where: { restaurantId: restId },
    attributes: [
      [sequelize.fn('MONTH', sequelize.col('order.createdAt')), 'month'],
      [sequelize.fn('COUNT', sequelize.col('order.id')), 'totalOrders'],
      [sequelize.fn('SUM', sequelize.col('orderCharge.total')), 'totalAmount'],
    ],
    include: [
      {
        model: orderApplication,
        attributes: [],
        where: { name: orderType },
      },
      {
        model: orderCharge,
        attributes: [],
      }
    ],
    group: [sequelize.fn('MONTH', sequelize.col('order.createdAt'))],
    order: [[sequelize.fn('MONTH', sequelize.col('order.createdAt')), 'ASC']],
  });

  const restaurantTotalEarning = await restaurantEarning.findOne({
    where: { restaurantId: restId },
    attributes: ['totalEarning'],
  });

  const totalCanceledOrders = await order.count({
    where: { restaurantId: restId },
    include: [{
      model: orderStatus,
      attributes: [],
      where: { name: 'Cancelled' },
    }],
  });

  const totalSuccessfulOrders = await order.count({
    where: { restaurantId: restId },
    include: [{
      model: orderStatus,
      attributes: [],
      where: { name: 'Delivered' },
    }],
  });

  const totalDeliveryOrders = await order.count({
    where: { restaurantId: restId },
    include: [{
      model: deliveryType,
      attributes: [],
      where: { name: 'Delivery' },
    }],
  });

  const totalSelfPickupOrders = await order.count({
    where: { restaurantId: restId },
    include: [{
      model: deliveryType,
      attributes: [],
      where: { name: 'Self-Pickup' },
    }],
  });

  const productSales = await orderItems.findAll({
    include: [
      {
        model: order,
        where: { restaurantId: restId },
        attributes: [],
      },
      {
        model: R_PLink, 
        attributes: ['name'], 
      }
    ],
    attributes: [
      'R_PLink.name', 
      [sequelize.fn('SUM', sequelize.col('orderItems.quantity')), 'itemsSold'],
      [sequelize.fn('AVG', sequelize.col('orderItems.unitPrice')), 'averagePrice'],
      [sequelize.fn('SUM', sequelize.col('orderItems.total')), 'revenue'],
    ],
    group: ['R_PLink.name'],
    raw: true,
  });
  
  const allMonths = monthNames.map(month => ({
    month,
    totalOrders: 0,
    totalAmount: 0,
    averageOrderValue: 0,
  }));

  monthlyOrders.forEach(order => {
    const monthIndex = order.dataValues.month - 1;
    allMonths[monthIndex].totalOrders = order.dataValues.totalOrders;
    allMonths[monthIndex].totalAmount = order.dataValues.totalAmount;
    allMonths[monthIndex].averageOrderValue = order.dataValues.totalOrders > 0
      ? (order.dataValues.totalAmount / order.dataValues.totalOrders).toFixed(2)
      : 0;
  });

  const totalOrders = monthlyOrders.reduce((acc, order) => acc + order.dataValues.totalOrders, 0);

  const overallAverageOrderValue = totalOrders > 0 ? (restaurantTotalEarning ? restaurantTotalEarning.totalEarning / totalOrders : 0) : 0;

  const cancellationRate = totalOrders > 0 ? (totalCanceledOrders / totalOrders) * 100 : 0;
  const result = {
    orderType,
    data: {
      orderAndSales:{
      monthlyOrders: allMonths,
      totalOrders,
      totalCanceledOrders, 
      totalSuccessfulOrders, 
      totalDeliveryOrders, 
      totalSelfPickupOrders, 
      totalEarning: restaurantTotalEarning ? restaurantTotalEarning.totalEarning : 0,
      overallAverageOrderValue: overallAverageOrderValue.toFixed(2),
      cancellationRate: cancellationRate.toFixed(2),
      },
      DeliveryAndMenu: productSales.map(product => ({
        productName: product['R_PLink.name'],
        itemsSold: product.itemsSold || 0,
        averagePrice: product.averagePrice ? parseFloat(product.averagePrice).toFixed(2) : 0,
        revenue: product.revenue || 0,
      })),
    },
  };

  let response = ApiResponse("1", "Total Orders by Restaurant", "", result);

  return res.json(response);

}
async function changeStatusAddon(req, res) {
  let { status, addOnId } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Update the add-on status within the transaction
    await addOn.update({ status: status }, { where: { id: addOnId }, transaction: t });

    await t.commit(); // Commit the transaction

    return res.json({
      status: "1",
      message: `Status changed to ${status}`,
      data: {},
      error: "",
    });

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Database Error",
      data: {},
      error: `${error.message}. Please try again later.`,
    });
  }
}


async function updateConfiguration(req, res) {
  const restaurantId = req.params.id;
  const newConfiguration = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the configuration for the given restaurant within the transaction
    const configData = await configuration.findOne({ where: { restaurantId: restaurantId }, transaction: t });

    if (configData) {
      // Update the configuration within the transaction
      await configData.update(newConfiguration, { transaction: t });

      await t.commit(); // Commit the transaction

      let response = ApiResponse("1", "Configuration updated successfully", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if the configuration is not found

      let response = ApiResponse("0", "Configuration not found", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function changeCollectionStatus(req, res) {
  const { id, status } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the collection within the transaction
    let col = await collection.findOne({ where: { id: id }, transaction: t });

    if (col) {
      // Update the status
      col.status = status;

      // Save the changes within the transaction
      await col.save({ transaction: t });

      await t.commit(); // Commit the transaction

      let response = ApiResponse("1", "Status updated", {});
      return res.json(response);
    } else {
      await t.rollback(); // Rollback if the collection is not found

      let response = ApiResponse("0", "Collection not found", "Error", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    let response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}


async function userTypefn(req, res) {
  const userTypeData = await userType.findAll({
    attributes: ["id", "name"],
   
  });
  return res.json({
    status: "1",
    message: "All userType",
    data: userTypeData,
    error: "",
  });
}

async function getMenuCategoriesForFilter(req,res){
    let businessType = await orderApplication.findOne({where:{name:"store"}});
    let categories = await menuCategory.findAll({where:{businessType :  businessType.name}});
    return res.json({
        status: "1",
        message: "All categories",
        data: categories,
        error: "",
      });
    
}


async function driverStatus(req, res) {
  const { driverId, status } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the driver within the transaction
    const driver = await user.findByPk(driverId, { transaction: t });

    if (driver) {
      // Update the driver's status
      driver.status = status;

      // Set verifiedAt if the status is "unblocked" (1)
      if (status == 1) {
        driver.verifiedAt = new Date();
      }

      // Save the changes within the transaction
      await driver.save({ transaction: t });

      await t.commit(); // Commit the transaction

      return res.json({
        status: "1",
        message: `Driver has been ${status === 0 ? "blocked" : "unblocked"} successfully`,
        data: "",
        error: "",
      });
    } else {
      await t.rollback(); // Rollback if the driver is not found

      return res.json({
        status: "0",
        message: "Driver not found",
        data: "",
        error: "Driver not found",
      });
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Error updating driver status",
      data: "",
      error: `${error.message}. Please try again later.`,
    });
  }
}
async function rejectDriver(req, res) {
  const { driverId } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Find the driver within the transaction
    const driver = await user.findByPk(driverId, { transaction: t });

    if (driver) {
      
      driver.reject = true;
      await driver.save({transaction:t})

      await t.commit(); // Commit the transaction

      return res.json({
        status: "1",
        message: `Driver has been reject successfully`,
        data: "",
        error: "",
      });
    } else {
      await t.rollback(); // Rollback if the driver is not found

      return res.json({
        status: "0",
        message: "Driver not found",
        data: "",
        error: "Driver not found",
      });
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    return res.json({
      status: "0",
      message: "Error updating driver status",
      data: "",
      error: `${error.message}. Please try again later.`,
    });
  }
}

async function activeDrivers(req,res){
const allActiveDriver = await user.findAll({
    include:{model:driverDetails,where:{status:true},attributes:['status'],required:true},
    where: {
        userTypeId: 2,
        verifiedAt: {
            [Op.ne]: null      // Not null       // Not an empty string
        }
    }
});

    return res.json({
          status: "1",
          message: "All Active Drivers",
          data: allActiveDriver,
          error: "",
      });
}
async function blockDrivers(req,res){
const allBlockedDrivers = await user.findAll({
    where: {
        userTypeId: 2,
        [Op.and]: [
            { status: { [Op.or]: [false, null] } },  // status is either false or null
            { reject: { [Op.or]: [false, null] } }   // reject is either false or null
        ]
    }
});
    return res.json({
          status: "1",
          message: "All Blocked Drivers",
          data: allBlockedDrivers,
          error: "",
      });
}
async function rejectedDrivers(req,res){
    const allBlockedDrivers = await user.findAll({
        where:{
            userTypeId:2,
            status:0,
            reject:1
           
        },
        // include:{model:driverDetails,attributes:['status'],where:{status:0}}
    })
    return res.json({
          status: "1",
          message: "All Blocked Drivers",
          data: allBlockedDrivers,
          error: "",
      });
}
async function transactionFilter(req, res) {
  const { driverId } = req.params;
  const { filterType, startDate, endDate } = req.query; 

  let start;
  let end;

  if (!filterType && !startDate && !endDate) {
    start = moment().startOf('month').toDate();  
    end = moment().endOf('month').toDate();      
  } else {
    switch (filterType) {
      case 'last90days':
        start = moment().subtract(90, 'days').startOf('day').toDate(); 
        end = moment().endOf('day').toDate();                           
        break;
      case 'lastweek':
        start = moment().subtract(1, 'weeks').startOf('isoWeek').toDate(); 
        end = moment().subtract(1, 'weeks').endOf('isoWeek').toDate();     
        break;
      case 'lastmonth':
        start = moment().subtract(1, 'months').startOf('month').toDate();  
        end = moment().subtract(1, 'months').endOf('month').toDate();      
        break;
      case 'lastyear':
        start = moment().subtract(1, 'years').startOf('year').toDate();   
        end = moment().subtract(1, 'years').endOf('year').toDate();       
        break;
      case 'currentyear':
        start = moment().startOf('year').toDate();  
        end = moment().endOf('year').toDate();      
        break;
      case 'custom':
        if (startDate && endDate) {
          start = moment(startDate).startOf('day').toDate();  
          end = moment(endDate).endOf('day').toDate();        
        } else {
          return res.status(400).json({ success: false, message: 'Invalid custom date range.' });
        }
        break;
      default:
      
        return res.status(400).json({ success: false, message: 'Invalid filter type.' });
    }
  }
    const transactions = await wallet.findAll({
      where: {
        userId: driverId, 
        
        createdAt: {                    
          [Op.gte]: start,              
          [Op.lte]: end                 
        }
      }
    });
   
      return res.json({
          status: "1",
          message: "Driver Transactions",
          data: transactions,
          error: "",
      });
  
}
async function filterOptions(req, res) {
         
        const countryData = await country.findAll({
            attributes: ["id", "name"]
        });
        
      
        const cityData = await city.findAll({
            attributes: ["id","name"]
        });
        
        const zoneData = await zone.findAll({
            attributes: ["id","name"]
        });
        
       
        const storeType = await orderApplication.findAll({
            attributes: ["name"]
        });

       
        const responseData = {
            country: countryData,
            city: cityData,
            zones: zoneData,
            storeTypes: storeType
        };

       
        return res.json({
            status: "1",
            message: "Filter Data",
            data: responseData,
            error: ""
        });

}
async function payoutrequests(req, res) {
  const driverPayouts = await driverPayout.findAll({
    include: [
      { model: unit, attributes: ["symbol"] },
      { model: user, attributes: ["userName"],include:[{model:userType,attributes:["name"]}] }
    ],
  });

  const restPayouts = await restaurantPayout.findAll({
    include: [
      { model: unit, attributes: ["symbol"] },
      { model: restaurant,attributes:["userId"],include:[{model:user,attributes:["userName"],include:[{model:userType,attributes:["name"]}]}] }
    ],
  });

  const totalDriverPayouts = driverPayouts.length;
  const totalRestPayouts = restPayouts.length;
  const totalRequests = totalDriverPayouts + totalRestPayouts;

  let allPayouts = {
    driverPayouts,
    restPayouts,
    totalRequests, 
   
  };

  let response = ApiResponse("1", "All Payout Requests", "", allPayouts);

  return res.json(response);
}
async function addCollection(req, res) {
  const { name, restId } = req.body;
  const requiredFields = ["name"];
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Validate required fields
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

    // Check if the collection already exists within the transaction
    const check = await collection.findOne({
      where: {
        title: name,
        status: true,
        restaurantId: restId,
      },
      transaction: t,
    });

    if (check) {
      await t.rollback(); // Rollback if a matching collection is found
      const response = ApiResponse("0", "Already exists", "", {});
      return res.json(response);
    } else {
      // Create and save the new collection within the transaction
      const coll = new collection();
      coll.title = name;
      coll.maxAllowed = 5;
      coll.minAllowed = 1;
      coll.restaurantId = restId;
      coll.status = true;

      await coll.save({ transaction: t });

      await t.commit(); // Commit the transaction

      const response = ApiResponse("1", "Added successfully", "", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
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

  
    if (minAllowed > maxAllowed) {
      await t.rollback(); 
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
      transaction: t 
    });

    const check = await addOn.findOne({
      where: { name: name, restaurantId: restaurantId, status: true },
      transaction: t
    });

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
    qty,
  } = req.body;

  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    let collectionList = JSON.parse(addonList);
    let check = await R_PLink.findOne({
      where: {
        name: productName,
        RMCLinkId: RMCLinkId,
      },
      transaction: t,
    });

    if (check) {
      await t.rollback(); // Rollback if a product with the same name exists
      let response = ApiResponse("1", "Product already exists with this name", "Error", {});
      return res.json(response);
    }

    // Create a new product entry
    const pro = new product();
    await pro.save({ transaction: t });

    const productData = new R_PLink();
    productData.name = productName;
    productData.description = description ? description : "description";
    productData.image = req?.files?.image[0]?.path?.replace(/\\/g, "/");
    productData.bannerImage = req?.files?.bannerImage[0]?.path?.replace(/\\/g, "/");
    productData.originalPrice = price;
    productData.deliveryPrice = deliveryPrice;
    productData.isAvailable = isAvailable;
    productData.pickupPrice = pickupPrice;
    productData.discountPrice = price;
    productData.discountValue = 0;
    productData.isNew = 1;
    productData.isRecommended = 1;
    productData.weight = weight;
    productData.productId = pro.id;
    productData.status = 1;
    productData.RMCLinkId = RMCLinkId;
    productData.qty = qty;
    productData.countryOfOrigin = countryOfOrigin ? countryOfOrigin : "No";
    productData.ingredients = ingredients ? ingredients : "No Ingredients";
    productData.allergies = allergies ? allergies : "No allergies";
    productData.nutrients = nutrients ? nutrients : "No Nutrients";

    await productData.save({ transaction: t });

    // Add collections and associated addons
    for (const col of collectionList) {
      let proColl = new productCollections();
      proColl.collectionId = col.collectionId;
      proColl.RPLinkId = productData.id;
      proColl.maxAllowed = col.maxAllowed;
      proColl.minAllowed = col.minAllowed;
      proColl.status = true;
      await proColl.save({ transaction: t });

      if (col.addOns.length) {
        for (const newAdd of col.addOns) {
          let addonCheck = await productAddons.findOne({
            where: { RPLinkId: productData.id, addOnId: newAdd.id },
            transaction: t,
          });

          if (addonCheck) {
            addonCheck.isAvailable = newAdd.isAvailable;
            addonCheck.isPaid = newAdd.isPaid;
            addonCheck.price = newAdd.price;
            addonCheck.status = true;
            await addonCheck.save({ transaction: t });
          } else {
            let newData = new productAddons();
            newData.RPLinkId = productData.id;
            newData.addOnId = newAdd.id;
            newData.isAvailable = newAdd.isAvailable;
            newData.isPaid = newAdd.isPaid;
            newData.price = newAdd.price;
            newData.status = true;
            await newData.save({ transaction: t });
          }
        }
      }
    }

    await t.commit(); // Commit the transaction

    const response = ApiResponse("1", "Product Added successfully", "", {});
    return res.json(response);
  } catch (error) {
    await t.rollback(); // Rollback the transaction in case of error

    const response = ApiResponse("0", error.message, "Error", {});
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
async function updateCollection(req, res) {
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
async function deleteAddonCategory(req, res) {
  const { id } = req.body;
  const t = await SequelizeDB.transaction(); 

  try {
    const data = await collection.findOne({ where: { id: id }, transaction: t });
    if (!data) {
      await t.rollback(); 
      const response = ApiResponse("0", "Collection not found", "Error", {});
      return res.json(response);
    }
    await collection.update({ status: 0 }, { where: { id }, transaction: t });
   
    const collectionAddonsToUpdate = await collectionAddons.findAll({ where: { collectionId: id }, transaction: t });
    if (collectionAddonsToUpdate.length > 0) {
      const addonIds = collectionAddonsToUpdate.map(col => col.addOnId);
    
      await Promise.all([
        collectionAddons.update({ status: false }, { where: { collectionId: id }, transaction: t }),
        addOn.update({ status: false }, { where: { id: addonIds }, transaction: t })
      ]);
    }
    
    await t.commit(); 
    const response = ApiResponse("1", "Collection and related data removed successfully", "", {});
    return res.json(response);

  } catch (error) {

    await t.rollback();
    console.error(error);
    const response = ApiResponse("0", "An error occurred", "Error", {});
    return res.status(500).json(response);
  }
}

async function addCategory(req, res) {
  const { name, businessType, restaurantId } = req.body;
  const requiredFields = ["name", "restaurantId", "businessType"];
  
  // Check for required fields
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

  const t = await SequelizeDB.transaction();
  try {
   
    const check_cat = await menuCategory.findOne({
      where: [
        { name: name },
        { businessType: businessType }
      ],
      transaction: t 
    });

    if (check_cat) {
    
      const rmc = await R_MCLink.findOne({
        where: [
          { status: true },
          { menuCategoryId: check_cat.id },
          { restaurantId: restaurantId }
        ],
        transaction: t 
      });

      if (rmc) {
        await t.rollback();
        const response = ApiResponse(
          "0",
          "Category with same name already exists",
          "",
          {}
        );
        return res.json(response);
      } else {
       
        let type = await orderApplication.findOne({
          where: { name: businessType },
          transaction: t 
        });

        const category = new menuCategory();
        category.name = name;
        category.status = true;
        category.businessType = type?.id;
        category.status = 1;
        
        // Save the category
        await category.save({ transaction: t });

        // Link the category to the restaurant
        const rmc = new R_MCLink();
        rmc.restaurantId = restaurantId;
        rmc.status = true;
        rmc.menuCategoryId = category.id;
        await rmc.save({ transaction: t });

        await t.commit(); 

        const response = ApiResponse(
          "1",
          "Category added successfully",
          "",
          {}
        );
        return res.json(response);
      }
    } else {
      // If the category doesn't exist, create a new one
      const category = new menuCategory();
      category.name = name;
      category.status = true;
      category.businessType = businessType;
      category.status = 1;

      // Save the new category
      await category.save({ transaction: t });

      // Link the new category to the restaurant
      const rmc = new R_MCLink();
      rmc.restaurantId = restaurantId;
      rmc.status = true;
      rmc.menuCategoryId = category.id;
      await rmc.save({ transaction: t });

      await t.commit(); // Commit the transaction if successful

      const response = ApiResponse(
        "1",
        "Category added successfully",
        "",
        {}
      );
      return res.json(response);
    }
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}

async function removeCategory(req, res) {
  const { id, restId } = req.body;
  const t = await SequelizeDB.transaction();

  try {
   
    const menu = await menuCategory.findOne({
      where: { id: id },
      transaction: t 
    });

    if (menu) {
  
      menu.status = false;
      await menu.save({ transaction: t }); 
    
      const rmc = await R_MCLink.findOne({
        where: [
          { menuCategoryId: menu.id },
          { restaurantId: restId }
        ],
        transaction: t 
      });

      if (rmc) {
       
        rmc.status = false;
        await rmc.save({ transaction: t }); 
      }

      await t.commit();

      const response = ApiResponse(
        "1",
        "Category removed successfully",
        "",
        {}
      );
      return res.json(response);

    } else {
      await t.rollback(); 
      const response = ApiResponse("0", "Category not found!", "", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); 

    const response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}

async function editCategory(req, res) {
  const { categoryId, name } = req.body;
  const requiredFields = ["categoryId", "name"];
  const t = await SequelizeDB.transaction(); 

  try {
  
    for (const field of requiredFields) {
      if (!req.body[field]) {
        const response = ApiResponse(
          "0",
          `${field.toUpperCase()} is required`,
          `Please provide a value for ${field.toUpperCase()}`,
          {}
        );
        await t.rollback();
        return res.json(response);
      }
    }

    
    const category = await menuCategory.findOne({
      where: { id: categoryId },
      transaction: t 
    });

    if (category) {
     
      category.name = name;

     
      if (req.file) {
        const imagePath = category.image;

      
        if (imagePath) {
          try {
            fs.unlinkSync(imagePath); 
          } catch (err) {
            console.error(err); // Log error if file deletion fails
          }
        }

       
        let tmpPath = req.file.path;
        let path = tmpPath.replace(/\\/g, "/");
        category.image = path;
      }

      // Save changes within the transaction
      await category.save({ transaction: t });

      await t.commit(); // Commit the transaction if successful

      const response = ApiResponse(
        "1",
        "Category updated successfully",
        "",
        {}
      );
      return res.json(response);

    } else {
      await t.rollback(); // Rollback if the category is not found
      const response = ApiResponse("0", "Category not found", "", {});
      return res.json(response);
    }

  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs

    const response = ApiResponse("0", error.message, "", {});
    return res.json(response);
  }
}


async function salesDahboardRestaurant(req, res) {
    let rest = await orderApplication.findOne({ where: { name: "restaurant" } });
         const totalCanceledOrders = await order.count({
    include: [{
      model: orderStatus,
      attributes: [],
      where: { name: 'Cancelled' },
    }],
  });
 let schedule = await orderMode.findOne({where:{name:"Scheduled"}});
  const totalSuccessfulOrders = await order.count({
    include: [{
      model: orderStatus,
      attributes: [],
      where: { name: 'Delivered' },
    }],
  });
  let totalScheduleOrders = await order.count({where:{orderModeId : schedule.id}});
       
     
    const totalRestaurants = await restaurant.count({ where: { businessType: rest.id } });

    let restaurantSales = await order.findAll({
        include: [
            { model: restaurant, where: { businessType: rest.id } },
            { model: orderCharge, attributes: ['restaurantEarnings'] }
        ],
        attributes: ['id']
    });

    const totalRestaurantSales = restaurantSales.reduce((total, order) => {
        const earnings = order.orderCharge ? parseFloat(order.orderCharge.restaurantEarnings) : 0;
        return total + earnings;
    }, 0);

    const totalOrders = await order.count({
        include: [
            { model: restaurant, where: { businessType: rest.id } }
        ]
    });

    const data = {
        TotalRegisteredRestaurants: totalRestaurants,
        totalRestaurantSales,
        totalOrders,
        totalSuccessfulOrders,
        totalCanceledOrders,
        totalScheduleOrders
    };

    const response = ApiResponse(
        "1",
        { data },
        "",
        {}
    );

    return res.json(response);
}
async function getBanners(req,res){
    const bannerData = await banner.findAll({})
     const response = ApiResponse(
        "1",
        "All Banners",
        "",
        {bannerData}
    );

    return res.json(response);
}
async function createBanner(req,res){
   const {title,type,startDate,endDate,cityId,dimension,businessType} = req.body
     let imagePathTemp = req.file.path;
     let imagePath = imagePathTemp.replace(/\\/g, "/");
     const bannerData = await banner.create({
        title,type,startDate,endDate,cityId,image:imagePath,status:1,dimension:dimension,businessType:businessType
     })
   
     const response = ApiResponse(
        "1",
        "Banner Created",
        "",
        {}
    );

    return res.json(response);
}

function getMonthlyEarnings(orders) {
    const earningsByMonth = {};

    // Initialize all 12 months with 0 earnings
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    monthNames.forEach(month => {
        earningsByMonth[month] = 0;
    });

    // Aggregate earnings from actual data
    orders.forEach(order => {
        const createdAt = new Date(order.createdAt);
        const month = createdAt.toLocaleString('default', { month: 'long' });

        // Check if orderCharge and restaurantEarnings are available
        const earnings = order.orderCharge && order.orderCharge.restaurantEarnings
            ? parseFloat(order.orderCharge.restaurantEarnings)
            : 0;

        // Aggregate the earnings by month
        if (earningsByMonth[month] !== undefined) {
            earningsByMonth[month] += earnings;
        }
    });

    // Convert the result to an array of objects in the desired format
    return Object.entries(earningsByMonth).map(([month, totalEarnings]) => ({
        [month]: totalEarnings.toFixed(2) // Format to 2 decimal places
    }));
}
function getRestaurantSummary(orders) {
    const summary = {};

    orders.forEach(order => {
        const restaurantName = order.restaurant.businessName;
        const deliveryType = order.deliveryType.name;
        const orderStatus = order.orderStatus.name;

        // Initialize the restaurant entry if it doesn't exist
        if (!summary[restaurantName]) {
            summary[restaurantName] = {
                restaurantName,
                totalOrders: 0,
                deliveryOrders: 0,
                cancelledOrders: 0,
                pickupOrders: 0,
                deliveredOrders: 0
            };
        }

        // Increment total orders
        summary[restaurantName].totalOrders += 1;

        // Check and count delivery or pickup orders
        if (deliveryType === "Delivery") {
            summary[restaurantName].deliveryOrders += 1;
        } else if (deliveryType === "Self-Pickup") {
            summary[restaurantName].pickupOrders += 1;
        }

        // Check and count cancelled or delivered orders
        if (orderStatus === "Reject") {
            summary[restaurantName].cancelledOrders += 1;
        } else if (orderStatus === "Delivered") {
            summary[restaurantName].deliveredOrders += 1;
        }
    });

    // Convert the result to an array
    return Object.values(summary);
}
function sumRestaurantEarnings(orders) {
    // Initialize the sum to 0
    let totalEarnings = 0;
    // Loop through each order
    orders.forEach(order => {
        // Check if orderCharge and restaurantEarnings exist and if it's a valid number
        if (
            order.orderCharge &&
            order.orderCharge.restaurantEarnings &&
            !isNaN(parseFloat(order.orderCharge.restaurantEarnings))
        ) {
            // Add the earnings to the total sum
            totalEarnings += parseFloat(order.orderCharge.restaurantEarnings);
        }
    });
    // Return the total sum
    return totalEarnings;
}
function calculateEarningsByPaymentMethod(orders) {
    let onlineEarnings = 0;
    let codEarnings = 0;

    orders.forEach(order => {
        if (
            order.orderCharge &&
            order.orderCharge.restaurantEarnings &&
            !isNaN(parseFloat(order.orderCharge.restaurantEarnings)) &&
            order.paymentMethod &&
            order.paymentMethod.name
        ) {
            const earnings = parseFloat(order.orderCharge.restaurantEarnings);

            if (order.paymentMethod.name.toLowerCase() === "adyen") {
                // Add to online earnings if the payment method is Adyen
                onlineEarnings += earnings;
            } else if (order.paymentMethod.name.toLowerCase() === "cod") {
                // Add to COD earnings if the payment method is COD
                codEarnings += earnings;
            }
        }
    });

    return {
        onlineEarnings,
        codEarnings
    };
}
async function zoneWiseRestaurantAnalytics(req,res){
    const { zoneId } = req.body;
    let type = await orderApplication.findOne({where:{name:"restaurant"}});
    
    // total restaurants
    let totalRestaurants = await restaurant.findAll({where:{businessType:type.id},include:{model:zoneRestaurants,where:{zoneId:zoneId},required:true}});
    let restIds = totalRestaurants.map((dat)=>dat.id);
    
    // new items 
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    let totalItems = await R_PLink.count({
    where: {
        createdAt: {
            [Op.gte]: lastWeek // Only include records created within the last week
        }
    },
    include: [
        {
            model: R_MCLink,
            where: {
                restaurantId: {
                    [Op.in]: restIds // Use Op.in to match any value in restIds array
                }
            },
            required: true
        }
    ]
});

    // total Orders
    // Initialize counters
let deliveredCount = 0;
let rejectedCount = 0;
let scheduledCount = 0;
let incompleteCount = 0;
    let orders = await order.findAll({
        attributes:['id','orderNum','createdAt'],
    where: {
        restaurantId: {
            [Op.in]: restIds // Use Op.in to match any value in restIds array
        }
    },
    include:[{model:restaurant,attributes:['businessName'],include:{model:zoneRestaurants,where:{zoneId:zoneId},required:true}},{model:deliveryType,attributes:['name']},{model:orderStatus,attributes:['name']},{model:orderMode,attributes:['name']},{model:orderCharge,attributes:['restaurantEarnings']},{model:paymentMethod,attributes:['name']}]
});

orders.forEach(order => {
    const status = order.orderStatus.name;
    const mode = order.orderMode.name;

    if (status === "Delivered") {
        deliveredCount++;
    } else if (status === "Reject") {
        rejectedCount++;
    }

    // Check for "Scheduled" orders by orderMode
    if (mode === "Scheduled") {
        scheduledCount++;
    }

    // Determine "Incomplete" orders
    if (["Placed", "On the way"].includes(status)) {
        incompleteCount++;
    }
});

    let data = {
        totalRestaurants : totalRestaurants.length,
        totalItems,
        totalOrders:orders.length,
        deliveredCount,
        rejectedCount,
        scheduledCount,
        incompleteCount,
        summary:getRestaurantSummary(orders),
        graphData:getMonthlyEarnings(orders),
        salesReport:{
            grossSale:sumRestaurantEarnings(orders),
            earnings:calculateEarningsByPaymentMethod(orders)
        }
    }
    return res.json(ApiResponse("1","Zone Wise Restaurant Analytics","",data));
}
async function zoneWiseStoreAnalytics(req,res){
    const { zoneId } = req.body;
    let type = await orderApplication.findOne({where:{name:"store"}});
    
    // total restaurants
    let totalRestaurants = await restaurant.findAll({where:{businessType:type.id},include:{model:zoneRestaurants,where:{zoneId:zoneId},required:true}});
    let restIds = totalRestaurants.map((dat)=>dat.id);
    
    // new items 
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    let totalItems = await R_PLink.count({
    where: {
        createdAt: {
            [Op.gte]: lastWeek // Only include records created within the last week
        }
    },
    include: [
        {
            model: R_MCLink,
            where: {
                restaurantId: {
                    [Op.in]: restIds // Use Op.in to match any value in restIds array
                }
            },
            required: true
        }
    ]
});

    // total Orders
    // Initialize counters
let deliveredCount = 0;
let rejectedCount = 0;
let scheduledCount = 0;
let incompleteCount = 0;
    let orders = await order.findAll({
        attributes:['id','orderNum','createdAt'],
    where: {
        restaurantId: {
            [Op.in]: restIds // Use Op.in to match any value in restIds array
        }
    },
    include:[{model:restaurant,attributes:['businessName'],include:{model:zoneRestaurants,where:{zoneId:zoneId},required:true}},{model:deliveryType,attributes:['name']},{model:orderStatus,attributes:['name']},{model:orderMode,attributes:['name']},{model:orderCharge,attributes:['restaurantEarnings']},{model:paymentMethod,attributes:['name']}]
});

orders.forEach(order => {
    const status = order.orderStatus.name;
    const mode = order.orderMode.name;

    if (status === "Delivered") {
        deliveredCount++;
    } else if (status === "Reject") {
        rejectedCount++;
    }

    // Check for "Scheduled" orders by orderMode
    if (mode === "Scheduled") {
        scheduledCount++;
    }

    // Determine "Incomplete" orders
    if (["Placed", "On the way"].includes(status)) {
        incompleteCount++;
    }
});

// return res.json(orders)
    let data = {
        totalRestaurants : totalRestaurants.length,
        totalItems,
        totalOrders:orders.length,
        deliveredCount,
        rejectedCount,
        scheduledCount,
        incompleteCount,
        summary:getRestaurantSummary(orders),
        graphData:getMonthlyEarnings(orders),
        salesReport:{
            grossSale:sumRestaurantEarnings(orders),
            earnings:calculateEarningsByPaymentMethod(orders)
        }
    }
    return res.json(ApiResponse("1","Zone Wise Restaurant Analytics","",data));
}
async function restaurantAnalytics(req,res){
    
    let type = await orderApplication.findOne({where:{name:"restaurant"}});
    
    // total restaurants
    let totalRestaurants = await restaurant.findAll({where:{businessType:type.id}});
    let restIds = totalRestaurants.map((dat)=>dat.id);
    
    // new items 
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    let totalItems = await R_PLink.count({
    where: {
        createdAt: {
            [Op.gte]: lastWeek // Only include records created within the last week
        }
    },
    include: [
        {
            model: R_MCLink,
            where: {
                restaurantId: {
                    [Op.in]: restIds // Use Op.in to match any value in restIds array
                }
            },
            required: true
        }
    ]
});

    // total Orders
    // Initialize counters
let deliveredCount = 0;
let rejectedCount = 0;
let scheduledCount = 0;
let incompleteCount = 0;
    let orders = await order.findAll({
        attributes:['id','orderNum','createdAt'],
    where: {
        restaurantId: {
            [Op.in]: restIds // Use Op.in to match any value in restIds array
        }
    },
    include:[{model:restaurant,attributes:['businessName']},{model:deliveryType,attributes:['name']},{model:orderStatus,attributes:['name']},{model:orderMode,attributes:['name']},{model:orderCharge,attributes:['restaurantEarnings']},{model:paymentMethod,attributes:['name']}]
});

orders.forEach(order => {
    const status = order.orderStatus.name;
    const mode = order.orderMode.name;

    if (status === "Delivered") {
        deliveredCount++;
    } else if (status === "Reject") {
        rejectedCount++;
    }

    // Check for "Scheduled" orders by orderMode
    if (mode === "Scheduled") {
        scheduledCount++;
    }

    // Determine "Incomplete" orders
    if (["Placed", "On the way"].includes(status)) {
        incompleteCount++;
    }
});

    let data = {
        totalRestaurants : totalRestaurants.length,
        totalItems,
        totalOrders:orders.length,
        deliveredCount,
        rejectedCount,
        scheduledCount,
        incompleteCount,
        summary:getRestaurantSummary(orders),
        graphData:getMonthlyEarnings(orders),
        salesReport:{
            grossSale:sumRestaurantEarnings(orders),
            earnings:calculateEarningsByPaymentMethod(orders)
        }
    }
    return res.json(ApiResponse("1","Restaurant Analytics","",data));
}
async function storeAnalytics(req,res){
    
    let type = await orderApplication.findOne({where:{name:"store"}});
    
    // total restaurants
    let totalRestaurants = await restaurant.findAll({where:{businessType:type.id}});
    let restIds = totalRestaurants.map((dat)=>dat.id);
    
    // new items 
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    let totalItems = await R_PLink.count({
    where: {
        createdAt: {
            [Op.gte]: lastWeek // Only include records created within the last week
        }
    },
    include: [
        {
            model: R_MCLink,
            where: {
                restaurantId: {
                    [Op.in]: restIds // Use Op.in to match any value in restIds array
                }
            },
            required: true
        }
    ]
});

    // total Orders
    // Initialize counters
let deliveredCount = 0;
let rejectedCount = 0;
let scheduledCount = 0;
let incompleteCount = 0;
    let orders = await order.findAll({
        attributes:['id','orderNum','createdAt'],
    where: {
        restaurantId: {
            [Op.in]: restIds // Use Op.in to match any value in restIds array
        }
    },
    include:[{model:restaurant,attributes:['businessName']},{model:deliveryType,attributes:['name']},{model:orderStatus,attributes:['name']},{model:orderMode,attributes:['name']},{model:orderCharge,attributes:['restaurantEarnings']},{model:paymentMethod,attributes:['name']}]
});

orders.forEach(order => {
    const status = order.orderStatus.name;
    const mode = order.orderMode.name;

    if (status === "Delivered") {
        deliveredCount++;
    } else if (status === "Reject") {
        rejectedCount++;
    }

    // Check for "Scheduled" orders by orderMode
    if (mode === "Scheduled") {
        scheduledCount++;
    }

    // Determine "Incomplete" orders
    if (["Placed", "On the way"].includes(status)) {
        incompleteCount++;
    }
});
// return res.json(orders)
    let data = {
        totalStores : totalRestaurants.length,
        totalItems,
        totalOrders:orders.length,
        deliveredCount,
        rejectedCount,
        scheduledCount,
        incompleteCount,
        summary:getRestaurantSummary(orders),
        graphData:getMonthlyEarnings(orders),
        salesReport:{
            grossSale:sumRestaurantEarnings(orders),
            earnings:calculateEarningsByPaymentMethod(orders)
        }
    }
    return res.json(ApiResponse("1","Store Analytics","",data));
}


// stamp Card Module

async function addStampCard(req, res) {
  const { title, value, cityId } = req.body;
  const t = await SequelizeDB.transaction(); // Start a transaction

  try {
    // Check for duplicate title
    let checkTitle = await stampCard.findOne({
      where: { title: title },
      transaction: t, // Ensure transaction is included in queries
    });

    if (checkTitle) {
      return res.json(
        ApiResponse("0", "A stamp card with this title already exists", "", {})
      );
    }

    // Create a new stamp card
    let stamp = new stampCard();
    stamp.title = title;
    stamp.value = value;
    stamp.cityId = cityId;
    stamp.status = true;
  

    // Handle image upload
    if (req.file) {
      let tmpPath = req.file.path;
      let path = tmpPath.replace(/\\/g, "/");
      stamp.image = path;
    }

    // Set start and end dates
    stamp.startDate = new Date(); // Current date
    stamp.endDate = new Date();
    stamp.endDate.setFullYear(stamp.endDate.getFullYear() + 1); // Add 1 year to the current date

    // Save the stamp card
    await stamp.save({ transaction: t });

    // Commit the transaction
    await t.commit();

    return res.json(ApiResponse("1", "Added successfully", "", {}));
  } catch (error) {
      console.log(error)
    // Rollback the transaction in case of error
    await t.rollback();

    const response = ApiResponse("0", error.message, "Error", {});
    return res.json(response);
  }
}

async function linkRestaurantstoStampCard(req, res) {
    const { restaurantIds, stampCardId } = req.body;
    const t = await SequelizeDB.transaction();  // Move transaction initialization here
    
    try {
        if (restaurantIds.length > 0) {
            for (const rest of restaurantIds) {
                // Check if the restaurant is already linked to the stamp card
                let check = await stampCardRestaurants.findOne({
                    where: { restaurantId: rest, stampCardId: stampCardId },
                    transaction: t  // Include transaction in query
                });
                if (!check) {
                    let dd = new stampCardRestaurants();
                    dd.startDate = new Date();
                    dd.endDate = new Date();
                    dd.endDate.setFullYear(dd.startDate.getFullYear() + 1);  // Use dd.startDate here instead of stamp.endDate
                    dd.restaurantId = rest;
                    dd.stampCardId = stampCardId;
                    dd.status = true;

                    // Save the new record with transaction
                    await dd.save({ transaction: t });
                }
            }
            // Commit the transaction after the loop
            await t.commit();
            return res.json(ApiResponse("1", "Restaurants linked successfully", "", {}));
        } else {
            return res.json(ApiResponse("0", "No restaurant IDs provided", "", {}));
        }
    } catch (error) {
        // If an error occurs, rollback the transaction
        await t.rollback();
        return res.json(ApiResponse("0", error.message, "", {}));
    }
}

async function getActiveOrders(req,res){
    const statuses = await orderStatus.findAll({
            where: {
                name: {
                    [Op.in]: [
                        "Accepted by Driver",
                        "Placed",
                        "Preparing",
                        "Food Arrived",
                        "Ready for delivery",
                        "Accepted",
                        "On the way",
                        "Food Pickedup",
                    ],
                },
            },
        });

        // Create a lookup object for status IDs
        const statusIds = statuses.map((status) => status.id);
        
    let orders = await order.findAll({where:{orderStatusId :statusIds},include:[{model:restaurant,attributes:['businessName']},{model:orderStatus,attributes:['name']},{model:user,attributes:['id','firstName','lastName','userName','email']},{model:user,as:"DriverId",attributes:['id','firstName','lastName','userName','email']}]});
    return res.json(orders)
}

async function updateStatus(req,res){
    const { orderStatusId , orderId } = req.body;
    
    let orderData = await order.findOne({where:{id:orderId}});
    if(orderData){
        orderData.orderStatusId = orderStatusId;
        await orderData.save();
        
        let time = Date.now();
        await orderHistory.create({
          time,
          orderId: orderId,
          orderStatusId: orderStatusId,
        });
        
        return res.json(ApiResponse("1","Status updated successfully","",{}));
    }
    else{
        return res.json(ApiResponse("0","Order not found!","",{}));
    }
}

async function getOrderStatus(req,res){
    let status = await orderStatus.findAll({where:{name:['Placed'
    ,'Accepted',
    ,'Preparing',
    ,'Ready for delivery',
    ,'On the way',
    ,'Food Pickedup',
    ,'Delivered',
    ,'Cancelled',
    ,'Accepted by Driver',
    ,'Reject',
    ,'Seen',
    ]}});
    return res.json(ApiResponse("1","Data","",{status}));
}

module.exports = {
  addUserType,
  addRole,
  login,
  logout,
  changePassword,
  addAddressType,
  getAddressType,
  deleteAddressType,
  editAddressType,
  addMenuCategory,
  allMenuCategories,
  activeMenuCategories,
  editMenuCategories,
  changeStatusMenuCategories,
  addCuisine,
  getAllCuisines,
  getActiveCuisines,
  editCuisine,
  changeCuisineStatus,
  addPaymentMethod,
  getAllPaymentMethods,
  getactivePaymentMethods,
  editPaymentMethod,
  changePaymentMethodStatus,
  addDeliveryType,
  activeDeliveryTypes,
  update_role_permissions,
  addDeliveryFeeType,
  activeDeliveryFeeType,
  addUnit,
  getAllUnits,
  getSpecificUnits,
  editUnit,
  changeUnitStatus,
  addRestaurant,
  getAllRestaurants,
  getResGeneral,
  editResGeneral,
  getResMetaData,
  editResMetaData,
  getResDeliverySettings,
  editResDeliverySettings,
  getResPaymentSettings,
  editResPaymentSettings,
  getResCharges,
  editResCharges,
  getResImages,
  editResImages,
  changeRestaurantStatus,
  getMenuSettings,
  updateMenuSettings,
  addAddonCategory,
  addAddon,
  allRestaurantsforProd,
  menuCategoriesOfRestaurant,
  getAllProducts,
  getProductbyId,
  getAddOnCats,
  getAddOns,
  assignAddOnProd,
  addProduct,
  changeProductStatus,
  updateProduct,
  updateProductAddOn,
  getAllUsers,
  getAllCustomers,
  getAllDrivers,
  getAllEmployees,
  addUser,
  getAllActiveRoles,
  getCustEmpDetails,
  getDriverDetails,
  updateUserDetails,
  banUser,
  approveUser,
  allActiveRoleswithType,
  updateRole,
  getAllRestOwners,
  getAllAddOnCats,
  updateAddOnCat,
  changeAddOnCatStatus,
  getAllAddOn,
  updateAddOn,
  changeAddOnStatus,
  changeStatusOfProdAddOnCat,
  addVehicleType,
  getAllVehicles,
  changeStatusVehicle,
  updateVehicle,
  getAllOrders,
  getOrderDetails,
  contactUsEmail,
  contactUsPhone,
  get_role_permissions,
  addVoucher,
  getAllVouchers,
  changeStatusOfVoucher,
  updateVoucher,
  voucherAssocaitedRest,
  pushNotifications,
  getAllPushNot,
  dashbaordStats,
  topItems,
  assign_permissions_to_role,
  earningAllRestaurants,
  payoutRequestsByRest,
  get_charges,
  update_charge,
  get_social_links,
  update_social_links,
  get_app_links,
  update_app_links,
  get_app_pages,
  update_app_pages,
  getAllActiveUnits,
  getAllRelatedRestaurants,
  getUnits,
  getWallet,
  getAllOrdersTaxi,
  getScheduledOrdersTaxi,
  getCompletedOrdersTaxi,
  updatecuisineSettings,
  all_order_applications,
  get_all_business_types,
  getAllStoreOwners,
  get_module_types,
  add_permission,
  get_permissions,
  addAddonCategoryStore,
  addaddonStore,
  allStoresforProd,
  addMenuCategoryStore,
  addCuisineStore,
  getAddOnCatsStore,
  allMenuCategoriesStore,
  getAllCuisinesStore,
  getAllAddOnStore,
  getAllProductsStore,
  testing_link,
  allRoles,
  roleDetails,
  changeStatusOfRole,
  changePermissionStatus,
  updatePermission,
  getRestaurantProducts,
  restaurant_culteries,
  updateRestaurantCultery,
  getRestaurantCuisines,
  updateRestaurantCuisine,
  getAllStores,
  getAllDefaultValues,
  updateDefaultValue,
  updateUnit,
  getAllZones,
  addZone,
  changeZoneStatus,
  updateZone,
  sendingNotification,
  getDataForAddingRestaurant,
  get_all_culteries,
  restAddOns,
  addOnCategoryRest,
  addOnCategoryStore,
  storeAddOns,
  getSpecificRestOrders,
  storeAllOrders,
  restAllOrders,
  restAllDeliveredOrders,
  storeAllDeliveredOrders,
  restAllCancelledOrders,
  storeAllCancelledOrders,
  storeAllScheduleOrders,
  restAllScheduleOrders,
  addCuisine,
  updateVehicleType,
  all_earnings,
  get_profile,
  update_profile,
  restaurant_earnings,
  store_earnings,
  driver_earnings,
  restaurantReports,
  storeReports,
  getCountries,
  addCountry,
  changeCountryStatus,
  editCountry,
  getCities,
  addCity,
  editCity,
  changeStatusofCity,
  addSetting,
  customerReports,
  orderMetrics,
  salesReports,
  updateDirector,
  getSetting,
  updateSetting,
  currentOrders,
  zoneActiveDrivers,
  overAllEarning,
  restAllRejectedOrders,
  getTableBooking,
  storeAllRejectedOrders,
  getBookingById,
  getTotalOrdersByType,
  allpayoutrequest,
  getZones,
  getZoneRestaurant,
  getTotalOrdersByRestaurant,
  changeStatusAddon,
  updateConfiguration,
  changeCollectionStatus,
  userTypefn,
  getMenuCategoriesForFilter,
  driverStatus,
  activeDrivers,
  blockDrivers,
  transactionFilter,
  filterOptions,
  payoutrequests,
  getAllAddOnCategories,
  addProduct,
  addCollection,
  addAddOns,
  updateCollection,
  deleteAddonCategory,
  addCategory,
  editCategory,
  removeCategory,
  salesDahboardRestaurant,
  getBanners,
  createBanner,
  restaurantAnalytics,
  storeAnalytics,
  zoneWiseRestaurantAnalytics,
  zoneWiseStoreAnalytics,
  filterOrders,
  
  addStampCard,
  linkRestaurantstoStampCard,
  rejectDriver,
  rejectedDrivers,
  getActiveOrders,
  updateStatus,
  getOrderStatus
  
  
  
};
