module.exports = (sequelize, DataTypes) =>{
    const driverOnlineSession = sequelize.define('driverOnlineSession', {
        start_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
         status:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
       
        
    });
    return driverOnlineSession;
};