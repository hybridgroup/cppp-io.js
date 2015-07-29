"use strict";

var mqtt = require("mqtt");

var _ = require("./../utils");

/**
 * Creates a new MQTT Protocol instance
 *
 * @constructor MQTT
 * @param {Object} opts - protocol options
 */
var MQTT = module.exports = function MQTT(opts) {
  this.client = null;
  this.data = null;

  this.broker = opts.broker;

  if (!this.broker) {
    throw new Error("No broker supplied for MQTT protocol");
  }
};

/**
 * Performs first-time setup / data fetching for the Protocol.
 *
 * Callback is invoked when complete, with the arguments (err, data)
 *
 * @param {Function} callback - function to invoke when connected + data fetched
 * @return {void}
 */
MQTT.prototype.connect = function connect(callback) {
  _.resolve(callback);
};

/**
 * Performs teardown, disconnects from remote.
 *
 * Callback is invoked when complete, with an error if any occurred.
 *
 * @param {Function} callback - function to invoke when disconnected.
 * @return {void}
 */
MQTT.prototype.disconnect = function disconnect(callback) {
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
MQTT.prototype.update = function update(callback) {
  _.resolve(callback);
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
MQTT.prototype.command = function command(name, route, params, callback) {
  _.resolve(callback);
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
MQTT.prototype.event = function event(name, route, callback) {
  _.resolve(callback);
};
