var path = require('path');
var webpack = require("webpack");

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'hashcast.bundle.js',
    library: 'HashCast'
  },

  // resolve: {
  //   fallback: {
  //     // crypto: require.resolve("crypto-browserify"),
  //     // stream: require.resolve("stream-browserify"),
  //     //buffer: require.resolve("buffer/")
  //   },
  //   alias: {
  //     process: 'process/browser.js',
  //   }
  // },
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     process: 'process/browser.js',
  //     Buffer: ['buffer', 'Buffer'],
  //   })
  // ]
};
