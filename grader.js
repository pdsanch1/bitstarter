#!/usr/bin/env node
/* 
Automatically grades files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaching command line application development and 
basic DOM parsing.

References:


+ cheerio
    - https://github.com/MatthewMueller/cheerio
    - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
    - http://maxogden.com/scraping-with-node.html

+ commander.js
    - https://github.com/visionmedia/commander.js
    - https://github.com/pdsanch1/bitstarter/blob/96da1d608d1a6498c7d2ad794003cf66db1c66c7/index.html
+ JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var sys  = require('util');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://www.listin.com.do" 
        
var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting", instr);
	process.exit(1); //  http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function (htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
      var present = $(checks[ii]).length > 0;
      out[checks[ii]] = present;
    }	
    return out;
};
var checkUrl = function (url, checksfile) {
    $ = cheerio.load(url);  
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
      var present = $(checks[ii]).length > 0;
      out[checks[ii]] = present;
    }	
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var assertUrlExists = function(val) { return val.toString();}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL name for desired URL')
        .parse(process.argv);

    if (program.url) {
        rest.get(program.url).on('complete', function(result) {
            var checkJson = checkUrl(result, program.checks);
            var outJson = JSON.stringify(checkJson, null, 4);
            console.log(outJson);
        });
    }
    else {
        var checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    };
} else {
    exports.checkHtmlFile = checkHtmlFile;
};

