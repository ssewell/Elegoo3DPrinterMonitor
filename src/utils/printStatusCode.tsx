export function getPrintStatusForCode(statusCode: number) {
  let status = '';

  if (statusCode === 0) {
    status = 'Ready';
  } else if (statusCode === 1) {
    status = 'Preparing';
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
    status = 'Complete';
  } else {
    status = 'Unknown';
  }

  return status;
}

export function getColorForStatusCode(statusCode: number) {
  let color = '#07c'; // Default blue color

  if (statusCode === 0 || statusCode === 7) {
    color = '#999'; // Gray when idle or paused
  } else if ((statusCode >= 5 && statusCode <= 6) || statusCode === 9) {
    color = '#c2b85c'; // Yellow during pausing or cancelling
  } else if (statusCode === 13) {
    color = '#c25c5c'; // Red once cancelled
  } else if (statusCode === 16) {
    color = '#64c25c'; // Green once complete
  }

  return color;
}
