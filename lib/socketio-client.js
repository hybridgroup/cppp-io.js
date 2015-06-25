"use strict";

var SocketioClient = module.exports = function SocketioClient(client, opts) {
  var self = this;
  opts = opts || {};

  this.client = client;

  for (var name in opts) {
    self[name] = opts[name];
  }
};

SocketioClient.prototype.connect = function() {
  return "Connected!";
};

module.exports = SocketioClient;
