const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const webpack = require('webpack')

module.exports = {
  entry: { main: './src/main.js' },
  resolve: {
    extensions: ['.js']
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/manifest.json' }
      ],
    }),
    new NodePolyfillPlugin(),
    new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
  ],
  output: { filename: '[name].js', path: path.resolve(__dirname, 'dist') }, // chrome will look for files under dist/* folder
};
