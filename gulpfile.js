var closureCompiler = require('google-closure-compiler').gulp();
var sourcemaps = require('gulp-sourcemaps');
var gulp = require('gulp');
var gutil = require('gulp-util');

var prod = process.env.NODE_ENV === 'production';

gulp.task('default', () => {
    return gulp.src('./src/**/*.js', { base: './' })
        // .pipe(sourcemaps.init())
        .pipe(closureCompiler({
            process_common_js_modules: true,
            module_resolution: 'NODE',
            entry_point: 'src/index.js', 
            hide_warnings_for: 'node_modules/socket.io-client',
            js: ['node_modules/socket.io-client/dist/socket.io.slim.js'],
            compilation_level: 'SIMPLE',
            language_in: 'ECMASCRIPT6_STRICT',
            language_out: 'ECMASCRIPT3',
            output_wrapper: '(function(){\n%output%\n}).call(this)',
            js_output_file: 'little-game.js',
        }))
        .on('error', gutil.log)
        // .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', () => {
    return gulp.watch('./src/**/*.js', ['default']);
});