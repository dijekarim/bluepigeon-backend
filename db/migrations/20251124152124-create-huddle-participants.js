"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    
    // Create huddle_participants table
    await queryInterface.createTable('huddle_participants', {
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
          model: 'huddle_sessions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      left_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create index for session participants queries
    await queryInterface.addIndex('huddle_participants', ['session_id', 'is_active'], {
      name: 'idx_huddle_participant_session',
    });

    // Create index for user participation queries
    await queryInterface.addIndex('huddle_participants', ['user_id', 'is_active'], {
      name: 'idx_huddle_participant_user',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop ENUM first (Postgres requirement)
    await queryInterface.removeIndex(
      "huddle_participants",
      "idx_huddle_participant_unique"
    );

    await queryInterface.dropTable("huddle_participants");

    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_huddle_participants_status";`
    );
  },
};