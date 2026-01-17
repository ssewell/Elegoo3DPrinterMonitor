import cx from 'utils/cx';
import { PrinterItem } from 'types/PrinterTypes';
import { getColorForStatusCode } from 'utils/printStatusCode';
import PrintStatus from './PrintStatus';
import PrinterIcon from './PrinterIcon';
import PrinterStatus from './PrinterStatus';
import ProgressBar from './ProgressBar';
import TimeStatus from './TimeStatus';

interface PrinterProps {
  item: PrinterItem;
  debug: boolean;
  isOnline: boolean;
  lastSeen: number;
  currentTime: number;
}

export default function Printer({
  item,
  debug,
  isOnline,
  lastSeen,
  currentTime,
}: PrinterProps) {
  const attr = item.Data.Attributes;
  const status = item.Data.Status.PrintInfo;

  const hasProgress = status.TotalLayer > 0;
  const progressPercentage = hasProgress
    ? Math.round((status.CurrentLayer / status.TotalLayer) * 100.0)
    : 0;
  const secondsSinceLastSeen = Math.max(
    0,
    Math.floor((currentTime - lastSeen) / 1000)
  );

  return (
    <div className="printer-container">
      <div className="printer-item">
        <div>
          <PrinterIcon machineName={attr.MachineName} />
        </div>
        <div className="printer-status">
          <div className="printer-header-row">
            <div className="printer-header">{attr.Name}</div>
            <div
              className={cx(
                'status-dot',
                isOnline ? 'status-dot-online' : 'status-dot-offline'
              )}
            />
          </div>
          <div className="subtle">{attr.Resolution}</div>
          <div className="subtle">{attr.FirmwareVersion}</div>
          {/* <div className="subtle">{attr.MainboardID}</div> */}

          <PrinterStatus statusCode={status.Status} isOnline={isOnline} />
        </div>
        <div className="print-status">
          {isOnline && hasProgress && (
            <>
              <ProgressBar
                progress={progressPercentage}
                label={<PrintStatus statusCode={status.Status} />}
                trackWidth={5}
                indicatorWidth={10}
                indicatorColor={getColorForStatusCode(status.Status)}
              />
              <div className="current-file">{status.Filename}</div>
              <div className="subtle">{status.CurrentLayer} Layers Printed</div>
              <div className="subtle">{status.TotalLayer} Total Layers</div>
              <TimeStatus
                ticks={status.TotalTicks - status.CurrentTicks}
                label="remaining"
              />
            </>
          )}
          {!isOnline && (
            <div className="offline-status">
              <div className="offline-title">Printer offline</div>
              <div className="subtle">
                Last seen {secondsSinceLastSeen}s ago
              </div>
            </div>
          )}
        </div>
      </div>
      {debug && <pre>{JSON.stringify(item, null, 2)}</pre>}
    </div>
  );
}
