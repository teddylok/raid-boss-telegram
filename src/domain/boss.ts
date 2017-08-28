import * as Emoji from 'node-emoji';
import * as Moment from 'moment';
import * as _ from 'lodash';
import { Group } from './group';
import * as i18n from 'i18next';
import { User } from './user';
import { Pokedex } from './pokedex';
import { GroupInstance } from '../models/entity/group';
import { TimeSlots } from "./timeslot";
import { BotHelper } from "../util/bot-helper";

export class Boss {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  hash: string;
  bot: any;
  channelId: string;
  location: string;
  lat: number;
  lng: number;
  gymName: string;
  name: string;
  pokemonId: number;
  pokedex: Pokedex;
  start: Date;
  groups: Group[];

  constructor(bot: any, pokedex: Pokedex, id: number, channelId: string, hash: string, start: Date, location: string) {
    this.id = id;
    this.bot = bot;
    this.hash = hash;
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

  setCoordinate(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }

  getGroupIds() {
    return _.map(this.groups, 'id');
  }

  getEmojiName() {
    if (!this.pokemonId) return '';
    const star = (_.indexOf([131, 143, 248], this.pokemonId) > -1) ? `${Emoji.get('star')}` : '';
    return `${Emoji.get(this.pokedex.getPokemonById(this.pokemonId).emoji)} ${this.name} ${star}`;
  }

  getTimeSlotList(callbackKey: string) {
    const timeSlots = new TimeSlots().getTimeSlots(Moment(this.start));
    const keys = [];
    _.map(timeSlots, (timeSlot) => {
      keys.push({ text: timeSlot.text, callbackData: `${callbackKey}_${this.id}_${timeSlot.id}` });
    });

    return BotHelper.getInlineKeyboard(keys, 1);
  }

  toString() {
    let list = `<strong>${Moment(this.start).format('HH:mm')} ${this.location} ${this.getEmojiName()}</strong>\n\n`;

    const timeSlots = new TimeSlots().getTimeSlots(Moment(this.start));
    _.map(timeSlots, timeSlot => {
      list += `${timeSlot.emoji} <strong>${timeSlot.text}</strong>\n`;
      _.map(this.groups, (group: Group) => {
        list += `${group.toTimeSlotString(timeSlot.id)}\n`;
      });
    });

    return list;
  }
}
