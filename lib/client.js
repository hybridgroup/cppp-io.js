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

Client.prototype.getApi = connected(function(cb) {
  return this.connection.getApi(cb);
});

Client.prototype.getRobots = connected(function(cb) {
  return this.connection.getRobots(cb);
});

Client.prototype.getCommands = connected(function(cb) {
  return this.connection.getCommands(cb);
});

Client.prototype.getEvents = connected(function(cb) {
  return this.connection.getEvents(cb);
});

Client.prototype.getRobot = connected(function(name, cb) {
  var result = this.connection.robots.filter(function(robot) {
    return robot.name === name;
  });
  return this.renderResults(null, result[0], cb);
});

module.exports = Client;
