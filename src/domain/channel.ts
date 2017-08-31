import * as Emoji from 'node-emoji';
import * as Moment from 'moment';
import * as _ from 'lodash';
import { Boss } from './boss';
import * as i18n from 'i18next';
import { Time } from './time';

export class Channel {
  public static readonly CHANNEL_TYPE_ADMIN = 1;
  public static readonly CHANNEL_TYPE_USER = 2;

  bot: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  id: string;
  name: string;
  boss: Boss[];
  channelTypeId: number;
  header: string;
  footer: string;

  constructor(bot: any, id: string, name: string, channelTypeId: number = Channel.CHANNEL_TYPE_ADMIN) {
    this.bot = bot;
    this.id = id;
    this.name = name;
    this.boss = [];
    this.channelTypeId = channelTypeId;
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

  getBossByHash(hash: string) {
    return _.find(this.boss, boss => boss.hash === hash );
  }

  getBossIds() {
    return _.map(this.boss, 'id');
  }

  getBossHashes() {
    return _.map(this.boss, 'hash');
  }

  getBoss() {
    return _.filter(this.boss, (boss: Boss) => this.isTodayBoss(boss));
  }

  getCompletedBoss() {
    return _.sortBy(_.filter(this.getBoss(), (boss: Boss) => Time.now() > Moment(boss.start).add(2, 'hour') && this.isTodayBoss(boss)), ['start']);
  }

  getBattleBoss() {
    return _.sortBy(_.filter(this.getBoss(), (boss: Boss) => Moment(boss.start).add(2, 'hour') >= Time.now() && Time.now() > Moment(boss.start) && this.isTodayBoss(boss)) , ['start']);
  }

  getPendingBoss() {
    return _.sortBy(_.filter(this.getBoss(), (boss: Boss) => Moment(boss.start) >= Time.now() && this.isTodayBoss(boss)), ['start']);
  }

  getUpcomingBoss() {
    return _.sortBy(_.filter(this.getBoss(), (boss: Boss) => Moment(boss.start).add(2, 'hour') >= Time.now() && this.isTodayBoss(boss)), ['start']);
  }

  getBattleAndCompletedBoss() {
    return _.sortBy(_.filter(this.getBoss(), (boss: Boss) => Time.now() > Moment(boss.start) && this.isTodayBoss(boss)), ['start']);
  }

  getUpcomingBossList(callbackKey: string) {
    const key = [];
    let pos = 0;
    let btnPerLine = 1;

    _.map(_.sortBy(this.getUpcomingBoss(), ['start']), (boss: Boss) => {
      let text = `${Moment(boss.start).format('HH:mm')} ${boss.location} ${boss.getEmojiName()}`;
      let row = pos / btnPerLine || 0;
      if (!key[row]) key[row] = [];

      key[row].push({ text: text, callback_data: `${callbackKey}_${boss.id}` });
      pos++;
    });

    return key;
  }

  getBossList(callbackKey: string) {
    const key = [];
    let pos = 0;
    let btnPerLine = 1;

    _.map(_.sortBy(this.getBoss(), ['start']), (boss: Boss) => {
      let text = `${Moment(boss.start).format('HH:mm')} ${boss.location} ${boss.getEmojiName()}`;
      let row = pos / btnPerLine || 0;
      if (!key[row]) key[row] = [];

      key[row].push({ text: text, callback_data: `${callbackKey}_${boss.id}` });
      pos++;
    });

    return key;
  }

  setChannelType(channelTypeId: number) {
    this.channelTypeId = channelTypeId;
  }

  isTodayBoss(boss: Boss) {
    return Moment(boss.start).format('YYYY-MM-DD') === Moment().format('YYYY-MM-DD');
  }

  toString(description?: string) {
    const completed = this.getCompletedBoss();
    const battling = this.getBattleBoss();
    const pending = this.getPendingBoss();
    const hr = '--------------------';

    let list: string = (description) ? `${description}\n\n` : '';
    list += `${i18n.t('today')} ${Emoji.get('four')} ${Emoji.get('star')} ${Emoji.get('hatching_chick')} \n`;
    list += `${i18n.t('date')}: ${Moment().format('YYYY-MM-DD')} \n`;
    list += `${hr}\n`;

    if (this.header && this.header !== '') {
      list += `${this.header}\n`;
      list += `${hr}\n`;
    }

    // complete list
    list += `${Emoji.get('white_check_mark')}  ${i18n.t('list.completed')}\n`;
    _.map(completed, boss => {
      list += `${Moment(boss.start).format('HH:mm')}\t${boss.location} ${boss.getEmojiName() || ''} ${this.getMapLink(boss)}\n`;
    });

    // battle list
    list += `\n${Emoji.get('crossed_swords')}  ${i18n.t('list.battle')}\n`;
    _.map(battling, boss => {
      list += `${Moment(boss.start).format('HH:mm')}\t${boss.location} ${boss.getEmojiName() || ''} ${this.getMapLink(boss)}\n`;
    });

    // pending list
    list += `\n${Emoji.get('alarm_clock')}  ${i18n.t('list.pending')}\n`;
    _.map(pending, boss => {
      list += `${Moment(boss.start).format('HH:mm')}\t${boss.location} ${this.getMapLink(boss)}\n`;
    });

    list += `${hr}\n`;
    list += `${i18n.t('lastUpdated')}: ${Moment().format('HH:mm:ss')} \n`;

    if (this.footer && this.footer !== '') {
      list += `${hr}\n`;
      list += `${this.footer}\n`;
      list += `${hr}\n`;
    }
    return list;
  }

  private getMapLink(boss) {
    return (boss.lat && boss.lng) ? `\n[<a href="www.google.com.hk/maps?q=${boss.lat},${boss.lng}">${(boss.gymName) ? boss.gymName : i18n.t('map')}</a>]` : '';
  }
}