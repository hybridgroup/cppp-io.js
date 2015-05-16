"use strict";

var Event = function Event(evt, client, robot, device) {
  this.client = client;
  this.robot = robot;
  this.device = device;
  this.name = evt;
};

Event.prototype.defaults = {
  client: null,
  robot: null,
  device: null,
  name: null
};

module.exports = Event;
