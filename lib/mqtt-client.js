"use strict";

var MqttClient = module.exports = function MqttClient(client, opts) {
  var self = this;
  opts = opts || {};

  this.client = client;

  for (var name in opts) {
    self[name] = opts[name];
  }
};

MqttClient.prototype.connect = function() {
  return "Connected!";
};

module.exports = MqttClient;
