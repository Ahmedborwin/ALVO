import fs from 'fs';
import path from 'path';

const sourceFile = path.join(__dirname, '..', '..', '..', 'reactjs', 'src', 'contracts', 'deployedContracts.ts');
const destDir = path.join(__dirname, '..', 'contracts');
const destFile = path.join(destDir, 'deployedContracts.ts');

// Ensure the destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy the file
fs.copyFile(sourceFile, destFile, (err) => {
  if (err) {
    console.error('Error copying file:', err);
    process.exit(1);
  }
  console.log('File copied successfully');
});