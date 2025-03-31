'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('client_app_config', [
      {
        id: 1,
        freeDeliveryIncluded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { ignoreDuplicates: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('client_app_config', { id: 1 });
  },
};
