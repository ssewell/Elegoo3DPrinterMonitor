import ticksToTime from 'utils/time';

export default function TimeStatus({
  ticks,
  label,
}: {
  ticks: number;
  label: string;
}) {
  const { hours, minutes } = ticksToTime(ticks);

  return (
    <>
      <hr className="subtle" />
      {ticks > 0 && (
        <div className="subtle">
          {hours > 0 ? `${hours} ${hours === 1 ? 'hour' : 'hours'}, ` : ''}
          {minutes > 0
            ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
            : 'Less than one minute'}{' '}
          {label}
        </div>
      )}
    </>
  );
}
