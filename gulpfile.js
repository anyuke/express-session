'use strict'
var gulp = require('gulp');
var minify = require('gulp-clean-css');

var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');

var cache = require('gulp-cache');

var uglify = require('gulp-uglify');
var pump = require('pump');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin')

var less = require('gulp-less');
var path = require('path');

var livereload = require('gulp-livereload');

// 压缩ejs
gulp.task('ejs', function() {
    return gulp.src('views/*.ejs')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist/views/'));
});

// 压缩less
gulp.task('less', function() {
    return gulp.src('public/css/*.css')
        .pipe(less({
            paths: [path.join(__dirname, 'css', 'includes')]
        }))
        .pipe(minify())
        .pipe(gulp.dest('dist/css/'));
});


// 压缩js
gulp.task('js', function(cb) {
    pump([
            gulp.src('public/js/*.js'),
            uglify(),
            gulp.dest('/dist/js/')
        ],
        cb
    );
});


// 压缩img
gulp.task('img', function() {
    return gulp.src('public/images/*') //引入所有需处理的Img
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })) //压缩图片
        // 如果想对变动过的文件进行压缩，则使用下面一句代码
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/img/'))
        // .pipe(notify({ message: '图片处理完成' }));
});


// 浏览器同步，用7000端口去代理Express的3000端口
gulp.task('browser-sync', ['nodemon'], function() {
    browserSync.init(null, {
        proxy: "http://localhost:4000",
        files: ["dist/views/*.*", "dist/css/*.*", "dist/js/*.*", "dist/img/*.*"],
        browser: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        port: 80,
    });
});

// 开启Express服务
gulp.task('nodemon', function(cb) {

    var started = false;

    return nodemon({
        script: 'bin/www'
    }).on('start', function() {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true;
        }
    });
});


gulp.task('clean', function(cb) {
    del(['./dist/*'], cb)
});

gulp.task('default', ['browser-sync', 'less', 'ejs', 'js', 'img'], function() {
    // 将你的默认的任务代码放这

    // 监听所有css文档
    gulp.watch('public/stylesheets/*.css', ['less']);

    // 监听所有.js档
    gulp.watch('public/js/*.js', ['js']);

    // 监听所有图片档
    gulp.watch('public/images/**/*', ['img']);
    // 监听ejs
    gulp.watch('views/**/*.ejs', ['ejs']);

    livereload.listen();
    gulp.watch('public/**/*.*', function(file) {
        livereload.changed(file.path);
    });
});