const glob = require('glob'),
  html_webpack_plugin_options = { hash: true, inject: 'head', minify: 'auto', scriptLoading: 'defer' },
  path = require('path'),
  webpack = require('webpack'),
  { CleanWebpackPlugin } = require('clean-webpack-plugin'),
  ImageMinimizerPlugin = require('image-minimizer-webpack-plugin'),
  JsonMinimizerPlugin = require('json-minimizer-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin'),
  CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  InjectBodyPlugin = require('inject-body-webpack-plugin').default,
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  css_loader = [
    MiniCssExtractPlugin.loader,
    '@teamsupercell/typings-for-css-modules-loader',
    { loader: 'css-loader', options: { modules: { localIdentName: '[local]-[hash:base64:5]' } } },
  ],
  RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
  { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity'),
  WorkboxPlugin = require('workbox-webpack-plugin'),

  CLIENT_DIR = path.join(__dirname, 'client'),
  PRIVATE_DIR = path.join(CLIENT_DIR, 'private'),
  PUBLIC_DIR = path.join(CLIENT_DIR, 'public'),
  TS_DIR = path.join(PRIVATE_DIR, 'ts'),
  VIEWS_DIR = path.join(PRIVATE_DIR, 'views'),
  EXTENSIONS = ['.css', '.gif', '.html', '.js', '.json', '.jsx', '.jpeg', '.jpg', '.png', 'sass', '.scss', '.svg', '.ts', '.tsx', '.webp'];

function reduce(a, b) { a[path.parse(b).name] = b; return a; };

/**
 * @type {webpack.Configuration}
 */
module.exports = (env, argv) => {
  const mode = argv.mode ?? 'production'; return {
    devtool: false,
    entry: glob.sync(path.join(TS_DIR, '**.ts')).filter(path => !path.endsWith('d.ts')).reduce(reduce, {}),
    mode: mode,
    module: {
      rules: [
        { test: /\.css$/i, use: css_loader },
        { test: /\.(gif|jpe?g|png|svg|webp)$/i, type: 'asset' },
        { loader: 'html-loader', test: /\.html$/i },
        { loader: 'babel-loader', test: /\.js[x]?$/i },
        { test: /\.json$/i, type: 'asset/resource' },
        { test: /\.s[ac]ss$/i, use: css_loader.concat('sass-loader') },
        { loader: 'babel-loader', test: /\.ts[x]?$/i },
        { loader: 'worker-loader', options: { name: '[contenthash].worker.js' }, test: /\.worker\.js$/i },
        { loader: 'worklet-loader', options: { name: '[contenthash].worklet.js' }, test: /\.worklet\.js$/i }
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
            options: { plugins: ['imagemin-gifsicle', 'imagemin-mozjpeg', 'imagemin-pngquant', 'imagemin-svgo'] },
          },
          test: /\.(gif|jpe?g|png|svg|webp)$/i
        }),
        new JsonMinimizerPlugin(),
        new TerserPlugin({
          extractComments: { banner: () => 'License information can be found in the void.', },
          terserOptions: {
            compress: true,
            keep_classnames: false,
            keep_fnames: false,
            mangle: { eval: true, properties: mode === 'development' ? false : true, toplevel: true },
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
    performance: { assetFilter: (filename) => EXTENSIONS.includes(path.extname(filename)), hints: false },
    plugins: [
      new CleanWebpackPlugin({ cleanAfterEveryBuildPatterns: ['*.LICENSE.txt'], protectWebpackAssets: false }),
      new CssMinimizerPlugin(),
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
        template: path.join(VIEWS_DIR, 'auth.html'),
        title: 'Meet | Authorization'
      }),
      new HtmlWebpackPlugin({
        chunks: ['index'],
        filename: 'index.html',
        ...html_webpack_plugin_options,
        template: path.join(VIEWS_DIR, 'index.html'),
        title: 'Meet | The Place Where You Meet The Simplicity of Technology',
      }),
      new InjectBodyPlugin({ content: '\n<noscript>You need to enable JavaScript to run this app.</noscript>\n' }),
      new MiniCssExtractPlugin({ filename: '[contenthash].css' }),
      new RemoveEmptyScriptsPlugin(),
      new SubresourceIntegrityPlugin(),
      new WorkboxPlugin.GenerateSW()
    ],
    resolve: { extensions: EXTENSIONS },
    watch: false,
    watchOptions: { aggregateTimeout: 1000, ignored: /node_modules/i, stdin: true }
  }
};