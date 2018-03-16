/*jslint node: true, nomen: true*/
"use strict";

var createGit = require('simple-git/promise');

function getTopLevel(folder) {
    folder = folder || './';
    return createGit(folder).raw([
        'rev-parse',
        '--show-toplevel'
    ]).then(function (root) {
        return root.trim();
    });
}

function isRebasing(folder) {
    folder = folder || './';
    return createGit(folder).status().then(function (status) {
        return status.files.length;
    });
}

function isRepository(folder) {
    folder = folder || './';
    return createGit(folder).checkIsRepo();
}

exports.getTopLevel = getTopLevel;
exports.isRebasing = isRebasing;
exports.isRepository = isRepository;
