import PrinterIcon from './PrinterIcon';

export default function Printer({ item }: { item: any }) {
  const attr = item.Data.Attributes;
  const status = item.Data.Status.PrintInfo;

  return (
    <div className="printer-item">
      <div>
        <PrinterIcon machineName={attr.MachineName} />
      </div>
      <div className="printer-attributes">
        <div>{attr.Name}</div>
        <div className="subtle">{attr.MainboardID}</div>
        <div className="subtle">{attr.Resolution}</div>
        <div className="subtle">{attr.FirmwareVersion}</div>

        <h3>Print Status</h3>
        <div>{status.Filename}</div>
        <div>
          {status.CurrentLayer} / {status.TotalLayer} (
          {Math.round((status.CurrentLayer / status.TotalLayer) * 100.0)}%)
        </div>
      </div>
    </div>
  );
}
