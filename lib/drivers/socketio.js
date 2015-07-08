"use strict";

var SocketIO = module.exports = function SocketIO(client, opts) {
  var self = this;
  opts = opts || {};

  this.client = client;

  for (var name in opts) {
    self[name] = opts[name];
  }
};

SocketIO.prototype.connect = function() {
  return "Connected!";
};
