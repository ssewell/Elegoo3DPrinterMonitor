const fs = require('fs');

function normalizeOptions(options) {
  const normalized = {
    recursive: true,
    force: true,
  };

  if (options?.maxRetries != null) {
    normalized.maxRetries = options.maxRetries;
  } else if (options?.maxBusyTries != null) {
    normalized.maxRetries = options.maxBusyTries;
  }

  if (options?.retryDelay != null) {
    normalized.retryDelay = options.retryDelay;
  }

  return normalized;
}

function ignoreMissing(error, callback) {
  if (!error || error.code === 'ENOENT') {
    if (callback) callback(null);
    return true;
  }

  return false;
}

function rimraf(targetPath, options, callback) {
  let resolvedOptions = options;
  let resolvedCallback = callback;

  if (typeof options === 'function') {
    resolvedCallback = options;
    resolvedOptions = undefined;
  }

  if (resolvedCallback) {
    return new Promise((resolve, reject) => {
      fs.rm(targetPath, normalizeOptions(resolvedOptions), (error) => {
        if (ignoreMissing(error, resolvedCallback)) {
          resolve();
          return;
        }

        resolvedCallback(error);
        reject(error);
      });
    });
  }

  return fs.promises
    .rm(targetPath, normalizeOptions(resolvedOptions))
    .catch((error) => {
      if (!ignoreMissing(error)) {
        throw error;
      }
    });
}

function rimrafSync(targetPath, options) {
  try {
    fs.rmSync(targetPath, normalizeOptions(options));
  } catch (error) {
    if (!ignoreMissing(error)) {
      throw error;
    }
  }
}

rimraf.sync = rimrafSync;
rimraf.rimraf = rimraf;
rimraf.rimrafSync = rimrafSync;

module.exports = rimraf;
