"use strict";

var socketClient = require("socket.io-client");
var Device = require("./device");
var Command = require("./command");
var Event = require("./event");
var Connection = require("./connection");

var Robot = function Robot(robotOpts, driver) {
  var self = this;
  var i;
  this.driver = driver;
  this.connections = [];
  this.commands = [];
  this.devices = [];
  this.events = [];

  if (this.driver.client.protocol === "socketio") {
    this.name = robotOpts.name;
    var url = this.driver.url() + "/api/robots/" + this.name;
    this.socket = socketClient(url);
    this.socket.on("connections", function(connections) {
      for (i in connections) {
        self.connections.push(new Connection(connections[i], self));
      }
    });
    this.socket.on("commands", function(commands) {
      for (i in commands) {
        self.commands.push(new Command(commands[i], null, self));
      }
    });
    this.socket.on("devices", function(devices) {
      for (i in devices) {
        self.devices.push(new Device({name: devices[i]}, self));
      }
    });
    this.socket.on("events", function(events) {
      for (i in events) {
        self.events.push(new Event(events[i], null, self));
      }
    });
    this.socket.emit("connections");
    this.socket.emit("commands");
    this.socket.emit("devices");
    this.socket.emit("events");

  } else {
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
  }

};

Robot.prototype.getConnections = function(cb) {
  return this.driver.renderResults(null, this.connections, cb);
};

Robot.prototype.getCommands = function(cb) {
  return this.driver.renderResults(null, this.commands, cb);
};

Robot.prototype.getDevices = function(cb) {
  return this.driver.renderResults(null, this.devices, cb);
};

Robot.prototype.getEvents = function(cb) {
  return this.driver.renderResults(null, this.events, cb);
};

Robot.prototype.on = function() {
  this.socket.on.apply(this.socket, arguments);
};

module.exports = Robot;
