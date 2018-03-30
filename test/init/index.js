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
            done();
        }).catch(function (error) {
            done(error);
        });
    });

    afterEach(function (done) {
        rm(repoPath).then(function () {
            done();
        }).catch(function (error) {
            done(error);
        });
    });

    it('should not be a repository', function (done) {
        commands.status.code(repoPath).then(function (status) {
            assert.deepEqual(status, {
                description: 'not a repository'
            });
            commands.status.printable(repoPath).then(function (output) {
                assert.equal(typeof output, 'string');
                done();
            });
        }).catch(function (err) {
            done(err);
        });
    });

    describe('run init commands without conflics', function () {
        beforeEach(function (done) {
            commands.init(repoPath).then(function () {
                git = createGit(repoPath);
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

        it('should add the Model commit', function (done) {
            testUtils.assertDifferent(repoPath, m0Path, '.git').then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('should be a not evolving repository', function (done) {
            commands.status.code(repoPath).then(function (status) {
                assert.deepEqual(status, {
                    description: 'not evolving'
                });
                done();
            }).catch(function (err) {
                done(err);
            });
        });
    });
});
