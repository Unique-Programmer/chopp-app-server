'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('client_app_config', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        defaultValue: 1,
      },
      averageDeliveryCost: Sequelize.FLOAT,
      freeDeliveryIncluded: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      freeDeliveryThreshold: Sequelize.FLOAT,
      openTime: Sequelize.STRING,
      closeTime: Sequelize.STRING,
      disabled: Sequelize.BOOLEAN,
      deliveryAndPaymentsVerbose: Sequelize.TEXT,
      publicOfferVerbose: Sequelize.TEXT,
      description: Sequelize.TEXT,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('client_app_config');
  },
};
