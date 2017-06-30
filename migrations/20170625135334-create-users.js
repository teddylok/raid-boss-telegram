'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('users', {
      id: {type: Sequelize.BIGINT, primaryKey: true},
      created_at: {type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false},
      updated_at: {type: Sequelize.DATE},
      deleted_at: {type: Sequelize.DATE},
      first_name: {type: Sequelize.STRING(50)},
      last_name: {type: Sequelize.STRING(50)},
      username: {type: Sequelize.STRING(50), unique: true},
      language_code: {type: Sequelize.STRING(50)},
      team_id: {type: Sequelize.INTEGER, defaultValue: 1}
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  }
};
