"use strict";

var client = require("./lib/client");
require("./lib/http-driver");
require("./lib/command");
require("./lib/event");
require("./lib/robot");
require("./lib/device");
require("./lib/connection");

module.exports = function() {
    var CPPPIO = client;
};
