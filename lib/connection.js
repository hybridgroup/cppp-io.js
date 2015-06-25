"use strict";

var Connection = function Connection(connection, robot) {
  var self = this;
  var name;
  this.robot = robot;

  for (name in connection) {
    self[name] = connection[name];
  }
};

module.exports = Connection;
