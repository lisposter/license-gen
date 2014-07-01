#! /usr/bin/env node

var fs = require('fs');
var exec = require('child_process').exec;
var prompt = require("prompt");
var program = require('commander');
var _ = require('underscore');
var async = require('async');

var packageInfo = require('./package.json');
var licenseTpls = require('./lib/license_tpl.json');
var args = process.argv.slice(2);

var config = {};
// handle th cmd-line logical and parse options.
if(args.length <= 0) {
    doAsk();
} else if(args.join('').indexOf('-') < 0 && args.indexOf('version') < 0) {
    async.waterfall([
        function(callback) {
            doMatch(function(err, result) {
                if(err) console.log(err.msg);
                callback(null, result);
            })
        },
        function(licenseType, callback) {
            getBasicInfo(function(err, result) {
                callback(null, licenseType, result);
            })
        },
        function(licenseType, config, callback) {
            genLice(licenseType, config, function(err, result) {
                if(err) console.error(err);
                console.log('LICENSE has been generated!');
            })
        }
    ]);
} else {
    getBasicInfo();
}

function getBasicInfo(callback) {
    async.waterfall([
        function(callback) {
            program
                .description('Use this command to generate a license file.')
                .version(packageInfo.version)
                .option('-a, --author <author>', 'Your name.', packageInfo.author)
                .option('-y, --year <year>', 'Year used in your license.', new Date().getFullYear())
                .option('-p, --project <project>', 'Project\'s name', packageInfo.name)
                .parse(process.argv);

            config = {
                author: program.author,
                year: program.year,
                project: program.project
            };

            callback(null, config);
        },
        function(config, callback) {

            // if no project name in package.json, use dir name insteed.
            if(!config.project) {
                config.project = __dirname.split('/').pop();
            }

            // if neither [-a] arg provided nor author info in package.json, use git config insteed.
            // TODO, if none of these specify an author name.
            if(!config.author) {
                exec('git config --get user.name', function(err, stdout, stderr) {
                    if(err) throw err;
                    config.author = stdout.replace(/[\n\r]/g, '');
                    callback(null, config);
                })
            } else {
                callback(null, config);
            }
        }
    ], function(err, result) {
        callback(err, result);
    });
}

function doAsk(callback) {
    prompt.message = "license-gen!".cyan;
    prompt.delimiter = " ".green;
    prompt.start();

    prompt.get({
        properties: {
            author: {
                description: "Input your name.",
                message: 'You must specify your name',
                required: true
            },
            year: {
                type: 'number',
                description: "Input the year to used inyour license.",
                message: "You should input a number or leave blank to use current year.",
                default: new Date().getFullYear()
            },
            project: {
                description: "Input the project\'s name.",
                default: packageInfo.name
            }
        }
    }, function(err, result) {
        callback(err, result);
    })

}

// match the arguments to test if there is a supported license type
function doMatch(callback) {
    var licenses = Object.keys(licenseTpls);
    var matachedIdx = '';

    var matached = licenses.some(function(element, idx, arr) {
        matachedIdx = idx;
        return args.indexOf(element) >= 0;
    })

    if(matached) {
        callback(null, licenses[matachedIdx]); 
    } else {
        callback({
            code: '001',
            msg: 'license not supported'
        }, matachedIdx)
    }
    
}

function genLice(licenseType, config, callback) {
    var license = licenseTpls[licenseType];
    var ws = fs.createWriteStream('./LICENSE', {
        flags: 'w',
        encoding: 'utf8'
    });

    var compiled = _.template(license.body);
    

    ws.end(compiled(config));

    ws.on('finish', function(err, result) {
        callback(err, result);
    })
}