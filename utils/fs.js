/*jslint node: true, nomen: true*/
"use strict";

var fs = require('fs-extra'),
    rm = require('rmfr'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    path = require('path');

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

exports.copy = copy;
exports.empty = empty;
