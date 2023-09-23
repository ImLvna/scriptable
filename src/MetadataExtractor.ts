/*
  Extracts scriptable's metadata from the current file

  Useful for getting image codes

  */

const manager = FileManager.iCloud();

const dir = manager.documentsDirectory();

const file = manager.readString(manager.joinPath(dir, `${Script.name()}.js`));

const match = file.match(/^(\/\/ .*\n?)*/g);

const commentLines = match ? match[0].split("\n") : [];

console.log(commentLines.join("\n"));
