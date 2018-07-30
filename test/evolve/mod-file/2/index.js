var Git = require('simple-git/promise'),
    assert = require('assert'),
    path = require('path'),
    fse = require('fs-extra'),
    tmp = require('tmp-promise'),
    lib = require('../../../../lib'),
    testUtils = require('../../../utils');

describe('test/evolve/mod-file/2 two manual commit with conflicts', function () {
    var repoPath,
        status,
        m0Path = path.join(__dirname, 'm0'),
        f0Path = path.join(__dirname, 'f0'),
        f1Path = path.join(__dirname, 'f1'),
        m1Path = path.join(__dirname, 'm1'),
        finalPath = path.join(__dirname, 'final'),
        rebasePath = path.join(__dirname, 'rebase'),
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
            return testUtils.commit(repoPath, f1Path)
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
            return git.checkout('HEAD~2');
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
                    done(new Error('is should not reach this state'));
                }).catch(function (error) {
                    done();
                });
        });

        it('should not leave a clean repository', function (done) {
            git.status().then(function (status) {
                assert.deepEqual(status, {
                    not_added: [],
                    conflicted: [
                        'a.txt',
                        'b.txt'
                    ],
                    created: [],
                    deleted: [],
                    modified: [],
                    renamed: [],
                    staged: [],
                    files: [
                        {
                            'index': 'U',
                            'path': 'a.txt',
                            'working_dir': 'U'
                        },
                        {
                            'index': 'U',
                            'path': 'b.txt',
                            'working_dir': 'U'
                        }
                    ],
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

        it('should reach the rebase state', function (done) {
            testUtils.assertDifferent(repoPath, rebasePath, '.git').then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('status should be a CONFLICTED', function (done) {
            status.status().then(function (status) {
                assert.deepEqual(status, 'CONFLICTED');
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        describe('resolve conflicts and try to terminate', function () {

            beforeEach(function (done) {
                fse.copy(path.join(finalPath, 'b.txt'), path.join(repoPath, 'b.txt')).then(function () {
                    return fse.copy(path.join(finalPath, 'a.txt'), path.join(repoPath, 'a.txt'));
                }).then(function () {
                    return git.add('-A');
                }).then(function () {
                    return lib.evolve.continue(repoPath);
                }).then(function () {
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

            it('should preserve the second Feature commit', function (done) {
                git.checkout('HEAD~2').then(function () {
                    return testUtils.assertDifferent(repoPath, f1Path, '.git');
                }).then(function () {
                    done();
                }).catch(function (err) {
                    done(err);
                });
            });

            it('should preserve the first Feature commit', function (done) {
                git.checkout('HEAD~3').then(function () {
                    return testUtils.assertDifferent(repoPath, f0Path, '.git');
                }).then(function () {
                    done();
                }).catch(function (err) {
                    done(err);
                });
            });

            it('should preserve the Initial Model commit', function (done) {
                git.checkout('HEAD~4').then(function () {
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
});
