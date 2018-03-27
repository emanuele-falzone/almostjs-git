/*jslint node: true, nomen: true*/
/*globals describe, it, beforeEach, afterEach, __dirname*/
'use strict';

var _ = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    assert = require('assert'),
    Promise = require('bluebird');

function assertDifferent(actual, expected, ignore) {
    return Promise.all([
        fs.stat(actual),
        fs.stat(expected)
    ]).then(function (stats) {
        assert.equal(stats[0].isDirectory(), stats[1].isDirectory());
        if (stats[0].isDirectory()) {
            return Promise.all([
                fs.readdir(actual).then(function (files) {
                    return _.without(files, ignore);
                }),
                fs.readdir(expected)
            ]).then(function (files) {
                files[0].sort();
                files[1].sort();
                assert.deepEqual(files[0], files[1]);
                return Promise.all(_.map(files[0], function (file) {
                    return assertDifferent(path.join(actual, file), path.join(expected, file));
                }));
            });
        }
        return Promise.all([
            fs.readFile(actual),
            fs.readFile(expected)
        ]).then(function (contents) {
            assert.deepEqual(contents[0], contents[1]);
        });
    });
}

exports.assertDifferent = assertDifferent;
