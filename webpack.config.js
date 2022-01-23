const glob = require('glob'),
  path = require('path'),
  ImageMinimizerPlugin = require('image-minimizer-webpack-plugin'),
  JsonMinimizerPlugin = require("json-minimizer-webpack-plugin"),
  TerserPlugin = require('terser-webpack-plugin'),
  CssMinimizerPlugin = require("css-minimizer-webpack-plugin"),
  CspHtmlWebpackPlugin = require('csp-html-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),

  CLIENT_DIR = path.join(__dirname, 'client'),
  PRIVATE_DIR = path.join(CLIENT_DIR, 'private'),
  PUBLIC_DIR = path.join(CLIENT_DIR, 'public'),
  JS_DIR = path.join(PRIVATE_DIR, 'js'),
  STYLES_DIR = path.join(PRIVATE_DIR, 'styles'),
  VIEWS_DIR = path.join(PRIVATE_DIR, 'views'),
  EXTENSIONS = ['.css', '.gif', '.html', '.js', '.json', '.jpeg', '.jpg', '.png', '.scss', '.svg', '.webp'];

function reduce(a, b) { a[path.parse(b).name] = b; return a; };

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  devtool: false,
  entry: glob.sync(path.join(JS_DIR, '**.js'))
    .reduce(reduce, glob.sync(path.join(STYLES_DIR, '*.{css,scss}'))
      .reduce(reduce, {})
    ),
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(gif|jpe?g|png|svg|webp)$/i,
        type: "asset",
      },
      {
        test: /\.json$/i,
        type: "asset/resource",
      },
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          "css-loader",
          "less-loader",
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
    ]
  },
  node: false,
  optimization: {
    minimize: true,
    minimizer: [
      new ImageMinimizerPlugin({
        loader: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              'imagemin-gifsicle',
              'imagemin-mozjpeg',
              'imagemin-pngquant',
              'imagemin-svgo',
            ],
          },
        },
        test: /\.(gif|jpe?g|png|svg|webp)$/i
      }),
      new JsonMinimizerPlugin(),
      new TerserPlugin({
        //extractComments: 'all',
        terserOptions: {
          compress: true,
          mangle: true,
          toplevel: true
        }
      })
    ]
  },
  output: {
    clean: true,
    chunkFilename: '[name].js',
    filename: '[contenthash].js',
    path: PUBLIC_DIR,
    publicPath: '/assets/',
  },
  performance: {
    assetFilter: (filename) => EXTENSIONS.includes(filename),
    hints: false
  },
  plugins: [
    new CssMinimizerPlugin(),
    new CspHtmlWebpackPlugin({
      'base-uri': "'self'",
      'object-src': "'none'",
      'script-src': "'self'",
      'style-src': "'self'"
    }, {
      enabled: true,
      hashEnabled: {
        'script-src': true,
        'style-src': true
      },
      hashingMethod: 'sha256',
      nonceEnabled: {
        'script-src': true,
        'style-src': true
      }
    }),
    new HtmlWebpackPlugin({
      chunks: ['404', '404style', 'style'],
      filename: '404.html',
      inlineSource: '.(js|css)$',
      title: 'Meet | Page Not Found'
    }),
    new HtmlWebpackPlugin({
      chunks: ['app', 'style'],
      filename: 'app.html',
      title: 'Meet'
    }),
    new HtmlWebpackPlugin({
      chunks: ['index', 'style'],
      filename: 'index.html',
      template: path.join(VIEWS_DIR, 'index.html'),
      title: 'Meet | The Place Where You Meet The Simplicity of Technology',
    }),
    new MiniCssExtractPlugin({ filename: '[contenthash].css' }),
    new RemoveEmptyScriptsPlugin()
  ],
  resolve: { extensions: EXTENSIONS },
  watch: false,
  watchOptions: {
    aggregateTimeout: 1000,
    ignored: /node_modules/,
    stdin: true
  }
};