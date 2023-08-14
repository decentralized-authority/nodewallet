const path = require("path");

module.exports = {
  entry: "./background/index.ts",
  mode: "production",
  module: {
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
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      path: false,
      // stream: require.resolve("stream-browserify"),
      // process: require.resolve("process/browser"),
      crypto: require.resolve("crypto-browserify"),
    },
  },
  output: {
    filename: "background.js",
    path: path.join(__dirname, "dist"),
  },
};
