var Git = require('simple-git/promise'),
    assert = require('assert'),
    path = require('path'),
    fse = require('fs-extra'),
    tmp = require('tmp-promise'),
    lib = require('../../../lib'),
    testUtils = require('../../utils');

describe('test/custom/1 same model', function () {
    var repoPath,
        status,
        m0Path = path.join(__dirname, 'm0'),
        f0Path = path.join(__dirname, 'f0'),
        m1Path = path.join(__dirname, 'm1');

    beforeEach(function (done) {
        tmp.dir().then(function (folder) {
            repoPath = folder.path;
            status = new lib.Status(repoPath);
            git = Git(repoPath);
            return fse.copy(m0Path, repoPath);
        }).then(function () {
            return lib.init(repoPath)
        }).then(function () {
            return testUtils.commit(repoPath,f0Path)
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

    it('status should be a READY', function (done) {
        status.status().then(function (status) {
            assert.deepEqual(status, 'READY');
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('should throw when call init', function (done) {
        lib.init().then(function () {
            done(new Error('it should not reach this state'));
        }).catch(function () {
            done();
        });
    });

    it('should throw when call evolve.continue', function (done) {
        lib.evolve.continue(repoPath).then(function () {
            done(new Error('it should not reach this state'));
        }).catch(function () {
            done();
        });
    });
    
    it('should throw when call evolve.abort', function (done) {
        lib.evolve.abort(repoPath).then(function () {
            done(new Error('it should not reach this state'));
        }).catch(function () {
            done();
        });
    });

    it('should throw when call evolve.finalize', function (done) {
        lib.evolve.finalize(repoPath).then(function () {
            done(new Error('it should not reach this state'));
        }).catch(function () {
            done();
        });
    });

    describe('perform evolution', function () {
        beforeEach(function (done) {
            lib.evolve.init(repoPath, m1Path)
                .then(function () {
                    done(new Error('it shold not reach this state'));
                }).catch(function () {
                    done();
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
    
        it('should throw when call init', function (done) {
            lib.init(repoPath).then(function () {
                done(new Error('it should not reach this state'));
            }).catch(function () {
                done();
            });
        });
    
        it('should throw when call evolve.init', function (done) {
            lib.evolve.init(repoPath, m1Path).then(function () {
                done(new Error('it should not reach this state'));
            }).catch(function () {
                done();
            });
        });
    });
});
