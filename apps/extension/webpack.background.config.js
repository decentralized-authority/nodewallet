const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: "./background/index.ts",
  mode: "production",
  module: {
    noParse: /\.wasm$/,
    rules: [
      {
        test: /\.ts?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: { noEmit: false },
            },
          },
        ],
        exclude: /node_modules/,
      },
      { // reference: https://github.com/antelle/argon2-browser/blob/d73916b8efad2ef47140a52acd48b166a4ba97bf/examples/webpack/webpack.config.js#L26
        test: /\.wasm$/,
        loader: 'base64-loader',
        type: 'javascript/auto',
      },
    ],
  },
  experiments: {
    asyncWebAssembly: true,
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      path: false,
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer'),
    },
  },
  output: {
    filename: "background.js",
    path: path.join(__dirname, "dist"),
  },
};
