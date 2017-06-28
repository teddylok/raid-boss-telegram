var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: `${__dirname}/src/index.ts`,
  target: 'node',
  externals: [
    /^[a-z\-0-9]+$/ // Ignore node_modules folder
  ],
  output: {
    filename: 'index.js',
    path: `${__dirname}/dist`,
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },
  module: {
    loaders: [{
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader',
      exclude: 'node_modules'
    }]
  }
};