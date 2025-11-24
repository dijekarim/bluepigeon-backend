module.exports = (sequelize, DataTypes) => {
    const direct_message = sequelize.define("direct_message", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        conversation_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'conversations',
                key: 'id'
            }
        },
        sender_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user_data',
                key: 'id'
            }
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
        },
        read_by: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: 'Array of user UUIDs who have read this message'
        },
    }, {
        timestamps: true,
        tableName: "direct_messages"
    });

    direct_message.associate = function(models) {
        direct_message.belongsTo(models.conversation, { 
            foreignKey: 'conversation_id', 
            as: 'conversation' 
        });
        direct_message.belongsTo(models.user_data, { 
            foreignKey: 'sender_id', 
            as: 'sender' 
        });
    };

    return direct_message;
};
