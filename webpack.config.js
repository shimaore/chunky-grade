(function() {
  var webpack;

  webpack = require('webpack');

  module.exports = {
    entry: {
      main: './main.js'
    },
    output: {
      path: __dirname,
      filename: '[name].bundle.js',
      library: '[name]',
      libraryTarget: 'umd'
    }
  };

}).call(this);
