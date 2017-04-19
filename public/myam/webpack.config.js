module.exports = {
  entry: "./src/index.js",
  output: {
    path: __dirname + "/src/dist",
    filename: "bundle.js",
  },
  devServer: {
    publicPath: "/dist",
    contentBase: "./src"
  },
  resolve: {
    extensions: [".js", ".ts"]
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
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader?limit=100000'
    }, {
      test: /\.less$/,
      use: [{
        loader: "style-loader" // creates style nodes from JS strings
      }, {
        loader: "css-loader" // translates CSS into CommonJS
      }, {
        loader: "less-loader" // compiles Less to CSS
      }]
    }]
  }
};
