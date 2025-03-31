'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      totalPrice: Sequelize.FLOAT,
      quantity: Sequelize.INTEGER,
      orderStatus: Sequelize.TEXT,
      paymentStatus: Sequelize.TEXT,
      transactionId: Sequelize.TEXT,
      paymentUrl: Sequelize.TEXT,
      address: Sequelize.TEXT,
      comment: Sequelize.TEXT,
      name: Sequelize.TEXT,
      phoneNumber: Sequelize.TEXT,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  },
};
