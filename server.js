const express = require('express');
const path = require('path');
const crawlDirectory = require('./crawler/crawler');
const indexer = require('./crawler/indexer');
const searchEngine = require('./crawler/search');
const watcher = require('./crawler/watcher');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());



async function initialize() {
  const rootDir = process.argv[2] || process.cwd();
  console.log(`\n📂 Initializing FileExplorer at: ${rootDir}`);


  console.log('Starting initial crawl...');
  try {
    const files = await crawlDirectory(rootDir);
    indexer.syncWithCrawl(files);
    console.log(`Crawl complete. Indexed ${files.length} files.`);
  } catch (err) {
    console.error('Initial crawl failed:', err.message);
  }


  watcher(rootDir);
}




app.get('/api/search', (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  const startTime = Date.now();
  const results = searchEngine.search(query);
  const duration = Date.now() - startTime;

  res.json({
    query,
    count: results.length,
    timeMs: duration,
    results: results.slice(0, 50).map(item => ({
      name: item.file.name,
      path: item.file.path,
      folder: path.dirname(item.file.path),
      size: item.file.size,
      modified: new Date(item.file.modified).toLocaleString(),
      score: item.score
    }))
  });
});


app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    indexedFiles: indexer.getAllFiles().length,
    cacheSize: searchEngine.cache.cache.size,
    root: process.cwd()
  });
});



app.listen(PORT, async () => {
  console.log(`\n🚀 FileExplorer Server running at http://localhost:${PORT}`);
  await initialize();
});
