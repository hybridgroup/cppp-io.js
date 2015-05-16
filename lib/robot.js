"use strict";

var _ = require("lodash");
var Device = require("./device");
var Command = require("./command");
var Event = require("./event");
var Connection = require("./connection");

var Robot = function Robot(robotOpts, client) {
  this.client = client;
  this.connections = [];
  this.commands = [];
  this.devices = [];
  this.events = [];

  _.forEach(robotOpts, function(def, name) {

    if (name === "connections") {
      _.forEach(def, function(connection) {
        this.connections.push(new Connection(connection, this));
      }, this);
    }
    else if (name === "commands") {
      _.forEach(def, function(command) {
        this.commands.push(new Command(command, null, this));
      }, this);
    }
    else if (name === "devices") {
      _.forEach(def, function(device) {
        this.devices.push(new Device(device, this));
      }, this);
    }
    else if (name === "events") {
      _.forEach(def, function(event) {
        this.events.push(new Event(event, null, this));
      }, this);
    }
    else {
      this[name] = def;
    }
  }, this);
};


Robot.prototype.defaults = {
  client: null,
  name: null,
  connections: [],
  commands: [],
  devices: [],
  events: []
};

Robot.prototype.getConnections = function(cb) {
  if (this.connections) {
    return this.client.renderResults(null, this.connections, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

Robot.prototype.getCommands = function(cb) {
  if (this.commands) {
    return this.client.renderResults(null, this.commands, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

Robot.prototype.getDevices = function(cb) {
  if (this.devices) {
    return this.client.renderResults(null, this.devices, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

Robot.prototype.getEvents = function(cb) {
  if (this.events) {
    return this.client.renderResults(null, this.events, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};


module.exports = Robot;
