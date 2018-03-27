/*jslint node: true, nomen: true*/
"use strict";

var _ = require('lodash'),
    Promise = require('bluebird'),
    createGit = require('simple-git/promise'),
    utils = require('../../../utils');

function lastModelHash(data) {
    return _(data.all).filter(function (log) {
        return log.description === 'Model';
    }).sort('date').first().hash;
}

function start(repository, newVersion) {

    var git = createGit(repository).silent(false);

    return git.checkout('master').then(function () {
        return git.log({
            format: {
                hash: '%H',
                date: '%ai',
                description: '%b'
            }
        });
    }).then(function (data) {
        return lastModelHash(data);
    }).then(function (hash) {
        return git.checkout(hash);
    }).then(function () {
        return git.checkoutLocalBranch('tmp');
    }).then(function () {
        return utils.fs.empty(repository);
    }).then(function () {
        return utils.fs.copy(newVersion, repository);
    }).then(function () {
        return git.add('-A');
    }).then(function () {
        return git.commit('Model');
    }).then(function () {
        return git.checkout('master');
    }).then(function () {
        return git.checkoutLocalBranch('final');
    }).then(function () {
        return git.rebase(['tmp']).then(function () {
            return true;
        }).catch(function () {
            return false;
        });
    });
}

module.exports = start;
