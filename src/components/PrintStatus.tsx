export default function PrintStatus({ statusCode }: { statusCode: number }) {
  let status;

  if (statusCode === 0) {
    status = 'Ready';
  } else if (statusCode === 1) {
    status = 'Busy';
  } else if (statusCode === 2) {
    status = 'Retracting';
  } else if (statusCode === 3) {
    status = 'Exposing';
  } else if (statusCode === 4) {
    status = 'Lifting';
  } else if (statusCode === 5) {
    status = 'Pausing';
  } else if (statusCode === 7) {
    status = 'Paused';
  } else if (statusCode === 9) {
    status = 'Cancelling';
  } else if (statusCode === 12) {
    status = 'Finalizing';
  } else if (statusCode === 13) {
    status = 'Cancelled';
  } else if (statusCode === 16) {
    status = 'Idle';
  } else {
    status = 'Unknown';
  }

  return <div>{status}</div>;
}
