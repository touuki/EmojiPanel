const gulp = require('gulp');
const util = require('gulp-util');
const sass = require('gulp-sass');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babel = require('babelify');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

let dev = false;

gulp.task('js', (done) => {
    const bundler = watchify(browserify('./src/index.js', { debug: dev })
        .transform(babel, {
            presets: ['@babel/preset-env']
        }));

    const rebundle = () => {
        console.log('-> bundling...');

        return bundler.bundle()
            .once('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(source('emojipanel.min.js'))
            .pipe(buffer())
            .pipe(!dev ? uglify() : util.noop())
            .pipe(gulp.dest('./dist'))
            .pipe(gulp.dest('./docs/js'))
            .once('end', () => {
                console.log('-> bundled!')
            });
    };

    if(dev) {
        bundler.on('update', () => rebundle());
    }

    rebundle();
    done();
});

gulp.task('tinymce4', (done) => {
    const bundler = watchify(browserify('./src/tinymce4-plugin.js', { debug: dev })
        .transform(babel, {
            presets: ['@babel/preset-env']
        }));

    const rebundle = () => {
        console.log('-> bundling plugin...');

        return bundler.bundle()
            .once('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(source('tinymce4-emojipanel.min.js'))
            .pipe(buffer())
            .pipe(!dev ? uglify() : util.noop())
            .pipe(gulp.dest('./dist'))
            .once('end', () => {
                console.log('-> bundled plugin!')
            });
    };

    if(dev) {
        bundler.on('update', () => rebundle());
    }

    rebundle();
    done();
});

gulp.task('scss', (done) => {
    gulp.src('./scss/panel.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(rename('emojipanel.min.css'))
        .pipe(gulp.dest('./dist'))
        .pipe(gulp.dest('./docs/css'));

    done();
});

gulp.task('build', gulp.series('scss', 'js', 'tinymce4'));

gulp.task('dev', (done) => {
    dev = true;
    done();
})

gulp.task('watch', gulp.series('dev', 'scss', 'js', 'tinymce4', (done) => {
    gulp.watch('scss/**/*.scss', gulp.series('scss'));
    done();
}));

gulp.task('default', gulp.series('watch', (done) => {
    done();
}));
