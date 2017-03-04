/*
 *@description Webpack配置文件
 *@author: <%= author %>
 *@email: <%= email %>
 *@time: <%= time %>
 */

var webpack = require("webpack-stream");
var path = require('path');

var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

var ROOT_PATH = path.resolve(__dirname);

var config = {
    //watch: true,
    entry: {
        vendors: ['jquery']
    },
    output: {
        path: '',
        filename: '[name].js'
    },
    module: {
        /*Loader can be passed query parameters via a query string (just like in the web).
         *The query string is appended to the loader with ?.
         *i.e. url-loader?mimetype=image/png.
         */
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            include: path.resolve(ROOT_PATH, 'app/javascript'),
            loaders: ['babel-loader?cacheDirectory']
        }]
    },
    plugins: [
        new CommonsChunkPlugin('vendor', 'vendor.bundle.js')
    ]
};

module.exports = config;
