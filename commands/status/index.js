/*jslint node: true, nomen: true*/
"use strict";

var Git = require('../../lib').Git,
    utils = require('../../utils');

function code(folder) {
    var git = new Git(folder);
    return git.checkIsRepo().then(function (isRepo) {
        if (isRepo) {
            return git.getTopLevel().then(function (root) {
                return utils.fs.readAlmostFile(root);
            }).then(function (obj) {
                return {
                    description: 'evolving',
                    branches: {
                        tmp: obj.branches.tmp,
                        final: obj.branches.final
                    }
                };
            }).catch(function () {
                return {
                    description: 'not evolving'
                };
            });
        }
        return {
            description: 'not a repository'
        };
    });
}

function printable(folder) {
    return code(folder).then(function (status) {
        switch (status.description) {
        case 'not a repository':
            return 'This is not a Git repository.\n' +
                '$ almost-git init\n' +
                'to initialize a new repository';
        case 'evolving':
            return 'There is an active evolution procedure\n' +
                'Two local branches have been created to complete the evolution process:\n' +
                status.branches.tmp + '\n' +
                status.branches.final + '\n' +
                '\n' +
                'Please fix conflicts and then run\n' +
                '$ almost-git evolve --continue\n' +
                'to continue the evolving process';
        case 'not evolving':
            return 'There is no active evolution procedure\n' +
                '$ almost-git evolve <src>\n' +
                'to start a new evolution process';
        }
    });
}

exports.code = code;
exports.printable = printable;
