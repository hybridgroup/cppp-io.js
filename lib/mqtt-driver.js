"use strict";

var MqttDriver = module.exports = function MqttDriver(client, opts) {
  var self = this;
  opts = opts || {};

  this.client = client;

  for (var name in opts) {
    self[name] = opts[name];
  }
};

MqttDriver.prototype.connect = function() {
  return "Connected!";
};

module.exports = MqttDriver;
