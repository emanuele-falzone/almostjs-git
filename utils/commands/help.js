/*jslint node: true, nomen: true*/
"use strict";

var commandLineUsage = require('command-line-usage');

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
            '$ evolve'
        ]
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'varsion',
                description: 'Print the version.'
            },
            {
                name: 'help',
                description: 'Print this usage guide.'
            }
        ]
    }
];


function help() {
    return commandLineUsage(sections);
}

exports.help = help;
