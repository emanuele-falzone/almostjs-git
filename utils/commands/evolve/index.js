/*jslint node: true, nomen: true*/
"use strict";

var commandLineArgs = require('command-line-args'),
    commandLineUsage = require('command-line-usage');

var options = [
    {
        name: 'src',
        alias: 's',
        description: 'The folder containing the files generated from the new model.',
        defaultOption: true,
        type: String,
        typeLabel: '{underline folder}'
    },
    {
        name: 'abort',
        alias: 'a',
        description: 'Abort the evolution process.',
        type: Boolean
    },
    {
        name: 'continue',
        alias: 'c',
        description: 'Continue the evolution process.',
        type: Boolean
    },
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
        content: '$ almost-git evolve [options]'
    },
    {
        header: 'Description',
        content: 'Allow you to automatically evolve the code. '
            + 'You may be asked to manually fix some conflicts during the evolution process.'
    },
    {
        header: 'Examples',
        content: [
            '$ almost-git evolve ~/generated',
            '$ almost-git evolve --continue',
            '$ almost-git evolve --abort',
        ]
    },
    {
        header: 'Options',
        optionList: options
    }
];

function help() {
    return commandLineUsage(sections);
}

// istanbul ignore next 
function parse(argv) {
    return commandLineArgs(options, {
        argv: argv,
        partial: true
    });
}

exports.help = help;
exports.parse = parse;
