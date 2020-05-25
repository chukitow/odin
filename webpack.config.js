const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

module.exports = [
  {
    mode,
    entry: {
      electron: path.resolve('./src/electron.ts'),
    },
    target: 'electron-main',
    node: false,
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }]
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].js'
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
      alias: {
        '@app': path.resolve(__dirname, 'src/')
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.FLUENTFFMPEG_COV': false
      })
    ]
  },
  {
    mode,
    entry: {
      index: path.resolve('./src/index.tsx'),
    },
    target: 'electron-renderer',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(scss)$/,
          use: [{
            loader: 'style-loader',
          }, {
            loader: 'css-loader',
          }, {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  require('precss'),
                  require('autoprefixer')
                ];
              }
            }
          }, {
            loader: 'sass-loader'
          }]
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          issuer: {
            test: /\.jsx?$/
          },
          use: ['babel-loader', '@svgr/webpack', 'url-loader']
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url-loader'
        },
        {
          test: /\.(jpe?g|png|gif)$/i,
          loader: 'url-loader'
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
      alias: {
        '@app': path.resolve(__dirname, 'src/')
      }
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      new CopyWebpackPlugin([
        { from:'src/assets',to:'assets' }
      ]),
      new CopyWebpackPlugin([
        { from:'bin', to:'bin' }
      ]),
    ]
  },
]
