const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;
const promises = [];
const css = require('../05-merge-styles');
const copyFiles = require('../04-copy-directory');

const PATH_TO_STYLES = path.join(__dirname, 'styles');
const PATH_TO_WRITE_STYLES = path.join(__dirname, 'project-dist');

const toFolder = path.join(__dirname, 'project-dist', 'assets');
const fromFolder = path.join(__dirname, 'assets');

function replacer(match) {
  const name = [...match].slice(2, -2).join('');
  try {
    const part = fsPromises.readFile(
      path.join(__dirname, 'components', `${name}.html`),
      { encoding: 'utf-8' },
      (err) => {
        if (err) {
          console.log('Error reading file', err);
        }
      }
    );
    promises.push(part);
  } catch (err) {
    console.log('err', err);
  }
}

async function getHtml() {
  const template = await fsPromises.readFile(
    path.join(__dirname, 'template.html'),
    { encoding: 'utf-8' },
    (err) => {
      if (err) {
        console.log('Error reading file', err);
      }
    }
  );

  template.replace(/{{\w+}}/gi, replacer);
  const data = await Promise.all(promises);
  const indexHtml = template.replace(/{{\w+}}/gi, () => {
    return data.shift();
  });

  await fsPromises.mkdir(path.join(__dirname, 'project-dist'), {
    recursive: true,
  });
  await fsPromises.writeFile(
    path.join(__dirname, 'project-dist', 'index.html'),
    indexHtml
  );
}

getHtml();
css.cssBundle(PATH_TO_STYLES, PATH_TO_WRITE_STYLES, 'style.css');
copyFiles.copyFiles(fromFolder, toFolder);
