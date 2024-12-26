const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack');

module.exports = {
  output: {
    path: path.join(__dirname, "/dist"), // the bundle output path
    filename: "bundle.js", // the name of the bundle
  },
  devServer: {
    port: 3030, // you can change the port
  },
  devtool: 'inline-source-map',
  module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/, // .js and .jsx files
                exclude: /node_modules/, // excluding the node_modules folder
                loader: "babel-loader",
                options: { presets: ["@babel/env"] }
            }
        ],
    },
    resolve: {
        extensions: ['.jsx', '.ts', '.js','.tsx'],
        alias: {
            process: "process/browser"
        } 
    },
    plugins:[
        new HtmlWebpackPlugin({
            title: "Application name",
            template: 'src/index.html',
            process: 'process/browser',
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new Dotenv()
    ]
};