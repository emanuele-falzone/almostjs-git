/*jslint node: true, nomen: true*/
"use strict";

var initialization = require('./start'),
    completion = require('./continue'),
    utils = require('../../utils');

function start(repository, folder) {
    return utils.git.getTopLevel(repository).then(function (root) {
        return initialization(root, folder);
    }).then(function (mergeSuccess) {
        if (mergeSuccess) {
            return completion(repository);
        }
    });
}

function end(repository) {
    return utils.git.getTopLevel(repository).then(function (root) {
        return completion(root);
    });
}

exports.start = start;
exports.end = end;
