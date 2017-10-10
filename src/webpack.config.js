var path = require('path');

module.exports = {
  entry: './js/entry.js',
  output: {
    path: path.resolve(__dirname, '../bin/assets/js'),
    filename: 'bundle.js'
  }
};
