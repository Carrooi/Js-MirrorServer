var http = require('http');
var url = require('url');
var qs = require('querystring');
var colors = require('colors');

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


var server = http.createServer(function (request, response) {
	var processRequest = function(data) {
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

		if (sleep > MAX_SLEEP) {
			throw new Error(request.method + ' ' + request.url + ': max allowed sleep is ' + MAX_SLEEP + 'ms, but ' + ' ' + sleep + 'ms given.');
		}

		response.writeHead(
			parseInt(statusCode),
			{
				'Content-Type': contentType,
				'Access-Control-Allow-Origin': '*'
			}
		);

		if (sleep) {
			process.stdout.write(colors.yellow(' sleeping for ' + sleep + 'ms...'));
		}

		setTimeout(function() {
			console.log(' [' + statusCode + ', ' + contentType + ']');
			response.end(typeof data === 'string' ? data : JSON.stringify(data));
		}, sleep);
	};

	if (ignore.indexOf(request.url) !== -1) {
		response.statusCode = 404;
		response.end();

		return;
	}

	process.stdout.write(colors.green(request.method) + ' ' + request.url);

	if (request.method == 'POST') {
		var body = '';

		request.on('data', function (data) {
			body += data;

			if (body.length > 1e6) {
				request.connection.destroy();
			}
		});

		request.on('end', function () {
			processRequest(qs.parse(body));
		});

	} else {
		processRequest(url.parse(request.url, true).query);
	}
});


server.listen(argv.port);

console.log('Listening on port ' + colors.green(argv.port));
console.log('');
