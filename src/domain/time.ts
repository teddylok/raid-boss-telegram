import * as Emoji from 'node-emoji';
import * as _ from 'lodash';
import * as Moment from 'moment';

export const Time = {
  now() {
    return Moment().add(process.env.TIMEZONE_OFFSET || 0, 'hour');
  }
};
