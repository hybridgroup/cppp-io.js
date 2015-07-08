"use strict";

var request = require("request");

var Client = source("client");
var HTTP = source("drivers/http");
var Robot = source("robot");
var Command = source("command");
var Event = source("event");

/*global jsonApi*/

describe("HTTP", function() {
  var options = {
    host: "127.0.0.1",
    port: "8080"
  };
  var client = new Client("http", options);
  var httpDriver = new HTTP(client);

  describe("#constructor", function() {
    it("should initialize options", function() {
      expect(httpDriver.host).to.be.eql(options.host);
      expect(httpDriver.port).to.be.eql(options.port);
    });
  });

  describe("#get Methods", function() {
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

    describe("#getRequest", function() {
      it("should make a get request", function(done) {
        httpDriver.getRequest(
          httpDriver.url(),
          function(error, response, body) {
            if (error) {
              return done();
            }
            expect(request.get.called).to.be.equal(true);
            expect(body);
            done();
          }
        );
      });
    });

    describe("#getApi", function() {
      it("should return error when not connected", function() {
        var api = httpDriver.getApi();
        expect(api).to.be.eql("Not Connected");
      });
    });

    describe("#getApi", function() {
      it("should returns an object containing info on the MCP", function() {
        httpDriver.connect();
        var api = httpDriver.getApi();
        expect(api).to.have.any.keys("commands", "events", "robots");
      });
    });

    describe("#getCommands", function() {
      it("should returns the MCP commands", function() {
        httpDriver.connect();
        var commands = httpDriver.getCommands();
        expect(commands[0].command).to.be.eql("myCommand1");
        expect(commands[1].command).to.be.eql("myCommand2");
        expect(commands[0]).to.be.instanceOf(Command);
        expect(commands[1]).to.be.instanceOf(Command);
      });
    });

    describe("#getRobots", function() {
      it("should returns the MCP robots", function() {
        httpDriver.connect();
        var robots = httpDriver.getRobots();
        expect(robots[0].name).to.be.eql("myRobot");
        expect(robots[0]).to.be.instanceOf(Robot);
      });
    });

    describe("#getEvents", function() {
      it("should returns the MCP events", function() {
        httpDriver.connect();
        var events = httpDriver.getEvents();
        expect(events[0].name).to.be.eql("myEvent1");
        expect(events[1].name).to.be.eql("myEvent2");
        expect(events[0]).to.be.instanceOf(Event);
        expect(events[1]).to.be.instanceOf(Event);
      });
    });
  });

  describe("#postRequest", function() {
    beforeEach(function(done) {
      sinon
        .stub(request, "post")
        .yields(null, {statusCode: 200}, JSON.stringify({result: "ok"}));
      done();
    });

    afterEach(function(done) {
      request.post.restore();
      done();
    });

    it("should send the request", function(done) {
      httpDriver.postRequest(
        httpDriver.url(),
        {param: "my param"},
        function(error, response, body) {
          if (error) {
            return done();
          }
          expect(request.post.called).to.be.equal(true);
          expect(response.statusCode).to.be.equal(200);
          expect(JSON.parse(body)).to.be.eql({result: "ok"});
          done();
        }
      );
    });

  });
});
