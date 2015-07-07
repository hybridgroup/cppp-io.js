"use strict";

var supportedProtocols = ["http", "socketio", "mqtt"];

var Client = function Client(protocol, opts) {
  var self = this;

  if (protocol === undefined) {
    throw new Error("Missing Protocol");
  }
  if (supportedProtocols.indexOf(protocol) < 0) {
    throw new Error("Unsupported Protocol");
  }
  if (opts === undefined ||
      opts.host === undefined ||
      opts.port === undefined) {
    throw new Error("Missing Options");
  }

  this.connection = null;
  this.protocol = protocol;

  for (var name in opts) {
    self[name] = opts[name];
  }
};

Client.prototype.connect = function(cb) {
  var req = "./" + this.protocol + "-driver";
  var Driver = null;

  try {
    Driver = require(req);
  } catch (e) {
    throw new Error("Missing Client - cannot proceed");
  }
  this.connection = new Driver(this);
  this.connection.connect(cb);
};

Client.prototype.disconnect = function() {
  this.connection = null;
};

Client.prototype.renderResults = function(error, result, cb) {
  if (cb) {
    return cb(error, result);
  }
  else if (error) {
    return error;
  }
  return result;
};

Client.prototype.getApi = function(cb) {
  if (this.connection) {
    return this.connection.getApi(cb);
  }
  return this.renderResults("Not Connected", null, cb);
};

Client.prototype.getRobots = function(cb) {
  if (this.connection) {
    return this.connection.getRobots(cb);
  }
  return this.renderResults("Not Connected", null, cb);
};

Client.prototype.getCommands = function(cb) {
  if (this.connection) {
    return this.connection.getCommands(cb);
  }
  return this.renderResults("Not Connected", null, cb);
};

Client.prototype.getEvents = function(cb) {
  if (this.connection) {
    return this.connection.getEvents(cb);
  }
  return this.renderResults("Not Connected", null, cb);
};

Client.prototype.getRobot = function(name, cb) {
  if (this.connection) {
    var result = this.connection.robots.filter(function(robot) {
      return robot.name === name;
    });
    return this.renderResults(null, result[0], cb);
  }
  return this.renderResults("Not Connected", null, cb);
};

module.exports = Client;
