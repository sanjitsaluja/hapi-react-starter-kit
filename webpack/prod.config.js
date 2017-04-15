const webpack = require('webpack');
const StatsPlugin = require('stats-webpack-plugin');
const WebpackStrip = require('strip-loader');
const path = require('path');

module.exports = {
  devtool: 'eval',
  entry: [
    './src/client.js'
  ],
  output: {
    path: path.resolve('./static/assets/'),
    filename: '[name]-[hash].min.js',
    publicPath: '/assets/'
  },
  plugins: [
    // new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true
      }
    }),
    new StatsPlugin('webpack.stats.json', {
      source: false,
      modules: false
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      '__SERVER__': false,
      '__CLIENT__': true
    }),
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    })
  ],
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: WebpackStrip.loader('debug', 'console.log')
    },
    {
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      /* query: {
        cacheDirectory: true,
        presets: [ 'es2015', 'react', 'stage-0' ],
        plugins: [ 'transform-decorators-legacy', 'transform-runtime' ]
      } */
    }, {
      test: /\.json?$/,
      loader: 'json'
    }]
  }
};
