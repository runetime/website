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
 * Admin JavaScript minfications and concatenations.
 */
gulp.task('scripts-admin', function() {
    var src = [
        './resources/assets/js/admin/**/*.js'
    ];

    return gulp.src(src)
        .pipe(concat('admin.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.public.js));
});

/**
 * Modules JavaScript minfications and concatenations.
 */
gulp.task('scripts-modules', function() {
    var src = [
        './resources/assets/js/modules/**/*.js'
    ];

    return gulp.src(src)
        .pipe(concat('modules.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.public.js));
});

/**
 * Vendor JavaScript minfications and concatenations.
 */
gulp.task('scripts-vendor', function() {
    // It's in this order due to dependencies. Please do not change this order.
    var src = [
        './resources/assets/vendor/jquery.js',
        './resources/assets/vendor/jquery-ui.js',
        './resources/assets/vendor/bootstrap.js',
        './resources/assets/vendor/modernizr.custom.js',
        './resources/assets/vendor/classie.js',
        './resources/assets/vendor/dragdealer.js',
        './resources/assets/vendor/dragslideshow.js',
        './resources/assets/vendor/jasny-bootstrap.js'
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
    gulp.watch(paths.assets.javascript_vendor, [
      'scripts-admin',
      'scripts-modules',
      'scripts-vendor'
    ]);
    gulp.watch(paths.assets.scss, ['sass']);
});

/**
 * Runs all of the compilations on the default Gulp command.
 */
gulp.task('default', [
    'sass',
    'scripts-admin',
    'scripts-modules',
    'scripts-vendor'
]);
