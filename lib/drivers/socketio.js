"use strict";

var socketClient = require("socket.io-client");

var Robot = require("./../robot"),
    Command = require("./../command"),
    Event = require("./../event"),
    _ = require("./../utils");

var SocketIO = module.exports = function SocketIO(client) {
  this.client = client;
  this.host = client.host;
  this.port = client.port;
  this.resetValues();
};

SocketIO.prototype.resetValues = function() {
  this.robots = [];
  this.commands = [];
  this.events = [];
  this.lastExecutionResult = null;
  if (this.socket) {
    this.socket.disconnect();
  }
  this.socket = null;
};

SocketIO.prototype.reload = function(cb) {
  this.resetValues();
  this.connect(cb);
};

SocketIO.prototype.disconnect = function() {
  this.resetValues();
};

SocketIO.prototype.connect = function(cb) {
  var self = this;
  var url = this.url() + "/api/robots";
  this.socket = socketClient(url);
  this.initApi();
  return _.resolve(null, self.client, cb);
};

SocketIO.prototype.url = function() {
  return "http://" + this.host + ":" + this.port;
};

SocketIO.prototype.initApi = function() {
  var i;
  var self = this;
  this.socket.on("robots", function(robots) {
    for (i in robots) {
      self.robots.push(new Robot({name: robots[i]}, self));
    }
  });
  this.socket.on("commands", function(commands) {
    for (i in commands) {
      self.commands.push(new Command(commands[i], self));
    }
  });
  this.socket.on("events", function(events) {
    for (i in events) {
      self.events.push(new Event(events[i], self));
    }
  });
};

SocketIO.prototype.getCommands = function(cb) {
  return _.resolve(null, this.commands, cb);
};

SocketIO.prototype.getRobots = function(cb) {
  return _.resolve(null, this.robots, cb);
};

SocketIO.prototype.getEvents = function(cb) {
  return _.resolve(null, this.events, cb);
};

SocketIO.prototype.executeCommand =
  function(client, robot, device, command, params, cb) {
    if (device) {
      device.socket.emit(command, params);
      return _.resolve(false, "Command Sent", cb);
    } else if (robot) {
      robot.socket.emit(command, params);
      return _.resolve(false, "Command Sent", cb);
    } else if (client) {
      client.socket.emit(command, params);
      return _.resolve(false, "Command Sent", cb);
    }
  };

SocketIO.prototype.on = function() {
  this.socket.on.apply(this.socket, arguments);
};
