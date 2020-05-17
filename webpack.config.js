const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [
  {
    mode: 'development',
    entry: {
      electron: path.resolve('./src/electron.ts'),
    },
    target: 'electron-main',
    node: {
      __filename: true,
      __dirname: true,
    },
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
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js'
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
      alias: {
        '@app': path.resolve(__dirname, 'src/')
      }
    }
  },
  {
    mode: 'development',
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
      path: __dirname + '/dist',
      filename: '[name].js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      new CopyWebpackPlugin([
        { from:'src/assets',to:'assets' }
      ]),
    ]
  },
]
