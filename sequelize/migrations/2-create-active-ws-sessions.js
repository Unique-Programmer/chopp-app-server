'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('active_ws_sessions', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      sid: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      connectedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('active_ws_sessions');
  },
};
