import * as Emoji from 'node-emoji';
import * as Moment from 'moment';
import * as _ from 'lodash';
import { Boss } from './boss';
import * as i18n from 'i18next';
import { Time } from "./time";

export class Channel {
  bot: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  id: string;
  name: string;
  boss: Boss[];

  constructor(bot: any, id: string, name: string) {
    this.bot = bot;
    this.id = id;
    this.name = name;
    this.boss = [];
  }

  addBoss(boss: Boss) {
    this.boss.push(boss);
  }

  removeBoss(id) {
    this.boss = _.filter(this.boss, (boss) => boss.id !== id);
  }

  getBossById(id: number) {
    return _.find(this.boss, boss => boss.id === id );
  }

  getCompletedBoss() {
    return _.sortBy(_.filter(this.boss, (boss: Boss) => Time.now() > Moment(boss.start).add(1, 'hour')), ['start', 'bossId']);
  }

  getBattleBoss() {
    return _.sortBy(_.filter(this.boss, (boss: Boss) => Moment(boss.start).add(1, 'hour') >= Time.now() && Time.now() > Moment(boss.start)), ['start', 'bossId']);
  }

  getPendingBoss() {
    return _.sortBy(_.filter(this.boss, (boss: Boss) => Moment(boss.start) >= Time.now()), ['start', 'bossId']);
  }

  getUpcomingBoss() {
    return _.sortBy(_.filter(this.boss, (boss: Boss) => Moment(boss.start).add(1, 'hour') >= Time.now()), ['start', 'bossId']);
  }

  getBattleAndCompletedBoss() {
    return _.sortBy(_.filter(this.boss, (boss: Boss) => Time.now() > Moment(boss.start)), ['start', 'bossId']);
  }

  getUpcomingBossList(callbackKey: string) {
    const key = [];
    let pos = 0;
    let btnPerLine = 1;

    _.map(_.sortBy(this.getUpcomingBoss(), ['start', 'bossId']), (boss: Boss) => {
      let text = `${Moment(boss.start).format('HH:mm')} ${boss.location} ${boss.getEmojiName()}`;
      let row = pos / btnPerLine || 0;
      if (!key[row]) key[row] = [];

      key[row].push({ text: text, callback_data: `${callbackKey}_${boss.id}` });
      pos++;
    });

    return key;
  }

  toString(description: string) {
    const completed = this.getCompletedBoss();
    const battling = this.getBattleBoss();
    const pending = this.getPendingBoss();

    let list: string = (description) ? `${description}\n\n` : '';
    list += `${i18n.t('today')} ${Emoji.get('four')} ${Emoji.get('star')} ${Emoji.get('hatching_chick')} \n`;

    // complete list
    list += `${Emoji.get('white_check_mark')}  ${i18n.t('list.completed')}\n`;
    _.map(completed, boss => {
      list += `${Moment(boss.start).format('HH:mm')}\t${boss.location} ${boss.getEmojiName() || ''}\n`;
    });

    // battle list
    list += `\n${Emoji.get('crossed_swords')}  ${i18n.t('list.battle')}\n`;
    _.map(battling, boss => {
      list += `${Moment(boss.start).format('HH:mm')}\t${boss.location} ${boss.getEmojiName() || ''}\n`;
    });

    // pending list
    list += `\n${Emoji.get('alarm_clock')}  ${i18n.t('list.pending')}\n`;
    _.map(pending, boss => {
      list += `${Moment(boss.start).format('HH:mm')}\t${boss.location}\n`;
    });

    return list;
  }
}