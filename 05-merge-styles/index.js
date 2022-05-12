const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const PATH_TO_STYLES = path.join(__dirname, 'styles');
const PATH_TO_WRITE_STYLES = path.join(__dirname, 'project-dist');

async function getFiles(pathToStyles) {
  try {
    const files = await fsPromises.readdir(
      pathToStyles,
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

async function getArrOfData(files, pathToStyles) {
  try {
    let arr = [];

    for (let file of files) {
      const part = await fsPromises.readFile(
        path.join(pathToStyles + '/' + file),
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

async function removeBundle(pathToBundle, name) {
  try {
    await fsPromises.rm(path.join(pathToBundle, name), {
      recursive: true,
      force: true,
    });
  } catch (err) {
    console.log('Error remove old bundle.css', err);
  }
}

async function writeData(arr, pathToWrite, name) {
  try {
    for (let part of arr) {
      await fsPromises.appendFile(path.join(pathToWrite, name), part, {
        encoding: 'utf-8',
      });
    }
  } catch (err) {
    console.log('Error write into bundle', err);
  }
}

module.exports.cssBundle = async function getBundle(
  pathToStyles,
  pathToWrite,
  bundleName
) {
  try {
    const files = await getFiles(pathToStyles);
    const arr = await getArrOfData(files, pathToStyles);
    await removeBundle(pathToWrite, bundleName);
    writeData(arr, pathToWrite, bundleName);
  } catch (err) {
    console.log('Error getting bundle', err);
  }
};

module.exports.cssBundle(PATH_TO_STYLES, PATH_TO_WRITE_STYLES, 'bundle.css');
