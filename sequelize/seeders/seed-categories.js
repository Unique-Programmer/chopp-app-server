'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = await queryInterface.sequelize.query(
      `SELECT title FROM categories`
    );

    const categoryTitles = categories[0].map((c) => c.title);
    if (!categoryTitles.includes('Другое')) {
      await queryInterface.bulkInsert('categories', [
        {
          title: 'Другое',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', { title: 'Другое' });
  },
};
