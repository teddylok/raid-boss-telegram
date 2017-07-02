'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('bosses', 'boss_id', 'hash');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('bosses', 'hash', 'boss_id');
  }
};
