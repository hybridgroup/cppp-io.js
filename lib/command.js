"use strict";

var Command = function Command(command, client, robot, device) {
  this.client = client;
  this.robot = robot;
  this.device = device;
  this.command = command;
};

Command.prototype.defaults = {
  client: null,
  robot: null,
  device: null,
  command: null
};


Command.prototype.execute = function(params, cb) {
  if (this.device) {
    if (cb) {
      this.device.robot.client.executeCommand(
        this.client, this.device.robot, this.device, this.command, params, cb
      );
    }
    else {
      return this.device.robot.client.executeCommand(
        this.client, this.device.robot, this.device, this.command, params
      );
    }
  }
  else if (this.robot) {
    if (cb) {
      this.robot.client.executeCommand(
        this.client, this.robot, null, this.command, params, cb
      );
    }
    else {
      return this.robot.client.executeCommand(
        this.client, this.robot, null, this.command, params
      );
    }
  }
  else if (this.client) {
    if (cb) {
      this.client.executeCommand(
        this.client, null, null, this.command, params, cb
      );
    }
    else {
      return this.client.executeCommand(
        this.client, null, null, this.command, params
      );
    }
  }
};

module.exports = Command;
