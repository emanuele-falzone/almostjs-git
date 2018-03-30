/*jslint node: true, nomen: true*/
"use strict";

var createGit = require('simple-git/promise');

function Git(repository) {
    if (!(this instanceof Git)) { return new Git(repository); }
    this._git = createGit(repository).silent(true);
}

Git.prototype.apply = function (patch) {
    return this._git.raw(['apply', patch]);
};

Git.prototype.addAll = function () {
    return this._git.add(['-A']);
};

Git.prototype.rm = function (file) {
    return this._git.rm([file]);
};

Git.prototype.addAllAndCommit = function (messages) {
    var self = this;
    return this.addAll().then(function () {
        return self.commit(messages);
    });
};

Git.prototype.deleteBranch = function (name) {
    return this._git.branch(['-D', name]);
};

Git.prototype.diff = function (from, to) {
    return this._git.diff([from + '..' + to, '--full-index', '--binary']);
};

Git.prototype.commit = function (messages) {
    return this._git.commit(messages);
};

Git.prototype.status = function () {
    return this._git.status();
};

Git.prototype.rebase = function (branch) {
    return this._git.rebase([branch]);
};

Git.prototype.continueRebase = function () {
    return this._git.rebase(['--continue']);
};

Git.prototype.abortRebase = function () {
    return this._git.rebase(['--abort']);
};

Git.prototype.skipRebase = function () {
    return this._git.rebase(['--skip']);
};

Git.prototype.log = function () {
    return this._git.log({
        format: {
            hash: '%H',
            date: '%ai',
            description: '%b'
        }
    });
};

Git.prototype.init = function () {
    return this._git.init();
};

Git.prototype.checkout = function (identifier) {
    return this._git.checkout(identifier);
};

Git.prototype.checkoutLocalBranch = function (identifier) {
    return this._git.checkoutLocalBranch(identifier);
};

Git.prototype.setTopLevel = function () {
    var self = this;
    return this._git.revparse([
        '--show-toplevel'
    ]).then(function (root) {
        return root.trim();
    }).then(function (root) {
        return self._git.cwd(root);
    });
};

Git.prototype.getTopLevel = function () {
    return this._git.revparse([
        '--show-toplevel'
    ]).then(function (root) {
        return root.trim();
    });
};

Git.prototype.isCleanRepo = function () {
    return this._git.status().then(function (status) {
        return status.files.length === 0;
    });
};

Git.prototype.checkIsRepo = function () {
    return this._git.checkIsRepo();
};

Git.prototype.clean = function () {
    return this._git.clean('f');
};

exports.Git = Git;
exports.createGit = createGit;
