var lib = require('../../../lib')

describe('test/custom/2 parameter check function call', function () {

    describe('parameter check on init', function () {
        it('should throw when called without parameter', function (done) {
            lib.init().then(function () {
                done(new Error('it should not reach this state'));
            }).catch(function () {
                done();
            });
        });
    });

    describe('parameter check on evolve.init', function () {

        it('should throw when called without parameter', function (done) {
            lib.evolve.init().then(function () {
                done(new Error('it should not reach this state'));
            }).catch(function () {
                done();
            });
        });

        it('should throw when called with one parameter', function (done) {
            lib.evolve.init('repositorypath').then(function () {
                done(new Error('it should not reach this state'));
            }).catch(function () {
                done();
            });
        });

    });

    describe('parameter check on evolve.continue', function () {

        it('should throw when called without parameter', function (done) {
            lib.evolve.continue().then(function () {
                done(new Error('it should not reach this state'));
            }).catch(function () {
                done();
            });
        });

    });

    describe('parameter check on evolve.abort', function () {

        it('should throw when called without parameter', function (done) {
            lib.evolve.abort().then(function () {
                done(new Error('it should not reach this state'));
            }).catch(function () {
                done();
            });
        });

    });

    describe('parameter check on evolve.finalize', function () {

        it('should throw when called without parameter', function (done) {
            lib.evolve.finalize().then(function () {
                done(new Error('it should not reach this state'));
            }).catch(function () {
                done();
            });
        });

    });
});
