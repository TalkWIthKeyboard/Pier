const _ = require('underscore');

function fileName(path) {
  let pathList = path.split('/');
  this.folderName  = [];
  this.pathName = path;

  this.depth = pathList.length;
  for (let i = 0; i < this.depth - 1; i ++)
    this.folderName.push(pathList[i]);
  this.realName = pathList[this.depth - 1];

  this.basename = () => {
    return this.realName.split('.')[0];
  };

  this.extname = () => {
    return this.realName.split('.')[1];
  };

  this.dirname = () => {
    let path = '';
    _.map(this.folderName, folder => {
      path = path !== '' ? `${path}/${folder}` : folder;
    });
    return path;
  };
}

module.exports = fileName;
