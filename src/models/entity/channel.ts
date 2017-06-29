import * as Sequelize from 'sequelize';
import { Sequelize as SequelizeInterface } from 'sequelize';
import { ModelsInterface } from '../models';

export interface ChannelAttribute {
  id: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  name: string;
}

export interface ChannelInstance extends Sequelize.Instance<ChannelAttribute>, ChannelAttribute {
}

export interface ChannelModel extends Sequelize.Model<ChannelInstance, ChannelAttribute> {
}

export function defineChannel<ChannelInstance, ChannelAttribute>(sequelize: SequelizeInterface) {
  const Channel = sequelize.define('Channel', {
    id: { type: Sequelize.BIGINT, primaryKey: true },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
    updated_at: { type: Sequelize.DATE },
    deleted_at: { type: Sequelize.DATE },
    name: { type: Sequelize.STRING(50) }
  }, {
    tableName: 'channels',
    timestamps: true,
    paranoid: true,
    underscored: true,
    classMethods: {
      associate: (models: ModelsInterface) => {
        Channel.hasMany(models.Boss, { foreignKey: 'channel_id' });
      }
    }
  });
  return Channel;
}
