var Git = require('simple-git/promise'),
    assert = require('assert'),
    path = require('path'),
    fse = require('fs-extra'),
    tmp = require('tmp-promise'),
    lib = require('../../../../lib'),
    testUtils = require('../../../utils');

describe('test/evolve/mod-file/0 modify a file without conflicts', function () {
    var repoPath,
        status,
        m0Path = path.join(__dirname, 'm0'),
        f0Path = path.join(__dirname, 'f0'),
        m1Path = path.join(__dirname, 'm1'),
        finalPath = path.join(__dirname, 'final'),
        git;

    beforeEach(function (done) {
        tmp.dir().then(function (folder) {
            repoPath = folder.path;
            status = new lib.Status(repoPath);
            git = Git(repoPath);
            return fse.copy(m0Path, repoPath);
        }).then(function () {
            return lib.init(repoPath)
        }).then(function () {
            return testUtils.commit(repoPath, f0Path)
        }).then(function () {
            done();
        }).catch(function (error) {
            done(error);
        });
    });

    afterEach(function (done) {
        fse.remove(repoPath).then(function () {
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
                staged: [],
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

    it('status should be a READY', function (done) {
        status.status().then(function (status) {
            assert.deepEqual(status, 'READY');
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('model commit hash should be correct', function (done) {
        var saved_hash;
        status.hash().then(function (hash) {
            saved_hash = hash;
            return git.checkout('HEAD~1');
        }).then(function () {
            return git.log();
        }).then(function (log) {
            assert.deepEqual(log.latest.hash.substring(0, 7), saved_hash);
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    describe('perform evolution', function () {
        beforeEach(function (done) {
            lib.evolve.init(repoPath, m1Path)
                .then(function () {
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
                    staged: [],
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
                return testUtils.assertDifferent(repoPath, f0Path, '.git');
            }).then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('should preserve the Initial Model commit', function (done) {
            git.checkout('HEAD~3').then(function () {
                return testUtils.assertDifferent(repoPath, m0Path, '.git');
            }).then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('status should be a READY', function (done) {
            status.status().then(function (status) {
                assert.deepEqual(status, 'READY');
                done();
            }).catch(function (err) {
                done(err);
            });
        });
    
        it('model commit hash should be correct', function (done) {
            var saved_hash;
            status.hash().then(function (hash) {
                saved_hash = hash;
                return git.checkout('HEAD~1');
            }).then(function () {
                return git.log();
            }).then(function (log) {
                assert.deepEqual(log.latest.hash.substring(0, 7), saved_hash);
                done();
            }).catch(function (err) {
                done(err);
            });
        });
    });
});
