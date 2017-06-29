'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('group_users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
      updated_at: { type: Sequelize.DATE },
      deleted_at: { type: Sequelize.DATE },
      group_id: { type: Sequelize.INTEGER, allowNull: false },
      user_id: { type: Sequelize.BIGINT, allowNull: false },
      option: { type: Sequelize.INTEGER, allowNull: false }
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('group_users');
  }
};
