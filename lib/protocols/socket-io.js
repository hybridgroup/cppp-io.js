"use strict";

var io = require("socket.io-client");

var _ = require("./../utils");

function property(fn) {
  return { get: fn, configurable: true, enumerable: true };
}

/**
 * Creates a new SocketIO Protocol instance
 *
 * @constructor SocketIO
 * @param {Object} opts - protocol options
 */
var SocketIO = module.exports = function SocketIO(opts) {
  this.socket = null;
  this.data = null;
  this.connections = {};

  this.host = opts.host;
  this.port = opts.port;

  if (!this.host) {
    throw new Error("No host supplied for SocketIO protocol");
  }

  if (!this.port) {
    throw new Error("No port supplied for SocketIO protocol");
  }

  Object.defineProperties(this, {
    url: property(function() {
      return "http://" + this.host + ":" + this.port;
    })
  });
};

/**
 * Performs first-time setup / data fetching for the Protocol.
 *
 * Callback is invoked when complete, with the arguments (err, data)
 *
 * @param {Function} callback - function to invoke when connected + data fetched
 * @return {void}
 */
SocketIO.prototype.connect = function connect(callback) {
  this.socket = io(this.url + "/api");
  this.connected = true;

  this.socket.on("/", function(data) { this.data = data; }.bind(this));
  this.socket.emit("/");

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
SocketIO.prototype.disconnect = function disconnect(callback) {
  this.socket = null;
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
SocketIO.prototype.update = function update(callback) {
  var self = this;

  function handle(data) {
    self.data = data;
    _.resolve(callback, null, self.data);
  }

  this.socket.once("/", handle);
  this.socket.emit("/");
};

/**
 * Executes a command on the server at the specified endpoint.
 *
 * @param {String} name - name of the command to run
 * @param {String} route - CPPP-IO endpoint path the command should run at
 * @param {Object} [params] - command parameters
 * @param {Function} [callback] - function to invoke with command result
 * @return {void}
 */
SocketIO.prototype.command = function command(name, route, params, callback) {
  if (!this.connections[route]) {
    this.connections[route] = io(this.url + "/api/" + route);
  }

  var socket = this.connections[route];

  function respond(data) {
    if (data.name === name) { socket.removeEventListener("command", respond); }
    _.resolve(callback, null, data.data);
  }

  socket.on("command", respond);
  socket.emit("command", { name: name, args: params });
};

/**
 * Listens for an event coming from the server, triggering a supplied callback
 * every time the event occurs, passing along any data the server emits.
 *
 * @param {String} name - name of the event to listen for
 * @param {String} route - CPPP-IO endpoint path the event exists at
 * @param {Function} callback - function to invoke when event is received
 * @return {void}
 */
SocketIO.prototype.event = function event(name, route, callback) {
  if (!this.connections[route]) {
    this.connections[route] = io(this.url + "/api/" + route);
  }

  var socket = this.connections[route];
  socket.on("event", function(evt) {
    if (evt.name === name) { callback(evt.data); }
  });
};
