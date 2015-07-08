"use strict";

var MQTT = module.exports = function MQTT(client, opts) {
  var self = this;
  opts = opts || {};

  this.client = client;

  for (var name in opts) {
    self[name] = opts[name];
  }
};

MQTT.prototype.connect = function() {
  return "Connected!";
};
