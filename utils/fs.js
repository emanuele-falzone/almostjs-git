/*jslint node: true, nomen: true*/
"use strict";

var _ = require('lodash'),
    os = require('os'),
    fs = require('fs-extra'),
    rm = require('rimraf-promise'),
    path = require('path'),
    Promise = require('bluebird');

function copy(source, destination) {
    return fs.readdir(source).then(function (files) {
        return Promise.all(
            _(files).filter(function (file) {
                return file !== '.git';
            }).map(function (file) {
                return fs.copy(path.join(source, file), path.join(destination, file));
            }).value()
        );
    });
}

function empty(folder) {
    return fs.readdir(folder).then(function (files) {
        return Promise.all(
            _(files).filter(function (file) {
                return file !== '.git';
            }).map(function (file) {
                return rm(path.join(folder, file));
            }).value()
        );
    });
}

function tempDir() {
    return fs.mkdtemp(path.join(os.tmpdir(), 'almost-git-'));
}

function remove(path) {
    return rm(path);
}

function saveContentToFile(content, path) {
    return fs.outputFile(path, content);
}

function readAlmostFile(root) {
    return fs.readFile(path.join(root, '.git/almost-git/index.js'), 'utf8').then(function (data) {
        return JSON.parse(data);
    });
}

function saveAlmostFile(content, root) {
    return saveContentToFile(JSON.stringify(content), path.join(root, '.git/almost-git/index.js'));
}

function deleteAlmostFile(root) {
    return rm(path.join(root, '.git/almost-git/index.js'));
}

exports.copy = copy;
exports.empty = empty;
exports.tempDir = tempDir;
exports.remove = remove;
exports.saveContentToFile = saveContentToFile;
exports.readAlmostFile = readAlmostFile;
exports.saveAlmostFile = saveAlmostFile;
exports.deleteAlmostFile = deleteAlmostFile;
