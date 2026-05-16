const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');

const SUPPORTED_EXTENSIONS = [
  '.txt', '.pdf', '.doc', '.docx', '.xlsx', '.xls', '.jpg', '.png',
  '.mp3', '.mp4', '.avi', '.mkv', '.zip', '.rar', '.7z', '.tar',
  '.gz', '.json', '.xml', '.html', '.css', '.js', '.py', '.java',
  '.c', '.cpp', '.cs', '.go', '.rb', '.php', '.ts', '.tsx', '.jsx',
  '.md', '.log', '.exe', '.dll', '.msi', '.iso', '.dmg', '.apk'
];

const STOP_KEYWORDS = [
  'node_modules', '.git', 'cache', 'temp', 'tmp',
  '$RECYCLE.BIN', 'System Volume Information', 'pagefile.sys', 'hiberfil.sys', 'dumpstack.log.tmp'
];

function crawlDirectory(directory, files = []) {
  try {
    const items = fs.readdirSync(directory);
    for (const item of items) {
      const lowerItem = item.toLowerCase();
      if (STOP_KEYWORDS.some(k => k.toLowerCase() === lowerItem)) continue;


      if (lowerItem.startsWith('$') || lowerItem === 'system volume information') continue;

      const fullPath = path.join(directory, item);
      try {
        const stats = fs.lstatSync(fullPath);

        if (stats.isDirectory()) {
          crawlDirectory(fullPath, files);
        } else {
          const ext = path.extname(fullPath).toLowerCase();
          if (SUPPORTED_EXTENSIONS.includes(ext)) {
            files.push({
              name: item,
              path: fullPath,
              size: stats.size,
              modified: stats.mtime.getTime()
            });
          }
        }
      } catch (err) {

      }
    }
  } catch (err) {

  }
  return files;
}

const { directory } = workerData;
const results = crawlDirectory(directory);
parentPort.postMessage(results);
