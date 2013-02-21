"use strict";
 
function waitForCondition(options) {
	// options.timeout = ms
	// options.condition = function returning boolean
	// options.onSuccess = success callback
	// options.onTimeout = timeout callback
	var timeout = options.timeout,
		interval = 100,
		attempt = Math.round(timeout / interval);
 
	var timer = setInterval(function () {
 
		if (options.condition()) {
			clearInterval(timer);
			options.onSuccess();
		}
		else if (--attempt === 0) {
			clearInterval(timer);
			options.onTimeout();
		}
 
	}, interval);
}
 
function BrowserWaiter(client) {
	this.client = client;
}
 
function logStartingMessage(timeout, expectedConnections) {
	console.log('\n>>> Waiting ' + timeout / 1000 + 's for ' + expectedConnections +
			' connection' + (expectedConnections === 1 ? '' : 's') + '...');
}
 
function logUpdate(expectedConnections) {
	console.log('\n>>> Expecting ' + expectedConnections + ' more connection' +
				(expectedConnections === 1 ? '' : 's') + '...');
}
 
BrowserWaiter.prototype.wait = function wait(options) {
	// options.timeout = ms
	// options.expectedConnections = integer
	// options.onSuccess = success callback
	// options.onTimeout = timeout callback
 
	var client = this.client,
		pollInterval = 100,
		remainingPolls = Math.round(options.timeout / pollInterval),
		remainingConnections = options.expectedConnections;
 
	client.on("agentConnect", function newConnection() {
		if(--remainingConnections === 0) {
			console.log('\n>>> Expected number of connections established');
		}
		else {
			logUpdate(remainingConnections);
		}
	});
 
	client.on("agentDisconnect", function lostConnection() {
		++remainingConnections;
		this.logUpdate(remainingConnections);
	});
 
	logStartingMessage(options.timeout, remainingConnections);
 
	waitForCondition({
		timeout: options.timeout,
		condition: function condition() { return remainingConnections === 0; },
		onSuccess: options.onSuccess,
		onTimeout: options.onTimeout
	});
 
};
 
module.exports = BrowserWaiter;