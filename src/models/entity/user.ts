import * as Sequelize from 'sequelize';
import { Sequelize as SequelizeInterface } from 'sequelize';
import { ModelsInterface } from '../models';

export interface UserAttribute {
  id: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  team_id: number;
}

export interface UserInstance extends Sequelize.Instance<UserAttribute>, UserAttribute {
}

export interface UserModel extends Sequelize.Model<UserInstance, UserAttribute> {
}

export function defineUser<UserInstance, UserAttribute>(sequelize: SequelizeInterface) {
  const User = sequelize.define('User', {
    id: { type: Sequelize.INTEGER, primaryKey: true },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
    updated_at: { type: Sequelize.DATE },
    deleted_at: { type: Sequelize.DATE },
    first_name: { type: Sequelize.STRING(50) },
    last_name: { type: Sequelize.STRING(50) },
    username: { type: Sequelize.STRING(50), unique: true },
    language_code: { type: Sequelize.STRING(50) },
    team_id: { type: Sequelize.INTEGER }
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
