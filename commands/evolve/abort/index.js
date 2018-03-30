/*jslint node: true, nomen: true*/
"use strict";

var Git = require('../../../lib').Git,
    utils = require('../../../utils');

function abort(repository) {

    var git = Git(repository),
        config;

    return git.getTopLevel().then(function (root) {
        return utils.fs.readAlmostFile(root);
    }).then(function (obj) {
        config = obj;
        return git.setTopLevel();
    }).then(function () {
        return git.clean();
    }).then(function () {
        return git.abortRebase();
    }).then(function () {
        return git.checkout('master');
    }).then(function () {
        return git.deleteBranch(config.branches.tmp);
    }).then(function () {
        return git.deleteBranch(config.branches.final);
    });
}

module.exports = abort;
