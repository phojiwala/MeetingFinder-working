const path = require('path'); 
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); 
const HtmlWebpackPlugin = require('html-webpack-plugin'); 
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack');

module.exports = { 
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/, // .js and .jsx files
                exclude: /node_modules/, // excluding the node_modules folder
                loader: "babel-loader",
                options: { presets: ["@babel/env"] }
            },
            {
                test: /\.(json)$/,
                include: [
                  path.join(__dirname, 'public')
                ],
                loader: 'url-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.jsx', '.ts', '.js','.tsx'],
        alias: {
            process: "process/browser"
        } 
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    entry: { 
        app: './src/index.tsx', 
    },
    plugins: [
        new CleanWebpackPlugin(), 
        new HtmlWebpackPlugin({ 
            title: 'Production', 
            template: './src/index.html',
        }), 
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new Dotenv()
    ], 
    output: { 
        filename: '[name].bundle.js', 
        path: path.resolve(__dirname, 'build'),
        publicPath: '/'
    }, 

}; 