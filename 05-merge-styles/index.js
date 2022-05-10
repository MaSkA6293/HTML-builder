const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const PATH_TO_STYLES = path.join(__dirname, 'styles');

async function getFiles() {
  try {
    const files = await fsPromises.readdir(
      PATH_TO_STYLES,
      { recursive: true, force: true },
      {
        withFileTypes: true,
      },
      (err) => {
        if (err) console.log('Error reading directory', err);
      }
    );
    return files.filter((el) => path.extname(el) === '.css');
  } catch (err) {
    console.log('Error getting arr of files', err);
  }
}

async function getArrOfData(files) {
  try {
    let arr = [];

    for (let file of files) {
      const part = await fsPromises.readFile(
        path.join(PATH_TO_STYLES + '/' + file),
        { encoding: 'utf-8' },
        (err) => {
          if (err) {
            console.log('Error reading file', err);
          }
        }
      );
      arr.push(part);
    }
    return arr;
  } catch (err) {
    console.log('Error getting arr of data', err);
  }
}

async function removeBundle() {
  try {
    await fsPromises.rm(path.join(__dirname, 'project-dist', 'bundle.css'), {
      recursive: true,
      force: true,
    });
  } catch (err) {
    console.log('Error remove old bundle.css', err);
  }
}

async function writeData(arr) {
  try {
    for (let part of arr) {
      await fsPromises.appendFile(
        path.join(__dirname, 'project-dist', 'bundle.css'),
        part,
        { encoding: 'utf-8' }
      );
    }
  } catch (err) {
    console.log('Error write into bundle', err);
  }
}

async function getBundle() {
  try {
    const files = await getFiles();
    const arr = await getArrOfData(files);
    await removeBundle();
    writeData(arr);
  } catch (err) {
    console.log('Error getting bundle', err);
  }
}
getBundle();
