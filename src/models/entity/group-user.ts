import * as Sequelize from 'sequelize';
import { Sequelize as SequelizeInterface } from 'sequelize';

import { ModelsInterface } from '../models';

export interface GroupUserAttribute {
  id: number;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
  group_id: number;
  user_id: number;
}

export interface GroupUserInstance extends Sequelize.Instance<GroupUserAttribute>, GroupUserAttribute {
}

export interface GroupUserModel extends Sequelize.Model<GroupUserInstance, GroupUserAttribute> {
}

export function defineGroupUser<GroupUserInstance, GroupUserAttribute>(sequelize: SequelizeInterface) {
  const GroupUser = sequelize.define('GroupUser', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
    updated_at: { type: Sequelize.DATE },
    deleted_at: { type: Sequelize.DATE },
    group_id: { type: Sequelize.INTEGER, allowNull: false },
    user_id: { type: Sequelize.INTEGER, allowNull: false }
  }, {
    tableName: 'group_users',
    timestamps: true,
    paranoid: true,
    underscored: true,
    classMethods: {
      associate: (models: ModelsInterface) => {}
    }
  });

  return GroupUser;
}
