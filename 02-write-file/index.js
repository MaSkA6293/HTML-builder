const fs = require('fs');
const path = require('path');
const { stdout, stdin } = require('process');
const LINK = path.join(__dirname, 'text.txt');

fs.writeFile(LINK, '', (err) => {
  if (err) {
    throw err;
  } else {
    stdout.write('The file text.txt was created, please write some text \n');
  }
});

stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') {
    process.exit();
  }
  fs.appendFile(LINK, data, (err) => {
    if (err) throw err;
    stdout.write('The information has been written to text.txt \n');
  });
});

process.on('SIGINT', () => {
  fs.access(LINK, fs.constants.F_OK, (err) => {
    if (err) {
      process.exit();
    } else {
      fs.unlink(LINK, (err) => {
        if (err) throw err;
        stdout.write('\n\nThe file text.txt has been successfully deleted');
        process.exit();
      });
    }
  });
});

process.on('exit', () => {
  stdout.write('\n\nGood luck!\n\n');
  process.exit();
});
