"use strict";

var _ = require("lodash");

var Connection = function Connection(connection, robot) {
  this.robot = robot;

  _.forEach(connection, function(def, name) {
    this[name] = def;
  }, this);
};

Connection.prototype.defaults = {
  robot: null,
  name: null,
  adaptor: null,
  details: null
};

module.exports = Connection;
