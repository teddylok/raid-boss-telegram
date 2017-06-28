import * as Sequelize from 'sequelize';
import { Sequelize as SequelizeInterface } from 'sequelize';
import { ModelsInterface } from '../models';
import { UserInstance } from './user';

export interface GroupAttribute {
  id: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
  boss_id: number;
  name: string;
  seq: number;
}

export interface GroupInstance extends Sequelize.Instance<GroupAttribute>, GroupAttribute {
  getUsers(): Promise<any>;
  addUser(user: UserInstance): Promise<any>;
}

export interface GroupModel extends Sequelize.Model<GroupInstance, GroupAttribute> {
}

export function defineGroup<GroupInstance, GroupAttribute>(sequelize: SequelizeInterface) {
  const Group = sequelize.define('Group', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false },
    updated_at: { type: Sequelize.DATE },
    deleted_at: { type: Sequelize.DATE },
    boss_id: { type: Sequelize.INTEGER },
    name: { type: Sequelize.STRING(20) },
    seq: { type: Sequelize.INTEGER }
  }, {
    tableName: 'groups',
    timestamps: true,
    paranoid: true,
    underscored: true,
    classMethods: {
      associate: (models: ModelsInterface) => {
        Group.belongsTo(models.Boss, { foreignKey: 'boss_id' });
        Group.belongsToMany(models.User, { as: 'Users', through: 'GroupUser', foreignKey: 'group_id' });
      }
    }
  });
  return Group;
}
