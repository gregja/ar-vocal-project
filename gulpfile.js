const { src, dest } = require('gulp');

/*
  Copy some npm scripts to the public folder
 */
var files = [
    {"orig":"./node_modules/alasql/dist/alasql.js", "dest":"./public/javascripts/alasql"}
]

exports.default = function() {
    files.forEach(file => {
        return src(file.orig)
            .pipe(dest(file.dest));
    })
}

