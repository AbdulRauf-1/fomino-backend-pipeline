module.exports = (sequelize, DataTypes) =>{
    const driverPayout = sequelize.define('driverPayout', {
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
    return driverPayout;
};