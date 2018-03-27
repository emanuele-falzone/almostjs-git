/*jslint node: true, nomen: true*/
"use strict";

var init = require('./init'),
    progress = require('./progress'),
    abort = require('./abort'),
    finalize = require('./finalize'),
    utils = require('../../utils');

function start(repository, folder) {
    return utils.git.getTopLevel(repository).then(function (root) {
        return init(root, folder);
    }).then(function (success) {
        return success || progress(repository);
    }).then(function (success) {
        return success && finalize(repository);
    });
}

function end(repository) {
    return progress(repository).then(function (success) {
        return success && finalize(repository);
    });
}

exports.start = start;
exports.end = end;
