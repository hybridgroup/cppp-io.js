"use strict";

process.env.NODE_ENV = "test";

var path = require("path");

var chai = require("chai"),
    sinon = require("sinon"),
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

global.chai = chai;
global.sinon = sinon;

global.should = chai.should();
global.expect = chai.expect;
global.assert = chai.assert;
global.AssertionError = chai.AssertionError;

global.spy = sinon.spy;
global.stub = sinon.stub;


// convenience function to require modules in lib directory
global.source = function(module) {
  return require(path.normalize("./../lib/" + module));
};

global.jsonApi = {
  MCP: {
    robots: [{
      name: "myRobot",
      connections: [{
        name: "myRobotConnection",
        adaptor: "myRobotAdaptor",
      }],
      devices: [{
        name: "myRobotDevice",
        driver: "myRobotDeviceDriver",
        connection: "myRobotDeviceConnection",
        commands: [
          "myDeviceCommand1",
          "myDeviceCommand2"
        ],
        events: [
          "myDeviceEvent1",
          "myDeviceEvent2"
        ],
        details: {}
      }],
      commands: [
        "myRobotCommand1",
        "myRobotCommand2"
      ],
      events: ["myRobotEvent1", "myRobotEvent2"]
    }],
    commands: ["myCommand1", "myCommand2"],
    events: ["myEvent1", "myEvent2"]
  }
};
