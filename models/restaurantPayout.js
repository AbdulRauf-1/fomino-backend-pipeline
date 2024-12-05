module.exports = (sequelize, DataTypes) =>{
    const restaurantPayout = sequelize.define('restaurantPayout', {
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(),
            allowNull: true,
        }, 
        note: {
            type: DataTypes.STRING(),
            allowNull: true,
        }, 
        accountNo: {
            type: DataTypes.STRING(),
            allowNull: true,
        }, 
        transactionId: {
            type: DataTypes.STRING(),
            allowNull: true,
        }, 
        
       
    });
    return restaurantPayout;
};