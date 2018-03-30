/*jslint node: true, nomen: true*/
"use strict";

var path = require('path'),
    utils = require('../../../utils'),
    Git = require('../../../lib').Git;

function finalize(repository) {
    var git = Git(repository),
        tempFolder,
        rootFolder,
        patchPath,
        config;

    return git.getTopLevel().then(function (root) {
        rootFolder = root;
        return utils.fs.readAlmostFile(root);
    }).then(function (obj) {
        config = obj;
        return git.setTopLevel();
    }).then(function () {
        return git.checkout(config.branches.tmp);
    }).then(function () {
        return utils.fs.tempDir();
    }).then(function (folder) {
        tempFolder = folder;
        patchPath = path.join(tempFolder, 'patch.diff');
        return utils.fs.copy(repository, tempFolder);
    }).then(function () {
        return git.checkout('master');
    }).then(function () {
        return utils.fs.empty(repository);
    }).then(function () {
        return utils.fs.copy(tempFolder, repository);
    }).then(function () {
        return utils.fs.empty(tempFolder);
    }).then(function () {
        return git.addAllAndCommit(['New Model', 'Model']);
    }).then(function () {
        return git.diff('master', config.branches.final);
    }).then(function (diff) {
        if (diff.length > 0) {
            return utils.fs.saveContentToFile(diff, patchPath).then(function () {
                return git.apply(patchPath);
            }).then(function () {
                return git.addAllAndCommit('New Merged Model');
            });
        }
    }).then(function () {
        return utils.fs.remove(tempFolder);
    }).then(function () {
        return git.deleteBranch(config.branches.tmp);
    }).then(function () {
        return git.deleteBranch(config.branches.final);
    }).then(function () {
        return utils.fs.deleteAlmostFile(rootFolder);
    }).then(function () {
        return true;
    });
}

module.exports = finalize;
