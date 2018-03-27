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

exports.copy = copy;
exports.empty = empty;
exports.tempDir = tempDir;
