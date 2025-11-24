module.exports = (sequelize, DataTypes) => {
  const huddle_participant = sequelize.define(
    "huddle_participant",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("joined", "left"),
        allowNull: false,
        defaultValue: "joined",
      },
      joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      left_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_muted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      tableName: "huddle_participants",
      indexes: [
        {
          unique: true,
          fields: ["session_id", "user_id"],
          name: "idx_huddle_participant_unique",
        },
      ],
    }
  );

  huddle_participant.associate = function (models) {
    huddle_participant.belongsTo(models.huddle_session, {
      foreignKey: "session_id",
      as: "session",
    });
    huddle_participant.belongsTo(models.user_data, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return huddle_participant;
};

