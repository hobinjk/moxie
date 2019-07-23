const path = require('path');

module.exports = {
  entry: './moxie.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'moxie.js',
  },
  plugins: [],
  mode: 'production',
};

