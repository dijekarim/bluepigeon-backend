module.exports = (sequelize, DataTypes) => {
    const channel_participant = sequelize.define("channel_participant", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        channel_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("admin", "member"),
            defaultValue: "member",
        }
    }, {
        timestamps: true,
        tableName: "channel_participants",
        indexes: [
            {
                unique: true,
                fields: ["channel_id", "user_id"]
            }
        ]
    });

    channel_participant.associate = function(models){
        channel_participant.belongsTo(models.channel, { foreignKey: 'channel_id', as: 'channel' });
        channel_participant.belongsTo(models.user_data, { foreignKey: 'user_id', as: 'user' });
    }

    return channel_participant;
}
