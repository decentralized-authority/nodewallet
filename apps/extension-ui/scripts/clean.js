const fs = require('fs-extra');
const path = require('path');

(async function() {
  const rootDir = path.resolve(__dirname, '../');
  const dirs = process.argv;
  for(const dir of dirs) {
    await fs.remove(path.join(rootDir, dir));
  }
})();
