'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('sync_channels', {
      id: {type: Sequelize.BIGINT, primaryKey: true},
      created_at: {type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false},
      updated_at: {type: Sequelize.DATE},
      deleted_at: {type: Sequelize.DATE},
      channel_id: {type: Sequelize.BIGINT},
      target_channel_id: {type: Sequelize.BIGINT}
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('sync_channels');
  }
};
