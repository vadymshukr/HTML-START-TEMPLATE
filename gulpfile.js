const PROJECT_FOLDER = "dist";
const SOURCE_FOLDER = "src";

let fs = require('fs');

const PATH = {
    build:{
        html: PROJECT_FOLDER + '/',
        css: PROJECT_FOLDER + '/css/',
        js: PROJECT_FOLDER + '/js/',
        img: PROJECT_FOLDER + '/img/',
        fonts: PROJECT_FOLDER + '/fonts/'
    },
    src:{
        html: [SOURCE_FOLDER + '/*.html', '!' + SOURCE_FOLDER + '/_*.html'],
        css: SOURCE_FOLDER + '/sass/style.sass',
        js: SOURCE_FOLDER + '/js/script.js',
        img: SOURCE_FOLDER + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts: SOURCE_FOLDER + '/fonts/*.ttf'
    },
    watch:{
        html: SOURCE_FOLDER + '/**/*.html',
        css: SOURCE_FOLDER + '/sass/**/*.sass',
        js: SOURCE_FOLDER + '/js/**/*.js',
        img: SOURCE_FOLDER + '/img/**/*.{jpg,png,svg,gif,ico,webp}'
    },
    clean: './' + PROJECT_FOLDER + '/'
}

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    mediaqueries = require('gulp-group-css-media-queries'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpcss = require('gulp-webpcss'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fonter = require('gulp-fonter');

function browserSync(){
    browsersync.init({
        server: {
            baseDir: './' + PROJECT_FOLDER + '/',    
        },
        port: 3000,
        notify: false
    })
}

function clean(){
    return del(PATH.clean);
}

function html(){
    return src(PATH.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(PATH.build.html))
        .pipe(browsersync.stream())
}

function css(){
    return src(PATH.src.css)
            .pipe(sass({
                outputStyle: "expanded"
            }))
            .pipe(mediaqueries())
            .pipe(autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            }))
            .pipe(webpcss())
            .pipe(dest(PATH.build.css))
            .pipe(cleancss())
            .pipe(rename({
                extname: '.min.css'
            }))
            .pipe(dest(PATH.build.css))
            .pipe(browsersync.stream())

}

function js(){
    return src(PATH.src.js)
        .pipe(fileinclude())
        .pipe(dest(PATH.build.js))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest(PATH.build.js))
        .pipe(browsersync.stream())
}

function images(){
    return src(PATH.src.img)
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest(PATH.build.img))
        .pipe(src(PATH.src.img))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3
        }))
        .pipe(dest(PATH.build.img))
        .pipe(browsersync.stream())
}

function fonts(){
    src(PATH.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(PATH.build.fonts));
    return src(PATH.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(PATH.build.fonts));
}

function watchFiles(){
    gulp.watch([PATH.watch.html], html);
    gulp.watch([PATH.watch.css], css);
    gulp.watch([PATH.watch.js], js);
    gulp.watch([PATH.watch.img], images);
}

gulp.task('otf2ttf', function(){
    return src([SOURCE_FOLDER + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(SOURCE_FOLDER + '/fonts/'));
});

let build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.build = build;
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.watch = watch;
exports.default = watch;