module.exports = (sequelize, DataTypes) =>{
    const restaurantBanners = sequelize.define('restaurantBanners', {
        title: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        exDescription: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
       
        dimension: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        businessType: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        bannerType: {
            type: DataTypes.ENUM('Discount', 'FreeDelivery', 'BOGO'),
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isAdult:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
    restaurantBanners.associate = (models)=>{
        
        restaurantBanners.hasOne(models.discountDetail);
        models.discountDetail.belongsTo(restaurantBanners);
        
       
        
        restaurantBanners.hasOne(models.bogoDetail);
        models.bogoDetail.belongsTo(restaurantBanners);
    };
    return restaurantBanners;
};
