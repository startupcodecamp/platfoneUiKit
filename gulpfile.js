'use strict';

var gulp  = require('gulp'),
  sass    = require('gulp-sass'),
  maps    = require('gulp-sourcemaps'),
  swig = require('gulp-swig'),
  plumber = require('gulp-plumber');

var opt = {
  'src': './',
  'view': './views',
  'sass': './scss',
  'font': './scss/fonts',
  'dist': './'
};

gulp.task('access', function (){
  gulp.src(opt.font + '/**.**')
  .pipe(gulp.dest(opt.dist + '/css/fonts'));
});

gulp.task('view', function (){
  gulp.src(opt.view + '/*.html')
  .pipe(swig())
  .pipe(gulp.dest(opt.dist + '/css'));
});

gulp.task("sass", ['access'], function (){
  return gulp.src(opt.sass + '/style.scss')
  .pipe(plumber())
  .pipe(maps.init({loadMaps: true}))
  .pipe(sass({
    outputStyle: 'nested',
    debug : true
  }).on('error', sass.logError))
  .pipe(maps.write("./")) //this path is going to be relative to our output directory ??
  .pipe(gulp.dest(opt.dist + '/css'));
});




gulp.task("default", function (){
  gulp.start('sass');
});
