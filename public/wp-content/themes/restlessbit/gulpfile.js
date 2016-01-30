/*global require */

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const glob = require('glob');
const es = require('event-stream');
const rename = require('gulp-rename');
const del = require('del');
const runSequence = require('run-sequence');

/* Command line utilities */
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');

/* Styles */
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const combineMQ = require('gulp-merge-media-queries');
const cssMin = require('gulp-minify-css');

/* Scripts */
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const babelify = require('babelify');
const eslint = require('gulp-eslint');

/* Build configuration */
const config = {
  browserSync: {
    notify: false,
    open: false,
    proxy: 'mariopabon.dev'
  },
  paths: {
    // Files to delete before building
    clean: ['assets/**/*'],

    // Files you want to trigger a BrowserSync refresh
    watch: ['**/*.php', '**/*.twig'],

    styles: {

      // Build stylesheets at root of styles directory
      src: 'styles/*.scss',

      dest: '.',

      // Which files you want to trigger a build of stylesheets
      watch: ['styles/**/*.scss']
    },
    scripts: {

      // Compile scripts at root of scripts directory
      src: 'scripts/*.js',

      dest: 'assets/js',

      // Which files you want to lint
      lint: ['scripts/**/*.js'],

      watch: ['scripts/**/*.js']
    },
    images: {
      src: 'images/**/*',
      dest: 'assets/img',
      watch: 'images/**/*'
    }
  }
};

/* Add or remove environments here */
const ENV = {
  production: 'production',
  development: 'development'
};

function handleBuildErrors(err) {
  gutil.beep();
  console.log(err);

  // Must emit 'end', or else watch task will never resume after error.
  this.emit('end');
}

function clean() {
  return del(config.paths.clean);
}

function lintScripts() {
  return gulp.src(config.paths.scripts.lint)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function buildScripts(env) {
  return glob(config.paths.scripts.src, function(er, files) {
    const tasks = files.map(function(entry) {
      var stream = browserify({
          entries: [entry],
          debug: env === ENV.development
        })
        .transform(babelify, {
          presets: ['es2015']
        })
        .bundle()
        .on('error', handleBuildErrors)
        .pipe(source(entry))
        .pipe(buffer());

      if (env === ENV.development) {
        stream = stream.pipe(sourcemaps.init({
            loadMaps: true
          }))
          .pipe(sourcemaps.write());
      } else if (env === ENV.production) {
        stream = stream.pipe(uglify());
      }

      stream = stream.pipe(rename({
          dirname: ''
        }))
        .pipe(gulp.dest(config.paths.scripts.dest));

      return stream;
    });

    return es.merge(tasks)
      .pipe(browserSync.stream());
  });
}

function buildStyles(env) {
  var stream = gulp.src(config.paths.styles.src)
    .pipe(plumber(handleBuildErrors));

  if (env === ENV.development) {
    stream = stream.pipe(sourcemaps.init())
      .pipe(sass({
        outputStyle: 'expanded',
        sourceMap: true
      }))
      .pipe(autoprefixer())
      .pipe(sourcemaps.write());
  } else if (env === ENV.production) {
    stream = stream.pipe(sass())
      .pipe(autoprefixer())
      .pipe(combineMQ())
      .pipe(cssMin());
  }

  return stream.pipe(gulp.dest(config.paths.styles.dest))
    .pipe(browserSync.stream());
}

gulp.task('clean', function() {
  return clean();
});

gulp.task('styles:dev', function() {
  return buildStyles(ENV.development);
});

gulp.task('styles:prod', function() {
  return buildStyles(ENV.production);
});

gulp.task('lint-scripts', function() {
  return lintScripts();
});

gulp.task('scripts:dev', ['lint-scripts'], function() {
  return buildScripts(ENV.development);
});

gulp.task('scripts:prod', ['lint-scripts'], function() {
  return buildScripts(ENV.production);
});

/* Build tasks */
gulp.task('build:dev', function(done) {
  return runSequence('clean', ['styles:dev', 'scripts:dev'], done);
});

gulp.task('build:prod', function(done) {
  return runSequence('clean', ['styles:prod', 'scripts:prod'], done);
});

/* Default dev task */
gulp.task('default', ['build:dev'], function() {
  browserSync.init(config.browserSync);

  gulp.watch(config.paths.watch, browserSync.reload);
  gulp.watch(config.paths.styles.watch, ['styles:dev']);
  gulp.watch(config.paths.scripts.watch, ['scripts:dev']);
});
