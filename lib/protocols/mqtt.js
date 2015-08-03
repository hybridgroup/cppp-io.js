"use strict";

var mqtt = require("mqtt");

var _ = require("./../utils");

// used to only receive MQTT messages on a specific topic, not from the client
function receive(path, fn) {
  return function(topic, message) {
    if (topic !== path) { return; }

    var data = JSON.parse(message.toString());

    if (!data) { return; }
    if (data.sender === "client") { return; }

    fn.call(null, data);
  };
}

/**
 * Creates a new MQTT Protocol instance
 *
 * @constructor MQTT
 * @param {Object} opts - protocol options
 */
var MQTT = module.exports = function MQTT(opts) {
  this.client = null;
  this.connected = false;
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
  var client = this.client = mqtt.connect(this.broker),
      self = this,
      resolved = false;

  client.on("connect", function() { self.connected = true; });
  client.on("close", function() { self.connected = false; });

  client.on("message", receive("/api", function(data) {
    if (!data.robots) { return; } // ignore non-MCP messages

    self.data = data;
    delete self.data.sender;

    // resolve passed callback, if we haven't already
    if (!resolved) {
      resolved = true;
      _.resolve(callback, null, self.data);
    }
  }));

  client.subscribe("/api");
  this.ping("/api");
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
  this.client.end(false, callback);
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
  var listener = receive("/api", function(data) {
    if (!data.robots) { return; } // ignore non-MCP messages
    _.resolve(callback, null, this.data);
    this.client.removeListener("message", listener);
  }.bind(this));

  this.client.on("message", listener);
  this.ping("/api");
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
  var path = ("/api/" + route + "/command").replace("//", "/");

  var listener = receive(path, function(data) {
    if (data.command !== name) { return; }
    _.resolve(callback, null, data.data);
    this.client.removeListener("message", listener);
  }.bind(this));

  this.client.on("message", listener);

  this.client.subscribe(path);
  this.publish(path, { command: name, args: params });
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
  var path = ("/api/" + route + "/events/" + name).replace("//", "/");

  this.client.subscribe(path);

  this.client.on("message", receive(path, function(data) {
    callback.call(null, data.data);
  }));
};

/**
 * Pings a topic on the MQTT broker, to provoke a response from Cylon.
 *
 * @param {String} topic - the topic to publish to
 * @return {void}
 * @private
 */
MQTT.prototype.ping = function ping(topic) {
  this.publish(topic, { sender: "client" });
};

/**
 * Publishes to a topic on the MQTT broker
 *
 * @param {String} topic - the topic to publish to
 * @param {Object} payload - data to publish to the broker
 * @return {void}
 * @private
 */
MQTT.prototype.publish = function publish(topic, payload) {
  payload = payload || {};
  payload.sender = "client";
  this.client.publish(topic, JSON.stringify(payload));
};
