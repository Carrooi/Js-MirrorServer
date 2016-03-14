[![NPM version](https://img.shields.io/npm/v/mirror-server.svg?style=flat-square)](https://www.npmjs.com/package/mirror-server)
[![Dependency Status](https://img.shields.io/gemnasium/Carrooi/Js-MirrorServer.svg?style=flat-square)](https://gemnasium.com/Carrooi/Js-MirrorServer)
[![Build Status](https://img.shields.io/travis/Carrooi/Js-MirrorServer.svg?style=flat-square)](https://travis-ci.org/Carrooi/Js-MirrorServer)

[![Donate](https://img.shields.io/badge/donate-PayPal-brightgreen.svg?style=flat-square)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=X3Q5HW5BDZD5A)

# Mirror server

Node.js server which sends back everything you send to it.

## Installation

```
$ npm install -g mirror-server
```

## Usage

When your server is running you can send any request to it and it will return you the same data you sent.

There are also few options which you can use to modify response from mirror-server:

* `statusCode`: change status code (default is `200`)
* `contentType`: change content type (default is `application/json`)

Normally you're sending `GET` or `POST` data (object or list of parameters), but you can send also custom plain text 
data with `response` parameter.

### GET

```js
var http = require('http');

var req = http.request({
	host: 'localhost',
	port: 3000,
	method: 'GET',
	path: '/?name=David&number=5&statusCode=304&contentType=' + encodeURIComponent('text/plain')
}, function(res) {
	var data = '';
	res.setEncoding('utf8');
	res.on('data', function(chunk) {
		data += chunk;
	});
	res.on('end', function() {
		data = JSON.parse(data);
		console.log(data.name);		// output: David
		console.log(data.number);	// output: 5
	});
});

req.end();
```

### POST

```js
var http = require('http');
var querystring = require('querystring');

var data = querystring.stringify({
	name: 'David',
	number: 5,
	statusCode: 304,
	contentType: 'text/plain'
});

var req = http.request({
	host: 'localhost',
	port: 3000,
	method: 'GET',
	path: '/'
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': data.length
	}
}, function(res) {
	var data = '';
	res.setEncoding('utf8');
	res.on('data', function(chunk) {
		data += chunk;
	});
	res.on('end', function() {
		data = JSON.parse(data);
		console.log(data.name);		// output: David
		console.log(data.number);	// output: 5
	});
});

req.write(data);
req.end();
```
 
## Running server

### CLI

```
$ mirror-server --port 3000 
```

### node.js

```js
var Server = require('mirror-server');
var server = new Server(3000);		// port

server.connect(function() {
	console.log('success');
});

setTimeout(function() {		// wait a while before disconnecting from server
	server.disconnect();
}, 1000);
```
