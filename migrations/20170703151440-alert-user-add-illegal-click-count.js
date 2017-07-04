'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'users',
      'illegal_click_count',
      {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'illegal_click_count');
  }
};
