"use strict";

var _ = require("lodash");

var SocketioClient = module.exports = function SocketioClient(opts) {
  opts = opts || {};

  _.forEach(this.defaults, function(def, name) {
    this[name] = _.has(opts, name) ? opts[name] : def;
  }, this);
};

SocketioClient.prototype.connect = function() {
  return "Connected!";
};

module.exports = SocketioClient;
