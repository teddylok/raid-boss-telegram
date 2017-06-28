import * as ORM from 'sequelize';
import { Sequelize } from 'sequelize';
import * as _ from 'lodash';
import * as Emoji from 'node-emoji';
import { defineUser } from './entity/user';
import * as Config from 'config';
import { defineBoss } from './entity/boss';
import { defineChannel } from './entity/channel';
import { defineGroup } from './entity/group';
import { defineGroupUser } from './entity/group-user';

export interface ModelsInterface {
  sequelize: Sequelize;
  Channel: any;
  Boss: any;
  Group: any;
  GroupUser: any;
  User: any;
}

const Models: ModelsInterface = {
  sequelize: null,
  Channel: null,
  Boss: null,
  Group: null,
  GroupUser: null,
  User: null
};

export const sequelize: Sequelize = new ORM(
  process.env.DB_DATABASE || Config.get('database.database'),
  process.env.DB_USERNAME || Config.get('database.username'),
  process.env.DB_PASSWORD || Config.get('database.password'),
  {
    host: process.env.DB_HOST || Config.get('database.host'),
    port: process.env.DB_PORT || Config.get('database.port'),
    dialect: process.env.DB_DIALECT || Config.get('database.dialect'),
    logging: console.log,
    omitNull: true
  });

// testing connection
sequelize.authenticate()
  .then(() => console.log(`${ Emoji.get('100') }  [sequelize] Database connection test success`))
  .catch((error) => console.error(`${ Emoji.get('bomb') }  [sequelize] Database connection test fail!`, error));

export const Boss = defineBoss(sequelize);
export const Channel = defineChannel(sequelize);
export const Group = defineGroup(sequelize);
export const GroupUser = defineGroupUser(sequelize);
export const User = defineUser(sequelize);


Models.sequelize = sequelize;
Models.Boss = Boss;
Models.Channel = Channel;
Models.GroupUser = GroupUser;
Models.User = User;
Models.Group = Group;

_.map(_.keys(Models), (modelName) => {
  if (modelName !== 'sequelize' && Models[modelName].hasOwnProperty('associate')) {
    Models[modelName].associate(Models);
  }
});

export default Models;
