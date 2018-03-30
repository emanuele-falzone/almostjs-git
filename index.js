/*jslint node: true*/
"use strict";

var Promise = require('bluebird'),
    utils = require('./utils'),
    commands = require('./commands'),
    packagejson = require('./package.json');

function parseInit() {
    return commands.init('./').then(function () {
        return 'Repository correctly initialized!';
    }).catch(function (err) {
        return 'Error: ' + err.message;
    });
}

function parseStatus() {
    return commands.status.printable().then(function (status) {
        return status;
    });
}

function parseEvolve(argv) {
    var parser = utils.commands.evolve.parse(argv);
    function evolving() {
        if (parser.continue) {
            return commands.evolve.end('./').then(function (success) {
                if (success) {
                    return 'Evolution completed!';
                }
                return 'Please fix current conflicts!\nThen run almost-git evolve --continue!';
            });
        }
        if (parser.abort) {
            return commands.evolve.abort('./').then(function () {
                return 'Evolution aborted!';
            });
        }
        return utils.commands.evolve.help();
    }

    function notEvolving() {
        if (parser.src) {
            return commands.evolve.start('./', parser.src).then(function (success) {
                if (success) {
                    return 'Evolution completed!';
                }
                return 'Please fix current conflicts!\nThen run almost-git evolve --continue!';
            });
        }
        return utils.commands.evolve.help();
    }

    return commands.status.code().then(function (status) {
        switch (status.description) {
        case 'evolving':
            return evolving();
        case 'not evolving':
            return notEvolving();
        default:
            return utils.commands.evolve.help();
        }
    });
}

function parse() {
    var main = utils.commands.parse(),
        argv = main._unknown || [];
    if (main.version) {
        return packagejson.version;
    }
    if (main.help) {
        switch (main.command) {
        case 'init':
            return utils.commands.init.help();
        case 'evolve':
            return utils.commands.evolve.help(argv);
        default:
            return utils.commands.help();
        }
    }
    if (main.command) {
        switch (main.command) {
        case 'init':
            return parseInit();
        case 'evolve':
            return parseEvolve(argv);
        case 'status':
            return parseStatus();
        default:
            return utils.commands.help();
        }
    }
}

var result = parse();

Promise.resolve(result).then(function (log) {
    console.log(log);
}).catch(function (err) {
    console.log('This should never happen! =(');
});
