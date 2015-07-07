"use strict";

var Command = function Command(command, client, robot, device) {
  this.driver = client;
  this.robot = robot;
  this.device = device;
  this.command = command;
};

Command.prototype.execute = function(params, cb) {
  if (this.device) {
    return this.device.robot.driver.executeCommand(
      this.driver, this.device.robot, this.device, this.command, params, cb
    );
  }
  else if (this.robot) {
    return this.robot.driver.executeCommand(
      this.driver, this.robot, null, this.command, params, cb
    );
  }
  else if (this.driver) {
    return this.driver.executeCommand(
      this.driver, null, null, this.command, params, cb
    );
  }
};

module.exports = Command;
