import cx from '../utils/cx';

export default function PrinterStatus({ statusCode }: { statusCode: number }) {
  let status;

  if (statusCode === 0 || statusCode === 13 || statusCode === 16) {
    status = 'Idle';
  } else {
    status = 'Busy';
  }

  return (
    <div
      className={cx(
        'badge',
        'margin-top-2',
        status === 'Idle' && 'badge-idle',
        status === 'Busy' && 'badge-busy'
      )}
    >
      <div className="badge-items">
        {status === 'Busy' && (
          <div className="blinky-container">
            <div className="blinky" />
          </div>
        )}
        {status}
      </div>
    </div>
  );
}
