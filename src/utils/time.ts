/**
 * Convert ticks to hours, minutes, and seconds.
 *
 * @param ticks - The number of ticks, assumed to be in milliseconds.
 * @returns An object containing the calculated hours, minutes, and seconds.
 */
export default function ticksToTime(ticks: number) {
  // Convert ticks to seconds
  const totalSeconds = Math.floor(ticks / 1000);

  // Calculate hours, minutes, and remaining seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  const seconds = totalSeconds - hours * 3600 - minutes * 60;

  return {
    hours,
    minutes,
    seconds,
  };
}
