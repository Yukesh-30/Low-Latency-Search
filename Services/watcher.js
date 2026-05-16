const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const indexer = require('./indexer');
const searchEngine = require('./search');


function startWatcher(directory) {
  console.log(`Starting real-time watcher for: ${directory}`);

  const watcher = chokidar.watch(directory, {
    ignored: [
      /(^|[\/\\])\../,
      '**/node_modules.gitindexes$RECYCLE.BINSystem Volume Informationpagefile.sys',
      '**/hiberfil.sys',
      '**/dumpstack.log.tmp'
    ],
    persistent: true,
    ignoreInitial: true,
    errorHandler: (err) => {
      if (err.code === 'EACCES' || err.code === 'EBUSY') return;
      console.error('Watcher error:', err);
    }
  });

  watcher.on('error', error => {
    if (error.code === 'EACCES' || error.code === 'EBUSY') {

      return;
    }
    console.error(`Critical Watcher error: ${error}`);
  });

  watcher
    .on('add', filePath => {
      try {
        const stats = fs.statSync(filePath);
        indexer.addFile({
          name: path.basename(filePath),
          path: filePath,
          size: stats.size,
          modified: stats.mtime.getTime()
        });
        searchEngine.clearCache();
      } catch (e) {}
    })
    .on('change', filePath => {
      try {
        const stats = fs.statSync(filePath);
        indexer.updateFile(filePath, stats);
        searchEngine.clearCache();
      } catch (e) {}
    })
    .on('unlink', filePath => {
      indexer.removeFile(filePath);
      searchEngine.clearCache();
    });

  return watcher;
}

module.exports = startWatcher;
