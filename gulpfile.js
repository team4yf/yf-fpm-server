var gulp = require('gulp')
  , concat = require('gulp-concat')
  , rename = require('gulp-rename');

const LIB_DIR = './node_modules/';

//复制 vender 的js文件到指定的目录下
gulp.task('copy-materialize', function () {
  return gulp.src([LIB_DIR + 'materialize-css/dist/**/*.*', LIB_DIR + 'jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('./public/lib/materialize-css'));
});  

gulp.task('default', ['copy-materialize']);