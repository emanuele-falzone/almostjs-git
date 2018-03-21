/*jslint node: true, nomen: true*/
/*globals describe, it, beforeEach, afterEach, __dirname*/
'use strict';

var assert = require('assert'),
    path = require('path'),
    rm = require('rimraf-promise'),
    fs = require('fs-extra'),
    createGit = require('simple-git/promise'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    commands = require('../../commands');

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

describe('Remove a File with conflicts', function () {
    var repoPath,
        m0Path,
        f0Path,
        m1Path,
        finalPath,
        git;
    beforeEach(function (done) {
        repoPath = path.join(__dirname, 'tmp');
        m0Path = path.join(__dirname, 'm0');
        f0Path = path.join(__dirname, 'f0');
        m1Path = path.join(__dirname, 'm1');
        finalPath = path.join(__dirname, 'final');

        rm(repoPath).then(function () {
            return fs.ensureDir(repoPath);
        }).then(function () {
            git = createGit(repoPath);
            git.silent(true);
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
            return commands.evolve.start(repoPath, m1Path);
        }).then(function () {
            done(new Error('it should not reach this state'));
        }).catch(function (error) {
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

    it('should not leave a clean repository', function (done) {
        git.status().then(function (status) {
            assert.deepEqual(status, {
                not_added: [],
                conflicted: [],
                created: [],
                deleted: [],
                modified: [
                    'a.txt'
                ],
                renamed: [],
                files: [{
                    index: 'M',
                    path: 'a.txt',
                    working_dir: ' '
                }, {
                    index: 'D',
                    path: 'b.txt',
                    working_dir: 'U'
                }],
                ahead: 0,
                behind: 0,
                current: 'HEAD',
                tracking: null
            }, status);
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    describe('resolve conflicts and terminate', function () {

        beforeEach(function (done) {
            git.rm('b.txt').then(function(){
                return git.rebase(['--continue'])
            }).then(function(){
                return commands.evolve.end(repoPath);
            }).then(function(){
                done();
            }).catch(function(err){
                done(err);
            });
        });

        it('should reach the final state', function (done) {
            assertDifferent(repoPath, finalPath, '.git').then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('should add the Model commit', function (done) {
            git.checkout('HEAD~1').then(function () {
                return assertDifferent(repoPath, m1Path, '.git');
            }).then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('should preserve the Feature commit', function (done) {
            git.checkout('HEAD~2').then(function () {
                return assertDifferent(repoPath, f0Path, '.git');
            }).then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('should preserve the Initial Model commit', function (done) {
            git.checkout('HEAD~3').then(function () {
                return assertDifferent(repoPath, m0Path, '.git');
            }).then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });
    });
});
