/*jslint node: true, nomen: true*/
"use strict";

var _ = require('lodash'),
    fs = require('fs-extra'),
    rm = require('rimraf-promise'),
    Promise = require('bluebird'),
    createGit = require('simple-git/promise'),
    utils = require('../../utils');

function lastModelHash(data) {
    return _(data.all)
        .filter(function (log) {
            return log.description[0] === 'M';
        }).sort('date').last().hash;
}

function start(repository, newVersion) {

    var git = createGit(repository);

    return git.checkout('master')
        .then(function () {
            return git.log({
                format: {
                    hash: '%H',
                    date: '%ai',
                    message: '%s%d',
                    author_name: '%aN',
                    author_email: '%ae',
                    description: '%b'
                }
            });
        }).then(function (data) {
            return git.checkout(lastModelHash(data));
        }).then(function () {
            return git.checkoutLocalBranch('tmp');
        }).then(function () {
            return git.rm('*');
        }).then(function () {
            return fs.copy(newVersion, repository);
        }).then(function () {
            return git.add('-A');
        }).then(function () {
            return git.commit('Model');
        }).then(function () {
            return git.checkout('master');
        }).then(function () {
            return git.checkoutLocalBranch('final');
        }).then(function () {
            return git.rebase(['tmp'])
                .then(function () {
                    return true;
                })
                .catch(function (err) {
                    return git.status().then(function (status) {
                        if (status.conflicted.length) {
                            return false;
                        }
                        throw err;
                    });
                });
        });
}

module.exports = start;
