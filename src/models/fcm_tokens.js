module.exports = (sequelize, DataTypes) => {
    const fcm_tokens = sequelize.define("fcm_tokens", {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: 'user_token_unique' // unique per user
        },
        device: {
            type: DataTypes.STRING(100)
        },
        last_updated: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
    tableName: 'fcm_tokens',
    timestamps: false,
    indexes: [
        {
        unique: true,
        fields: ['user_id', 'token'],
        name: 'user_token_unique'
        }
    ]
    });

    return fcm_tokens;
}