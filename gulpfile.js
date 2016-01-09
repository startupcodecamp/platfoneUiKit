'use strict';

var gulp       = require('gulp'),
    del        = require('del'),
    sass       = require('gulp-sass'),
    maps       = require('gulp-sourcemaps'),
    swig       = require('gulp-swig'),
    concat     = require('gulp-concat'),
    plumber    = require('gulp-plumber'),
    watch      = require('gulp-watch'),
    webserver  = require('gulp-webserver');

var opt = {
  'src': './',
  'view': './views',
  'sass': './scss',
  'font': './scss/fonts',
  'img' : './images',
  'dist': './public'
};

var scripts = [
  './app.js',
  './directives/**.js'
];

gulp.task("concatScripts", function () {
  return gulp.src(scripts)
  .pipe(maps.init({loadMaps: true}))
  .pipe(concat('app.js'))
  .pipe(maps.write())
  .pipe(gulp.dest(opt.dist + '/js'));
});

gulp.task('access', function (){
  gulp.src(opt.font + '/**.**')
  .pipe(gulp.dest(opt.dist + '/css/fonts'));

  gulp.src(opt.img + '/**', { base: './'})
  .pipe(gulp.dest(opt.dist));
});

gulp.task('view', function (){
  return gulp.src(opt.view + '/*.html')
  .pipe(plumber())
  .pipe(swig())
  .pipe(gulp.dest(opt.dist));
});

gulp.task('sass', ['access'], function (){
  return gulp.src(opt.sass + '/style.scss')
  .pipe(plumber())
  .pipe(maps.init({loadMaps: true}))
  .pipe(sass({
    outputStyle: 'nested',
    debug : true
  }).on('error', sass.logError))
  .pipe(maps.write('./')) //this path is going to be relative to our output directory ??
  .pipe(gulp.dest(opt.dist + '/css'));
});

watch([opt.sass + '/**/*.scss'], function() {
  gulp.start('sass');
});

watch([opt.view + '/**/*.html'], function (){
  gulp.start('view');
});

gulp.task('webserver', function() {
  gulp.src(opt.dist)
    .pipe(webserver({
      livereload: true,
      open: false,
      port: 3000
    }));
});


gulp.task('clean', function (){
  del(opt.dist);
});

gulp.task('build',['sass', 'view'], function (){

});



gulp.task('default', function (){
  gulp.start('webserver','build');
});
