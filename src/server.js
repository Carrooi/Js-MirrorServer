var path = require('path');
var spawn = require('child_process').spawn;


var Server = function(port)
{
	if (port == null) {
		port = Server.DEFAULT_PORT;
	}

	this.port = port;
	this.server = null;
};


Server.DEFAULT_PORT = 3000;


Server.prototype.connect = function(cb)
{
	if (this.server) {
		throw new Error('Connection to mirror-server on port ' + this.port + ' already exists.');
	}

	this.server = spawn('node', [path.join(__dirname, '..', 'bin', 'server.js'), '--port', this.port]);

	this.server.on('error', function(err) {
		throw err;
	});

	this.server.stdout.on('data', function(data) {
		if (cb && (data + '').match(/Listening\son\sport\s\d+/)) {
			cb();
		}
	});
};


Server.prototype.disconnect = function()
{
	if (!this.server) {
		throw new Error('Can not disconnect from mirror-server since there is no connection.');
	}

	this.server.kill();
};


module.exports = Server;
