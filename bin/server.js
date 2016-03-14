#!/usr/bin/env node

var http = require('http');
var url = require('url');
var colors = require('colors');
var Busboy = require('busboy');

var argv = require('yargs')
	.usage('Usage: $0 -p [num]')
	.alias('p', 'port')
	.default('p', 3000)
	.describe('p', 'Set port on which mirror-server should listen')
	.help('h')
	.alias('h', 'help')
	.argv;


var ignore = [
	'/favicon.ico'
];

var DEFAULT_STATUS_CODE = 200;
var DEFAULT_CONTENT_TYPE = 'application/json';
var DEFAULT_SLEEP = 0;

var MAX_SLEEP = 5000;


var processRequest = function(request, response, data, files)
{
	var statusCode = DEFAULT_STATUS_CODE;
	var contentType = DEFAULT_CONTENT_TYPE;
	var sleep = DEFAULT_SLEEP;

	if (typeof data['statusCode'] !== 'undefined') {
		statusCode = data['statusCode'];
		delete data['statusCode'];
	}

	if (typeof data['contentType'] !== 'undefined') {
		contentType = data['contentType'];
		delete data['contentType'];
	}

	if (typeof data['sleep'] !== 'undefined') {
		sleep = parseInt(data['sleep']);
		delete data['sleep'];
	}

	if (typeof data['response'] !== 'undefined') {
		data = data['response'];
	}

	if (sleep > MAX_SLEEP) {
		throw new Error(request.method + ' ' + request.url + ': max allowed sleep is ' + MAX_SLEEP + 'ms, but ' + ' ' + sleep + 'ms given.');
	}

	var headers = {
		'Content-Type': contentType,
		'Access-Control-Allow-Origin': '*'
	};

	if (files) {
		var headerFiles = [];
		for (var file in files) {
			if (files.hasOwnProperty(file)) {
				headerFiles.push({
					name: file,
					file: files[file]
				});
			}
		}

		if (headerFiles.length) {
			headers['Mirror-Files'] = JSON.stringify(headerFiles);
		}
	}

	response.writeHead(parseInt(statusCode), headers);

	if (sleep) {
		process.stdout.write(colors.yellow(' sleeping for ' + sleep + 'ms...'));
	}

	setTimeout(function() {
		console.log(' [' + statusCode + ', ' + contentType + ']');
		response.end(typeof data === 'string' ? data : JSON.stringify(data));
	}, sleep);
};


var server = http.createServer(function (request, response)
{
	if (ignore.indexOf(request.url) !== -1) {
		response.statusCode = 404;
		response.end();

		return;
	}

	process.stdout.write(colors.green(request.method) + ': ' + request.url);

	if (request.method == 'POST') {
		var busboy = new Busboy({headers: request.headers});
		var data = {};
		var files = {};

		busboy.on('field', function(name, value) {
			data[name] = value;
		});

		busboy.on('file', function(name, file, filename) {
			files[name] = filename;
			file.on('data', function(data) {});			// needed for continuing processing of file
		});

		busboy.on('finish', function() {
			processRequest(request, response, data, files);
		});

		request.pipe(busboy);

	} else {
		processRequest(request, response, url.parse(request.url, true).query, null);
	}
});


server.listen(argv.port);

console.log('Listening on port ' + colors.green(argv.port));
console.log('');
