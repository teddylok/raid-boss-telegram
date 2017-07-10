'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'channels',
      'header',
      {
        type: Sequelize.TEXT
      }
    );

    queryInterface.addColumn(
      'channels',
      'footer',
      {
        type: Sequelize.TEXT
      }
    );

    return true;
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('channels', 'header');
    queryInterface.removeColumn('channels', 'footer');
    return true;
  }
};
