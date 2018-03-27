/*jslint node: true*/
"use strict";

var utils = require('./utils'),
    commands = require('./commands'),
    createGit = require('simple-git/promise'),
    commandLineArgs = require('command-line-args'),
    pjson = require('./package.json');

var mainDefinitions = [
    {
        name: 'command',
        defaultOption: true
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean
    },
    {
        name: 'version',
        alias: 'v',
        type: Boolean
    }
];

var mainOptions = commandLineArgs(mainDefinitions, {
    partial: true
});

if (mainOptions.help) {
    return console.log(utils.commands.help.help());
}
if (mainOptions.version) {
    console.log('Version: ' + pjson.version);
    return;
}

var argv = mainOptions._unknown || [];

if (mainOptions.command === 'init') {
    commands.init.initialize('./').then(function () {
        console.log("Git repository initialized!");
    }).catch(function (err) {
        console.log(err);
        console.log('Invalid Command!');
        console.log(utils.commands.help.help());
    });
}

if (mainOptions.command === 'evolve') {

    utils.git.isRepository().then(function (isRepo) {
        if (isRepo) {
            return utils.git.isRebasing('./')
        }
        throw new Error('This is not a git repository!');
    }).then(function (rebasing) {
        if (rebasing) {
            var definitions = [{
                    name: 'continue',
                    alias: 'c',
                    type: Boolean
                }],
                options = commandLineArgs(definitions, {
                    argv: argv,
                    partial: true
                });

            if (options.continue) {
                return createGit().rebase(['--continue']).then(function () {
                    commands.evolve.end('./');
                });
            }
            throw new Error('USAGE: evolve --continue');

        } else {
            var definitions = [{
                    name: 'dir',
                    defaultOption: true
                }],
                options = commandLineArgs(definitions, {
                    argv: argv,
                    partial: true
                });

            if (options.dir) {
                return commands.evolve.start('./', options.dir);
            }
            throw new Error('USAGE: evolve <dir>');

        }
    }).catch(function (err) {
        console.log(err);
        console.log('Invalid Command!');
        console.log(utils.commands.help.help());
    });

}
