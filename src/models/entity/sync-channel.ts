import * as Sequelize from 'sequelize';
import { Sequelize as SequelizeInterface } from 'sequelize';

import { ModelsInterface } from '../models';

export interface SyncChannelAttribute {
  id: number;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
  channel_id: string;
  target_channel_id: string;
}

export interface SyncChannelInstance extends Sequelize.Instance<SyncChannelAttribute>, SyncChannelAttribute {
}

export interface SyncChannelModel extends Sequelize.Model<SyncChannelInstance, SyncChannelAttribute> {
}

export function defineSyncChannel<SyncChannelInstance, SyncChannelAttribute>(sequelize: SequelizeInterface) {
  const SyncChannel = sequelize.define('SyncChannel', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
    updated_at: { type: Sequelize.DATE },
    deleted_at: { type: Sequelize.DATE },
    channel_id: { type: Sequelize.BIGINT, allowNull: false },
    target_channel_id: { type: Sequelize.BIGINT, allowNull: false }
  }, {
    tableName: 'sync_channels',
    timestamps: true,
    paranoid: true,
    underscored: true,
    classMethods: {
      associate: (models: ModelsInterface) => {}
    }
  });

  return SyncChannel;
}
