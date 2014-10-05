'use strict';
var fs = require('fs');
var path = require('path');

var _ = require('underscore');

var licenseTpls = require('./lib/license_tpl.json');


function genLice(licenseType, config, callback) {
    var license = licenseTpls[licenseType.trim().toLowerCase()];

    var location = './LICENSE';

    if(config._path) {
        location = path.resolve(config._path, './LICENSE');
    }

    var ws = fs.createWriteStream(location, {
        flags: 'w',
        encoding: 'utf8'
    });

    var compiled = _.template(license.body);
    ws.end(compiled(config));

    ws.on('finish', function(err, result) {
        callback(err, result);
    });
}

module.exports = exports.genLicense = genLice;
