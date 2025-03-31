'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      phoneNumber: { type: Sequelize.STRING, unique: true, allowNull: true },
      verificationCode: { type: Sequelize.STRING, allowNull: true },
      verificationExpires: { type: Sequelize.DATE, allowNull: true },
      verificationAttempts: { type: Sequelize.INTEGER, defaultValue: 0 },
      isRegistered: { type: Sequelize.BOOLEAN, defaultValue: true },
      telegramUserId: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, unique: true, allowNull: true },
      password: { type: Sequelize.STRING, allowNull: true },
      fullName: { type: Sequelize.STRING, allowNull: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
