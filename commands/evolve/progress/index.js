/*jslint node: true, nomen: true*/
"use strict";

var _ = require('lodash'),
    Promise = require('bluebird'),
    createGit = require('simple-git/promise'),
    utils = require('../../../utils');

// suppongo di essere in mezzo a un rebase
function progress(repository) {
    var git = createGit(repository).silent(false);
    return git.rebase(['--continue']).then(function () {
        return utils.git.isCleanRepo(repository).then(function (clean) {
            if (clean) {
                return true;
            }
            return git.status().then(function (status) {
                return _(status.files).filter(function (item) {
                    return item.index === 'D' && item.working_dir === 'U';
                }).value();
            }).then(function (files) {
                if (files.length === 0) {
                    return false;
                }
                return Promise.all(
                    _(files).map(function (file) {
                        return git.rm([file.path]);
                    }).value()
                ).then(function () {
                    return progress(repository);
                });
            });
        });
    }).catch(function () {
        return git.rebase(['--skip']).then(function () {
            return utils.git.isCleanRepo(repository);
        }).then(function (clean) {
            return clean || progress(repository);
        });
    });
}

module.exports = progress;
