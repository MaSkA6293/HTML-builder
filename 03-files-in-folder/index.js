const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

async function filesInfo() {
  try {
    let items = await fsPromises.readdir(
      path.join(__dirname, 'secret-folder'),
      {
        withFileTypes: true,
      }
    );
    items = items
      .filter((el) => el.isFile())
      .map((el) => [el.name, path.extname(el.name)])
      .map(async (el) => {
        const stats = await fsPromises.stat(
          path.join(__dirname, 'secret-folder', el[0])
        );
        return Promise.resolve([...el, stats.size]);
      });

    const result = await Promise.all(items);
    result.forEach((el) =>
      process.stdout.write(
        `${el[0].match(/.*\./)[0].slice(0, -1)} - ${el[1].slice(1)} - ${
          el[2] / 1000
        }kb \n`
      )
    );
  } catch (err) {
    console.log(err);
  }
}

filesInfo();
