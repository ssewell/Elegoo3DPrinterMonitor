import PrinterIcon from './PrinterIcon';
import PrinterStatus from './PrinterStatus';
import ProgressBar from './ProgressBar';

export default function Printer({ item }: { item: any }) {
  const attr = item.Data.Attributes;
  const status = item.Data.Status.PrintInfo;
  const progressPercentage = Math.round(
    (status.CurrentLayer / status.TotalLayer) * 100.0
  );
  const hasProgress = status.TotalLayer > 0;

  return (
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
        <div>{status.Filename}</div>
        <div>
          {hasProgress && (
            <ProgressBar
              progress={progressPercentage}
              trackWidth={5}
              indicatorWidth={10}
            />
          )}
        </div>
      </div>
    </div>
  );
}
