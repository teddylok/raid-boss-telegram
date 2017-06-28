'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('channels', {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
      updated_at: { type: Sequelize.DATE },
      deleted_at: { type: Sequelize.DATE },
      name: { type: Sequelize.STRING(50) }
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('channels');
  }
};
