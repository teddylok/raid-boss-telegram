import * as _ from 'lodash';
import * as Moment from 'moment';
import * as TelegramBot from 'node-telegram-bot-api';
import * as Emoji from 'node-emoji';
import * as i18n from 'i18next';
import { Channel } from './domain/channel';
import Models from './models/models';
import { User } from './domain/user';
import { Boss } from './domain/boss';
import { UserInstance } from './models/entity/user';
import { Group } from './domain/group';
import { GroupInstance } from './models/entity/group';
import { Pokedex, Pokemon } from './domain/pokedex';
import { Locale } from './locale';
import { Team } from './domain/team';
import * as Express from 'express';
import * as Schedule from 'node-schedule';
import * as Request from 'request-promise';
import * as util from 'util';
import { BotHelper } from './util/bot-helper';
import { UserRepository } from './models/repository/user-repository';
import { GroupRepository } from './models/repository/group-repository';
import { BossRepository } from './models/repository/boss-repository';
import { BossInstance } from './models/entity/boss';
import * as base64 from 'base-64';
import { ChannelInstance } from './models/entity/channel';
import { ChannelRepository } from './models/repository/channel-repository';

const app = Express();

const token = process.env.BOT_TOKEN;
const locales = [Locale.EN_US, Locale.JA_JP, Locale.ZH_CN, Locale.ZH_HK];
const channels = [];

// translation
i18n.init({
  lng: Locale.ZH_HK,
  fallbackLng: Locale.EN_US,
  keySeparator: '|',
  resources: getTranslations()
});

const bot = new TelegramBot(token, { polling: true });
const pokedex = new Pokedex(bot);

const channelRepository = new ChannelRepository(bot);
const userRepository = new UserRepository(bot);
const groupRepository = new GroupRepository(bot);
const bossRepository = new BossRepository(bot, pokedex);

// load data from database
loadDataFromDatabase();

// bot listener
bot.on('channel_post', (msg, match) => {
  console.log('on text msg', msg);
  if (_.toString(msg.chat.id) === _.toString(process.env.TAI_PO_RAID_ALERT_CHAT_ID)) {
    try {
      const channel = getChannel(msg.chat.id);
      const data = JSON.parse(base64.decode(msg.text));
      const hash = data[0];
      const gymName = data[1];
      const lat = _.toInteger(data[2]);
      const lng = _.toInteger(data[3]);
      const level = _.toInteger(data[5]);
      const pokemonId = _.toInteger(data[6]);
      let boss = null;

      if (4 === level) {
        getAddress(lat, lng)
          .then(address => {
            address = _.replace(address, /香港|九龍|新界|大埔/g, 'qu');
            bot.sendMessage(channel.id, `${hash} ${gymName} ${lat} ${level} ${pokemonId} ${address}`);

            boss = channel.getBossByHash(hash);
            if (!boss) {
              return addBoss(msg, channel, Moment(data[4]).format('HH:mm'), `${address} ${gymName}`, hash);
            }
          })
          .then(() => {
            console.log(channel.boss);
            boss = channel.getBossByHash(hash);
            if (pokemonId) {
              return setBoss(channel, boss.id, pokemonId)
                .then(() => {
                  bot.sendMessage(channel.id, channel.toString(), {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id
                  });
                });
            }
          })
          .catch(err => console.log(err));
      }
    } catch (err) {
      if (err.message !== 'Invalid character: the string to be decoded is not correctly encoded.') {
        console.log(err);
      }
    }
  }
});

bot.onText(/\/start/, (msg) => {
  const id = msg.chat.id;
  const name = msg.chat.title;

  if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
    bot.sendMessage(
      id,
      `${Emoji.get('no_entry_sign')}  ${i18n.t('botOnlySupportGroupChat')}`
    );
    return;
  }

  // validation and make sure one channel is unique
  if (_.find(channels, (channel) => _.toString(channel.id) === _.toString(id))) {
    bot.sendMessage(
      msg.chat.id,
      `${Emoji.get('no_entry_sign')}  ${i18n.t('botHasBeenRegistered')}`
    );
    return;
  }

  Models.Channel
    .findById(id)
    .then(channel => (channel) ? channel : Models.Channel.create({
      id,
      name,
      channel_type_id: Channel.CHANNEL_TYPE_ADMIN
    }))
    .then((channel: ChannelInstance) => channels.push(new Channel(bot, channel.id, channel.name, channel.channel_type_id)))
    .catch(err => console.log(err));

  bot.sendMessage(id, `${Emoji.get('white_check_mark')}  ${i18n.t('botRegistered')}`);
});

bot.onText(/\/raid (.+)/, (msg, match) => {
  const channel = getChannel(msg.chat.id);
  const regex = /\d\d:\d\d (.*)/;

  if (channel.channelTypeId !== Channel.CHANNEL_TYPE_ADMIN) return false;
  if (!regex.test(match)) {
    bot.sendMessage(channel.id, `${Emoji.get('bomb')}  ${i18n.t('raid.incorrectTimeFormat')}`);
  }
});

bot.onText(/\/raid (\d\d:\d\d) (.+)/, (msg, match) => {
  const channel = getChannel(msg.chat.id);
  const time = match[1];
  const location = match[2];

  if (!channel) return askForRegistration(msg.chat.id);
  if (channel.channelTypeId !== Channel.CHANNEL_TYPE_ADMIN) return false;

  addBoss(msg, channel, time, location, null);
});

bot.onText(/\/list(.+)?/, (msg, match) => {
  const channel = getChannel(msg.chat.id);
  bot.sendMessage(channel.id, channel.toString(_.trim(match[1])), {
    chat_id: msg.chat.id,
    message_id: msg.message_id
  });
});

bot.onText(/\/boss/, (msg) => {
  const channelId = msg.chat.id;
  const channel = getChannel(channelId);
  const keys = [];

  if (channel.channelTypeId !== Channel.CHANNEL_TYPE_ADMIN) return false;
  if (!channel.getBattleAndCompletedBoss()) {
    bot.sendMessage(channelId, i18n.t('battle.currentlyNoBattle'));
    return;
  }

  _.map(channel.getBattleAndCompletedBoss(), (boss: Boss) => {
    let text = `${Moment(boss.start).format('HH:mm')} ${boss.location} ${boss.getEmojiName()}`;
    keys.push({ text: text, callbackData: `BOSS_${boss.id}` });
  });

  bot.sendMessage(channelId, i18n.t('boss.pleaseSelect'), {
    reply_markup: JSON.stringify({ inline_keyboard: BotHelper.getInlineKeyboard(keys, 2) }),
    chat_id: msg.chat.id,
    message_id: msg.message_id
  });
});

bot.onText(/\/join/, (msg) => {
  const channelId = msg.chat.id;
  const channel = getChannel(channelId);

  bot.sendMessage(channelId, i18n.t('join.pleaseSelect'), {
    reply_markup: JSON.stringify({ inline_keyboard: channel.getUpcomingBossList('JOIN') }),
    chat_id: msg.chat.id,
    message_id: msg.message_id
  });
});

bot.onText(/\/team/, (msg) => {
  const channelId = msg.chat.id;
  const channel = getChannel(channelId);

  if (channel.channelTypeId !== Channel.CHANNEL_TYPE_ADMIN) return false;
  let keys = channel.getUpcomingBossList('TEAM');
  bot.sendMessage(channelId, i18n.t('team.pleaseSelect'), {
    reply_markup: JSON.stringify({ inline_keyboard: keys }),
    chat_id: msg.chat.id,
    message_id: msg.message_id
  });
});

bot.onText(/\/delboss/, (msg, match) => {
  const id = match[1];
  const channelId = msg.chat.id;
  const channel = getChannel(channelId);
  const keys = [];

  if (channel.channelTypeId !== Channel.CHANNEL_TYPE_ADMIN) return false;

  _.map(_.sortBy(channel.getBoss(), ['start']), (boss: Boss) => {
    keys.push({ text: `${Moment(boss.start).format('HH:mm')} ${boss.location} ${boss.getEmojiName()}`, callbackData: `DELBOSS_${boss.id}` });
  });

  bot.sendMessage(msg.chat.id, i18n.t('team.pleaseSelect'), {
    reply_markup: JSON.stringify({ inline_keyboard: BotHelper.getInlineKeyboard(keys, 2) }),
    chat_id: msg.chat.id,
    message_id: msg.message_id
  });
});

bot.onText(/\/setting/, (msg) => {
  chooseTeam(msg);
});

bot.onText(/\/setchanneltype (\d)/, (msg, match) => {
  const channel = getChannel(msg.chat.id);
  channel.setChannelType(_.toInteger(match[1]));
  channelRepository
    .save(channel)
    .then(() => bot.sendMessage(channel.id, `${Emoji.get('ok')} ${i18n.t('channel.type.updated')}`))
    .catch(err => console.log(err));
});

bot.on('callback_query', (msg) => {
  const chatId = msg.message.chat.id;
  const channel = getChannel(chatId);
  const match = _.split(msg.data, '_');
  let boss = null;

  switch (match[0]) {
    case 'BOSS':
      boss = channel.getBossById(_.toInteger(match[1]));
      const level4Pokemons = pokedex.getPokemonByLevel(4);
      const keys = [];

      _.map(level4Pokemons, (pokemon: Pokemon) => {
        keys.push({ text: pokemon.zhHkName, callbackData: `SETBOSS_${boss.id}_${pokemon.id}` });
      });

      const message = i18n.t('boss.whatIsTheBoss', {
        bossId: match[1],
        start: Moment(boss.start).format('HH:mm'),
        location: boss.location
      });

      bot.editMessageText(message, {
        reply_markup: JSON.stringify({ inline_keyboard: BotHelper.getInlineKeyboard(keys, 3) }),
        chat_id: chatId,
        message_id: msg.message.message_id
      });
      break;
    case 'TEAM':
      boss = channel.getBossById(_.toInteger(match[1]));
      bot.editMessageText(boss.toString(), {
        chat_id: chatId,
        message_id: msg.message.message_id
      });
      break;
    case 'SETBOSS':
      setBoss(channel, _.toInteger(match[1]), _.toInteger(match[2]))
        .then(() => {
          bot.editMessageText(channel.toString(), {
            chat_id: chatId,
            message_id: msg.message.message_id
          });
        });
      break;
    case 'JOIN':
      // show time slot options
      boss = channel.getBossById(_.toInteger(match[1]));

      bot.editMessageText(`${boss.toString()}\n\n`, {
        reply_markup: JSON.stringify({ inline_keyboard: boss.getTimeSlotList('JOINBOSS') }),
        chat_id: chatId,
        message_id: msg.message.message_id
      });
      break;
    case 'JOINBOSS':
      joinBoss(msg, _.toInteger(match[1]), _.toInteger(match[2]));
      break;
    case 'DELBOSS':
      const id = _.toInteger(match[1]);
      bossRepository
        .remove(id)
        .then(() => getChannel(channel.id).removeBoss(id))
        .then(() => bot.editMessageText(channel.toString(), {
          chat_id: chatId,
          message_id: msg.message.message_id
        }))
        // .then(() => bot.sendMessage(channel.id, `${Emoji.get('skull_and_crossbones')}  ${i18n.t('boss.deleted', { id })}`))
        .catch(err => console.log(err));
      break;
    case 'LOCALE':
      (_.indexOf(locales, match[1])) ? i18n.changeLanguage(match[1]) : false;
      break;
    case 'SETTEAM':
      if (match[1] !== _.toString(msg.from.id)) {
        bot.sendMessage(chatId, `${Emoji.get('middle_finger')} ${BotHelper.getFullName(msg.from)} ${i18n.t('noneOfYourBusiness')}`);
        break;
      }
      setTeam(msg.from, _.toInteger(match[2])).then(() => {
        let teamName = '';

        switch (_.toInteger(match[2])) {
          case 1:
            teamName = i18n.t('team.valor');
            break;
          case 2:
            teamName = i18n.t('team.mystic');
            break;
          case 3:
            teamName = i18n.t('team.instinct');
            break;
        }
        bot.editMessageText(i18n.t('team.changed', { name: msg.from.first_name, teamName }), {
          chat_id: chatId,
          message_id: msg.message.message_id
        });
      }).catch(err => console.log(err));
      break;
  }
});

bot.on('message', (msg) => {
  if (msg.new_chat_member) {
    chooseTeam(msg);
  }
});

// bot.onText(/\/language/, (msg) => {
//   const channel = getChannel(msg.chat.id);
//   const key = [];
//   const languages = []
//   let pos = 0;
//   let btnPerLine = 3;
//
//   _.map(locales, (locale: string) => {
//     let localeName = '';
//     let row = pos / btnPerLine | 0;
//     if (!key[row]) key[row] = [];
//
//     switch (locale) {
//       case Locale.EN_US: localeName = 'English'; break;
//       case Locale.JA_JP: localeName = '日文'; break;
//       case Locale.ZH_HK: localeName = '繁體中文'; break;
//       case Locale.ZH_CN: localeName = '簡體中文'; break;
//       default: localeName = 'English'; break;
//     }
//     key[row].push({ text: localeName, callback_data: `LOCALE_${locale}` });
//     pos++;
//   });
//
//   const message = i18n.t('setting.changeLocale');
//
//   bot.sendMessage(channel.id, message, {
//     reply_markup: JSON.stringify({ inline_keyboard: key }),
//     chat_id: msg.chat.id,
//     message_id: msg.message_id
//   });
// });

function getChannel(id: string) {
  const channel = _.find(channels, (channel) => _.toString(channel.id) === _.toString(id));

  if (!channel) {
    askForRegistration(id);
  }

  return channel;
}

function askForRegistration(channelId: string) {
  return bot.sendMessage(channelId, `${Emoji.get('bomb')}  ${i18n.t('askForRegistration')}`);
}

function loadDataFromDatabase() {
  const promise = loadChannels()
    .catch(err => console.log(err));

  return promise;
}

function loadChannels() {
  return Models.Channel
    .findAll({
      include: [
        {
          required: false,
          model: Models.Boss,
          where: {
            start: {
              $gte: Moment().format('YYYY-MM-DDT00:00:00'),
              $lte: Moment().format('YYYY-MM-DDT23:59:59')
            }
          },
          include: [{
            required: false,
            model: Models.Group,
            include: [{
              required: false,
              model: Models.User,
              through: { model: Models.GroupUser, attributes: ['option'] },
              as: 'Users'
            }]
          }]
        }
      ]
    })
    .then(channelInstances => {
      _.map(channelInstances, (channelInstance: any) => {
        const channel = new Channel(bot, channelInstance.id, channelInstance.name);
        channel.createdAt = channelInstance.created_at;
        channel.updatedAt = channelInstance.updated_at;
        channels.push(channel);

        _.map(channelInstance.Bosses, (bossInstance: any) => {
          const boss = bossRepository.getDomainObject(bossInstance);
          channel.addBoss(boss);

          _.map(bossInstance.Groups, (groupInstance: any) => {
            const group = boss.addGroup(groupInstance);

            _.map(groupInstance.Users, (userInstance: any) => {
              group.users.push(userRepository.getDomainObject(userInstance));
            });
          });
        });
      });
    });
}

function addBoss(msg: any, channel: Channel, time: string, location: string, bossHash: string) {
  const hash = (bossHash) ? bossHash : _.toString(channel.getBoss().length + 1);

  const start = Moment();
  start.hour(_.toInteger(time.substring(0, 2)));
  start.minute(_.toInteger(time.substring(3, 5)));
  start.second(0);
  start.millisecond(0);

  let bossInstance = null;
  let boss: Boss = new Boss(bot, pokedex, null, channel.id, hash, start.toDate(), location);

  bossRepository
    .save(boss)
    .then((instance: BossInstance) => {
      boss.id = instance.id;
      boss.createdAt = instance.created_at;
      boss.updatedAt = instance.updated_at;
      channel.addBoss(boss);
      bossInstance = instance;

      const groups = [];
      _.map(boss.groups, (group: any) => {
        groups.push({
          boss_id: group.bossId,
          name: group.name,
          seq: group.seq
        });
      });

      return groups;
    })
    .then((groups: Group[]) => groupRepository.bulkCreate(groups))
    .then(groupInstances => {
      _.map(groupInstances, (groupInstance: any) => {
        _.find(boss.groups, group => group.seq === groupInstance.seq).id = groupInstance.id;
      });
    })
    .then(() => bot.sendMessage(channel.id, channel.toString(), {
      chat_id: msg.chat.id,
      message_id: msg.message_id
    }));
}

function setBoss(channel: Channel, bossId: number, pokemonId: number) {
  const boss = channel.getBossById(bossId);
  return Promise.resolve()
    .then(() => boss.setPokemon(pokemonId))
    .then(() => bossRepository.save(boss))
    .catch(err => console.log(err));
}

function getTranslations() {
  const namespaces = ['translation'];
  const resources = {};

  _.map(locales, (locale: string) => {
    resources[locale] = {};
    _.map(namespaces, (namespace: string) => {
      resources[locale][namespace] = require(`./translation/${locale}/${namespace}.json`);
    });
  });

  return resources;
}

function chooseTeam(msg) {
  const channel = getChannel(msg.chat.id);
  const from = (msg.new_chat_member) ? msg.new_chat_member : msg.from;
  const key = [];
  const teams = [
    { id: Team.TEAM_VALOR, name: i18n.t('team.valor') },
    { id: Team.TEAM_MYSTIC, name: i18n.t('team.mystic') },
    { id: Team.TEAM_INSTINCT, name: i18n.t('team.instinct') }
  ];
  let pos = 0;
  let btnPerLine = 3;

  _.map(teams, (team: any) => {
    let localeName = '';
    let row = pos / btnPerLine | 0;
    if (!key[row]) key[row] = [];

    key[row].push({ text: team.name, callback_data: `SETTEAM_${from.id}_${team.id}` });
    pos++;
  });

  const message = `${i18n.t('greeting')} ${BotHelper.getFullName(from)} ${i18n.t('team.changeTeam')}`;

  bot.sendMessage(channel.id, message, {
    reply_markup: JSON.stringify({ inline_keyboard: key }),
    chat_id: msg.chat.id,
    message_id: msg.message_id
  });
}

function setTeam(from, teamId: number) {
  const user = getUser(from);
  user.teamId = teamId;

  return userRepository
    .save(user)
    .catch(err => console.log(err));
}

function getUser(from, option?: string) {
  const user = new User(bot);
  user.id = _.toString(from.id);
  user.firstName = from.first_name;
  user.lastName = from.last_name;
  user.username = from.username;
  user.languageCode = from.language_code;

  return user;
}

function joinBoss(msg: any, bossId: number, option: number) {
  const channel = getChannel(msg.message.chat.id);
  const boss = channel.getBossById(bossId);

  let group = null;
  let userInstance = null;

  Promise.resolve()
    .then(() => userRepository.save(getUser(msg.from)))
    .then((instance: UserInstance) => userInstance = instance)
    .then(() => group = _.find(boss.groups, (group: Group) => group.seq === userInstance.team_id))
    .then(() => groupRepository.removeGroupUser(boss.getGroupIds(), userInstance.id))
    .then(() => boss.removeUserInGroup(userInstance.id))
    .then(() => groupRepository.getById(group.id))
    .then((instance: GroupInstance) => instance.addUser(userInstance, { option }))
    .then(() => group.addUser(userRepository.getDomainObject(userInstance, option)))
    .then(() => bot.editMessageText(`${boss.toString()} ${i18n.t('lastUpdated')}: ${Moment().add(process.env.TIMEZONE_OFFSET || 0, 'hour').format('HH:mm:ss')}`, {
      chat_id: channel.id,
      message_id: msg.message.message_id,
      reply_markup: JSON.stringify({ inline_keyboard: boss.getTimeSlotList('JOINBOSS') }),
    }))
    .catch(err => console.log(err));
}

function getAddress(lat: number, lng: number) {
  return Request(`http://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&sensor=true`)
    .then(response => response.formatted_address);
}
