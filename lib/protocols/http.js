"use strict";

var request = require("superagent");

var _ = require("./../utils");

var ES;

if (typeof EventSource === "function") {
  ES = EventSource;
} else {
  ES = require("eventsource");
}

function property(fn) {
  return { get: fn, configurable: true, enumerable: true };
}

/**
 * Creates a new HTTP Driver instance
 *
 * @constructor HTTP
 * @param {Object} opts - driver options
 */
var HTTP = module.exports = function HTTP(opts) {
  this.connected = false;
  this.listeners = {};
  this.data = null;

  this.host = opts.host;
  this.port = opts.port;
  this.auth = opts.auth;

  if (!this.host) {
    throw new Error("No host supplied for HTTP driver");
  }

  if (!this.port) {
    throw new Error("No port supplied for HTTP driver");
  }

  Object.defineProperties(this, {
    url: property(function() {
      return "http://" + this.host + ":" + this.port;
    })
  });
};

/**
 * Performs first-time setup / data fetching for the Driver.
 *
 * Callback is invoked when complete, with the arguments (err, data)
 *
 * @param {Function} callback - function to invoke when connected + data fetched
 * @return {void}
 */
HTTP.prototype.connect = function connect(callback) {
  this.connected = true;
  return this.update(callback);
};

/**
 * Performs teardown, disconnects from remote.
 *
 * Callback is invoked when complete, with an error if any occurred.
 *
 * @param {Function} callback - function to invoke when disconnected.
 * @return {void}
 */
HTTP.prototype.disconnect = function disconnect(callback) {
  this.connected = false;
  this.data = null;
  _.resolve(callback);
};

/**
 * Fetches new data from the server, replacing existing data entirely.
 *
 * Callback is invoked when complete, with the arguments (err, data)
 *
 * @param {Function} callback - function to invoke when updated
 * @return {void}
 */
HTTP.prototype.update = function update(callback) {
  var self = this;

  function handle(err, res) {
    if (err) { return _.resolve(callback, err); }
    if (!res.ok) { return _.resolve(callback, res.text); }
    self.data = res.body.MCP;
    return _.resolve(callback, null, self.data);
  }

  request.get(this.url + "/api").end(handle);
};

/**
 * Executes a command on the server at the specified endpoint.
 *
 * @param {String} name - name of the command to run
 * @param {String} endpoint - CPPP-IO endpoint path the command should run at
 * @param {Object} [params] - command parameters
 * @param {Function} [callback] - function to invoke with command result
 * @return {void}
 */
HTTP.prototype.command = function command(name, endpoint, params, callback) {
  var url = this.url + "/api/" + endpoint + "/commands/" + name;

  if (params == null) {
    params = {};
  }

  if (typeof params === "function") {
    callback = params;
    params = {};
  }

  function handle(err, res) {
    if (err) { return _.resolve(callback, res.body.error || err); }
    if (!res.ok) { return _.resolve(callback, res.text); }
    _.resolve(callback, null, res.body.result);
  }

  request.post(url).send(params).end(handle);
};

/**
 * Listens for an event coming from the server, triggering a supplied callback
 * every time the event occurs, passing along any data the server emits.
 *
 * @param {String} name - name of the event to listen for
 * @param {String} endpoint - CPPP-IO endpoint path the event exists at
 * @param {Function} callback - function to invoke when event is received
 * @return {void}
 */
HTTP.prototype.event = function event(name, endpoint, callback) {
  var path = endpoint + "/events/" + name,
      self = this;

  function onmessage(msg) {
    self.listeners[path].callbacks.forEach(function(cb) {
      cb(JSON.parse(msg.data));
    });
  }

  if (!self.listeners[path]) {
    var eventsource = new ES(this.url + "/api/" + path);
    eventsource.onmessage = onmessage;
    self.listeners[path] = { eventsource: eventsource, callbacks: [callback] };
    return;
  }

  this.listeners[path].callbacks.push(callback);
};
