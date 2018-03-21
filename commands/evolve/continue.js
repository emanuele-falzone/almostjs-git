/*jslint node: true, nomen: true*/
"use strict";

var _ = require('lodash'),
    fs = require('fs-extra'),
    rm = require('rimraf-promise'),
    os = require('os'),
    path = require('path'),
    Promise = require('bluebird'),
    createGit = require('simple-git/promise'),
    utils = require('../../utils');

function completion(repository) {

    var git = createGit(repository),
        tempFolder;

    return git.checkout('tmp').then(function () {
        return fs.mkdtemp(path.join(os.tmpdir(), 'git-'));
    }).then(function (folder) {
        tempFolder = folder;
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
        return git.add('-A');
    }).then(function () {
        return git.commit(['new_model', 'Model']);
    }).then(function () {
        return git.diff(['master..final', '--full-index', '--binary']);
    }).then(function (diff) {
        return fs.outputFile(path.join(tempFolder, 'patch.diff'), diff);
    }).then(function () {
        return git.raw(['apply', path.join(tempFolder, 'patch.diff')]);
    }).then(function () {
        return rm(tempFolder);
    }).then(function () {
        return git.add('-A');
    }).then(function () {
        return git.commit('new_merged_model');
    }).then(function () {
        return git.branch(['-D', 'tmp']);
    }).then(function () {
        return git.branch(['-D', 'final']);
    });
}

module.exports = completion;
