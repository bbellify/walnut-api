export function secondsToTime(seconds: number): string {
  seconds = Math.floor(seconds);

  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;

  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;

  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  const remainingSeconds = seconds;

  let timeString = '';

  if (days > 0) timeString += `${days}d`;
  if (hours > 0) timeString += `${hours}h`;
  if (minutes > 0) timeString += `${minutes}m`;
  if (remainingSeconds > 0 || timeString === '') {
    timeString += `${remainingSeconds}s`;
  }
  return timeString.replace(/,\s*$/, '');
}

export function celciusToFahrenheit(c: number): number {
  return c * (9 / 5) + 32;
}
