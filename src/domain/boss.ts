import * as Emoji from 'node-emoji';
import * as Moment from 'moment';
import * as _ from 'lodash';
import { Group } from './group';
import * as i18n from 'i18next';
import { User } from './user';
import { Pokedex } from './pokedex';
import { GroupInstance } from '../models/entity/group';
import { TimeSlots } from "./timeslot";

export class Boss {
  id: number;
  bossId: number;
  bot: any;
  channelId: string;
  location: string;
  name: string;
  pokemonId: number;
  pokedex: Pokedex;
  start: Date;
  groups: Group[];

  constructor(bot: any, pokedex: Pokedex, id: number, channelId: string, bossId: number, start: Date, location: string) {
    this.id = id;
    this.bot = bot;
    this.bossId = bossId;
    this.channelId = channelId;
    this.location = location;
    this.pokedex = pokedex;
    this.start = start;
    this.groups = [
      new Group(this.bot, this.id, i18n.t('team.valor'), 1),
      new Group(this.bot, this.id, i18n.t('team.mystic'), 2),
      new Group(this.bot, this.id, i18n.t('team.instinct'), 3)
    ];
  }

  setPokemon(pokemonId: number) {
    const pokemon = this.pokedex.getPokemonById(pokemonId);
    this.name = pokemon.zhHkName;
    this.pokemonId = pokemon.id;
  }

  getTeam(teamId) {
    return _.find(this.groups, group => group.seq === teamId);
  }

  addGroup(groupInstance: GroupInstance) {
    const group = _.find(this.groups, group => group.seq === groupInstance.seq);
    group.id = groupInstance.id;
    group.name = groupInstance.name;
    group.bossId = groupInstance.boss_id;

    return group;
  }

  addUserToGroup(user: User) {
    const group: Group = this.getTeam(user.teamId);
    group.addUser(user);
  }

  removeUserInGroup(userId: string) {
    _.map(this.groups, group => {
      group.users = _.filter(group.users, user => user.id !== userId);
    });
  }

  getGroupIds() {
    return _.map(this.groups, 'id');
  }

  getEmoji() {
    let emoji = '';

    switch (this.pokemonId) {
      case 3:
        emoji = Emoji.get('seedling');
        break;
      case 6:
        emoji = Emoji.get('fire');
        break;
      case 9:
        emoji = Emoji.get('droplet');
        break;
      case 112:
        emoji = Emoji.get('mountain');
        break;
      case 131:
        emoji = Emoji.get('snowflake');
        break;
      case 143:
        emoji = Emoji.get('panda_face');
        break;
      case 248:
        emoji = Emoji.get('hatched_chick');
        break;
      default:
        emoji = Emoji.get('red_circle');
        break;
    }

    return emoji;
  }

  getEmojiName() {
    if (!this.pokemonId) return '';
    const star = (_.indexOf([131, 143, 248], this.pokemonId) > -1) ? `${Emoji.get('star')}` : '';
    return `${this.getEmoji()} ${this.name} ${star}`;
  }

  getTimeSlotList() {
    const timeSlots = new TimeSlots().getTimeSlots();

    const key = [];
    let pos = 0;
    let btnPerLine = 1;

    _.map(timeSlots, (timeSlot) => {
      let row = pos / btnPerLine || 0;
      if (!key[row]) key[row] = [];

      key[row].push({ text: timeSlot.text, callback_data: `JOINBOSS_${this.id}_${timeSlot.id}` });
      pos++;
    });
    return key;
  }

  toString() {
    let list = `${Moment(this.start).format('HH:mm')} ${this.location} ${this.getEmojiName()}\n\n`;

    const timeSlots = new TimeSlots().getTimeSlots();
    _.map(timeSlots, timeSlot => {
      list += `${timeSlot.emoji} ${timeSlot.text}\n`;
      _.map(this.groups, (group: Group) => {
        list += `${group.toTimeSlotString(timeSlot.id)}\n`;
      });
    });

    return list;
  }
}