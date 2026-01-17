import cx from 'utils/cx';

interface PrinterStatusProps {
  statusCode: number;
  isOnline: boolean;
}

export default function PrinterStatus({
  statusCode,
  isOnline,
}: PrinterStatusProps) {
  let status = 'Busy';

  if (!isOnline) {
    status = 'Offline';
  } else if (statusCode === 0 || statusCode === 13 || statusCode === 16) {
    status = 'Idle';
  }

  return (
    <div
      className={cx(
        'badge',
        'margin-top-2',
        status === 'Idle' && 'badge-idle',
        status === 'Busy' && 'badge-busy',
        status === 'Offline' && 'badge-offline'
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
