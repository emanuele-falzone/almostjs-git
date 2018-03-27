/*jslint node: true, nomen: true*/
"use strict";

var commandLineUsage = require('command-line-usage');

var sections = [
    {
        header: 'ALMOsT-Git'
    },
    {
        header: 'Synopsis',
        content: '$ almost-git evolve [arguments|options]'
    },
    {
        header: 'Arguments',
        optionList: [
            {
                name: 'src',
                description: 'The folder containing the files generated from the new model.',
                defaultOption: true,
                type: String,
                typeLabel: '{underline folder}'
            }
        ]
    },
    {
        header: 'Options',
        optionList: [
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
        ]
    }
];


function help() {
    return commandLineUsage(sections);
}

exports.help = help;
