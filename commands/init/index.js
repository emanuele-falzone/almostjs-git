/*jslint node: true, nomen: true*/
"use strict";

var Git = require('../../lib').Git;

function initialize(folder) {
    var git = new Git(folder);
    return git.checkIsRepo()
        .then(function (isRepo) {
            if (!isRepo) {
                return git.init().then(function () {
                    return git.addAllAndCommit(['Initial version', 'Model']);
                });
            }
            throw new Error('This is already a git repository!');
        });
}

module.exports = initialize;
