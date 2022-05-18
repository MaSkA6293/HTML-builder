const fs = require("fs");
const path = require("path");
const fsPromises = fs.promises;
const promises = [];
const ERROR_ENOENT = "ENOENT";

const PATH_TO_STYLES = path.join(__dirname, "styles");
const PATH_TO_WRITE_STYLES = path.join(__dirname, "project-dist");

const toFolder = path.join(__dirname, "project-dist", "assets");
const fromFolder = path.join(__dirname, "assets");

function replacer(match) {
  const name = [...match].slice(2, -2).join("");
  try {
    const part = fsPromises.readFile(
      path.join(__dirname, "components", `${name}.html`),
      { encoding: "utf-8" },
      (err) => {
        if (err) {
          console.log("Error reading file", err);
        }
      }
    );
    promises.push(part);
  } catch (err) {
    console.log("err", err);
  }
}

async function getHtml() {
  const template = await fsPromises.readFile(
    path.join(__dirname, "template.html"),
    { encoding: "utf-8" },
    (err) => {
      if (err) {
        console.log("Error reading file", err);
      }
    }
  );

  template.replace(/{{\w+}}/gi, replacer);
  const data = await Promise.all(promises);
  const indexHtml = template.replace(/{{\w+}}/gi, () => {
    return data.shift();
  });

  await fsPromises.mkdir(path.join(__dirname, "project-dist"), {
    recursive: true,
  });
  await fsPromises.writeFile(
    path.join(__dirname, "project-dist", "index.html"),
    indexHtml
  );
}

async function copyFiles(from, to) {
  try {
    await removeDir(to);
    await fsPromises.mkdir(to, {
      recursive: true,
    });
    copy(from, to);
  } catch (err) {
    console.log("failed to create directory", err);
  }
}

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
        await removeDir(rmFolderPath + "/" + file, {
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
    console.log("failed to remove directory", err);
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
          path.join(to + "/" + file),
          {
            recursive: true,
          },
          (err) => {
            if (err) {
              console.log("failed to create dir", err);
            }
          }
        );
        await copyFiles(
          path.join(from + "/" + file),
          path.join(to + "/" + file)
        );
      } else {
        await fsPromises.copyFile(path.join(from, file), path.join(to, file));
      }
    }
  } catch (err) {
    console.log("filed to copy files", err);
  }
}

async function getFiles(pathToStyles) {
  try {
    const files = await fsPromises.readdir(
      pathToStyles,
      { recursive: true, force: true },
      {
        withFileTypes: true,
      },
      (err) => {
        if (err) console.log("Error reading directory", err);
      }
    );
    return files.filter((el) => path.extname(el) === ".css");
  } catch (err) {
    console.log("Error getting arr of files", err);
  }
}

async function getArrOfData(files, pathToStyles) {
  try {
    let arr = [];

    for (let file of files) {
      const part = await fsPromises.readFile(
        path.join(pathToStyles + "/" + file),
        { encoding: "utf-8" },
        (err) => {
          if (err) {
            console.log("Error reading file", err);
          }
        }
      );
      arr.push(part);
    }
    return arr;
  } catch (err) {
    console.log("Error getting arr of data", err);
  }
}

async function removeBundle(pathToBundle, name) {
  try {
    await fsPromises.rm(path.join(pathToBundle, name), {
      recursive: true,
      force: true,
    });
  } catch (err) {
    console.log("Error remove old bundle.css", err);
  }
}

async function writeData(arr, pathToWrite, name) {
  try {
    for (let part of arr) {
      await fsPromises.appendFile(path.join(pathToWrite, name), part, {
        encoding: "utf-8",
      });
    }
  } catch (err) {
    console.log("Error write into bundle", err);
  }
}

async function getBundle(pathToStyles, pathToWrite, bundleName) {
  try {
    const files = await getFiles(pathToStyles);
    const arr = await getArrOfData(files, pathToStyles);
    await removeBundle(pathToWrite, bundleName);
    writeData(arr, pathToWrite, bundleName);
  } catch (err) {
    console.log("Error getting bundle", err);
  }
}

getHtml();
getBundle(PATH_TO_STYLES, PATH_TO_WRITE_STYLES, "style.css");
copyFiles(fromFolder, toFolder);

