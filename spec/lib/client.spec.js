"use strict";

var Client = source("client");
var HttpClient = source("http-client");
var SocketClient = source("socketio-client");
var MqttClient = source("mqtt-client");
var request = require("request");

/*global jsonApi*/

describe("Client", function() {
  var client = Client;
  beforeEach(function() {
    client.disconnect();
  });
  describe("#constructor", function() {
    it("should initialize connected variable with false", function() {
      expect(client.connected).to.be.eql(false);
    });

    it("should initialize connected variable with false", function() {
      expect(client.connection).to.be.eql(null);
    });
  });

  describe("#connect with missing params", function() {
    it("should throw error about missing protocol", function() {
      expect(
        client.connect.bind(client)
      ).to.throw("Missing Protocol");
    });

    it("should throw error about missing options", function() {
      expect(
        client.connect.bind(client, "http")
      ).to.throw("Missing Options");
    });
  });

  describe("#connect with correct params", function() {
    var opts = { host: "127.0.0.1", port: "3000" };

    beforeEach(function(done) {
      sinon
        .stub(request, "get")
        .yields(null, null, JSON.stringify(jsonApi));
      done();
    });

    afterEach(function(done) {
      request.get.restore();
      done();
    });

    it("should throw error about wrong protocol", function() {
      expect(
        client.connect.bind(client, "wrong", opts)
      ).to.throw("Unsupported Protocol");
    });

    it("should set connected to true", function() {
      client.connect("http", opts);
      expect(
        client.connected
      ).to.be.eql(true);
    });

    it("should set connection to correct client", function() {
      client.connect("http", opts);
      expect(
        client.connection
      ).to.be.an.instanceOf(HttpClient);
    });

    it("should set connection to correct client", function() {
      client.connect("socketio", opts);
      expect(
        client.connection
      ).to.be.an.instanceOf(SocketClient);
    });

    it("should set connection to correct client", function() {
      client.connect("mqtt", opts);
      expect(
        client.connection
      ).to.be.an.instanceOf(MqttClient);
    });

  });

  describe("#methods", function() {
    beforeEach(function(done) {
      sinon
        .stub(request, "get")
        .yields(null, null, JSON.stringify(jsonApi));
      done();
    });

    afterEach(function(done) {
      request.get.restore();
      done();
    });

    describe("#getRobots", function() {
      it("should get the list of robots", function() {
        var opts = { host: "127.0.0.1", port: "3000" };
        client.connect("http", opts);
        expect(client.getRobots()).to.be.instanceof(Array);
      });
    });

    describe("#getRobot", function() {
      it("should return the robot", function() {
        var opts = { host: "127.0.0.1", port: "3000" };
        client.connect("http", opts);
        should.exist(client.getRobot("myRobot"));
      });

      it("should return null if no robot found", function() {
        var opts = { host: "127.0.0.1", port: "3000" };
        client.connect("http", opts);
        should.not.exist(client.getRobot("otherRobot"));
      });
    });

    describe("#getCommands", function() {
      it("should get the list of commands", function() {
        var opts = { host: "127.0.0.1", port: "3000" };
        client.connect("http", opts);
        expect(client.getCommands()).to.be.instanceof(Array);
      });
    });

    describe("#getEvents", function() {
      it("should get the list of events", function() {
        var opts = { host: "127.0.0.1", port: "3000" };
        client.connect("http", opts);
        expect(client.getEvents()).to.be.instanceof(Array);
      });
    });
  });

  describe("#disconnect", function() {
    it("should set connected to false", function() {
      client.disconnect();
      expect(
        client.connected
      ).to.be.eql(false);
    });

    it("should set connection to null", function() {
      client.disconnect();
      expect(
        client.connection
      ).to.be.eql(null);
    });
  });
});
