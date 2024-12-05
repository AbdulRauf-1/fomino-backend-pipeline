module.exports = (sequelize, DataTypes) =>{
    const orderCharge = sequelize.define('orderCharge', {
        basketTotal: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        deliveryFees: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        discount: {
             type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        serviceCharges: {
             type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        VAT: {
           type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        packingFee: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        fine: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        tip: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        additionalTip: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        total: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        adminEarnings: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        adminDeliveryCharges: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        driverEarnings: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        restaurantEarnings: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        restaurantDeliveryCharges: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        adminPercent: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        baseFare: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        distFare: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        timeFare: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        processingFee: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        cardFee: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        
    });
    return orderCharge;
};