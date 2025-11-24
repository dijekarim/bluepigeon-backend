module.exports = (sequelize, DataTypes) => {
    const channel_message = sequelize.define("channel_message", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        channel_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        sender_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        reply_to_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        file_path: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        file_type: {
            type: DataTypes.ENUM("text", "image", "voice"),
            allowNull: false,
            defaultValue: "text",
        }
    }, {
        timestamps: true,
        tableName: "channel_messages"
    });

    channel_message.associate = function(models){
        channel_message.belongsTo(models.channel, { foreignKey: 'channel_id', as: 'channel' });
        channel_message.belongsTo(models.user_data, { foreignKey: 'sender_id', as: 'sender' });
        channel_message.belongsTo(models.channel_message, { foreignKey: 'reply_to_id', as: 'reply_to' });
    }

    return channel_message;
}
