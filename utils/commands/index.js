/*jslint node: true, nomen: true*/
"use strict";

var _ = require('lodash'),
    commandLineArgs = require('command-line-args'),
    commandLineUsage = require('command-line-usage'),
    init = require('./init'),
    evolve = require('./evolve'),
    status = require('./status');

var options = [
    {
        name: 'command',
        description: 'Print the help',
        defaultOption: true,
        type: String
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print the help'
    },
    {
        name: 'version',
        alias: 'v',
        type: Boolean,
        description: 'Print the version'
    }
];

var sections = [
    {
        header: 'ALMOsT-Git'
    },
    {
        header: 'Synopsis',
        content: '$ almost-git <command> [options]'
    },
    {
        header: 'Command List',
        content: [
            '$ init',
            '$ evolve',
            '$ status'
        ]
    },
    {
        header: 'Options',
        optionList: _(options).filter(function (option) {
            return option.name !== 'command';
        }).value()
    }
];

function help() {
    return commandLineUsage(sections);
}

// istanbul ignore next 
function parse() {
    return commandLineArgs(options, {
        partial: true
    });
}

exports.help = help;
exports.parse = parse;
exports.init = init;
exports.evolve = evolve;
exports.status = status;
