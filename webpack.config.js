var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var path = require('path');
var webpack = require('webpack');
var fs = require('fs');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var srcDir = path.resolve(process.cwd(), 'static/src');

//获取多页面的每个入口文件，用于配置中的entry
function getEntry() {
    var jsPath = path.resolve(srcDir, 'js');
    var dirs = fs.readdirSync(jsPath); // 同步读取文件内容
    var matchs = [], files = {};
    dirs.forEach(function (item) {
        matchs = item.match(/(.+)\.js$/);
        if (matchs) {
            files[matchs[1]] = path.resolve(srcDir, 'js', item);
        }
    });
    return files;
}

module.exports = {
    cache: true,
    devtool: "source-map", //生成sourcemap,便于开发调试
    entry: getEntry(), //获取项目入口js文件
    output: {
        path: path.join(__dirname, "static/dist/js/"), //文件输出目录 __dirname 程序运行的根目录
        publicPath: "static/dist/js/", //用于配置文件发布路径，如CDN或本地服务器
        filename: "[name].js", //根据入口文件输出的对应多个文件名[name]-[chunkhash].js name+md5
        chunkFilename: "[chunkhash].js"
    },
    resolve: {  //配置别名，在项目中可缩减引用路径
        alias: {
            jquery: srcDir + "/js/lib/jquery.min.js",
            core: srcDir + "/js/core",
            ui: srcDir + "/js/ui"
        }
    },
    plugins: [
        //将公共代码抽离出来合并为一个文件
        new CommonsChunkPlugin('webpackcommon.js')
    ],
    module:{
        rules:[
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include:path.resolve(__dirname, srcDir),
                exclude:path.resolve(__dirname, 'node_modules'),
                query: {
                    presets: ['es2015'] // 语法版本
                }
            }
        ]
    }

};
