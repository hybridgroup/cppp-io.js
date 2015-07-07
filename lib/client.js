"use strict";

var supportedProtocols = ["http", "socketio", "mqtt"];

// Guards a method so it will only be invoked when the client is connected
function connected(fn) {
  return function() {
    var args = [].slice.call(arguments);

    if (this.connection) {
      return fn.apply(this, args);
    }

    return this.renderResults("Not Connected", null, args[args.length - 1]);
  };
}

var Client = function Client(protocol, opts) {
  if (supportedProtocols.indexOf(protocol) < 0) {
    if (protocol == null) { throw new Error("Missing protocol"); }
    throw new Error("Unsupported protocol");
  }

  if (opts == null) {
    throw new Error("No options provided");
  }

  if (opts.host == null) {
    throw new Error("No host option provided");
  }

  if (opts.port == null) {
    throw new Error("No port option provided");
  }

  this.connection = null;
  this.protocol = protocol;

  for (var name in opts) {
    this[name] = opts[name];
  }
};

Client.prototype.connect = function(callback) {
  var req = "./" + this.protocol + "-driver";
  var Driver = null;

  try {
    Driver = require(req);
  } catch (e) {
    throw new Error("Missing Client - cannot proceed");
  }

  this.connection = new Driver(this);
  this.connection.connect(callback);
};

Client.prototype.disconnect = function() {
  this.connection = null;
};

Client.prototype.renderResults = function(error, result, callback) {
  if (typeof callback === "function") {
    return callback(error, result);
  }

  return error || result;
};

Client.prototype.getApi = connected(function(callback) {
  return this.connection.getApi(callback);
});

Client.prototype.getRobots = connected(function(callback) {
  return this.connection.getRobots(callback);
});

Client.prototype.getCommands = connected(function(callback) {
  return this.connection.getCommands(callback);
});

Client.prototype.getEvents = connected(function(callback) {
  return this.connection.getEvents(callback);
});

Client.prototype.getRobot = connected(function(name, callback) {
  var result = this.connection.robots.filter(function(robot) {
    return robot.name === name;
  });
  return this.renderResults(null, result[0], callback);
});

module.exports = Client;
