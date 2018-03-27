/*jslint node: true, nomen: true*/
"use strict";

var createGit = require('simple-git/promise');

function abort(repository) {

    var git = createGit(repository).silent(false);

    return git.clean('f').then(function () {
        return git.checkout('master');
    }).then(function () {
        return git.branch(['-D', 'tmp']);
    }).then(function () {
        return git.branch(['-D', 'final']);
    });
}

module.exports = abort;
