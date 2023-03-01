const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './client/src/index.js',

  output: {
    path: path.join(__dirname, '/client/dist'),
    filename: 'bundle.js'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '/client/dist'),
      publicPath: '/'
    },
    proxy: {
      '/login': 'http://localhost:3000'
    },
    compress: true,
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './client/src/index.html'
    })
  ],

  module: {
    rules: [
      {
        test: /\.js$|jsx/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        }
      }
    ]
  }
};