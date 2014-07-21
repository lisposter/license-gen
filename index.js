#! /usr/bin/env node

var fs = require('fs');
var exec = require('child_process').exec;
var prompt = require("prompt");
var program = require('commander');
var _ = require('underscore');
var async = require('async');

try {
    var packageInfo = require(process.cwd() + '/package.json');
} 
catch (e) {
    var packageInfo = {};
}
var licenseTpls = require('./lib/license_tpl.json');
var args = process.argv.slice(2);


var config = {};
// handle th cmd-line logical and parse options.
if(args.length <= 0) {
    async.waterfall([
        function(callback) {
            promptBasic(function(err, result) {
                if(err) return console.error(err)
                callback(null, result);
            })
        },
        function(config, callback) {
            promptChooseLicense(function(err, licenses) {
                if(err) return console.error(err)
                if(licenses.length <= 0) return console.error('Sorry, no advice.')
                if(licenses.length === 1) {
                    prompt.message = "license-gen!".cyan;
                    prompt.delimiter = " ".green;
                    prompt.start();

                    prompt.get({
                        name: 'value',
                        message: 'Seems ' + licenses[0] + ' is satisfied your requirement, press return key to generate it.',
                        validator: /y[es]*|n[o]?/,
                        warning: 'Must respond yes or no',
                        default: 'y'
                    }, function(err, result) {
                        if(test(result.value)) {
                            genLice(licenses[0], config, function(err, result) {
                                if(err) console.error(err);
                                console.log('LICENSE has been generated!');
                            })
                        }
                    })
                } else {
                    prompt.message = "license-gen!".cyan;
                    prompt.delimiter = " ".green;
                    prompt.start();

                    prompt.get({
                        name: 'value',
                        message: 'Seems ' + licenses.join() + ' are satisfied your requirement, Please choose one of them.',
                        warning: 'Must respond yes or no',
                        default: licenses[0]
                    }, function(err, result) {
                        if(licenses.indexOf(result.value) < 0) return console.error('You may input the wrong license');
                        genLice(result.value, config, function(err, result) {
                            if(err) console.error(err);
                            console.log('LICENSE has been generated!');
                        })
                    })
                }
            });
        }
    ]);
} else if(args.join('').indexOf('-') < 0 && args.indexOf('version') < 0) {
    async.waterfall([
        function(callback) {
            doMatch(null, function(err, result) {
                if(err) return console.log(err.msg);
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
    async.waterfall([
        function(callback) {

            getBasicInfo(function(err, config, remainArgs) {
                if(remainArgs.length <= 0) {

                    prompt.message = "license-gen!".cyan;
                    prompt.delimiter = " ".green;
                    prompt.start();

                    prompt.get({
                        properties: {
                            license: {
                                description: 'Input the license type you want to use.',
                                required: true
                            }
                        }
                    }, function(err, result) {
                        if(err) throw err;
                        callback(null, config, result.license, remainArgs);
                    })
                } else {
                    callback(null, config, null, remainArgs);
                }
            });
        },
        function(config, licenseType, remainArgs, callback) {
            if(!licenseType) {
                doMatch(remainArgs, function(err, result) {
                    if(err) return console.error(err.msg);
                    callback(null, result, config);
                })
            } else {
                callback(null, licenseType, config);
            }
        },
        function(licenseType, config, callback) {
            genLice(licenseType, config, function(err, result) {
                if(err) console.error(err);
                console.log('LICENSE has been generated!');
            })
        }
    ]);
}

function test(str) {
    var TRUERE = /y/i;
    var FALSERE = /n/i;

    if(TRUERE.test(str)) return true;
    if(FALSERE.test(str)) return false;
}

function getBasicInfo(callback) {
    async.waterfall([
        function(callback) {
            var config = {};

            config.project = __dirname.split('/').pop();

            // if neither [-a] arg provided nor author info in package.json, use git config insteed.
            // TODO, if none of these specify an author name.
            exec('git config --get user.name', function(err, stdout, stderr) {
                if(err) {
                    config.author = ''
                }
                config.author = stdout.replace(/[\n\r]/g, '');
                callback(null, config);
            })
        },
        function(config, callback) {
            program
                .description('Use this command to generate a license file.')
                .version(packageInfo.version)
                .option('-a, --author <author>', 'Your name.', config.author || '')
                .option('-y, --year <year>', 'Year used in your license.', new Date().getFullYear())
                .option('-p, --project <project>', 'Project\'s name', packageInfo.name)
                .parse(process.argv);

            configCli = {}

            if(program.author) configCli.author = program.author
            if(program.year) configCli.year = program.year
            if(program.project) configCli.project = program.project

            config = _.extend(config, configCli)

            remainArgs = program.args;

            callback(null, config, remainArgs);
        }
    ], function(err, result, remainArgs) {
        callback(err, result, remainArgs);
    });
}

function promptBasic(callback) {
    prompt.message = "license-gen!".cyan;
    prompt.delimiter = " ".green;
    prompt.start();

    prompt.get({
        properties: {
            author: {
                description: "Input your name.",
                message: 'You must specify your name',
                required: true,
                default: packageInfo.author || ''
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
        if(err) return console.log(err);
        callback(err, result);
    })

}

function promptChooseLicense(callback) {

    var condition = {};

    prompt.message = "license-gen:".cyan;
    prompt.delimiter = " ".green;
    var properties = {
        dontCare: {
            name: 'value',
            message: 'I don\'t care what they will do with my code?',
            validator: /y[es]*|n[o]?/,
            default: 'n'
        },
        isCode: {
            name: 'value',
            message: 'Is your content code?',
            validator: /y[es]*|n[o]?/,
            warning: 'Must respond yes or no',
            default: 'y'
        },
        modSameLicense: {
            name: 'value',
            message: 'Should be issued under the same license?',
            validator: /y[es]*|n[o]?/,
            warning: 'Must respond yes or no',
            default: 'y'
        },
        linkedInSameLicense: {
            name: 'value',
            message: 'All linked works must be issued under the same license?',
            validator: /y[es]*|n[o]?/,
            warning: 'Must respond yes or no',
            default: 'y'
        },
        plpb: {
            name: 'value',
            message: 'Prohibit DRM, locaked-down firmware, patent suits; broader license compatibility?',
            validator: /y[es]*|n[o]?/,
            warning: 'Must respond yes or no',
            default: 'y'
        },
        containInfo: {
            name: 'value',
            message: 'Every file must contain all information about changes, copyrights and patents. Patent Protection?',
            validator: /y[es]*|n[o]?/,
            warning: 'Must respond yes or no',
            default: 'y'
        },
        prohibit: {
            name: 'value',
            message: 'Prohibit use of copyright holder\'s name for promotion?',
            validator: /y[es]*|n[o]?/,
            warning: 'Must respond yes or no',
            default: 'y'
        }
    }
    prompt.start();

    prompt.get(properties.dontCare, function(err, result) {
        if(err) return console.error(err);
        if(test(result.value)) return callback(null, ['wtfpl', 'cc0']);

        // prompt.get(properties.isCode, function(err, result) {
        //     if(err) return console.error(err);
        //     if(!test(result.value)) return callback(null, ['Creative Commons']);  
        // });

        prompt.get(properties.modSameLicense, function(err, result) {
            if(err) return console.error(err);
            if(test(result.value)) {
                prompt.get(properties.linkedInSameLicense, function(err, result) {
                    if(err) return console.error(err);
                    if(test(result.value)) {
                        prompt.get(properties.plpb, function(err, result) {
                            if(err) return console.error(err);
                            if(test(result.value)) {
                                return callback(null, ['gpl3']);
                            } else {
                                return callback(null, ['gpl2']);
                            }
                        });
                    } else {
                        prompt.get(properties.plpb, function(err, result) {
                            if(err) return console.error(err);
                            if(test(result.value)) {
                                return callback(null, ['lgpl']);
                            } else {
                                return callback(null, ['mpl']);
                            }
                        });
                    } 
                });
            } else {
                prompt.get(properties.containInfo, function(err, result) {
                    if(err) return console.error(err);
                    if(test(result.value)) {
                        return callback(null, ['apache']);
                    } else {
                        prompt.get(properties.prohibit, function(err, result) {
                            if(err) return console.error(err);
                            if(test(result.value)) {
                                return callback(null, ['bsd3']);
                            } else {
                                return callback(null, ['mit', 'bsd2']);
                            }
                        });
                    }
                });
            }
        });

    });
}

// match the arguments to test if there is a supported license type
function doMatch(arr, callback) {
    var licenses = Object.keys(licenseTpls);
    var matachedIdx = '';
    arr = arr || args;

    var matached = licenses.some(function(element, idx, originArr) {
        matachedIdx = idx;
        return arr.indexOf(element) >= 0;
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
