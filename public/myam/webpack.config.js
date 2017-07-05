const isDev = !!process.env.dev;
const webpack = require('webpack');

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
    loaders: [{
      test: /\.ts/,
      loader: ['ts-loader'],
      exclude: /node_modules/
    }, {
      test: /\.html$/,
      loader: 'raw-loader',
      exclude: /node_modules/
    }]
  },
  plugins: []
};

if (isDev) {
  let _addLoaders = [{
    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
    loader: 'url-loader?limit=100000'
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
  setting['module']['loaders'].push(..._addLoaders);
} else {
  // compile less
  const ExtractTextPlugin = require('extract-text-webpack-plugin');

  const extractCSS = new ExtractTextPlugin('[name].css');
  const extractLESS = new ExtractTextPlugin('[name]-less.css');

  let _addLoaders = [{
    test: /\.(jpe?g|gif|png|svg|woff|woff2|eot|ttf|wav|mp3)$/,
    loader: 'file-loader'
  }, {
    test: /\.css$/,
    use: extractCSS.extract(['css-loader', 'postcss-loader'])
  }, {
    test: /\.less$/i,
    use: extractLESS.extract(['css-loader', 'less-loader'])
  }];

  setting['module']['loaders'].push(..._addLoaders);
  setting['plugins'].push(extractCSS, extractLESS);


  // minify js setting
  setting['devtool'] = 'source-map';
  setting['plugins'].push(
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      comments: false,
      sourceMap: true,
      minimize: false
    })
  );
}
module.exports = setting;
