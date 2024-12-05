module.exports = (sequelize, DataTypes) =>{
    const driverHourlyEarnings = sequelize.define('driverHourlyEarnings', {
        time: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0, // Start with zero hours
  },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        }
    });
    return driverHourlyEarnings;
};