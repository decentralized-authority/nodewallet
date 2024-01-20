const fs = require('fs');
const path = require('path');
const uniq = require('lodash/uniq');

const packageRootPath = path.join(__dirname, 'packages');

const isTsFile = (filePath) => {
  return path.extname(filePath) === '.ts';
}

const reccursiveGetFiles = (dir) => {
  const files = fs.readdirSync(dir);
  const subdirectoryFiles = files
    .filter(file => fs.statSync(path.join(dir, file)).isDirectory())
    .filter(file => file !== 'dist' && file !== 'scripts')
    .map(file => reccursiveGetFiles(path.join(dir, file)))
    .reduce((acc, val) => acc.concat(val), []);
  const tsFiles = files
    .filter(file => isTsFile(file))
    .filter(file => !/\.spec\.ts$/.test(file))
    .map(file => path.join(dir, file));
  return [
    ...subdirectoryFiles,
    ...tsFiles,
  ];
};

const importPatt = /^import.+?from.+?'(.+?)'/;

for(const dir of fs.readdirSync(packageRootPath)) {
  const packageJsonPath = path.join(packageRootPath, dir, 'package.json');
  const packageJson = require(packageJsonPath);
  const dependencies = Object.keys(packageJson.dependencies || {});
  console.log(`Checking ${dir} dependencies`);
  const projectFiles = reccursiveGetFiles(path.join(packageRootPath, dir)).slice(0, 5);
  let allImports = [];
  for(const filepath of projectFiles) {
    const fileContent = fs.readFileSync(filepath, 'utf8');
    const imports = fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => importPatt.test(line))
      .map(line => line.match(importPatt)[1])
      .filter(dep => !/^\./.test(dep));
    allImports = allImports.concat(imports);
  }
  const uniqImports = uniq(allImports)
    .sort((a, b) => a.localeCompare(b));
  const notFound = uniqImports.filter(dep => !dependencies.includes(dep));
  if(notFound.length === 0) {
    console.log('All dependencies found!\n');
  } else {
    console.log('Missing dependencies:\n', notFound.join('\n') + '\n');
  }
}
