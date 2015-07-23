"use strict";

var socketClient = require("socket.io-client");

var Command = require("./command"),
    Event = require("./event"),
    _ = require("./utils");

var Device = function Device(deviceOpts, robot) {
  var self = this;
  var i;
  this.robot = robot;
  this.commands = [];
  this.events = [];

  if (this.robot.driver.client.protocol === "socketio") {
    this.name = deviceOpts.name;
    var url = robot.driver.url() + robot.socket.nsp + "/devices/" + this.name;
    this.socket = socketClient(url);
    this.socket.on("commands", function(commands) {
      for (i in commands) {
        self.commands.push(new Command(commands[i], null, null, self));
      }
    });
    this.socket.on("events", function(events) {
      for (i in events) {
        self.events.push(new Event(events[i], null, null, self));
      }
    });
    this.socket.emit("commands");
    this.socket.emit("events");
  } else {
    for (var name in deviceOpts) {
      if (name === "commands") {
        for (i in deviceOpts[name]) {
          self.commands.push(new Command(
            deviceOpts[name][i], null, null, self)
          );
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
  }
};

Device.prototype.getCommands = function(cb) {
  return _.resolve(null, this.commands, cb);
};

Device.prototype.getEvents = function(cb) {
  return _.resolve(null, this.events, cb);
};

Device.prototype.on = function() {
  this.socket.on.apply(this.socket, arguments);
};

module.exports = Device;
