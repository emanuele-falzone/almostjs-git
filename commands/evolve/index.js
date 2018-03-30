/*jslint node: true, nomen: true*/
"use strict";

var init = require('./init'),
    progress = require('./progress'),
    abort = require('./abort'),
    finalize = require('./finalize');

function start(repository, folder) {
    return init(repository, folder).then(function (success) {
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
exports.abort = abort;
