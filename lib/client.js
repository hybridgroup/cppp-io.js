"use strict";

var decorator = require("./decorator"),
    _ = require("./utils");

var protocols = {
  http: require("./protocols/http"),
  mqtt: require("./protocols/mqtt"),
  "socket-io": require("./protocols/socket-io")
};

function checkArgs(protocol, opts) {
  var protocolSupplied = typeof protocol === "string",
      protocolSupported = !!~Object.keys(protocols).indexOf(protocol);

  if (!protocolSupplied) { throw new Error("Missing protocol"); }
  if (!protocolSupported) { throw new Error("Unsupported protocol"); }

  if (opts == null) { throw new Error("No options provided"); }
  if (opts.host == null) { throw new Error("No host option provided"); }
  if (opts.port == null) { throw new Error("No port option provided"); }
}

var Client = module.exports = function Client(protocol, opts) {
  checkArgs(protocol, opts);

  var Driver = protocols[protocol];

  this.protocol = protocol;
  this.driver = new Driver(opts);
};

Client.prototype.connect = function(callback) {
  var driver = this.driver;

  this.driver.connect(function(err, data) {
    if (err) { return _.resolve(callback, err); }
    data = _.extend({}, data);
    _.resolve(callback, null, decorator.decorate(driver, data));
  });
};

Client.prototype.update = function(callback) {
  var driver = this.driver;

  if (!driver.connected) {
    return _.resolve(callback, "Not connected. Call Client#connect instead.");
  }

  driver.update(function(err, data) {
    if (err) { return _.resolve(callback, err); }
    data = _.extend({}, data);
    _.resolve(callback, null, decorator.decorate(driver, data));
  });
};

Client.prototype.disconnect = function(callback) {
  this.driver.disconnect(callback);
};
