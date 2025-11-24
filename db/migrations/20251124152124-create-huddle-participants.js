"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("huddle_participants", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "huddle_sessions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "user_data",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("joined", "left"),
        allowNull: false,
        defaultValue: "joined",
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      left_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_muted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
      "huddle_participants",
      ["session_id", "user_id"],
      {
        name: "idx_huddle_participant_session_user",
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "huddle_participants",
      "idx_huddle_participant_session_user"
    );

    await queryInterface.dropTable("huddle_participants");

    // Remove ENUM in MySQL
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS `enum_huddle_participants_status`;"
    );
  },
};