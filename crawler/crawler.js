const path = require('path')
const { Worker } = require('worker_threads')

/**
 * Starts a file crawl using a worker thread.
 * @param {string} directory - The root directory to crawl.
 * @returns {Promise<Array>} - A promise that resolves with the list of files.
 */
function crawlDirectory(directory) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'worker.js'), {
      workerData: { directory }
    });

    worker.on('message', (files) => {
      resolve(files);
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

module.exports = crawlDirectory;
