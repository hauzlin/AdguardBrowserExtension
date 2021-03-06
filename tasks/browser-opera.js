/*
 * Opera build is the same as Chromium build but includes it own filters.
 * This task is running after Chromium build, so we need to copy Chromium folder
 * and include Opera filters files. To zip Opera build folder if release.
 */

/* global process */
import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import {BUILD_DIR, BRANCH_RELEASE, PRIVATE_FILES} from './consts';
import {version} from './parse-package';
import crx from 'gulp-crx-pack';

// set current type of build
const BRANCH = process.env.NODE_ENV || '';

const paths = {
    filtersOpera: path.join('Extension/filters/opera/**/*'),
    chromium: path.join(BUILD_DIR, BRANCH, `chrome-${version}`, '**/*'),
    cert: path.join(PRIVATE_FILES, 'certificate.pem'),
    dest: path.join(BUILD_DIR, BRANCH, `opera-${version}`)
};

const dest = {
    filters: path.join(paths.dest, 'filters'),
    inner: path.join(paths.dest, '**/*'),
    buildDir: path.join(BUILD_DIR, BRANCH)
};

// copy chromium build dir
const copyChromiumFiles = () => gulp.src(paths.chromium).pipe(gulp.dest(paths.dest));

// replace chromium filters by opera filters
const copyFiltersOpera = () => gulp.src(paths.filtersOpera).pipe(gulp.dest(dest.filters));

const crxPack = (done) => {
    if (BRANCH !== BRANCH_RELEASE) {
        return done();
    }

    return gulp.src(paths.dest)
        .pipe(crx({
            privateKey: fs.readFileSync(paths.cert, 'utf8'),
            filename: `opera-${BRANCH}-${version}.crx`
        }))
        .pipe(gulp.dest(dest.buildDir));
};

export default gulp.series(copyChromiumFiles, copyFiltersOpera, crxPack);
