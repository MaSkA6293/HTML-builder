const fs = require('fs');
const path = require('path');
const { stdout, stdin } = require('process');
const LINK = path.join(__dirname, 'text.txt');

fs.writeFile(LINK, '', (err) => {
  if (err) {
    throw err;
  } else {
    stdout.write('file was created');
  }
});

stdin.on('data', (data) => {
  fs.appendFile(LINK, data, (err) => {
    if (err) throw err;
    stdout.write('The information was written');
  });
});

process.on('SIGINT', () => {
  fs.access(LINK, fs.constants.F_OK, (err) => {
    if (err) {
      process.exit();
    } else {
      fs.unlink(LINK, (err) => {
        if (err) throw err;
        stdout.write('\n\nThe file was successfully deleted');
        process.exit();
      });
    }
  });
});

process.on('exit', () => {
  stdout.write('\n\nGood luck!\n\n');
  process.exit();
});
