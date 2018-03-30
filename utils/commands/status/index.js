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

function parse() {
    return commandLineArgs(options, {
        partial: true
    });
}

exports.parse = parse;
