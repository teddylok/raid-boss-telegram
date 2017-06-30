import { Group as GroupModel, GroupUser } from '../models';
import { GroupInstance, GroupAttribute } from '../entity/group';
import { Group } from '../../domain/group';

export class GroupRepository {
  bot: any;

  constructor(bot) {
    this.bot = bot;
  }

  getById(id: string): any {
    return GroupModel.find({ where: { id } });
  }

  save(group: Group) {
    return (group.id) ? this.update(group) : this.create(group);
  }

  removeGroupUser(groupIds: number[], userId: string) {
    return GroupUser.destroy({
      where: {
        group_id: {
          $in: groupIds
        },
        user_id: userId
      }
    });
  }

  bulkCreate(groups: Group[]) {
    return GroupModel.bulkCreate(groups, { returning: true });
  }

  private create(group: Group) {
    return GroupModel.create(this.getModel(group));
  }

  private update(group: Group) {
    return GroupModel
      .update(this.getModel(group), {
        where: {
          id: group.id
        },
        returning: true
      })
      .then((response: [number, GroupInstance[]]) =>
        (response[0]) ? response[1].shift() : null);
  }

  getDomainObject(instance: GroupInstance): Group {
    const group = new Group(this.bot, instance.boss_id, instance.name, instance.seq);
    group.id = instance.id;
    group.createdAt = instance.created_at;
    group.updatedAt = instance.updated_at;
    group.deletedAt = instance.deleted_at;

    return group;
  }

  getModel(group: Group) {
    const model: GroupAttribute = {
      id: group.id,
      created_at: group.createdAt,
      updated_at: group.updatedAt,
      deleted_at: group.deletedAt,
      boss_id: group.bossId,
      name: group.name,
      seq: group.seq
    };

    return model;
  }
}