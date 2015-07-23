"use strict";

var Protocols = {
  http: require("./drivers/http"),
  socketio: require("./drivers/socketio"),
  mqtt: require("./drivers/mqtt")
};

var _ = require("./utils");

// Guards a method so it will only be invoked when the client is connected
function connected(fn) {
  return function() {
    var args = [].slice.call(arguments);

    if (this.driver) {
      return fn.apply(this, args);
    }

    return _.resolve(args[args.length - 1], "Not Connected");
  };
}

var Client = function Client(protocol, opts) {
  var supported = Object.keys(Protocols);

  if (supported.indexOf(protocol) < 0) {
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

  this.driver = null;
  this.protocol = protocol;

  for (var name in opts) {
    this[name] = opts[name];
  }
};

Client.prototype.connect = function(callback) {
  var Driver = Protocols[this.protocol];

  if (!Driver) {
    throw new Error("Missing Client - cannot proceed");
  }

  this.driver = new Driver(this);
  this.driver.connect(callback);
};

Client.prototype.disconnect = function() {
  this.driver = null;
};

Client.prototype.getApi = connected(function(callback) {
  return this.driver.getApi(callback);
});

Client.prototype.getRobots = connected(function(callback) {
  return this.driver.getRobots(callback);
});

Client.prototype.getCommands = connected(function(callback) {
  return this.driver.getCommands(callback);
});

Client.prototype.getEvents = connected(function(callback) {
  return this.driver.getEvents(callback);
});

Client.prototype.getRobot = connected(function(name, callback) {
  function byName(bot) { return bot.name === name; }
  return _.resolve(callback, null, this.driver.robots.filter(byName)[0]);
});

module.exports = Client;
