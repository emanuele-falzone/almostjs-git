/*jslint node: true, nomen: true*/
"use strict";

var _ = require('lodash'),
    Promise = require('bluebird'),
    Git = require('../../../lib').Git;

function progress(repository) {
    var git = Git(repository);
    return git.setTopLevel().then(function () {
        return git.continueRebase().then(function () {
            return git.isCleanRepo().then(function (clean) {
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
                            return git.rm(file.path);
                        }).value()
                    ).then(function () {
                        return progress(repository);
                    });
                });
            });
        }).catch(function () {
            return git.status().then(function (status) {
                return _(status.files).filter(function (item) {
                    return item.index === 'D' && item.working_dir === 'U';
                }).value();
            }).then(function (files) {
                if (files.length === 0) {
                    return false;
                }
                return git.skipRebase().then(function () {
                    return git.isCleanRepo();
                }).then(function (clean) {
                    return clean || progress(repository);
                });
            });
        });
    });
}

module.exports = progress;
