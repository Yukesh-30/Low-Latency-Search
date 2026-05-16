const crawlDirectory = require('../crawler/crawler');
const indexer = require('../crawler/indexer');
const startWatcher = require('../crawler/watcher');
const searchEngine = require('../crawler/search');
const path = require('path');
const fs = require('fs');

async function runTest() {
  const testDir = path.join(__dirname, 'test_files');
  
  // Cleanup previous tests
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testDir);

  // 1. Create some initial files
  console.log('--- Initial Setup ---');
  const file1 = path.join(testDir, 'test1.txt');
  fs.writeFileSync(file1, 'Hello World');
  
  // 2. Perform initial crawl with worker thread
  console.log('--- Running Initial Crawl with Worker Thread ---');
  const startTime = Date.now();
  const files = await crawlDirectory(testDir);
  console.log(`Crawl completed in ${Date.now() - startTime}ms. Found ${files.length} files.`);
  
  indexer.syncWithCrawl(files);
  console.log('Index initialized.');

  // 3. Start watcher
  console.log('--- Starting Watcher ---');
  const watcher = startWatcher(testDir);

  // Wait for watcher to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 4. Test incremental ADD
  console.log('--- Testing Incremental ADD ---');
  const file2 = path.join(testDir, 'test2.txt');
  fs.writeFileSync(file2, 'Incremental data');
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // wait for watcher
  let currentFiles = indexer.getAllFiles();
  console.log(`Files in index: ${currentFiles.length}`);
  if (currentFiles.find(f => f.name === 'test2.txt')) {
    console.log('✅ Incremental ADD successful.');
  } else {
    console.log('❌ Incremental ADD failed.');
  }

  // 5. Test incremental CHANGE
  console.log('--- Testing Incremental CHANGE ---');
  fs.appendFileSync(file1, '...more data');
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // wait for watcher
  const updatedFile1 = indexer.getAllFiles().find(f => f.name === 'test1.txt');
  console.log(`File1 size: ${updatedFile1.size}`);
  if (updatedFile1.size > 11) { // 'Hello World' is 11 bytes
    console.log('✅ Incremental CHANGE successful.');
  } else {
    console.log('❌ Incremental CHANGE failed.');
  }

  // 6. Test incremental REMOVE
  console.log('--- Testing Incremental REMOVE ---');
  fs.unlinkSync(file2);
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // wait for watcher
  currentFiles = indexer.getAllFiles();
  console.log(`Files in index: ${currentFiles.length}`);
  if (!currentFiles.find(f => f.name === 'test2.txt')) {
    console.log('✅ Incremental REMOVE successful.');
  } else {
    console.log('❌ Incremental REMOVE failed.');
  }

  console.log('--- Test Complete ---');
  watcher.close();
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
