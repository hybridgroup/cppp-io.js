"use strict";

var Client = source("client");
var HTTP = source("drivers/http");
var SocketIO = source("drivers/socketio");
var MQTT = source("drivers/mqtt");
var request = require("request");

/*global jsonApi*/

describe("Client", function() {
  var options = {host: "127.0.0.1", port: 8080};

  describe("#constructor", function() {
    it("should initialize options", function() {
      var client = new Client("http", options);
      expect(client.protocol).to.be.eql("http");
      expect(client.host).to.be.eql("127.0.0.1");
      expect(client.port).to.be.eql(8080);
    });
  });

  describe("#initialize with missing params", function() {

    it("should throw error about missing protocol", function() {
      expect(Client.bind("new")).to.throw("Missing protocol");
    });

    it("should throw error about missing options", function() {
      expect(Client.bind("new", "http")).to.throw("No options provided");
    });

    it("should throw error about missing host", function() {
      var fn = Client.bind("new", "http", { port: "3000" });
      expect(fn).to.throw("No host option provided");
    });

    it("should throw error about missing port", function() {
      var fn = Client.bind("new", "http", { host: "0.0.0.0" });
      expect(fn).to.throw("No port option provided");
    });
  });

  describe("#initialize with correct params", function() {
    var opts = { host: "127.0.0.1", port: "3000" };

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

    it("should throw error about wrong protocol", function() {
      expect(
        Client.bind("new", "wrong", opts)
      ).to.throw("Unsupported protocol");
    });

    it("should set connection to correct client", function() {
      var client = new Client("http", opts);
      client.connect();
      expect(client.connection).to.be.an.instanceOf(HTTP);
    });

    it("should set connection to correct client", function() {
      var client = new Client("socketio", opts);
      client.connect();
      expect(client.connection).to.be.an.instanceOf(SocketIO);
    });

    it("should set connection to correct client", function() {
      var client = new Client("mqtt", opts);
      client.connect();
      expect(client.connection).to.be.an.instanceOf(MQTT);
    });

  });

  describe("#methods", function() {
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

    describe("#getRobots", function() {
      it("should get the list of robots", function() {
        var opts = { host: "127.0.0.1", port: "3000" };
        var client = new Client("http", opts);
        client.connect();
        expect(client.getRobots()).to.be.instanceof(Array);
      });
    });

    describe("#getRobot", function() {
      it("should return the robot", function() {
        var opts = { host: "127.0.0.1", port: "3000" };
        var client = new Client("http", opts);
        client.connect();
        should.exist(client.getRobot("myRobot"));
      });

      it("should return null if no robot found", function() {
        var opts = { host: "127.0.0.1", port: "3000" };
        var client = new Client("http", opts);
        client.connect();
        should.not.exist(client.getRobot("otherRobot"));
      });
    });

    describe("#getCommands", function() {
      it("should get the list of commands", function() {
        var opts = { host: "127.0.0.1", port: "3000" };
        var client = new Client("http", opts);
        client.connect();
        expect(client.getCommands()).to.be.instanceof(Array);
      });
    });

    describe("#getEvents", function() {
      it("should get the list of events", function() {
        var opts = { host: "127.0.0.1", port: "3000" };
        var client = new Client("http", opts);
        client.connect();
        expect(client.getEvents()).to.be.instanceof(Array);
      });
    });
  });

  describe("#disconnect", function() {
    it("should set connected to false", function() {
      var client = new Client("http", options);
      client.connect();
      client.disconnect();
      expect(
        client.connection
      ).to.be.eql(null);
    });
  });
});
