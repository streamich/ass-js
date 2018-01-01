var gulp = require('gulp');
var ts = require('gulp-typescript');


gulp.task('build-ts', function () {
    return gulp.src([
      'src/**/*.ts',
      '!src/__tests__/**/*.*',
      '!src/**/__tests__/**/*.*',
    ])
        .pipe(ts({
            "target": "es5",
            "module": "commonjs",
            "removeComments": true,
            "noImplicitAny": false,
            "sourceMap": false,
            "compileOnly": true,
        }))
        .pipe(gulp.dest('lib'));
});
