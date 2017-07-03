import * as Emoji from 'node-emoji';
import * as Moment from 'moment';
import * as _ from 'lodash';

export class SyncChannel {
  id: any;
  bot: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  channelId: string;
  targetChannelId: string;

  constructor(bot: any, id: number, channelId: string, targetChannelId: string) {
    this.id = id;
    this.bot = bot;
    this.channelId = channelId;
    this.targetChannelId = targetChannelId;
  }
}