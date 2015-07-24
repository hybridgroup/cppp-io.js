"use strict";

var _ = require("./utils");

var protocols = {
  http: require("./drivers/http")
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

function process(driver, data) {
  function bindCommand(target, path) {
    return function(name) {
      if (target[name]) { return; }
      target[name] = driver.command.bind(driver, name, path);
    };
  }

  data.commands.forEach(bindCommand(data, ""));

  data.robots.forEach(function(robot) {
    var path = "robots/" + robot.name;
    robot.commands.forEach(bindCommand(robot, path));

    robot.devices.forEach(function(device) {
      var devicePath = path + "/devices/" + device.name;
      device.commands.forEach(bindCommand(device, devicePath));
    });
  });

  return data;
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
    _.resolve(callback, null, process(driver, data));
  });
};

Client.prototype.disconnect = function(callback) {
  this.driver.disconnect(callback);
};
