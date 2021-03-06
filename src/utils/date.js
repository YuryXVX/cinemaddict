import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDuration = (date) => dayjs().to(dayjs(date));
export const formatReleaseDate = (date) => dayjs(date).format('DD MMMM YYYY');

export const filmDurationCovert = (num) => {
  const hours = (num / 60);
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  const lessHour = rhours !== 0 ? `${rhours}` : '';
  const lessMinutes = minutes !== 0 ? `${rminutes}` : '';

  return { hours: lessHour, minutes: lessMinutes };
};

