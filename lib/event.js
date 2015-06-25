"use strict";

var Event = function Event(evt, client, robot, device) {
  this.client = client;
  this.robot = robot;
  this.device = device;
  this.name = evt;
};

module.exports = Event;
