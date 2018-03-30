

/*jslint node: true, nomen: true*/
"use strict";

var _ = require('lodash'),
    utils = require('../../../utils'),
    Git = require('../../../lib').Git;

function lastModelHash(data) {
    return _(data.all).filter(function (log) {
        return log.description === 'Model';
    }).sort('date').first().hash;
}

function randomString(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

function start(repository, newVersion) {

    var git = Git(repository),
        config = {
            branches: {
                tmp: 'tmp-' + randomString(6),
                final: 'final-' + randomString(6)
            }
        };

    return git.getTopLevel().then(function (root) {
        return utils.fs.saveAlmostFile(config, root);
    }).then(function () {
        return git.setTopLevel();
    }).then(function () {
        return git.checkout('master');
    }).then(function () {
        return git.log();
    }).then(function (data) {
        return lastModelHash(data);
    }).then(function (hash) {
        return git.checkout(hash);
    }).then(function () {
        return git.checkoutLocalBranch(config.branches.tmp);
    }).then(function () {
        return utils.fs.empty(repository);
    }).then(function () {
        return utils.fs.copy(newVersion, repository);
    }).then(function () {
        return git.addAllAndCommit('Model');
    }).then(function () {
        return git.checkout('master');
    }).then(function () {
        return git.checkoutLocalBranch(config.branches.final);
    }).then(function () {
        return git.rebase(config.branches.tmp).then(function () {
            return true;
        }).catch(function () {
            return false;
        });
    });
}

module.exports = start;
