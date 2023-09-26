const path = require('path');
const fs = require('fs-extra');

(async function() {
  const rootDir = path.resolve(__dirname, '../');
  const distDir = path.join(rootDir, 'dist');
  await fs.copy(
    path.resolve(rootDir, '../extension-ui/build'),
    distDir,
    {
      overwrite: true,
    });
  await fs.copy(path.join(rootDir, 'service-worker.js'), path.join(distDir, 'service-worker.js'));
  await fs.copy(
    path.join(rootDir, 'manifest.json'),
    path.join(distDir, 'manifest.json'),
    {
      overwrite: true,
    });
})();
