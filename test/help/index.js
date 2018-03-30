/*jslint node: true, nomen: true*/
/*globals describe, it, beforeEach, afterEach, __dirname*/
"use strict";

var assert = require('assert'),
    utils = require('../../utils');

describe('Get help string', function () {

    it('should get general help', function (done) {
        assert.equal(typeof utils.commands.help(), 'string');
        done();
    });
    it('should get help for init command', function (done) {
        assert.equal(typeof utils.commands.init.help(), 'string');
        done();
    });
    it('should get help for evolve command', function (done) {
        assert.equal(typeof utils.commands.evolve.help(), 'string');
        done();
    });
});
