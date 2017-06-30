import * as _ from 'lodash';

export interface InlineKeyboardKey {
  text: string;
  callbackData: string;
}

export const BotHelper = {
  getFullName(user) {
    return `${user.first_name} ${user.last_name || ''}`;
  },

  getInlineKeyboard(keys: InlineKeyboardKey[], btnPerLine: number) {
    let output = [];
    let pos = 0;

    _.map(keys, (key) => {
      let row = _.toInteger(pos / btnPerLine) || 0;
      if (!output[row]) output[row] = [];

      output[row].push({ text: key.text, callback_data: key.callbackData });
      pos++;
    });

    return output;
  }
};
