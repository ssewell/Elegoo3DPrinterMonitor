import { PrinterItem } from 'types/PrinterTypes';
import { getColorForStatusCode } from 'utils/printStatusCode';
import PrintStatus from './PrintStatus';
import PrinterIcon from './PrinterIcon';
import PrinterStatus from './PrinterStatus';
import ProgressBar from './ProgressBar';

export default function Printer({
  item,
  debug,
}: {
  item: PrinterItem;
  debug: boolean;
}) {
  const attr = item.Data.Attributes;
  const status = item.Data.Status.PrintInfo;

  const progressPercentage = Math.round(
    (status.CurrentLayer / status.TotalLayer) * 100.0
  );
  const hasProgress = status.TotalLayer > 0;

  return (
    <div className="printer-container">
      <div className="printer-item">
        <div>
          <PrinterIcon machineName={attr.MachineName} />
        </div>
        <div className="printer-status">
          <div className="printer-header">{attr.Name}</div>
          <div className="subtle">{attr.Resolution}</div>
          <div className="subtle">{attr.FirmwareVersion}</div>
          {/* <div className="subtle">{attr.MainboardID}</div> */}

          <PrinterStatus statusCode={status.Status} />
        </div>
        <div className="print-status">
          {hasProgress && (
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
            </>
          )}
        </div>
      </div>
      {debug && <pre>{JSON.stringify(item, null, 2)}</pre>}
    </div>
  );
}
