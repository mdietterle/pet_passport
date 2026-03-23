const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // CSS variáveis
  { regex: /--color-teal/g, replacement: '--color-orange' },
  { regex: /--color-amber/g, replacement: '--color-gold' },
  { regex: /--color-purple/g, replacement: '--color-primary' },
  { regex: /--color-red/g, replacement: '--color-danger' },
  { regex: /--color-green/g, replacement: '--color-success' },
  
  // Classes badge
  { regex: /badge-teal/g, replacement: 'badge-orange' },
  { regex: /badge-amber/g, replacement: 'badge-gold' },
  { regex: /badge-purple/g, replacement: 'badge-primary' },
  { regex: /badge-red/g, replacement: 'badge-danger' },
  { regex: /badge-green/g, replacement: 'badge-success' },

  // Classes stat-icon
  { regex: /stat-icon-teal/g, replacement: 'stat-icon-orange' },
  { regex: /stat-icon-amber/g, replacement: 'stat-icon-gold' },
  { regex: /stat-icon-purple/g, replacement: 'stat-icon-primary' },
  { regex: /stat-icon-red/g, replacement: 'stat-icon-danger' },
  { regex: /stat-icon-green/g, replacement: 'stat-icon-success' },
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx') || dirPath.endsWith('.css')) {
        callback(dirPath);
      }
    }
  });
}

let modifiedFiles = 0;

walkDir(directoryPath, function(filePath) {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  let newContent = originalContent;

  for (const { regex, replacement } of replacements) {
    newContent = newContent.replace(regex, replacement);
  }

  if (newContent !== originalContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    modifiedFiles++;
    console.log(`Updated: ${filePath}`);
  }
});

console.log(`Refactoring complete. ${modifiedFiles} files updated.`);
