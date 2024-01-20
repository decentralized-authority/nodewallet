const fs = require('fs');
const path = require('path');

// Remove the node_modules, dist, and build folders in all directories under apps and under packages
const clean = () => {
  const root = __dirname;
  const dirs = fs.readdirSync(root);
  dirs.forEach(dir => {
    if (dir === 'apps' || dir === 'packages') {
      const subDirs0 = fs.readdirSync(path.join(root, dir));
      subDirs0.forEach(subDir0 => {
        const subDirs1 = fs.readdirSync(path.join(root, dir, subDir0));
        subDirs1.forEach(subDir1 => {
          if (['node_modules', 'dist', 'build', '.turbo'].includes(subDir1)) {
            fs.rmSync(path.join(root, dir, subDir0, subDir1), { recursive: true });
          }
        });
      });
    }
  });
  fs.rmSync(path.join(root, 'node_modules'), { recursive: true });
}
clean();
