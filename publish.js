const fs = require('fs-extra');
const path = require('path');
const omit = require('lodash/omit');
const { spawnSync } = require('child_process');

const tempdir = path.join(__dirname, 'temp');
fs.emptyDirSync(tempdir);

const packagesRoot = path.join(__dirname, 'packages');

const packageVersions = {};

const packageDirectories = fs.readdirSync(packagesRoot)

for(const dir of packageDirectories) {
  const packagePath = path.join(packagesRoot, dir);
  if (!fs.statSync(packagePath).isDirectory()) {
    continue;
  }
  const packageJsonPath = path.join(packagePath, 'package.json');
  const { name, version, private: isPrivate } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageVersions[name] = version;
  if(isPrivate) {
    continue;
  }
  fs.copySync(packagePath, path.join(tempdir, dir));
}
for(const dir of fs.readdirSync(tempdir)) {
  const packagePath = path.join(tempdir, dir);
  const packageJsonPath = path.join(packagePath, 'package.json');
  let content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  content = omit(content, ['devDependencies', 'scripts']);
  for(const dep of Object.keys(content.dependencies || {})) {
    if(packageVersions[dep]) {
      content.dependencies[dep] = packageVersions[dep];
    }
  }
  fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, 2), 'utf8');
  const result = spawnSync('npm', ['publish', '--access=public'], {
    cwd: packagePath,
    stdio: 'inherit',
  });
  if(result.error) {
    console.error(result.error);
    process.exit(1);
  }
}
