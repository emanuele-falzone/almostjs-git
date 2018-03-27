/*jslint node: true, nomen: true*/
"use strict";

var createGit = require('simple-git/promise');

function getTopLevel(folder) {
    return createGit(folder).revparse([
        '--show-toplevel'
    ]).then(function (root) {
        return root.trim();
    });
}

function isCleanRepo(folder) {
    return createGit(folder).status().then(function (status) {
        return status.files.length === 0;
    });
}

exports.getTopLevel = getTopLevel;
exports.isCleanRepo = isCleanRepo;
