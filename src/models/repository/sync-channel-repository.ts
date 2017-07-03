import { SyncChannel as SyncChannelModel } from '../models';
import { SyncChannelInstance, SyncChannelAttribute } from '../entity/sync-channel';
import { SyncChannel } from '../../domain/sync-channel';
import * as _ from 'lodash';

export class SyncChannelRepository {
  bot: any;

  constructor(bot) {
    this.bot = bot;
  }

  getByChannelId(channelId: string): any {
    return SyncChannelModel.findAll({ where: { channel_id: channelId } });
  }

  save(syncChannel: SyncChannel) {
    return (syncChannel.id) ? this.update(syncChannel) : this.create(syncChannel);
  }

  remove(id: number) {
    return SyncChannelModel.destroy({
      where: { id }
    });
  }

  private create(channel: SyncChannel) {
    return SyncChannelModel.create(this.getModel(channel));
  }

  private update(channel: SyncChannel) {
    return SyncChannelModel
      .update(this.getModel(channel), {
        where: {
          id: channel.id
        },
        returning: true
      })
      .then((response: [number, SyncChannelInstance[]]) =>
        (response[0]) ? response[1].shift() : null);
  }

  getDomainObject(instance: SyncChannelInstance): SyncChannel {
    const channel = new SyncChannel(this.bot, instance.id, instance.channel_id, instance.target_channel_id);

    channel.createdAt = instance.created_at;
    channel.updatedAt = instance.updated_at;
    channel.deletedAt = instance.deleted_at;

    return channel;
  }

  getModel(channel: SyncChannel) {
    const model: SyncChannelAttribute = {
      id: channel.id,
      created_at: channel.createdAt,
      updated_at: channel.updatedAt,
      deleted_at: channel.deletedAt,
      channel_id: channel.channelId,
      target_channel_id: channel.targetChannelId
    };

    return model;
  }
}