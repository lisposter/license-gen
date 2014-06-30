#! /usr/bin/env node

//var licenseTpls = require('./lib/license_tpl.json');
var prompt = require("prompt");
var program = require('commander');

var packageInfo = require('./package.json');
var args = process.argv.slice(2);

if(args.length <= 0) {
    doAsk();
} else if('-'.indexOf(args.join('') < 0) && args.indexOf('version') < 0) {
    //doMatch();
} else {
    program
        .description('Use this command to generate a license file.')
        .version(packageInfo.version)
        .option('-a, --author <author>', 'Your name.')
        .option('-y, --year <year>', 'Year used in your license.', new Date().getFullYear())
        .option('-p, --project <project>', 'Project\'s name', packageInfo.name)
        .parse(process.argv);


    console.log(program.author, program.year, program.project)
}


function doAsk() {
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
        console.log(result);
    })

}


function doMatch() {
    
}