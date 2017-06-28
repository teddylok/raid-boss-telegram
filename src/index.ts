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

const app = Express();

app.get('/', (req, res) => {
  res.send('Raid Boss Bot is up.');
});

const host = process.env.HOST;
const port = process.env.PORT || 80;
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

// load data from database
loadDataFromDatabase();

// bot listener
bot.onText(/\/start/, (msg) => {
  if (msg.chat.type !== 'group') {
    bot.sendMessage(
      msg.chat.id,
      `${Emoji.get('no_entry_sign')}  ${i18n.t('botOnlySupportGroupChat')}`
    );
    return;
  }
  const id = msg.chat.id;
  const name = msg.chat.title;

  // validation and make sure one channel is unique
  if (_.find(channels, (channel) => channel.id === id)) {
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
      name
    }))
    .then(channel => channels.push(new Channel(bot, channel.id, channel.name)))
    .catch(err => console.log(err));

  bot.sendMessage(msg.chat.id, `${Emoji.get('white_check_mark')}  ${i18n.t('botRegistered')}`);
});

bot.onText(/\/raid (.+)/, (msg, match) => {
  const channelId = msg.chat.id;
  const regex = /\d\d:\d\d (.*)/;

  if (!regex.test(match)) {
    bot.sendMessage(channelId, `${Emoji.get('bomb')}  ${i18n.t('raid.incorrectTimeFormat')}`);
  }
});

bot.onText(/\/raid (\d\d:\d\d) (.+)/, (msg, match) => {
  const channel = getChannel(msg.chat.id);
  const time = match[1];
  const location = match[2];
  let boss: Boss = null;

  if (!channel) return askForRegistration(msg.chat.id);

  const start = Moment();
  start.hour(time.substring(0, 2));
  let minutes = time.substring(3, 5);
  start.minute(minutes);
  start.second(0);
  start.millisecond(0);

  let bossInstance = null;

  Models.Boss.create({
    boss_id: channel.boss.length + 1,
    channel_id: channel.id,
    start: start.toString(),
    location
  })
    .then(instance => {
      boss = new Boss(bot, pokedex, instance.id, instance.channel_id, instance.boss_id, instance.start, instance.location);
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
    .then((groups) => Models.Group.bulkCreate(groups, {returning: true}))
    .then(groupInstances => {
      _.map(groupInstances, (groupInstance: any) => {
        _.find(boss.groups, group => group.seq === groupInstance.seq).id = groupInstance.id;
      });
    })
    .then(() => bot.sendMessage(channel.id, channel.toString()));
});

bot.onText(/\/list(.+)?/, (msg, match) => {
  const channel = getChannel(msg.chat.id);
  bot.sendMessage(channel.id, channel.toString(_.trim(match[1])));
});

bot.onText(/\/boss/, (msg) => {
  const channelId = msg.chat.id;
  const channel = getChannel(channelId);
  const key = [];
  let pos = 0;
  let btnPerLine = 1;

  if (!channel.getBattleBoss()) {
    bot.sendMessage(channelId, i18n.t('battle.currentlyNoBattle'));
    return;
  }

  _.map(channel.getBattleAndCompletedBoss(), (boss: Boss) => {
    let text = `${Moment(boss.start).format('HH:mm')} ${boss.location} ${boss.getEmojiName()}`;
    let row = pos / btnPerLine || 0;
    if (!key[row]) key[row] = [];

    key[row].push({ text: text, callback_data: `BOSS_${boss.id}` });
    pos++;
  });

  bot.sendMessage(channelId, i18n.t('boss.pleaseSelect'), {
    reply_markup: JSON.stringify({ inline_keyboard: key }),
    chat_id: msg.chat.id,
    message_id: msg.message_id
  });
});

bot.onText(/\/join/, (msg) => {
  const channelId = msg.chat.id;
  const channel = getChannel(channelId);
  const key = [];
  let pos = 0;
  let btnPerLine = 1;

  _.map(_.sortBy(channel.getUpcomingBoss(), ['start', 'bossId']), (boss: Boss) => {
    let text = `${Moment(boss.start).format('HH:mm')} ${boss.location} ${boss.getEmojiName()}`;
    let row = pos / btnPerLine || 0;
    if (!key[row]) key[row] = [];

    key[row].push({ text: text, callback_data: `JOIN_${boss.id}` });
    pos++;
  });

  bot.sendMessage(channelId, i18n.t('join.pleaseSelect'), {
    reply_markup: JSON.stringify({ inline_keyboard: key }),
    chat_id: msg.chat.id,
    message_id: msg.message_id
  });
});

bot.onText(/\/team/, (msg) => {
  const channelId = msg.chat.id;
  const channel = getChannel(channelId);
  const key = [];
  let pos = 0;
  let btnPerLine = 1;

  _.map(_.sortBy(channel.getUpcomingBoss(), ['start', 'bossId']), (boss: Boss) => {
    let text = `${Moment(boss.start).format('HH:mm')} ${boss.location} ${boss.getEmojiName()}`;
    let row = pos / btnPerLine || 0;
    if (!key[row]) key[row] = [];

    key[row].push({ text: text, callback_data: `TEAM_${boss.id}` });
    pos++;
  });

  bot.sendMessage(channelId, i18n.t('team.pleaseSelect'), {
    reply_markup: JSON.stringify({ inline_keyboard: key }),
    chat_id: msg.chat.id,
    message_id: msg.message_id
  });
});

bot.onText(/\/delboss (\d)/, (msg, match) => {
  const id = match[1];
  const channelId = msg.chat.id;

  Models.Boss.destroy({
    where: { id }
  })
    .then(() => getChannel(channelId).removeBoss(id))
    .then(() => bot.sendMessage(channelId, `${Emoji.get('skull_and_crossbones')}  ${i18n.t('boss.deleted', { id })}`))
    .catch(err => console.log(err));
});

bot.onText(/\/setting/, (msg) => {
  chooseTeam(msg);
});

bot.on('callback_query', (msg) => {
  const channelId = msg.message.chat.id;
  const channel = getChannel(channelId);
  const match = _.split(msg.data, '_');
  let boss = null;

  switch (match[0]) {
    case 'BOSS':
      boss = channel.getBossById(_.toInteger(match[1]));
      const level4Pokemons = pokedex.getPokemonByLevel(4);
      const key = [];
      let pos = 0;
      let btnPerLine = 3;

      _.map(level4Pokemons, (pokemon: Pokemon) => {
        let row = pos / btnPerLine | 0;
        if (!key[row]) key[row] = [];
        key[row].push({ text: pokemon.zhHkName, callback_data: `SETBOSS_${match[1]}_${pokemon.id}` });
        pos++;
      });

      const message = i18n.t('boss.whatIsTheBoss', {
        bossId: match[1],
        start: Moment(boss.start).format('HH:mm'),
        location: boss.location
      });

      bot.sendMessage(channel.id, message, {
        reply_markup: JSON.stringify({ inline_keyboard: key }),
        chat_id: channelId,
        message_id: msg.message_id
      });
      break;
    case 'TEAM':
      boss = channel.getBossByBossId(_.toInteger(match[1]));
      bot.editMessageText(boss.toString(), {
        chat_id: channelId,
        message_id: msg.message.message_id
      });
      break;
    case 'SETBOSS':
      setBoss(channel, _.toInteger(match[1]), _.toInteger(match[2]))
        .then(() => {
          bot.editMessageText(channel.toString(), {
            chat_id: channelId,
            message_id: msg.message.message_id
          });
        });
      break;
    case 'JOIN':
      joinBoss(msg, _.toInteger(match[1]));
      break;
    case 'LOCALE':
      (_.indexOf(locales, match[1])) ? i18n.changeLanguage(match[1]) : false;
      break;
    case 'SETTEAM':
      setTeam(msg.from, _.toInteger(match[1])).then(() => {
        let teamName = '';

        switch (_.toInteger(match[1])) {
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
          chat_id: channelId,
          message_id: msg.message.message_id
        });
      }).catch(err => console.log(err));
      break;
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

function getChannel(id: number) {
  const channel = _.find(channels, (channel) => channel.id === id);

  if (!channel) {
    askForRegistration(id);
  }

  return channel;
}

function askForRegistration(msgId: number) {
  return bot.sendMessage(msgId, `${Emoji.get('bomb')}  ${i18n.t('askForRegistration')}`);
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
              through: 'GroupUser',
              as: 'Users'
            }]
          }]
        }
      ]
    })
    .then(channelInstances => {
      _.map(channelInstances, (channelInstance: any) => {
        const channel = new Channel(bot, channelInstance.id, channelInstance.name);
        channels.push(channel);

        _.map(channelInstance.Bosses, (bossInstance: any) => {
          const boss = new Boss(bot, pokedex, bossInstance.id, bossInstance.channel_id, bossInstance.boss_id, bossInstance.start, bossInstance.location);
          if (bossInstance.pokemon_id) {
            boss.setPokemon(_.toInteger(bossInstance.pokemon_id));
          }
          channel.boss.push(boss);

          _.map(bossInstance.Groups, (groupInstance: any) => {
            const group = boss.addGroup(groupInstance);

            _.map(groupInstance.Users, (userInstance: any) => {
              group.users.push(getUserDomainObject(userInstance));
            });
          });
        });
      });
    });
}

function setBoss(channel: Channel, bossId: number, pokemonId: number) {
  const boss = channel.getBossByBossId(bossId);
  const pokemon = pokedex.getPokemonById(pokemonId);

  return Models.Boss.update({
    pokemon_id: pokemon.id
  }, {
    where: {
      id: boss.id
    },
    returning: true
  })
    .then(() => boss.setPokemon(pokemonId));
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

function getUser(from) {
  const userId = from.id;
  return Models.User.find({
    where: {
      id: userId
    }
  })
    .then((user: UserInstance) => {
      if (user) {
        user.first_name = from.first_name;
        user.last_name = from.last_name;
        user.username = from.username;
        user.language_code = from.language_code;
        return user.save();
      }

      return Models.User.create({
        id: userId,
        first_name: from.first_name || '',
        last_name: from.last_name || '',
        username: from.username || '',
        language_code: from.language_code,
        team_id: Team.TEAM_VALOR
      });
    });
}

function getUserDomainObject(instance: UserInstance) {
  const user = new User(bot);

  user.id = instance.id;
  user.firstName = instance.first_name;
  user.lastName = instance.last_name;
  user.username = instance.username;
  user.languageCode = instance.language_code;
  user.teamId = instance.team_id;

  return user;
}

function chooseTeam(msg) {
  const channel = getChannel(msg.chat.id);
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

    key[row].push({ text: team.name, callback_data: `SETTEAM_${team.id}` });
    pos++;
  });

  const message = `${i18n.t('team.changeTeam')}`;

  bot.sendMessage(channel.id, message, {
    reply_markup: JSON.stringify({ inline_keyboard: key }),
    chat_id: msg.chat.id,
    message_id: msg.message_id
  });
}

function setTeam(from, teamId: number) {
  return getUser(from)
    .then((user: UserInstance) => {
      user.team_id = teamId;
      user.save();
      return user;
    });
}

function joinBoss(msg: any, bossId: number) {
  const channel = getChannel(msg.message.chat.id);
  const boss = channel.getBossByBossId(bossId);

  let group = null;
  let userInstance = null;

  Promise.resolve()
    .then(() => getUser(msg.from))
    .then((instance: UserInstance) => userInstance = instance)
    .then(() => group = _.find(boss.groups, (group: Group) => group.seq === userInstance.team_id))
    .then(() => Models.GroupUser.destroy({
      where: {
        group_id: {
          $in: boss.getGroupIds()
        },
        user_id: userInstance.id
      }
    }))
    .then(() => boss.removeUserInGroup(userInstance.id))
    .then(() => Models.Group.find({
      where: {
        id: group.id
      }
    }))
    .then((instance: GroupInstance) => instance.addUser(userInstance))
    .then(() => group.addUser(getUserDomainObject(userInstance)))
    .then(() => bot.sendMessage(channel.id, i18n.t('boss.joined', { name: userInstance.first_name, start: Moment(boss.start).format('HH:mm'), location : boss.location, bossName: boss.getEmojiName() })))
    .catch(err => console.log(err));
}

const server = app.listen(port, () => {
  console.log(`${Emoji.get('robot_face')}  Hi! I am up ${host}:${port}`);
});

// schedule to ping Heroku every 15min except 00:00 to 06:00
const schedulerHost = process.env.SCHEDULER_HOST;
const rule = new Schedule.RecurrenceRule();
rule.hour = [0, new Schedule.Range(5, 23)];
rule.minute = [0, 15, 30, 45];

const job = Schedule.scheduleJob(rule, () => {
  Request(`http://${host}`)
    .then(() => console.log(`Ping ${host} at ${Moment()}`))
    .catch(err => console.log(err));
});

// schedule to wakeUp the scheduler
const job2 = Schedule.scheduleJob('* * 21 * * *', () => {
  Request(`http://${schedulerHost}`)
    .then(() => console.log(`Ping ${schedulerHost} at ${Moment()}`))
    .catch(err => console.log(err));
});