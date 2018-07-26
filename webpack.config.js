var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './js/app.js',
    output: {
        path: path.resolve(__dirname, './site'),
        filename: 'app.bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['env']
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'eval-cheap-module-source-map’'
};
