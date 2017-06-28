import * as Emoji from 'node-emoji';
import * as Moment from 'moment';
import * as _ from 'lodash';
import { Boss } from './boss';
import * as i18n from 'i18next';

export class Channel {
  bot: any;
  id: number;
  name: string;
  boss: Boss[];

  constructor(bot: any, id: number, name: string) {
    this.bot = bot;
    this.id = id;
    this.name = name;
    this.boss = [];
  }

  addBoss(boss: Boss) {
    this.boss.push(boss);
  }

  removeBoss(id) {
    this.boss = _.remove(this.boss, (boss) => boss.id === id);
  }

  getBossById(id: number) {
    return _.find(this.boss, boss => boss.id === id );
  }

  getBossByBossId(bossId: number) {
    return _.find(this.boss, boss => boss.bossId === bossId );
  }

  getCompletedBoss() {
    return _.sortBy(_.filter(this.boss, (boss: Boss) => this.getCurrentTime() > Moment(boss.start).add(1, 'hour')), ['start', 'bossId']);
  }

  getBattleBoss() {
    return _.sortBy(_.filter(this.boss, (boss: Boss) => Moment(boss.start).add(1, 'hour') >= this.getCurrentTime() && this.getCurrentTime() > Moment(boss.start)), ['start', 'bossId']);
  }

  getPendingBoss() {
    return _.sortBy(_.filter(this.boss, (boss: Boss) => Moment(boss.start) >= this.getCurrentTime()), ['start', 'bossId']);
  }

  getUpcomingBoss() {
    return _.sortBy(_.filter(this.boss, (boss: Boss) => Moment(boss.start).add(1, 'hour') >= this.getCurrentTime()), ['start', 'bossId']);
  }

  getBattleAndCompletedBoss() {
    return _.sortBy(_.filter(this.boss, (boss: Boss) => this.getCurrentTime() > Moment(boss.start)), ['start', 'bossId']);
  }

  getCurrentTime() {
    return Moment().add(process.env.TIMEZONE_OFFSET || 0, 'hour');
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
      list += `${boss.bossId}. ${Moment(boss.start).format('HH:mm')}\t${boss.location} ${boss.getEmojiName() || ''}\n`;
    });

    // battle list
    list += `\n${Emoji.get('crossed_swords')}  ${i18n.t('list.battle')}\n`;
    _.map(battling, boss => {
      list += `${boss.bossId}. ${Moment(boss.start).format('HH:mm')}\t${boss.location} ${boss.getEmojiName() || ''}\n`;
    });

    // pending list
    list += `\n${Emoji.get('alarm_clock')}  ${i18n.t('list.pending')}\n`;
    _.map(pending, boss => {
      list += `${boss.bossId}. ${Moment(boss.start).format('HH:mm')}\t${boss.location}\n`;
    });

    return list;
  }
}