// Conversation model for 1-on-1 direct messaging
module.exports = (sequelize, DataTypes) => {
    const conversation = sequelize.define("conversation", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        // First participant (stored in sorted order to prevent duplicates)
        participant_one: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user_data',
                key: 'id'
            }
        },
        // Second participant (stored in sorted order to prevent duplicates)
        participant_two: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user_data',
                key: 'id'
            }
        },
        // Timestamp of the last message sent in this conversation
        last_message_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        timestamps: true,
        tableName: "conversations",
        // Unique index prevents duplicate conversations between same users
        indexes: [
            {
                unique: true,
                fields: ['participant_one', 'participant_two'],
                name: 'unique_conversation_participants'
            }
        ]
    });

    // Define relationships with other models
    conversation.associate = function(models) {
        // Relationship to user_data for both participants
        conversation.belongsTo(models.user_data, { 
            foreignKey: 'participant_one', 
            as: 'participantOne' 
        });
        conversation.belongsTo(models.user_data, { 
            foreignKey: 'participant_two', 
            as: 'participantTwo' 
        });
        // One conversation has many messages
        conversation.hasMany(models.direct_message, { 
            foreignKey: 'conversation_id', 
            as: 'messages' 
        });
    };

    return conversation;
};
