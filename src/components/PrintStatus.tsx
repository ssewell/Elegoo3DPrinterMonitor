import { getPrintStatusForCode } from 'utils/printStatusCode';

export default function PrintStatus({ statusCode }: { statusCode: number }) {
  return <div>{getPrintStatusForCode(statusCode)}</div>;
}
