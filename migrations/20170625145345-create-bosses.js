'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('bosses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
      updated_at: { type: Sequelize.DATE },
      deleted_at: { type: Sequelize.DATE },
      channel_id: { type: Sequelize.INTEGER },
      boss_id: { type: Sequelize.INTEGER },
      location: { type: Sequelize.STRING(255) },
      pokemon_id: { type: Sequelize.INTEGER },
      start: { type: Sequelize.DATE }
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('bosses');
  }
};
