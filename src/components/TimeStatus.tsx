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
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {ticks > 0 && (
        <>
          <hr className="subtle" />
          <div className="subtle">
            {hours > 0 ? `${hours} ${hours === 1 ? 'hour' : 'hours'}, ` : ''}
            {minutes > 0
              ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
              : 'Less than one minute'}{' '}
            {label}
          </div>
        </>
      )}
    </>
  );
}
