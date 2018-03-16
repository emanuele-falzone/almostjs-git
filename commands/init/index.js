/*jslint node: true, nomen: true*/
"use strict";

var createGit = require('simple-git/promise');

function initialize(folder) {
    folder = folder || './';
    var git = createGit(folder);
    return git.checkIsRepo()
        .then(function (isRepo) {
            if (!isRepo) {
                return git.init().then(function(){
                    return git.add(['-A']);
                }).then(function(){
                    return git.commit(['Initial version', 'Model']);
                });
            }
            throw new Error('This is already a git repository!');
        });
}

exports.initialize = initialize;
