'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'channels',
      'channel_type_id',
      {
        type: Sequelize.INTEGER,
        defaultValue: 1
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('channels', 'channel_type_id');
  }
};
