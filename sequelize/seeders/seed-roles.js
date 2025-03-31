'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        value: 'ADMIN',
        description: 'Роль администратора',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        value: 'USER',
        description: 'Роль пользователя',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', {
      id: { [Sequelize.Op.in]: [1, 2] },
    });
  },
};
