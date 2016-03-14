var http = require('http');
var querystring = require('querystring');


module.exports = function(method, port, path, data, cb) {
	var options = {
		protocol: 'http:',
		host: 'localhost',
		port: port,
		method: method,
		path: path,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	if (data) {
		if (typeof data !== 'string') {
			data = querystring.stringify(data);
		}

		options.headers['Content-Length'] = data.length;
	}

	var req = http.request(options, function(res) {
		var data = '';
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on('end', function() {
			cb(res, data);
		});
	});

	if (data) {
		req.write(data);
	}

	req.end();
};
