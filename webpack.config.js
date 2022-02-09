const css_loader = { loader: 'css-loader', options: { modules: { localIdentName: '[local]-[hash:base64:5]' } } },
  glob = require('glob'),
  html_webpack_plugin_options = { hash: true, inject: 'head', minify: 'auto', scriptLoading: 'defer' },
  path = require('path'),
  webpack = require('webpack'),
  ImageMinimizerPlugin = require('image-minimizer-webpack-plugin'),
  JsonMinimizerPlugin = require('json-minimizer-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin'),
  CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
  CspHtmlWebpackPlugin = require('csp-html-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  InjectBodyPlugin = require('inject-body-webpack-plugin').default,
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
  { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity'),
  WebpackObfuscator = require('webpack-obfuscator'),

  CLIENT_DIR = path.join(__dirname, 'client'),
  PRIVATE_DIR = path.join(CLIENT_DIR, 'private'),
  PUBLIC_DIR = path.join(CLIENT_DIR, 'public'),
  JS_DIR = path.join(PRIVATE_DIR, 'js'),
  TS_DIR = path.join(PRIVATE_DIR, 'ts'),
  VIEWS_DIR = path.join(PRIVATE_DIR, 'views'),
  EXTENSIONS = ['.css', '.gif', '.html', '.js', '.json', '.jpeg', '.jpg', '.png', 'sass', '.scss', '.svg', '.ts', '.webp'];

function reduce(a, b) { a[path.parse(b).name] = b; return a; };

/**
 * @type {webpack.Configuration}
 */
module.exports = (env, argv) => {
  const mode = argv.mode ?? 'production'; return {
    devtool: false,
    entry: glob.sync(path.join(TS_DIR, '**.ts')).reduce(reduce, {}),
    mode: mode,
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            '@teamsupercell/typings-for-css-modules-loader',
            css_loader
          ]
        },
        {
          test: /\.(gif|jpe?g|png|svg|webp)$/i,
          type: 'asset',
        },
        {
          test: /\.html$/i,
          loader: "html-loader",
          options: {
            sources: false
          }
        },
        {
          test: /\.json$/i,
          type: 'asset/resource',
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            '@teamsupercell/typings-for-css-modules-loader',
            css_loader,
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
            keep_classnames: false,
            keep_fnames: false,
            mangle: {
              eval: true,
              properties: mode === 'development' ? false : true,
              toplevel: true
            },
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
      assetFilter: (filename) => EXTENSIONS.includes(path.extname(filename)),
      hints: false
    },
    plugins: [
      new CssMinimizerPlugin(),
      /*new CspHtmlWebpackPlugin({
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
      }),*/
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
      new InjectBodyPlugin({
        content: '\n<noscript>You need to enable JavaScript to run this app.</noscript>\n'
      }),
      new MiniCssExtractPlugin({ filename: '[contenthash].css' }),
      new RemoveEmptyScriptsPlugin(),
      new SubresourceIntegrityPlugin(),
      //new WebpackObfuscator()
    ],
    resolve: { extensions: EXTENSIONS },
    watch: false,
    watchOptions: {
      aggregateTimeout: 1000,
      ignored: /node_modules/,
      stdin: true
    }
  }
};