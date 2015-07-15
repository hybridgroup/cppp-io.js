"use strict";

var Event = function Event(evt, driver, robot, device) {
  this.driver = driver;
  this.robot = robot;
  this.device = device;
  this.name = evt;
};

module.exports = Event;
