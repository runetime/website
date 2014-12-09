var gulp = require('gulp');

var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var uglifyjs = require('gulp-uglifyjs');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');

var paths = {
	'assets': {
		scss: './assets/scss/*.scss',
		typescript: './assets/typescript/modules/*.ts'
	},
	'public': {
		css: './public/css',
		js: './public/js'
	}
};

// Sass Compile Task
gulp.task('scss', function() {
	return gulp.src(paths.assets.scss)
		.pipe(sass({ style: 'compressed' }))
		.pipe(gulp.dest(paths.public.css));
});

// Scripts-Admin Task
gulp.task('scripts-admin', function() {
	var tsResult = gulp.src('./assets/typescript/admin/*.ts')
		.pipe(sourcemaps.init())
		.pipe(ts({
			sortOutput: true
		}));

	return tsResult.js
		.pipe(concat('admin.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/js/'));
});

// Scripts-Modules Task
gulp.task('scripts-modules', function() {
	var tsResult = gulp.src('./assets/typescript/modules/*.ts')
		.pipe(sourcemaps.init())
		.pipe(ts({
			sortOutput: true
		}));

	return tsResult.js
		.pipe(concat('modules.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/js'));
});

// Scripts-Admin Task
gulp.task('scripts-vendor', function() {
	gulp.src('./assets/typescript/vendor/*.js')
		.pipe(uglifyjs('vendor.js', {
			outSourceMap: false
		}))
		.pipe(gulp.dest('./public/js'))
});

gulp.task('watch', function() {
	gulp.watch('./assets/typescripts/*', ['scripts-admin', 'scripts-modules', 'scripts-vendor']);
	gulp.watch('./assets/scss/*.scss', ['scss']);
	gulp.watch('./assets/scss/partials/*.scss', ['scss']);
});

gulp.task('default', ['cass']);