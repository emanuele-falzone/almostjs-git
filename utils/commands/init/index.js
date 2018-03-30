/*jslint node: true, nomen: true*/
"use strict";

var commandLineArgs = require('command-line-args'),
    commandLineUsage = require('command-line-usage');

var options = [
    {
        name: 'help',
        alias: 'h',
        description: 'Print this usage guide.',
        type: Boolean
    }
];

var sections = [
    {
        header: 'ALMOsT-Git'
    },
    {
        header: 'Synopsis',
        content: '$ almost-git init'
    },
    {
        header: 'Description',
        content: 'Inititialize a new repository'
    },
    {
        header: 'Options',
        optionList: options
    }
];

function help() {
    return commandLineUsage(sections);
}

function parse() {
    return commandLineArgs(options, {
        partial: true
    });
}

exports.help = help;
exports.parse = parse;
