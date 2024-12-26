const path = require('path'); 
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); 
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin") ;
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack');;

module.exports = {
  mode: "production",
  entry: "./src/index.tsx",
  output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[contenthash].js",
      publicPath: "/apps/meeting-finder/",
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.json$/i,
        exclude: /node_modules/,
        use: ["url-loader"],
      },
    ],
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      "React" : "react"
    }),
    new CopyPlugin({
      patterns: [
        { from: "public/meetings.json", to: "meetings.json" },
      ],
    }),
    new Dotenv()
  ],
};
