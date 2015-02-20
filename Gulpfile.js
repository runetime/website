/**
 * Require the main Gulp package.  Gulp is broguth in via NPM.
 */
var gulp = require('gulp');

/**
 * Gulp dependencies.
 */
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglifyjs = require('gulp-uglifyjs');
var rename = require('gulp-rename');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');

/**
 * Abstracted TypeScript settings
 *
 * @type {{declarationFiles: boolean, noExternalResolve: boolean, sortOutput: boolean}}
 */
var tsProject = {
	declarationFiles: true,
	noExternalResolve: true,
	sortOutput: true
};

/**
 * Directories of the various assets and public output.
 *
 * @type {{assets: {scss: string, typescript: string}, public: {css: string, js: string}}}
 */
var paths = {
	'assets': {
		scss: './resources/assets/scss/*.scss',
		typescript: './resources/assets/typescript/modules/*.ts'
	},
	'public': {
		css: './public/css',
		js: './public/js'
	}
};

/**
 * Sass compile task.
 */
gulp.task('scss', function() {
	return gulp.src(paths.assets.scss)
		.pipe(sass({
			sourcemap: false,
			style: 'compressed'
		}))
		.on('error', function(err) {
			console.log(err.message);
		})
		.pipe(gulp.dest(paths.public.css));
});

/**
 * Admin TypeScript compile task.
 */
gulp.task('scripts-admin', function() {
	var tsResult = gulp.src('./resources/assets/typescript/admin/*.ts')
		.pipe(sourcemaps.init())
		.pipe(ts({
			sortOutput: true
		}));

	return tsResult.js
		.pipe(uglifyjs('admin.js'), {
			compress: true
		})
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/js/'));
});

/**
 * Modules TypeScript compile task.
 */
gulp.task('scripts-modules', function() {
	var tsResult = gulp.src('./resources/assets/typescript/modules/*.ts')
		.pipe(sourcemaps.init())
		.pipe(ts(tsProject));

	return tsResult.js
		.pipe(concat('modules.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/js'));
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
	gulp.src(src)
		.pipe(uglifyjs('vendor.js', {
			compress: true,
			outSourceMap: false
		}))
		.pipe(gulp.dest('./public/js'))
});

/**
 * A task that watches the directories' files for
 * changes and runs the appropriate Gulp task.
 */
gulp.task('watch', function() {
	gulp.watch('./resources/assets/typescript/*', ['scripts-admin', 'scripts-modules', 'scripts-vendor']);
	gulp.watch('./resources/assets/typescript/admin/*.ts', ['scripts-admin']);
	gulp.watch('./resources/assets/typescript/modules/*.ts', ['scripts-modules']);
	gulp.watch('./resources/assets/typescript/vendor/*.js', ['scripts-vendor']);
	gulp.watch('./resources/assets/scss/*.scss', ['scss']);
	gulp.watch('./resources/assets/scss/partials/*.scss', ['scss']);
	gulp.watch('./resources/assets/scss/partials/*/*.scss', ['scss']);
});

/**
 * Runs all of the compilations on the default Gulp command.
 */
gulp.task('default', ['scss', 'scripts-admin', 'scripts-modules', 'scripts-vendor']);