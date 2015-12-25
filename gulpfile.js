'use strict';

var gulp  = require('gulp'),
  sass    = require('gulp-sass'),
  maps    = require('gulp-sourcemaps'),
  plumber = require('gulp-plumber');
  
var opt = {
  'src': './',
  'sass': './scss',
  'dist': './'
};

gulp.task("sass", function (){
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