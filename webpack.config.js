/*
 * @Author: zhaoye 
 * @Date: 2018-04-18 15:43:42 
 * @Last Modified by: zhaoye
 * @Last Modified time: 2018-04-18 15:51:54
 */
module.exports = {
    entry: './index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'promise.js',
        libraryTarget: 'umd',
        library: 'Promise',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: ['babel-loader'],
            }
        ]
    },
}