const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  entry: './index.ts',
  mode: 'production',
  output: {
    filename: '[name].js',
    chunkFilename: 'chunks/[name]-chunk.js',
    path: path.resolve(__dirname, './dist'),
    libraryTarget: 'commonjs'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },

  target: 'node',
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          chunks: 'all',
          name: 'common',
          minChunks: 2,
          enforce: true
        }
      }
    }
  },
  plugins: [new CleanWebpackPlugin()]
}
