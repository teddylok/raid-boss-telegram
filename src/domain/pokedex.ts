import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import { Group } from './group';

export class Pokemon {
  id: number;
  name: string;
  level: number;
  zhHkName: string;
  zhCnName: string;
  jaName: string;
  emoji: string;
}

export class Pokedex {
  bot: any;
  pokemons: Pokemon[];

  constructor(bot: any) {
    this.bot = bot;
    this.pokemons = [];

    const raidBosses = [
      { id: 129, level: 1, name: 'Magikarp', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 153, level: 1, name: 'Bayleef', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 156, level: 1, name: 'Quilava', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 159, level: 1, name: 'Croconaw', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 89, level: 2, name: 'Muk', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 103, level: 2, name: 'Exeggutor', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 110, level: 2, name: 'Weezing', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 125, level: 2, name: 'Electabuzz', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 126, level: 2, name: 'Magmar', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 59, level: 3, name: 'Arcanine', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 65, level: 3, name: 'Alakazam', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 68, level: 3, name: 'Machamp', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 94, level: 3, name: 'Gengar', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 134, level: 3, name: 'Vaporeon', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 135, level: 3, name: 'Jolteon', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 136, level: 3, name: 'Flareon', zhHkName: '', zhCnName: '', jaName: '', emoji: '' },
      { id: 3, level: 4, name: 'Venusaur', zhHkName: '奇異花', zhCnName: '', jaName: '', emoji: 'hibiscus' },
      { id: 6, level: 4, name: 'Charizard', zhHkName: '噴火龍', zhCnName: '', jaName: '', emoji: 'fire' },
      { id: 9, level: 4, name: 'Blastoise', zhHkName: '水箭龜', zhCnName: '', jaName: '', emoji: 'droplet' },
      { id: 112, level: 4, name: 'Rhydon', zhHkName: '鐵甲暴龍', zhCnName: '', jaName: '', emoji: 'mountain' },
      { id: 131, level: 4, name: 'Lapras', zhHkName: '背背龍', zhCnName: '', jaName: '', emoji: 'snowflake' },
      { id: 143, level: 4, name: 'Snorlax', zhHkName: '卡比獸', zhCnName: '', jaName: '', emoji: 'panda_face' },
      { id: 248, level: 4, name: 'Tyranitar', zhHkName: '班吉拉', zhCnName: '', jaName: '', emoji: 'hatched_chick' },
      { id: 144, level: 5, name: 'Articuno', zhHkName: '急凍鳥', zhCnName: '', jaName: '', emoji: 'snowflake' },
      { id: 145, level: 5, name: 'Zapdos', zhHkName: '雷鳥', zhCnName: '', jaName: '', emoji: 'zap' },
      { id: 146, level: 5, name: 'Moltres', zhHkName: '火鳥', zhCnName: '', jaName: '', emoji: 'fire' },
      { id: 150, level: 5, name: 'Mewtwo', zhHkName: '超夢夢', zhCnName: '', jaName: '', emoji: 'smiling_imp' },
      { id: 151, level: 5, name: 'Mew', zhHkName: '夢夢', zhCnName: '', jaName: '', emoji: 'alien' },
      { id: 249, level: 5, name: 'Lugia', zhHkName: '利基亞', zhCnName: '', jaName: '', emoji: 'bird' },
      { id: 250, level: 5, name: 'Ho-Oh', zhHkName: '鳳凰', zhCnName: '', jaName: '', emoji: 'fire' },
      { id: 251, level: 5, name: 'Celebi', zhHkName: '雪拉比', zhCnName: '', jaName: '', emoji: 'alien' },
      { id: 243, level: 5, name: 'Raikou', zhHkName: '雷公', zhCnName: '', jaName: '', emoji: 'zap' },
      { id: 244, level: 5, name: 'Entei', zhHkName: '炎帝', zhCnName: '', jaName: '', emoji: 'fire' },
      { id: 245, level: 5, name: 'Suicune', zhHkName: '水君', zhCnName: '', jaName: '', emoji: 'droplet' },
    ];

    _.map(raidBosses, boss => {
      const pokemon = new Pokemon();
      pokemon.id = boss.id;
      pokemon.name = boss.name;
      pokemon.level = boss.level;
      pokemon.zhHkName = boss.zhHkName;
      pokemon.zhCnName = boss.zhCnName;
      pokemon.jaName = boss.jaName;
      pokemon.emoji = boss.emoji;

      this.pokemons.push(pokemon);
    });
  }

  getPokemonByLevel(level: number) {
    return _.filter(this.pokemons, (pokemon: Pokemon) => pokemon.level === level);
  }

  getPokemonById(id: number) {
    return _.find(this.pokemons, (pokemon: Pokemon) => pokemon.id === id);
  }
}