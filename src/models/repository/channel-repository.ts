import { Channel as ChannelModel } from '../models';
import { ChannelInstance, ChannelAttribute } from '../entity/channel';
import { Channel } from '../../domain/channel';
import * as _ from 'lodash';

export class ChannelRepository {
  bot: any;

  constructor(bot) {
    this.bot = bot;
  }

  getById(id: string): any {
    return ChannelModel.find({ where: { id } });
  }

  save(channel: Channel) {
    return (channel.id) ? this.update(channel) : this.create(channel);
  }

  remove(id: number) {
    return ChannelModel.destroy({
      where: { id }
    });
  }

  private create(channel: Channel) {
    return ChannelModel.create(this.getModel(channel));
  }

  private update(channel: Channel) {
    return ChannelModel
      .update(this.getModel(channel), {
        where: {
          id: channel.id
        },
        returning: true
      })
      .then((response: [number, ChannelInstance[]]) =>
        (response[0]) ? response[1].shift() : null);
  }

  getDomainObject(instance: ChannelInstance): Channel {
    const channel = new Channel(this.bot, instance.id, instance.name, instance.channel_type_id);

    channel.createdAt = instance.created_at;
    channel.updatedAt = instance.updated_at;
    channel.deletedAt = instance.deleted_at;

    return channel;
  }

  getModel(channel: Channel) {
    const model: ChannelAttribute = {
      id: channel.id,
      created_at: channel.createdAt,
      updated_at: channel.updatedAt,
      deleted_at: channel.deletedAt,
      name: channel.name,
      channel_type_id: channel.channelTypeId
    };

    return model;
  }
}