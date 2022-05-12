const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const toFolder = path.join(__dirname, 'files-copy');
const fromFolder = path.join(__dirname, 'files');
const ERROR_ENOENT = 'ENOENT';

module.exports.copyFiles = async function copyFiles(from, to) {
  try {
    await removeDir(to);
    await fsPromises.mkdir(to, {
      recursive: true,
    });
    copy(from, to);
  } catch (err) {
    console.log('failed to create directory', err);
  }
};

async function removeDir(rmFolderPath) {
  try {
    const files = await fsPromises.readdir(
      rmFolderPath,
      { recursive: true, force: true },
      {
        withFileTypes: true,
      }
    );
    if (files.length === 0) {
      await fsPromises.rmdir(rmFolderPath, {
        force: true,
      });
      return;
    }
    if (files.length === 1) {
      const stat = await fsPromises.stat(path.join(rmFolderPath, files[0]));
      if (stat.isDirectory()) {
        await removeDir(path.join(rmFolderPath, files[0]));
        await fsPromises.rmdir(rmFolderPath);
        return;
      } else {
        await fsPromises.rm(path.join(rmFolderPath, files[0]), {
          recursive: true,
          force: true,
        });
        await fsPromises.rmdir(rmFolderPath);
        return;
      }
    }

    for (let file of files) {
      const stat = await fsPromises.stat(path.join(rmFolderPath, file));
      if (stat.isDirectory()) {
        await removeDir(rmFolderPath + '/' + file, {
          force: true,
        });
      } else {
        await fsPromises.rm(path.join(rmFolderPath, file), {
          recursive: true,
          force: true,
        });
      }
    }
    await fsPromises.rmdir(rmFolderPath);
  } catch (err) {
    if ((err.code = ERROR_ENOENT)) {
      return;
    }
    console.log('failed to remove directory', err);
  }
}

async function copy(from, to) {
  try {
    const files = await fsPromises.readdir(
      from,
      { recursive: true, force: true },
      {
        withFileTypes: true,
      }
    );
    if (files.length === 0) {
      return;
    }
    for (let file of files) {
      const stat = await fsPromises.stat(path.join(from, file));
      if (stat.isDirectory()) {
        await fsPromises.mkdir(
          path.join(to + '/' + file),
          {
            recursive: true,
          },
          (err) => {
            if (err) {
              console.log('failed to create dir', err);
            }
          }
        );
        await module.exports.copyFiles(
          path.join(from + '/' + file),
          path.join(to + '/' + file)
        );
      } else {
        await fsPromises.copyFile(path.join(from, file), path.join(to, file));
      }
    }
  } catch (err) {
    console.log('filed to copy files', err);
  }
}

module.exports.copyFiles(fromFolder, toFolder);
