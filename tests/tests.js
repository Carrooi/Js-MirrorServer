var expect = require('chai').expect;

var fetch = require('./fetch');
var Server = require('../src/server');


var port = 5000;
var server = null;


describe('#mirror-server', function() {

	beforeEach(function(done) {
		server = new Server(port);
		server.connect(function() {
			done();
		});
	});

	afterEach(function() {
		server.disconnect();
	});

	describe('GET', function() {

		it('should receive simple GET response', function(done) {
			fetch('GET', port, '/', null, function(res, data) {
				expect(res.statusCode).to.be.equal(200);
				expect(res.headers['content-type']).to.be.equal('application/json');
				expect(JSON.parse(data)).to.be.eql({});
				done();
			});
		});

		it('should receive GET with data', function(done) {
			fetch('GET', port, '/?name=john&number=5', null, function(res, data) {
				expect(res.statusCode).to.be.equal(200);
				expect(res.headers['content-type']).to.be.equal('application/json');
				expect(JSON.parse(data)).to.be.eql({
					name: 'john',
					number: '5'
				});
				done();
			});
		});

		it('should send custom data', function(done) {
			fetch('GET', port, '/?response=hello&contentType=' + encodeURIComponent('text/plain'), null, function(res, data) {
				expect(res.statusCode).to.be.equal(200);
				expect(res.headers['content-type']).to.be.equal('text/plain');
				expect(data).to.be.equal('hello');
				done();
			});
		});

		it('should change status code', function(done) {
			fetch('GET', port, '/?statusCode=304', null, function(res) {
				expect(res.statusCode).to.be.equal(304);
				done();
			});
		});

		it('should change content type', function(done) {
			fetch('GET', port, '/?contentType=' + encodeURIComponent('text/plain'), null, function(res) {
				expect(res.headers['content-type']).to.be.equal('text/plain');
				done();
			});
		});

	});

	describe('POST', function() {

		it('should receive simple GET response', function(done) {
			fetch('POST', port, '/', null, function(res, data) {
				expect(res.statusCode).to.be.equal(200);
				expect(res.headers['content-type']).to.be.equal('application/json');
				expect(JSON.parse(data)).to.be.eql({});
				done();
			});
		});

		it('should receive GET with data', function(done) {
			var expected = {
				name: 'john',
				number: '5'
			};

			fetch('POST', port, '/', expected, function(res, data) {
				expect(res.statusCode).to.be.equal(200);
				expect(res.headers['content-type']).to.be.equal('application/json');
				expect(JSON.parse(data)).to.be.eql(expected);
				done();
			});
		});

		it('should send custom data', function(done) {
			fetch('POST', port, '/', {response: 'hello', contentType: 'text/plain'}, function(res, data) {
				expect(res.statusCode).to.be.equal(200);
				expect(res.headers['content-type']).to.be.equal('text/plain');
				expect(data).to.be.equal('hello');
				done();
			});
		});

		it('should change status code', function(done) {
			fetch('POST', port, '/', {statusCode: 304}, function(res) {
				expect(res.statusCode).to.be.equal(304);
				done();
			});
		});

		it('should change content type', function(done) {
			fetch('POST', port, '/', {contentType: 'text/plain'}, function(res) {
				expect(res.headers['content-type']).to.be.equal('text/plain');
				done();
			});
		});

	});

});
