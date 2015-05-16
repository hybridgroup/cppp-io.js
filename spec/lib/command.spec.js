"use strict";

var request = require("request");

var HttpClient = source("http-client");
var Command = source("command");

/*global jsonApi*/

describe("Command", function() {
  var options = {
    host: "127.0.0.1",
    port: "8080"
  };
  var httpClient = new HttpClient(options);

  describe("#constructor", function() {
    beforeEach(function(done) {
      sinon
        .stub(request, "get")
        .yields(null, null, JSON.stringify(jsonApi));

      httpClient.connect();
      done();
    });

    afterEach(function(done) {
      request.get.restore();
      httpClient.disconnect();
      done();
    });

    it("should initialize MCP commands options", function() {
      var command = httpClient.commands[0];
      expect(command).to.be.instanceOf(Command);
      expect(command.command).to.be.eql("myCommand1");
      expect(command.client).to.be.eql(httpClient);
      should.not.exist(command.device);
      should.not.exist(command.robot);
    });

    it("should initialize robot commands options", function() {
      var command = httpClient.robots[0].commands[0];
      expect(command).to.be.instanceOf(Command);
      expect(command.command).to.be.eql("myRobotCommand1");
      expect(command.robot).to.be.eql(httpClient.robots[0]);
      should.not.exist(command.device);
      should.not.exist(command.client);
    });

    it("should initialize device commands options", function() {
      var command = httpClient.robots[0].devices[0].commands[0];
      expect(command).to.be.instanceOf(Command);
      expect(command.command).to.be.eql("myDeviceCommand1");
      expect(command.device).to.be.eql(httpClient.robots[0].devices[0]);
      should.not.exist(command.robot);
      should.not.exist(command.client);
    });
  });


  describe("#execute", function() {
    beforeEach(function(done) {
      sinon
        .stub(request, "get")
        .yields(null, null, JSON.stringify(jsonApi));

      sinon
        .stub(request, "post")
        .yields(null, 200, JSON.stringify({result: "ok"}));

      done();
    });

    afterEach(function(done) {
      request.get.restore();
      request.post.restore();
      done();
    });

    it("should execute MCP command", function() {
      httpClient.connect();
      var commands = httpClient.getCommands();
      var result = commands[0].execute({param1: "param1"});
      expect(result).to.be.eql({result: "ok"});
    });

    it("should execute robot command", function() {
      httpClient.connect();
      var robots = httpClient.getRobots();
      var result = robots[0].commands[0].execute({param1: "param1"});
      expect(result).to.be.eql({result: "ok"});
    });

    it("should execute device command", function() {
      httpClient.connect();
      var robots = httpClient.getRobots();
      var result = robots[0].devices[0].commands[0].execute({param1: "param1"});
      expect(result).to.be.eql({result: "ok"});
    });

  });
});
