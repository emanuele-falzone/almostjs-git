/*jslint node: true, nomen: true*/
"use strict";

var _ = require('lodash'),
    Promise = require('bluebird'),
    createGit = require('simple-git/promise'),
    utils = require('../../../utils');

function progress(repository) {
    var git = createGit(repository).silent(false);
    return git.status().then(function (status) {
        return _(status.files).filter(function (item) {
            return item.index === 'D' && item.working_dir === 'U';
        }).value();
    }).then(function (files) {
        if (files.length === 0) {
            return git.rebase(['--continue']).then(function () {
                return utils.git.isCleanRepo(repository);
            });
        }
        return Promise.all(
            _(files).map(function (file) {
                return git.rm([file.path]);
            }).value()
        ).then(function () {
            return git.rebase(['--continue']).then(function () {
                return utils.git.isCleanRepo(repository);
            }).then(function (clean) {
                return clean || progress(repository);
            });
        });
    });
}

module.exports = progress;
