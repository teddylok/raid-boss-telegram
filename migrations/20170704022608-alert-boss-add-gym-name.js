'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'bosses',
      'gym_name',
      {
        type: Sequelize.STRING(255),
        defaultValue: null
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('bosses', 'gym_name');
  }
};
