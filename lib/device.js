"use strict";

var _ = require("lodash");
var Command = require("./command");
var Event = require("./event");

var Device = function Device(deviceOpts, robot) {
  this.robot = robot;
  this.commands = [];
  this.events = [];

  _.forEach(deviceOpts, function(def, name) {
    if (name === "commands") {
      _.forEach(def, function(command) {
        this.commands.push(new Command(command, null, null, this));
      }, this);
    }
    else if (name === "events") {
      _.forEach(def, function(event) {
        this.events.push(new Event(event, null, null, this));
      }, this);
    }
    else {
      this[name] = def;
    }
  }, this);
};

Device.prototype.defaults = {
  robot: null,
  name: null,
  driver: null,
  connection: null,
  commands: [],
  events: [],
  details: {}
};

Device.prototype.getCommands = function(cb) {
  if (this.commands) {
    return this.robot.client.renderResults(null, this.commands, cb);
  }
  return this.robot.client.renderResults("Not Connected", null, cb);
};

Device.prototype.getEvents = function(cb) {
  if (this.events) {
    return this.robot.client.renderResults(null, this.events, cb);
  }
  return this.robot.client.renderResults("Not Connected", null, cb);
};

module.exports = Device;
