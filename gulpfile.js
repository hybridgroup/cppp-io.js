'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

gulp.task('browserify', function () {
  var b = browserify({
    entries: ['./index.js']
  });

  b.require('./lib/client.js', {expose: 'cppp-io'});
  b.require('./lib/http-driver.js', {expose: './http-driver'});
  //b.external('cppp-io');

  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'))
    .on('error', gutil.log);
});

gulp.task('default', ['browserify']);
