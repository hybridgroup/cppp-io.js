"use strict";

var request = require("request");

var Client = source("client");
var HttpDriver = source("http-driver");
var Robot = source("robot");

/*global jsonApi*/

describe("Command", function() {
  var options = {
    host: "127.0.0.1",
    port: "8080"
  };
  var client = new Client("http", options);
  var httpDriver = new HttpDriver(client);

  describe("#constructor", function() {
    beforeEach(function(done) {
      sinon
        .stub(request, "get")
        .yields(null, {statusCode: 200}, JSON.stringify(jsonApi));

      done();
    });

    afterEach(function(done) {
      request.get.restore();
      done();
    });

    it("should initialize robot options", function() {
      httpDriver.connect();
      var robot = httpDriver.robots[0];
      expect(robot).to.be.instanceOf(Robot);
      expect(robot.name).to.be.eql("myRobot");
      expect(robot.driver).to.be.eql(httpDriver);
      should.exist(robot.connections);
      should.exist(robot.commands);
      should.exist(robot.devices);
      should.exist(robot.events);
    });

  });


  describe("#methods", function() {
    beforeEach(function(done) {
      sinon
        .stub(request, "get")
        .yields(null, {statusCode: 200}, JSON.stringify(jsonApi));

      sinon
        .stub(request, "post")
        .yields(null, {statusCode: 200}, JSON.stringify({result: "ok"}));

      done();
    });

    afterEach(function(done) {
      request.get.restore();
      request.post.restore();
      done();
    });

    describe("#getCommands ", function() {
      it("should return the list of robots", function() {
        httpDriver.connect();
        var robot = httpDriver.robots[0];
        var commands = robot.getCommands();
        expect(commands.length).to.be.eql(2);
        expect(commands[0].command).to.be.eql("myRobotCommand1");
        expect(commands[1].command).to.be.eql("myRobotCommand2");
      });
    });

    describe("#getDevices ", function() {
      it("should return the list of devices", function() {
        httpDriver.connect();
        var robot = httpDriver.robots[0];
        var devices = robot.getDevices();
        expect(devices.length).to.be.eql(1);
        expect(devices[0].name).to.be.eql("myRobotDevice");
      });
    });

    describe("#getConnections ", function() {
      it("should return the list of connections", function() {
        httpDriver.connect();
        var robot = httpDriver.robots[0];
        var connections = robot.getConnections();
        expect(connections.length).to.be.eql(1);
        expect(connections[0].name).to.be.eql("myRobotConnection");
        expect(connections[0].adaptor).to.be.eql("myRobotAdaptor");
      });
    });

    describe("#getEvents ", function() {
      it("should return the list of events", function() {
        httpDriver.connect();
        var robot = httpDriver.robots[0];
        var events = robot.getEvents();
        expect(events.length).to.be.eql(2);
        expect(events[0].name).to.be.eql("myRobotEvent1");
        expect(events[1].name).to.be.eql("myRobotEvent2");
      });
    });

  });
});
