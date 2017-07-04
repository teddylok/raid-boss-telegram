import * as Sequelize from 'sequelize';
import { Sequelize as SequelizeInterface } from 'sequelize';
import { ModelsInterface } from '../models';
import { GroupUserInstance } from "./group-user";

export interface UserAttribute {
  id: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  team_id: number;
  illegal_click_count: number;
  GroupUser?: GroupUserInstance;
}

export interface UserInstance extends Sequelize.Instance<UserAttribute>, UserAttribute {
  GroupUser?: GroupUserInstance;
}

export interface UserModel extends Sequelize.Model<UserInstance, UserAttribute> {
}

export function defineUser<UserInstance, UserAttribute>(sequelize: SequelizeInterface) {
  const User = sequelize.define('User', {
    id: { type: Sequelize.BIGINT, primaryKey: true },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
    updated_at: { type: Sequelize.DATE },
    deleted_at: { type: Sequelize.DATE },
    first_name: { type: Sequelize.STRING(50) },
    last_name: { type: Sequelize.STRING(50) },
    username: { type: Sequelize.STRING(50), unique: true },
    language_code: { type: Sequelize.STRING(50) },
    team_id: { type: Sequelize.INTEGER },
    illegal_click_count: { type: Sequelize.INTEGER, defaultValue: 0 }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    underscored: true,
    classMethods: {
      associate: (models: ModelsInterface) => {
      }
    }
  });
  return User;
}
