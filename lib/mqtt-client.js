"use strict";

var _ = require("lodash");

var MqttClient = module.exports = function MqttClient(opts) {
  opts = opts || {};

  _.forEach(this.defaults, function(def, name) {
    this[name] = _.has(opts, name) ? opts[name] : def;
  }, this);
};

MqttClient.prototype.connect = function() {
  return "Connected!";
};

module.exports = MqttClient;
