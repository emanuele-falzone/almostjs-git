/*jslint node: true, nomen: true*/
"use strict";

var fs = require('fs'),
    fstream = require('fstream'),
    unzip = require('unzip');

function unzip(zipPath, outputPath) {
    outputPath = outputPath || './';
    var readStream = fs.createReadStream(zipPath),
        writeStream = fstream.Writer(outputPath);
    return readStream
        .pipe(unzip.Parse())
        .pipe(writeStream);
}

exports.unzip = unzip;
