module.exports = (sequelize, DataTypes) => {
    const channel = sequelize.define("channel", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        is_closed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        permissions: {
            type: DataTypes.ENUM("all_can_post", "admin_only_post"),
            defaultValue: "all_can_post",
        }
    }, {
        timestamps: true,
        tableName: "channels"
    });

    channel.associate = function(models){
        channel.hasMany(models.channel_participant, { foreignKey: 'channel_id', as: 'participants' });
        channel.hasMany(models.channel_message, { foreignKey: 'channel_id', as: 'messages' });
    }

    return channel;
}
