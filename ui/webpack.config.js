const path = require('path');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

module.exports = {
  entry: './moxie.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'moxie.js',
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, '..'),
    }),
  ],
  mode: 'development',
};

