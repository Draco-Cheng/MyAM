const isDev = !!process.env.dev;
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

let setting = {
  entry: './src/index.ts',
  devtool: 'source-map',
  output: {
    path: __dirname + '/src/dist',
    filename: 'bundle.js',
  },
  devServer: {
    publicPath: '/dist',
    contentBase: './src'
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [{
      test: /\.ts/,
      use: 'ts-loader',
      exclude: /node_modules/
    }, {
      test: /\.html$/,
      use: 'raw-loader',
      exclude: /node_modules/
    }]
  },
  plugins: []
};

if (isDev) {
  let _addLoaders = [{
    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
    use: 'url-loader?limit=100000'
  }, {

    test: /\.(css|less)$/,
    use: [{
      loader: 'style-loader' // creates style nodes from JS strings
    }, {
      loader: 'css-loader' // translates CSS into CommonJS
    }, {
      loader: 'less-loader' // compiles Less to CSS
    }]
  }];
  setting['module']['rules'].push(..._addLoaders);
} else {
  // compile less
  const ExtractTextPlugin = require('extract-text-webpack-plugin');
  const MiniCssExtractPlugin = require("mini-css-extract-plugin");

  const extractCSS = new MiniCssExtractPlugin({filename: '[name].css'});
  const extractLESS = new MiniCssExtractPlugin({filename:'[name]-less.css'});

  let _addLoaders = [{
    test: /\.(jpe?g|gif|png|svg|woff|woff2|eot|ttf|wav|mp3)$/,
    loader: 'file-loader'
  }, {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'postcss-loader'
    ]
  }, {
    test: /\.less$/i,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'less-loader'
    ]
  }];

  setting['module']['rules'].push(..._addLoaders);
  setting['plugins'].push(extractCSS, extractLESS);


  // minify js setting
  setting['devtool'] = 'source-map';
  setting['plugins'].push(
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: true
      },
      sourceMap: true
    })
  );
}
module.exports = setting;
