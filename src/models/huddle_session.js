module.exports = (sequelize, DataTypes) => {
  const huddle_session = sequelize.define(
    "huddle_session",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      context_type: {
        type: DataTypes.ENUM("channel", "dm"),
        allowNull: false,
      },
      context_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      initiator_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "ended", "expired"),
        allowNull: false,
        defaultValue: "active",
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ends_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      ended_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ended_reason: {
        type: DataTypes.ENUM("manual", "timeout", "empty"),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: "huddle_sessions",
      indexes: [
        {
          fields: ["context_type", "context_id", "status"],
          name: "idx_huddle_context_status",
        },
      ],
    }
  );

  huddle_session.associate = function (models) {
    huddle_session.hasMany(models.huddle_participant, {
      foreignKey: "session_id",
      as: "participants",
    });
  };

  return huddle_session;
};

