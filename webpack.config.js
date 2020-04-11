
const webpack = require('webpack');
const resolve = require('path').resolve;

const config = {
    devtool: 'eval-source-map',
    entry: './app/main.jsx',
    output: {
        path: resolve('./js/'),
        filename: 'main.js',
        publicPath: resolve('./js')
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    module: {
        rules: [
            {
                test: /\.jsx?/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ["@babel/preset-react", "@babel/preset-env"]
                }
            }]
    }
}

module.exports = config;