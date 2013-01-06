/*
 * node-nonce
 * https://github.com/ahultgren/node-nonce
 *
 * Copyright (c) 2013 Andreas Hultgren
 * Licensed under the MIT license.
 */

var
// Dependencies
	crypto = require('crypto'),
	url = require('url'),
	qs = require('querystring'),
// Private vars
	nonces = [],
	verificators = [];


// Private functions

function find (nonce, callback) {
	var i, l;

	for(i = 0, l = nonces.length; i < l; i++) {
		if(nonces[i].nonce === nonce) {
			callback(null, nonces[i], i);
			return;
		}
	}

	callback(new Error('Nonce sent but not valid'));
}

function getNonce (req, callback) {
	var data;

	function done (data) {
		if(data) {
			callback(null, data);
		}
		else {
			callback(new Error('Nonce required but not found.'));
		}
	}

	if(req.method === 'GET') {
		if(req.query && req.query.nonce) {
			done(req.query.nonce);
		}
		else {
			data = url.parse(req.url, true).query.nonce;

			done(data);
		}
	}
	else {
		if(req.body && req.body.nonce) {
			done(req.body.nonce);
		}
		else {
			req.on('data', function (data) {
				data += data;
			});

			req.on('end', function () {
				data = qs.parse(data).nonce;

				done(data);
			});
		}
	}
}


// Public methods

module.exports.generate = function (data, callback) {
	crypto.randomBytes(32, function (err, bytes) {
		bytes = bytes.toString('base64').replace(/[^\w]/g, '');
		nonces.push({ data: data, nonce: bytes });
		callback(bytes);
	});
};

module.exports.verify = function (action) {
	return function (req, res, next) {
		getNonce(req, function (err, nonce) {
			if(err) {
				next(err);
			}
			else {
				find(nonce, function (err, nonceItem, i) {
					if( err ){
						next(err);
					}
					else if(action && nonceItem.data.action !== action){
						next(new Error('Nonce sent and found but not valid for the action: ' + action));
					}
					else {
						(function verify (k) {
							if(typeof verificators[k] === 'function') {
								verificators[k](req, res, nonceItem, function (err) {
									if( err ){
										next(err);
									}
									else {
										verify(k + 1);
									}
								});
							}
							else {
								nonces.splice(i, 1);
								next();
							}
						}(0));
					}
				});
			}
		});
	};
};

module.exports.use = function (func) {
	verificators.push(func);
};