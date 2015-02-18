var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function() {
  return gulp.src('./src/*.js')
    .pipe(concat('OverPassLayer.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./dist/'));
});

