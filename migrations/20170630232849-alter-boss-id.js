'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'bosses',
      'boss_id',
      {
        type: Sequelize.STRING(255)
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    // return queryInterface.dropTable('bosses');
  }
};
