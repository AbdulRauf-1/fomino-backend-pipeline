module.exports = (sequelize, DataTypes) =>{
    const unAcknowledgedEvents = sequelize.define('unAcknowledgedEvents', {
        to: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        data:{
            type: DataTypes.STRING(),
            allowNull: true,
        }
    });
    unAcknowledgedEvents.associate = (models)=>{
      
        
    };
    
    return unAcknowledgedEvents;
};