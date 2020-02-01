const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './moxie.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'moxie.js',
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: 'static',
      ignore: ['.*'], // ignore all hidden (git) files
    }]),
  ],
  mode: 'production',
};

