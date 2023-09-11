import mars4UltraImage from '../../assets/printers/Mars4Ultra.png';
import saturn3UltraImage from '../../assets/printers/Saturn3Ultra.png';
import defaultImage from '../../assets/printers/default.png'; // Import a default image

interface PrinterImages {
  [key: string]: string;
}

const printerImages: PrinterImages = {
  'ELEGOO Mars 4 Ultra': mars4UltraImage,
  'ELEGOO Saturn 3 Ultra': saturn3UltraImage,
};

export default function PrinterIcon({ machineName }: { machineName: string }) {
  return (
    <div className="printer-icon">
      <img src={printerImages[machineName] || defaultImage} alt={machineName} />
    </div>
  );
}
