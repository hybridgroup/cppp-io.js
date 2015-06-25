"use strict";

var supportedProtocols = ["http", "socketio", "mqtt"];

var Client = module.exports = {
  connected: false,
  connection: null
};

Client.connect = function(protocol, opts) {

  if (this.connected && this.connection) {
    throw new Error("Already Connected");
  }
  if (protocol == null) {
    throw new Error("Missing Protocol");
  }
  if (supportedProtocols.indexOf(protocol) < 0) {
    throw new Error("Unsupported Protocol");
  }
  if (opts == null) {
    throw new Error("Missing Options");
  }

  var req = "./" + protocol + "-client";
  var Connection = null;

  try {
    Connection = require(req);
  } catch (e) {
    throw new Error("Missing Client - cannot proceed");
  }

  this.connection = new Connection(this, opts);
  return this.connection.connect();
};

Client.disconnect = function() {
  this.connection = null;
  this.connected = false;
};

Client.reconnect = function() {
  if (this.connection) {
    this.connection.reload();
  }
};

Client.getApi = function(cb) {
  return this.connection.getApi(cb);
};

Client.getRobots = function(cb) {
  return this.connection.getRobots(cb);
};

Client.getCommands = function(cb) {
  return this.connection.getCommands(cb);
};

Client.getEvents = function(cb) {
  return this.connection.getEvents(cb);
};

Client.getRobot = function(name, cb) {
  var result = this.connection.robots.filter(function(robot) {
    return robot.name === name;
  });
  if (cb) {
    return (null, result[0]);
  }
  return result[0];
};
