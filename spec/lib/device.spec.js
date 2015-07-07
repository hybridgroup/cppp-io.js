"use strict";

var request = require("request");

var Client = source("client");
var HttpDriver = source("http-driver");
var Device = source("device");

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
      var device = httpDriver.robots[0].devices[0];
      expect(device).to.be.instanceOf(Device);
      expect(device.name).to.be.eql("myRobotDevice");
      expect(device.driver).to.be.eql("myRobotDeviceDriver");
      expect(device.connection).to.be.eql("myRobotDeviceConnection");
      expect(device.robot).to.be.eql(httpDriver.robots[0]);
      should.exist(device.commands);
      should.exist(device.events);
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
        var device = httpDriver.robots[0].devices[0];
        var commands = device.getCommands();
        expect(commands.length).to.be.eql(2);
        expect(commands[0].command).to.be.eql("myDeviceCommand1");
        expect(commands[1].command).to.be.eql("myDeviceCommand2");
      });
    });

    describe("#getEvents ", function() {
      it("should return the list of events", function() {
        httpDriver.connect();
        var device = httpDriver.robots[0].devices[0];
        var events = device.getEvents();
        expect(events.length).to.be.eql(2);
        expect(events[0].name).to.be.eql("myDeviceEvent1");
        expect(events[1].name).to.be.eql("myDeviceEvent2");
      });
    });

  });
});
