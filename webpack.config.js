const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
  mode: 'production',
  entry: { bundle: './source/views/scripts/index.ts' },
  
  externals: {
    'agora-rtc-sdk-ng': 'AgoraRTC',
    'agora-rtm-sdk': 'AgoraRTM',
  },  
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist/public'),
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false,
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      querystring: require.resolve('querystring-es3'),
      child_process: false,
      zlib: require.resolve('browserify-zlib'),
      vm: require.resolve('vm-browserify'),
      http2: false,
      timers: require.resolve('timers-browserify'),
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      process: require.resolve('process/browser'),
      path: require.resolve("path-browserify")
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.[contenthash].css',
    }),      
    new WebpackManifestPlugin({
      fileName: 'manifest.json',
      publicPath: '/', 
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'source/views/assets'),
          to: path.resolve(__dirname, 'dist/public/assets'),
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },
  
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist/public'),
    },
    port: 3293,
    open: true,
  },
};