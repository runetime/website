var gulp = require('gulp');

var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglifyjs = require('gulp-uglifyjs');
var rename = require('gulp-rename');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');


var tsProject = {
	declarationFiles: true,
	noExternalResolve: true,
	sortOutput: true
};

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

// Sass Compile Task
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

// Scripts-Admin Task
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

// Scripts-Modules Task
gulp.task('scripts-modules', function() {
	var tsResult = gulp.src('./resources/assets/typescript/modules/*.ts')
		.pipe(sourcemaps.init())
		.pipe(ts(tsProject));

	return tsResult.js
		.pipe(concat('modules.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/js'));
});

// Scripts-Admin Task
gulp.task('scripts-vendor', function() {
	var src = [
		'./resources/assets/typescript/vendor/jquery.js',
		'./resources/assets/typescript/vendor/jquery-ui.js',
		'./resources/assets/typescript/vendor/bootstrap.js',
		'./resources/assets/typescript/vendor/jasny-bootstrap.js'
	];
	gulp.src(src)
		.pipe(uglifyjs('vendor.js', {
			compress: true,
			outSourceMap: false
		}))
		.pipe(gulp.dest('./public/js'))
});

gulp.task('watch', function() {
	gulp.watch('./resources/assets/typescript/*', ['scripts-admin', 'scripts-modules', 'scripts-vendor']);
	gulp.watch('./resources/assets/typescript/admin/*.ts', ['scripts-admin']);
	gulp.watch('./resources/assets/typescript/modules/*.ts', ['scripts-modules']);
	gulp.watch('./resources/assets/typescript/vendor/*.ts', ['scripts-vendor']);
	gulp.watch('./resources/assets/scss/*.scss', ['scss']);
	gulp.watch('./resources/assets/scss/partials/*.scss', ['scss']);
});

gulp.task('default', ['scss', 'scripts-admin', 'scripts-modules', 'scripts-vendor']);