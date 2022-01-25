const css_loader = { loader: 'css-loader', options: { modules: { localIdentName: '[local]-[hash:base64:5]' } } },
  glob = require('glob'),
  html_webpack_plugin_options = { hash: true, inject: 'head', minify: 'auto', scriptLoading: 'blocking' },
  path = require('path'),
  webpack = require('webpack'),
  ImageMinimizerPlugin = require('image-minimizer-webpack-plugin'),
  JsonMinimizerPlugin = require('json-minimizer-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin'),
  CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
  CspHtmlWebpackPlugin = require('csp-html-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
  { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity'),

  CLIENT_DIR = path.join(__dirname, 'client'),
  PRIVATE_DIR = path.join(CLIENT_DIR, 'private'),
  PUBLIC_DIR = path.join(CLIENT_DIR, 'public'),
  JS_DIR = path.join(PRIVATE_DIR, 'js'),
  VIEWS_DIR = path.join(PRIVATE_DIR, 'views'),
  EXTENSIONS = ['.css', '.gif', '.html', '.js', '.json', '.jpeg', '.jpg', '.png', 'sass', '.scss', '.svg', '.ts', '.webp'];

function reduce(a, b) { a[path.parse(b).name] = b; return a; };

/**
 * @type {webpack.Configuration}
 */
module.exports = {
  devtool: false,
  entry: glob.sync(path.join(JS_DIR, '**.js')).reduce(reduce, {}),
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          css_loader,
          'postcss-loader'
        ]
      },
      {
        test: /\.(gif|jpe?g|png|svg|webp)$/i,
        type: 'asset',
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.json$/i,
        type: 'asset/resource',
      },
      {
        test: /\.less$/i,
        use: [
          MiniCssExtractPlugin.loader,
          css_loader,
          'postcss-loader',
          'less-loader',
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          css_loader,
          'postcss-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.ts?$/,
        use: 'ts-loader'
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
        extractComments: false,
        terserOptions: {
          compress: true,
          mangle: true,
          toplevel: true
        }
      })
    ],
    realContentHash: true
  },
  output: {
    clean: true,
    chunkFilename: '[name].js',
    crossOriginLoading: 'anonymous',
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
      'img-src': "'self'",
      'object-src': "'none'",
      'script-src': "'self'",
      'style-src': "'self' https://fonts.googleapis.com"
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
      chunks: ['404'],
      filename: '404.html',
      ...html_webpack_plugin_options,
      title: 'Meet | Page Not Found',
    }),
    new HtmlWebpackPlugin({
      chunks: ['app'],
      filename: 'app.html',
      ...html_webpack_plugin_options,
      title: 'Meet'
    }),
    new HtmlWebpackPlugin({
      chunks: ['auth'],
      filename: 'auth.html',
      ...html_webpack_plugin_options,
      title: 'Meet | Authorization'
    }),
    new HtmlWebpackPlugin({
      chunks: ['index'],
      filename: 'index.html',
      ...html_webpack_plugin_options,
      template: path.join(VIEWS_DIR, 'index.html'),
      title: 'Meet | The Place Where You Meet The Simplicity of Technology',
    }),
    new MiniCssExtractPlugin({ filename: '[contenthash].css' }),
    new RemoveEmptyScriptsPlugin(),
    new SubresourceIntegrityPlugin()
  ],
  resolve: { extensions: EXTENSIONS },
  watch: false,
  watchOptions: {
    aggregateTimeout: 1000,
    ignored: /node_modules/,
    stdin: true
  }
};