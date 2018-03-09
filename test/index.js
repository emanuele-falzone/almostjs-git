/*jslint node: true, nomen: true*/
"use strict";

var assert = require('assert'),
    lib = require('../lib');

describe('Test', function () {
    it('should pass', function () {
        assert.equal(lib.alwaysTrue(), true);
    });
});
