"use strict";

var gulp = require("gulp");
var browserify = require("browserify");
var babel = require("babelify");
var buffer = require("vinyl-buffer");
var source = require("vinyl-source-stream");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var runSequence = require("run-sequence");
var sass = require("gulp-sass");
var reactify = require("reactify");
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');


gulp.task("default", function(callback) {
  runSequence(["test", "compile", "css", "html"], callback);
});

gulp.task("compile", function(callback) {
  runSequence(["compile-popup", "compile-options", "compile-background"], callback);
})

gulp.task("compile-popup", function() {
  return browserify('./src/js/popup.js', { debug: true })
            .transform("reactify")
            .transform(babel)
            .bundle()
            .on('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(source("alerts.js"))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest("dist"));

});

gulp.task("compile-options", function() {
  return browserify('./src/js/options.js', { debug: true })
            .transform(babel)
            .bundle()
            .on('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(source("options.js"))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest("dist"));

});

gulp.task("compile-background", function() {
  return browserify('./src/js/background.js', { debug: true })
            .transform(babel)
            .bundle()
            .on('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(source("background.js"))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest("dist"));

});
gulp.task("css", function() {
  return gulp.src("src/css/**/*.sass")
             .pipe(concat("style.sass"))
             .pipe(sass().on('error', sass.logError))
             .pipe(gulp.dest("dist"));

});

gulp.task("html", function() {
  return gulp.src("src/html/*.html")
             .pipe(gulp.dest("dist"));
});

gulp.task("test", function() {
  return gulp.src('./src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
});
