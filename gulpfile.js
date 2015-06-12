/**
 * Require the main Gulp package.  Gulp is broguth in via NPM.
 */
var gulp = require('gulp');

/**
 * Gulp dependencies.
 */
var concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify');

/**
 * Directories of the various assets and public output.
 *
 * @type object
 */
var paths = {
    assets: {
        scss: './resources/assets/scss/**/*.scss',
        javascript_vendor: './resources/assets/typescript/vendor/*.js'
    },
    public: {
        css: './public/css',
        js: './public/js'
    }
};

/**
 * Sass Compilation task.
 */
gulp.task('sass', function () {
  gulp.src(paths.assets.scss)
    .pipe(sass({
        outputStyle: 'compressed',
    })
    .on('error', sass.logError))
    .pipe(gulp.dest(paths.public.css));
});

/**
 * Vendor JavaScript minfications and concatenations.
 */
gulp.task('scripts-vendor', function() {
    // It's in this order due to dependencies ;_; Please do not change this order.
    var src = [
        './resources/assets/typescript/vendor/jquery.js',
        './resources/assets/typescript/vendor/jquery-ui.js',
        './resources/assets/typescript/vendor/bootstrap.js',
        './resources/assets/typescript/vendor/modernizr.custom.js',
        './resources/assets/typescript/vendor/classie.js',
        './resources/assets/typescript/vendor/dragdealer.js',
        './resources/assets/typescript/vendor/dragslideshow.js',
        './resources/assets/typescript/vendor/jasny-bootstrap.js'
    ];

    return gulp.src(src)
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.public.js));
});

/**
 * A task that watches the directories' files for
 * changes and runs the appropriate Gulp task.
 */
gulp.task('watch', function() {
    gulp.watch(paths.assets.javascript_vendor, ['scripts-vendor']);
    gulp.watch(paths.assets.scss, ['scss']);
});

/**
 * Runs all of the compilations on the default Gulp command.
 */
gulp.task('default', ['sass', 'scripts-vendor']);
