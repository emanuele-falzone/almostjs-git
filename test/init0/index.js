/*jslint node: true, nomen: true*/
/*globals describe, it, beforeEach, afterEach, __dirname*/
"use strict";

var _ = require('lodash'),
    fs = require('fs-extra'),
    rm = require('rimraf-promise'),
    path = require('path'),
    assert = require('assert'),
    createGit = require('simple-git/promise'),
    Promise = require('bluebird'),
    commands = require('../../commands'),
    utils = require('../../utils'),
    testUtils = require('../utils');

describe('Init repo without conflicts', function () {
    var repoPath,
        m0Path = path.join(__dirname, 'm0'),
        git;

    beforeEach(function (done) {
        utils.fs.tempDir().then(function (folder) {
            repoPath = folder;
        }).then(function () {
            return fs.copy(m0Path, repoPath);
        }).then(function () {
            git = createGit(repoPath);
            return git.init();
        }).then(function () {
            return git.add('-A');
        }).then(function () {
            return git.commit(['Initial version', 'Model']);
        }).then(function () {
            return commands.init(repoPath);
        }).then(function () {
            done(new Error());
        }).catch(function () {
            done();
        });
    });

    afterEach(function (done) {
        rm(repoPath).then(function () {
            done();
        }).catch(function (error) {
            done(error);
        });
    });

    it('should leave a clean repository', function (done) {
        git.status().then(function (status) {
            assert.deepEqual(status, {
                not_added: [],
                conflicted: [],
                created: [],
                deleted: [],
                modified: [],
                renamed: [],
                files: [],
                ahead: 0,
                behind: 0,
                current: 'master',
                tracking: null
            });
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('should preserve files', function (done) {
        testUtils.assertDifferent(repoPath, m0Path, '.git').then(function () {
            done();
        }).catch(function (err) {
            done(err);
        });
    });
});
