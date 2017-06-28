import * as Emoji from 'node-emoji';
import * as _ from 'lodash';

export class User {
  id: number;
  bot: any;
  firstName: string;
  lastName: string;
  username: string;
  languageCode: string;
  teamId: number;

  constructor(bot: any) {
    this.bot = bot;
  }
}