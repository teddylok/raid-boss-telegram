'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('groups', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
      updated_at: { type: Sequelize.DATE },
      deleted_at: { type: Sequelize.DATE },
      boss_id: { type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING(20) },
      seq: { type: Sequelize.INTEGER }
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('groups');
  }
};
