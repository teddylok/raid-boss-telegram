'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'bosses',
      'lat',
      {
        type: Sequelize.FLOAT,
        defaultValue: null
      }
    );
    queryInterface.addColumn(
      'bosses',
      'lng',
      {
        type: Sequelize.FLOAT,
        defaultValue: null
      }
    );

    return true;
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('bosses', 'lat');
    queryInterface.removeColumn('bosses', 'lng');
    return true;
  }
};
