"use strict";

var request = require("request");

var Client = source("client");
var HTTP = source("drivers/http");
var Command = source("command");

/*global jsonApi*/

describe("Command", function() {
  var options = {
    host: "127.0.0.1",
    port: "8080"
  };
  var client = new Client("http", options);
  var httpDriver = new HTTP(client);

  describe("#constructor", function() {
    beforeEach(function(done) {
      sinon
        .stub(request, "get")
        .yields(null, {statusCode: 200}, JSON.stringify(jsonApi));

      httpDriver.connect();
      done();
    });

    afterEach(function(done) {
      request.get.restore();
      httpDriver.disconnect();
      done();
    });

    it("should initialize MCP commands options", function() {
      var command = httpDriver.commands[0];
      expect(command).to.be.instanceOf(Command);
      expect(command.command).to.be.eql("myCommand1");
      expect(command.driver).to.be.eql(httpDriver);
      should.not.exist(command.device);
      should.not.exist(command.robot);
    });

    it("should initialize robot commands options", function() {
      var command = httpDriver.robots[0].commands[0];
      expect(command).to.be.instanceOf(Command);
      expect(command.command).to.be.eql("myRobotCommand1");
      expect(command.robot).to.be.eql(httpDriver.robots[0]);
      should.not.exist(command.device);
      should.not.exist(command.driver);
    });

    it("should initialize device commands options", function() {
      var command = httpDriver.robots[0].devices[0].commands[0];
      expect(command).to.be.instanceOf(Command);
      expect(command.command).to.be.eql("myDeviceCommand1");
      expect(command.device).to.be.eql(httpDriver.robots[0].devices[0]);
      should.not.exist(command.robot);
      should.not.exist(command.driver);
    });
  });


  describe("#execute", function() {
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

    it("should execute MCP command", function() {
      httpDriver.connect();
      var commands = httpDriver.getCommands();
      commands[0].execute(function(error, result) {
        if (!error) {
          expect(result).to.be.eql(JSON.stringify({result: "ok"}));
        }
      });
    });

    it("should execute robot command", function() {
      httpDriver.connect();
      var robots = httpDriver.getRobots();
      robots[0].commands[0].execute({param1: "abc"}, function(error, result) {
        if (!error) {
          expect(result).to.be.eql(JSON.stringify({result: "ok"}));
        }
      });
    });

    it("should execute device command", function() {
      httpDriver.connect();
      var robots = httpDriver.getRobots();
      robots[0].devices[0].commands[0].execute({param1: "abc"},
        function(error, result) {
          if (!error) {
            expect(result).to.be.eql(JSON.stringify({result: "ok"}));
          }
        });
    });

  });
});
