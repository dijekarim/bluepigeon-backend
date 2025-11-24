'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create huddle_sessions table
    await queryInterface.createTable('huddle_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      context_type: {
        type: Sequelize.ENUM('channel', 'dm'),
        allowNull: false,
      },
      context_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      initiator_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'ended', 'expired'),
        allowNull: false,
        defaultValue: 'active',
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      ends_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      ended_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      ended_reason: {
        type: Sequelize.ENUM('manual', 'timeout', 'empty'),
        allowNull: true,
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

    // Create index for context and status queries
    await queryInterface.addIndex('huddle_sessions', ['context_type', 'context_id', 'status'], {
      name: 'idx_huddle_context_status',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order (participants first due to foreign key)
    await queryInterface.dropTable('huddle_sessions');

    // Drop ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_huddle_sessions_context_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_huddle_sessions_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_huddle_sessions_ended_reason";');
  }
};