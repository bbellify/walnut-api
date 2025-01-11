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

  if (days > 0) timeString += `${days} day${days > 1 ? 's' : ''}, `;
  if (hours > 0) timeString += `${hours} hour${hours > 1 ? 's' : ''}, `;
  if (minutes > 0) timeString += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
  if (remainingSeconds > 0 || timeString === '') {
    timeString += `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }
  return timeString.replace(/,\s*$/, '');
}

export function celciusToFahrenheit(c: number): number {
  return c * (9 / 5) + 32;
}
