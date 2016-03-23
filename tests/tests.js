var expect = require('chai').expect;
var request = require('request');
var fs = require('fs');

var Server = require('../src/server');


var port = 5000;
var url = 'http://localhost:' + port;
var server = null;


describe('#mirror-server', function() {

	beforeEach(function(done) {
		server = new Server(port);
		server.on('data', function(data) {
			//process.stdout.write(data);			// just for debugging
		});
		server.connect(function() {
			done();
		});
	});

	afterEach(function() {
		server.disconnect();
	});

	describe('GET', function() {

		it('should receive simple GET response', function(done) {
			request.get(url, function(err, response, body) {
				if (err) {
					throw err;
				}

				expect(response.statusCode).to.be.equal(200);
				expect(response.headers['content-type']).to.be.equal('application/json');
				expect(JSON.parse(body)).to.be.eql({});
				done();
			});
		});

		it('should receive GET with data', function(done) {
			request.get(url + '/?name=john&number=5', function(err, response, body) {
				if (err) {
					throw err;
				}

				expect(response.statusCode).to.be.equal(200);
				expect(response.headers['content-type']).to.be.equal('application/json');
				expect(JSON.parse(body)).to.be.eql({
					name: 'john',
					number: '5'
				});
				done();
			});
		});

		it('should send custom data', function(done) {
			request.get(url + '/?response=hello&contentType=' + encodeURIComponent('text/plain'), function(err, response, body) {
				if (err) {
					throw err;
				}

				expect(response.statusCode).to.be.equal(200);
				expect(response.headers['content-type']).to.be.equal('text/plain');
				expect(body).to.be.equal('hello');
				done();
			});
		});

		it('should change status code', function(done) {
			request.get(url + '/?statusCode=304', function(err, response) {
				if (err) {
					throw err;
				}

				expect(response.statusCode).to.be.equal(304);
				done();
			});
		});

		it('should change content type', function(done) {
			request.get(url + '/?contentType=' + encodeURIComponent('text/plain'), function(err, response) {
				if (err) {
					throw err;
				}

				expect(response.headers['content-type']).to.be.equal('text/plain');
				done();
			});
		});

	});

	describe('POST', function() {

		it('should receive simple POST response', function(done) {
			request.post({url: url, formData: {}}, function(err, response, body) {
				if (err) {
					throw err;
				}

				expect(response.statusCode).to.be.equal(200);
				expect(response.headers['content-type']).to.be.equal('application/json');
				expect(JSON.parse(body)).to.be.eql({});
				done();
			});
		});

		it('should receive GET with data', function(done) {
			var data = {
				name: 'john',
				number: '5'
			};

			request.post({url: url, formData: data}, function(err, response, body) {
				if (err) {
					throw err;
				}

				expect(response.statusCode).to.be.equal(200);
				expect(response.headers['content-type']).to.be.equal('application/json');
				expect(JSON.parse(body)).to.be.eql(data);
				done();
			});
		});

		it('should send custom data', function(done) {
			var data = {
				response: 'hello',
				contentType: 'text/plain'
			};

			request.post({url: url, formData: data}, function(err, response, body) {
				if (err) {
					throw err;
				}

				expect(response.statusCode).to.be.equal(200);
				expect(response.headers['content-type']).to.be.equal('text/plain');
				expect(body).to.be.equal('hello');
				done();
			});
		});

		it('should change status code', function(done) {
			request.post({url: url, formData: {statusCode: 304}}, function(err, response) {
				if (err) {
					throw err;
				}

				expect(response.statusCode).to.be.equal(304);
				done();
			});
		});

		it('should change content type', function(done) {
			request.post({url: url, formData: {contentType: 'text/plain'}}, function(err, response) {
				if (err) {
					throw err;
				}

				expect(response.headers['content-type']).to.be.equal('text/plain');
				done();
			});
		});

		describe('files', function() {

			it('should send files', function(done) {
				var data = {
					readme: fs.createReadStream(__dirname + '/data/readme.md'),
					install: fs.createReadStream(__dirname + '/data/install.md')
				};

				request.post({url: url, formData: data}, function(err, response) {
					if (err) {
						throw err;
					}

					expect(response.headers).to.contain.keys(['x-mirror-files']);
					expect(JSON.parse(response.headers['x-mirror-files'])).to.be.eql([
						{
							name: 'readme',
							file: 'readme.md'
						},
						{
							name: 'install',
							file: 'install.md'
						}
					]);
					done();
				});
			});

		});

	});

});
