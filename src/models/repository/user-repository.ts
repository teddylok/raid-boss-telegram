import { User as UserModel } from '../models';
import { UserInstance, UserAttribute } from '../entity/user';
import { Team } from '../../domain/team';
import { User } from '../../domain/user';
import * as Bluebird from 'bluebird';

export class UserRepository {
  bot: any;

  constructor(bot) {
    this.bot = bot;
  }

  getById(id: string): any {
    return UserModel.find({ where: { id } });
  }

  save(user: User) {
    if (!user.id) {
      return this.create(user);
    }

    return this.getById(user.id)
      .then((userInstance: UserInstance) => (userInstance) ? this.update(user) : this.create(user));
  }

  private create(user: User) {
    return UserModel.create(this.getModel(user));
  }

  private update(user: User) {
    return UserModel
      .update(this.getModel(user), {
        where: {
          id: user.id
        },
        returning: true
      })
      .then((response: [number, UserInstance[]]) =>
        (response[0]) ? response[1].shift() : null);
  }

  getDomainObject(instance: UserInstance, option?: number): User {
    const user = new User(this.bot);
    user.id = instance.id;
    user.createdAt = instance.created_at;
    user.updatedAt = instance.updated_at;
    user.deletedAt = instance.deleted_at;
    user.firstName = instance.first_name;
    user.lastName = instance.last_name;
    user.username = instance.username;
    user.languageCode = instance.language_code;
    user.teamId = instance.team_id || Team.TEAM_VALOR;
    user.illegalClickCount = instance.illegal_click_count;
    user.option = option;

    return user;
  }

  getModel(user: User) {
    const model: UserAttribute = {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      username: user.username,
      language_code: user.languageCode,
      illegal_click_count: user.illegalClickCount,
      team_id: user.teamId
    };

    if (user.createdAt) model.created_at = user.createdAt;
    if (user.updatedAt) model.updated_at = user.updatedAt;
    if (user.deletedAt) model.deleted_at = user.deletedAt;

    return model;
  }
}