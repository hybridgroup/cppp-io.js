"use strict";

var Command = require("./command");
var Event = require("./event");

var Device = function Device(deviceOpts, robot) {
  var self = this;
  var i;
  this.robot = robot;
  this.commands = [];
  this.events = [];

  for (var name in deviceOpts) {
    if (name === "commands") {
      for (i in deviceOpts[name]) {
        self.commands.push(new Command(deviceOpts[name][i], null, null, self));
      }
    }
    else if (name === "events") {
      for (i in deviceOpts[name]) {
        self.events.push(new Event(deviceOpts[name][i], null, null, self));
      }
    }
    else {
      self[name] = deviceOpts[name];
    }
  }
};

Device.prototype.getCommands = function(cb) {
  if (this.commands) {
    return this.robot.driver.renderResults(null, this.commands, cb);
  }
  return this.robot.driver.renderResults("Not Connected", null, cb);
};

Device.prototype.getEvents = function(cb) {
  if (this.events) {
    return this.robot.driver.renderResults(null, this.events, cb);
  }
  return this.robot.driver.renderResults("Not Connected", null, cb);
};

module.exports = Device;
