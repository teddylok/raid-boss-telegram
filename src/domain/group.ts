import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { User } from './user';

export class Group {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  bossId: number;
  bot: any;
  name: string;
  seq: number;
  users: User[];

  constructor(bot: any, bossId: number, name: string, seq: number) {
    this.bot = bot;
    this.bossId = bossId;
    this.name = name;
    this.seq = seq;
    this.users = [];
  }

  addUser(user: User) {
    this.users.push(user);
  }

  getFlag() {
    let flag = '';

    switch (this.seq) {
      case 1: flag = Emoji.get('heart'); break;
      case 2: flag = Emoji.get('blue_heart'); break;
      case 3: flag = Emoji.get('yellow_heart'); break;
      default: flag = Emoji.get('purple_heart'); break;
    }

    return flag;
  }

  toString() {
    let count = 1;
    let list = `${this.getFlag()}  ${this.name} (${Emoji.get('raising_hand')}${this.users.length})\n`;

    _.map(this.users, (user: User) => {
      list += `${count}. ${user.firstName || ''}${user.lastName || ''}\n`;
      count++;
    });

    return list;
  }

  toTimeSlotString(timeSlot: number) {
    let count = 1;
    let users = _.filter(this.users, u => u.option === timeSlot);
    let list = `${this.getFlag()}  ${this.name} (${users.length})\n`;

    _.map(users, (user: User) => {
      const username = (user.username) ? ` (@${user.username})` : '';
      list += ` - ${count}. ${user.firstName || ''} ${user.lastName || ''}${username}\n`;
      count++;
    });

    return list;
  }
}