const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;//del comments(es6 supported)
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const fileinclude = require('gulp-file-include');
const gcmq = require('gulp-group-css-media-queries'); //находит одинаковые media и скидывает в конец
const strip = require('gulp-strip-comments');//remove comments( CSS3, JSON5 and ECMAScript6 supported)



function script() {
    return src([
            'node_modules/jquery/dist/jquery.js',
            'app/js/main.js'
        ])
        .pipe(strip())
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/",
            index: "project.html"
        }
    });
}

    function html() {
        return src('app/layout-project.html')
            .pipe(fileinclude())
            .pipe(concat('project.html'))//если не переименовать то layout-index.html будет как index.html
            .pipe(dest('app/'))
            .pipe(browserSync.stream())
    }

    function cleanDist() {
        return del('dist')
    }

    function styles() {
        return src('app/scss/style.scss')
            .pipe(autoprefixer({
                overrideBrowserslist: ['last 10 version'],
                grid: 'autoplace'
            }))
            .pipe(sass().on('error', sass.logError))
            .pipe(gcmq())
            .pipe(dest('app/css'))
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(concat('style.min.css'))
            .pipe(dest('app/css'))
            .pipe(browserSync.stream())
    }

    function imgmin() {
        return src('app/img/**/*')
            .pipe(imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({quality: 75, progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ]))
            .pipe(dest('dist/img'))
    }

    function watcher() {
        watch(['app/scss/**/*.scss'], styles)
        watch(['app/**/*.js', '!app/**/main.min.js'], script)
        watch(['app/layout-*.html'], html)
    }

    function build() {
        return src([
                'app/css/style.min.css',
                'app/fonts/**/*',
                'app/js/main.min.js',
                'app/*.html',
                '!app/layout-*.html'
            ], {
                base: 'app'
            }) //опция позволяет сохранять вложенность католога, а не в одну кучу js, css и т.п.
            .pipe(dest('dist'))
    }
    exports.styles = styles;
    exports.imgmin = imgmin;
    exports.build = series(cleanDist, styles, build, imgmin);
    exports.autoprefixer = autoprefixer;
    exports.watcher = watcher;
    exports.browsersync = browsersync;
    exports.html = html;
    exports.script = script;
    exports.default = parallel(styles, browsersync, watcher, html, script); //когда запускается gulp запустит переменную по умолчанию parallel

//  To upgrade to the latest gulp-sass, please do the following steps:
//    1.Delete your node_modules folder
//    2.Remove gulp-sass from your package.json file
//    3.Remove node-sass from your package.json file (if you have it in there)
//    4.Run npm install gulp-sass --save-dev
//    5.Update your Gulp task as required

    //npm i --save-dev name_plugin
    //npm install

    
// Transision gulpfile.js to newName.html, do the follwing steps:
//  1. Compare menu and footer with index.html, if they are same
//  2. Prepare img/newName/
//  3. Rename layout-*.html files
//      -rename references layout-name.html
//  4. Create newName.scss
//      -create reference into style.scss
//  5. Remake gulpfile.js
//      -remake html()
//      -remake browsersync()