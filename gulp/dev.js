const gulp = require('gulp');
const nunjucks = require('gulp-nunjucks-render');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const fs = require('fs');
const changed = require('gulp-changed');
const webpHTML = require('gulp-webp-html');
const webp = require('gulp-webp');
const autoprefixer = require('autoprefixer');
const sourceMaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const postcssSyntaxScss = require('postcss-scss');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpack = require('webpack-stream');
const imagemin = require('gulp-imagemin');

gulp.task('clean:dev', function (done) {
	if (fs.existsSync('./dist/')) {
		return gulp
			.src('./dist/', { read: false })
			.pipe(clean({ force: true }));
	}
	done();
});

const plumberNotify = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};

gulp.task('nunjucks:dev', function () {
    return gulp
        .src(['./src/nunjucks/**/*.njk'], [!'./src/nunjucks/**/*.njk'])
        .pipe(changed('./dist/'))
        .pipe(plumber(plumberNotify('Nunjucks')))
        .pipe(nunjucks(
			{
				path: ['src/nunjucks'],
				ext: '.html'
			  }
		))
		.pipe(webpHTML())
        .pipe(gulp.dest('./dist/'))
		.pipe(browserSync.stream())
});

gulp.task('sass:dev', function () {
	return (
		gulp
			.src(['./src/scss/**/*.scss'], ['./src/nunjucks/**/**/*.scss'])
			.pipe(changed('./dist/css/'))
			.pipe(plumber(plumberNotify('SCSS')))
			.pipe(sourceMaps.init())
			.pipe(sass().on('error', sass.logError))
			.pipe(postcss([
				autoprefixer()
			], { syntax: postcssSyntaxScss }))
			.pipe(sourceMaps.write())
			.pipe(gulp.dest('./dist/css/'))
			.pipe(browserSync.stream())
	);
});

gulp.task('images:dev', function () {
	return gulp
		.src('./src/img/**/*')
		.pipe(changed('./dist/img/'))
		.pipe(webp())
		.pipe(imagemin({ verbose: true }))
		.pipe(gulp.dest('./dist/img/'))
		.pipe(browserSync.stream())
});

gulp.task('fonts:dev', function () {
	return gulp
		.src('./src/fonts/**/*.woff2')
		.pipe(changed('./dist/fonts/'))
		.pipe(gulp.dest('./dist/fonts/'))
		.pipe(browserSync.stream())
});

gulp.task('js:dev', function () {
	return gulp
		.src('./src/js/*.js')
		.pipe(changed('./dist/js/'))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(webpack(require('./../webpack.config.js')))
		.pipe(gulp.dest('./dist/js/'))
		.pipe(browserSync.stream())
});

gulp.task('browser-sync:dev', function() {
	browserSync.init({
		server: {
			baseDir: "./dist"
		}
	});
});

gulp.task('watch:dev', function () {
	gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
	gulp.watch('./src/nunjucks/**/*.scss', gulp.parallel('sass:dev'));
	gulp.watch('./src/nunjucks/**/*.njk', gulp.parallel('nunjucks:dev'));
	gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
	gulp.watch('./src/fonts/**/*.woff2', gulp.parallel('fonts:dev'));
	gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
});
