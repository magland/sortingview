const fs = require('fs');
const path = require('path');

function generateFileManifest(directory, outputFileName) {
  const files = [];
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    items.forEach((item) => {
      const itemPath = path.join(currentDir, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        traverse(itemPath);
      } else {
        files.push(itemPath);
      }
    });
  }

  traverse(directory);
  const files2 = files.map((file) => {
    return file.substring(directory.length + 1);
  })
  fs.writeFileSync(outputFileName, files2.join('\n'));
}

// Usage example
generateFileManifest('dist', 'dist/file-manifest.txt');