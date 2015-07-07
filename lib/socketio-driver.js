"use strict";

var SocketioDriver = module.exports = function SocketioDriver(client, opts) {
  var self = this;
  opts = opts || {};

  this.client = client;

  for (var name in opts) {
    self[name] = opts[name];
  }
};

SocketioDriver.prototype.connect = function() {
  return "Connected!";
};

module.exports = SocketioDriver;
