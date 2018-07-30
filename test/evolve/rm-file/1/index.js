var Git = require('simple-git/promise'),
    assert = require('assert'),
    path = require('path'),
    fse = require('fs-extra'),
    tmp = require('tmp-promise'),
    lib = require('../../../../lib'),
    testUtils = require('../../../utils');

describe('test/evolve/rm-file/1 three manual commit with conflicts', function () {
    var repoPath,
        status,
        m0Path = path.join(__dirname, 'm0'),
        f0Path = path.join(__dirname, 'f0'),
        f1Path = path.join(__dirname, 'f1'),
        f2Path = path.join(__dirname, 'f2'),
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
            return testUtils.commit(repoPath, f2Path)
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
            return git.checkout('HEAD~3');
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
                    conflicted: [],
                    created: [],
                    deleted: [],
                    renamed: [],
                    files: [
                        {
                            index: "D",
                            path: "a.txt",
                            working_dir: "U"
                        },
                        {
                            index: "D",
                            path: "b.txt",
                            working_dir: "U"
                        },
                        {
                            index: "D",
                            path: "c.txt",
                            working_dir: "U"
                        },
                        {
                            index: "M",
                            path: "d.txt",
                            working_dir: " "
                        }
                    ],
                    modified: [
                        "d.txt"
                    ],
                    ahead: 0,
                    behind: 0,
                    staged: [
                        "d.txt"
                    ],
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

        describe('solve conflicts', function () {

            beforeEach(function (done) {
                var a_path = path.join(repoPath, 'a.txt'),
                    b_path = path.join(repoPath, 'b.txt'),
                    c_path = path.join(repoPath, 'c.txt');

                fse.remove(a_path).then(function () {
                    return fse.remove(b_path)
                }).then(function () {
                    return fse.remove(c_path)
                }).then(function () {
                    return git.add(['-A'])
                }).then(function () {
                    return lib.evolve.continue(repoPath);
                }).then(function () {
                    done()
                }).catch(function (s) {
                    console.log(s);
                    done(new Error('it should not reach this state 2'));
                })
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
