import * as Emoji from 'node-emoji';
import * as Moment from 'moment';
import * as _ from 'lodash';
import * as i18n from 'i18next';

export class TimeSlots {
  getTimeSlots(startTime: any) {
    const after15mins = startTime.add(15, 'minute').format('HH:mm');
    const after30mins = startTime.add(30, 'minute').format('HH:mm');
    const after45mins = startTime.add(45, 'minute').format('HH:mm');

    return [
      { id: 1, text: i18n.t('timeslot.reach'), emoji: Emoji.get('clock3') },
      { id: 2, text: i18n.t('timeslot.15min') + `(${after15mins})`, emoji: Emoji.get('clock330') },
      { id: 3, text: i18n.t('timeslot.30min') + `(${after30mins})`, emoji: Emoji.get('clock930') },
      { id: 4, text: i18n.t('timeslot.45min') + `(${after45mins})`, emoji: Emoji.get('clock9') },
      { id: 5, text: i18n.t('timeslot.reject'), emoji: Emoji.get('no_good') }
    ];
  }
}
