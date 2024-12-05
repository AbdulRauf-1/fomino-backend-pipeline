module.exports = (sequelize, DataTypes) => {
    const bogoDetail = sequelize.define('bogoDetail', {
        
        buyItem: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        getItem: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        
    });

    bogoDetail.associate = (models) => {
       
    };

    return bogoDetail;
};
