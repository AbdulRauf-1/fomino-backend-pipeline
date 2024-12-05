module.exports = (sequelize, DataTypes) =>{
    const driverCommission = sequelize.define('driverCommission', {
        
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        distance: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        time: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
    });
    driverCommission.associate = (models)=>{
        
    };
    return driverCommission;
};
