"use strict";

var Device = require("./device");
var Command = require("./command");
var Event = require("./event");
var Connection = require("./connection");

var Robot = function Robot(robotOpts, client) {
  var self = this;
  var i;
  this.driver = client;
  this.connections = [];
  this.commands = [];
  this.devices = [];
  this.events = [];

  for (var name in robotOpts) {
    if (name === "connections") {
      for (i in robotOpts[name]) {
        self.connections.push(new Connection(robotOpts[name][i], self));
      }
    }
    else if (name === "commands") {
      for (i in robotOpts[name]) {
        self.commands.push(new Command(robotOpts[name][i], null, self));
      }
    }
    else if (name === "devices") {
      for (i in robotOpts[name]) {
        self.devices.push(new Device(robotOpts[name][i], self));
      }
    }
    else if (name === "events") {
      for (i in robotOpts[name]) {
        self.events.push(new Event(robotOpts[name][i], null, self));
      }
    }
    else {
      self[name] = robotOpts[name];
    }
  }

};

Robot.prototype.getConnections = function(cb) {
  if (this.connections) {
    return this.driver.renderResults(null, this.connections, cb);
  }
  return this.driver.renderResults("Not Connected", null, cb);
};

Robot.prototype.getCommands = function(cb) {
  if (this.commands) {
    return this.driver.renderResults(null, this.commands, cb);
  }
  return this.driver.renderResults("Not Connected", null, cb);
};

Robot.prototype.getDevices = function(cb) {
  if (this.devices) {
    return this.driver.renderResults(null, this.devices, cb);
  }
  return this.driver.renderResults("Not Connected", null, cb);
};

Robot.prototype.getEvents = function(cb) {
  if (this.events) {
    return this.driver.renderResults(null, this.events, cb);
  }
  return this.driver.renderResults("Not Connected", null, cb);
};


module.exports = Robot;
