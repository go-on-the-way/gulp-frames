'use strict';
var gulp            = require('gulp'),                      //基础库
    watch           = require('gulp-watch'),                //文件监控
    browserSync     = require('browser-sync'),              // 浏览器监控，同步插件
    reload          = browserSync.reload,                   //serve 后自动刷新浏览器
    cssmin          = require('gulp-minify-css'),                 //css压缩插件
    plumber         = require('gulp-plumber'),              //sass 过滤器
    eslint          = require('gulp-eslint'),               // js语法检查
    ejs             = require("gulp-ejs"),                  //ejs编译
    gutil           = require('gulp-util'),                 //报错信息
    spriter         = require('gulp-css-spriter'),                  // 雪碧图
    base64          = require('gulp-css-base64'),
    compass         = require('gulp-compass'),
    bootlint        = require('gulp-bootlint'),
    cache           = require('gulp-cache'),
    pngquant        = require('imagemin-pngquant'),//使用pngquant深度压缩png图片的imagemin插件
    imagemin        = require('gulp-imagemin'),//图片压缩
    del             = require('del'),//文件删除
    webpackConfig   = require('./webpack.config.js'),
    webpack         = require('webpack');
// const sourcemaps = require('gulp-sourcemaps');
// const babel      = require('gulp-babel'); // es6
// const concat     = require('gulp-concat'); // 合并js
// var cdn          = require('gulp-cdn'); // 批量替换CDN
// var md5          = require('gulp-md5-plus');// 添加md5
// var spritesmith  = require("gulp.spritesmith");//spritesmith图片合并
// var oss          = require('gulp-alioss');// 上传OSS
// var rename       = require('gulp-rename');//重命名
// var jshintStylish= require('jshint-stylish');// js语法检查
// var uglify       = require('gulp-uglify');// js压缩
// var minimist     = require('minimist');//获取配置信息
// var fileinclude  = require('gulp-file-include');// 引入html片段
// var autoprefixer = require('gulp-autoprefixer');//CSS自动前缀
// var sass         = require('gulp-sass');//sass，css预编译
// var uglify       = require('gulp-uglify');//js压缩


// 项目配置
var devPath         = "static/src/";// 开发路径
var packPath        = "static/dist/"; // build路径

var myDevConfig = Object.create(webpackConfig); // 获取配置对象
var devCompiler = webpack(myDevConfig);

//引用webpack对js进行操作 - 不使用
gulp.task("js-build", function(callback) {
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-js", err);
        gutil.log("[webpack:build-js]", stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task('js:watch', function(){
    gulp.watch(devPath + 'js/**/*.js', ['js-move']);
});

// js moveto dist
gulp.task('js-move', function(){
    console.log('.....'+devPath)
    gulp.src(devPath + 'js/**/*.js')
        .pipe(gulp.dest(packPath + 'js'));
});

// 图片压缩 -- 报错 -- 不可用
gulp.task('img', function () {
    return gulp.src('./static/src/img/*.{png,jpg.gif,ico}')
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}], //不要移除svg的viewbox属性
            use: [pngquant()]
        })))
        .pipe(gulp.dest('./static/dist/img'));
});

// 删除项目生成的 dist 目录
gulp.task('clean', function () {
    return del([packPath], function () {
        console.log('\nDelete path:\n','dist' );
    });
});

gulp.task('compass', function () {
    console.log(devPath + 'scss/**/*.scss')
    gulp.src(devPath + 'scss/**/*.scss')
        .pipe(plumber({
            errorHandler:function(error){
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(compass({
            css:devPath+'css',
            sass:devPath+'scss',
            image:devPath+'img' //不能写成image:'./img'
        }))
        .pipe(gulp.dest(packPath + '/css'))
});

gulp.task('compass:watch',function () {
    console.log(devPath + 'scss/**/*.scss')
    gulp.watch(devPath + 'scss/**/*.scss',['compass']);
});

// ejs
gulp.task('ejs', function () {
    gulp.src(devPath + '**/*.ejs')
        .pipe(ejs().on('error', gutil.log))
        .pipe(gulp.dest(packPath));
});

gulp.task('ejs:watch', function () {
    gulp.watch(devPath + '**/*.ejs',['ejs']);
});

// 将img移动到发布目录中
gulp.task('img-move', function(){

    gulp.src(devPath + 'img/**/*')
        .pipe(gulp.dest(packPath + 'img'))

});

//将img 移入dist
gulp.task('img:watch', function(){
    gulp.watch(devPath + 'img/**/*', ['img-move'])
});

// 将fonts移动到发布目录中
gulp.task('fonts-move', function(){

    gulp.src(devPath + 'fonts/**/*')
        .pipe(gulp.dest(packPath + 'fonts'))

});


// serve
gulp.task('serve', ['fonts-move','compass','compass:watch','img-move','img:watch','js-move','js:watch','ejs','ejs:watch'], function() {

    browserSync({
        server: packPath
    });

    gulp.watch(['*.html',
            'css/**/*.css',
            'img/**/*',
            'js/**/*.js'],
        {cwd: packPath},
        reload);
});



// 定义默认任务 正式版
gulp.task('default',['serve']);

