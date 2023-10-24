const gulp = require('gulp');

// Tasks
require('./gulp/dev.js');
require('./gulp/prod.js');

gulp.task(
	'default',
	gulp.series(
		'clean:dev',
		gulp.parallel('nunjucks:dev', 'sass:dev', 'images:dev', 'fonts:dev', 'js:dev'),
		gulp.parallel('browser-sync:dev', 'watch:dev')
	)
);

gulp.task(
	'prod',
	gulp.series(
		'clean:prod',
		gulp.parallel('nunjucks:prod', 'sass:prod', 'images:prod', 'fonts:prod', 'js:prod')
	)
);
