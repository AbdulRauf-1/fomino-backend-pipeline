module.exports = (sequelize, DataTypes) =>{
    const adminEarning = sequelize.define('adminEarning', {
        
        totalEarning: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
    });
    adminEarning.associate = (models)=>{
        
    };
    return adminEarning;
};
