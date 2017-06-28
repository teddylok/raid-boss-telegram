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
}

export class Pokedex {
  bot: any;
  pokemons: Pokemon[];

  constructor(bot: any) {
    this.bot = bot;
    this.pokemons = [];

    const raidBosses = [
      { id: 129, level: 1, name: 'Magikarp', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 153, level: 1, name: 'Bayleef', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 156, level: 1, name: 'Quilava', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 159, level: 1, name: 'Croconaw', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 89, level: 2, name: 'Muk', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 103, level: 2, name: 'Exeggutor', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 110, level: 2, name: 'Weezing', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 125, level: 2, name: 'Electabuzz', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 126, level: 2, name: 'Magmar', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 59, level: 3, name: 'Arcanine', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 65, level: 3, name: 'Alakazam', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 68, level: 3, name: 'Machamp', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 94, level: 3, name: 'Gengar', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 134, level: 3, name: 'Vaporeon', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 135, level: 3, name: 'Jolteon', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 136, level: 3, name: 'Flareon', zhHkName: '', zhCnName: '', jaName: '' },
      { id: 3, level: 4, name: 'Venusaur', zhHkName: '奇異花', zhCnName: '', jaName: '' },
      { id: 6, level: 4, name: 'Charizard', zhHkName: '噴火龍', zhCnName: '', jaName: '' },
      { id: 9, level: 4, name: 'Blastoise', zhHkName: '水箭龜', zhCnName: '', jaName: '' },
      { id: 112, level: 4, name: 'Rhydon', zhHkName: '鐵甲暴龍', zhCnName: '', jaName: '' },
      { id: 131, level: 4, name: 'Lapras', zhHkName: '背背龍', zhCnName: '', jaName: '' },
      { id: 143, level: 4, name: 'Snorlax', zhHkName: '卡比獸', zhCnName: '', jaName: '' },
      { id: 248, level: 4, name: 'Tyranitar', zhHkName: '班吉拉', zhCnName: '', jaName: '' }
    ];

    _.map(raidBosses, boss => {
      const pokemon = new Pokemon();
      pokemon.id = boss.id;
      pokemon.name = boss.name;
      pokemon.level = boss.level;
      pokemon.zhHkName = boss.zhHkName;
      pokemon.zhCnName = boss.zhCnName;
      pokemon.jaName = boss.jaName;

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