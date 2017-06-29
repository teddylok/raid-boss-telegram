import * as Emoji from 'node-emoji';
import * as _ from 'lodash';

export class User {
  id: string;
  bot: any;
  firstName: string;
  lastName: string;
  username: string;
  languageCode: string;
  teamId: number;
  option?: number;

  constructor(bot: any) {
    this.bot = bot;
  }
}