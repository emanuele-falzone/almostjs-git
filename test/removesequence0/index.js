/*jslint node: true, nomen: true*/
/*globals describe, it, beforeEach, afterEach, __dirname*/
'use strict';

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

describe('Remove a serie of Files with conflicts', function () {
    var repoPath,
        m0Path = path.join(__dirname, 'm0'),
        f0Path = path.join(__dirname, 'f0'),
        f1Path = path.join(__dirname, 'f1'),
        f2Path = path.join(__dirname, 'f2'),
        m1Path = path.join(__dirname, 'm1'),
        finalPath = path.join(__dirname, 'final'),
        git;

    beforeEach(function (done) {
        utils.fs.tempDir().then(function (folder) {
            repoPath = folder;
        }).then(function () {
            git = createGit(repoPath);
            return git.init();
        }).then(function () {
            return fs.copy(m0Path, repoPath);
        }).then(function () {
            return git.add('-A');
        }).then(function () {
            return git.commit(['Initial version', 'Model']);
        }).then(function () {
            return git.rm('*');
        }).then(function () {
            return fs.copy(f0Path, repoPath);
        }).then(function () {
            return git.add('-A');
        }).then(function () {
            return git.commit('First feature');
        }).then(function () {
            return git.rm('*');
        }).then(function () {
            return fs.copy(f1Path, repoPath);
        }).then(function () {
            return git.add('-A');
        }).then(function () {
            return git.commit('Second feature');
        }).then(function () {
            return git.rm('*');
        }).then(function () {
            return fs.copy(f2Path, repoPath);
        }).then(function () {
            return git.add('-A');
        }).then(function () {
            return git.commit('Third feature');
        }).then(function () {
            return commands.evolve.start(repoPath, m1Path);
        }).then(function (success) {
            if (success) {
                done();
            } else {
                done(new Error('it should not reach this state'));
            }
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
            }, status);
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('should reach the final state', function (done) {
        testUtils.assertDifferent(repoPath, finalPath, '.git').then(function () {
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('should delete the almost-git file inside .git folder', function (done) {
        utils.fs.readAlmostFile(repoPath).then(function () {
            done(new Error('The config file is still there'));
        }).catch(function () {
            done();
        });
    });
    
    it('should add the Model commit', function (done) {
        git.checkout('HEAD~1').then(function () {
            return testUtils.assertDifferent(repoPath, m1Path, '.git');
        }).then(function () {
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('should preserve the Feature commit', function (done) {
        git.checkout('HEAD~2').then(function () {
            return testUtils.assertDifferent(repoPath, f2Path, '.git');
        }).then(function () {
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('should preserve the Feature commit', function (done) {
        git.checkout('HEAD~3').then(function () {
            return testUtils.assertDifferent(repoPath, f1Path, '.git');
        }).then(function () {
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('should preserve the Feature commit', function (done) {
        git.checkout('HEAD~4').then(function () {
            return testUtils.assertDifferent(repoPath, f0Path, '.git');
        }).then(function () {
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('should preserve the Initial Model commit', function (done) {
        git.checkout('HEAD~5').then(function () {
            return testUtils.assertDifferent(repoPath, m0Path, '.git');
        }).then(function () {
            done();
        }).catch(function (err) {
            done(err);
        });
    });

});
