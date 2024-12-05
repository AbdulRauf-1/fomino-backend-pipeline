module.exports = (sequelize, DataTypes) =>{
    const stampCardPoints = sequelize.define('stampCardPoints', {
        value: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true,
        },
        endDate: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
         status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    });
     stampCardPoints.associate = (models)=>{
         
        
    };
    return stampCardPoints;
};