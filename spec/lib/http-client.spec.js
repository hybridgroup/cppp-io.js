"use strict";

var request = require("request");

var HttpClient = source("http-client");
var Robot = source("robot");
// var Device = source("device");
var Command = source("command");
var Event = source("event");
// var Connection = source("connection");

/*global jsonApi*/

describe("HttpClient", function() {
  var options = {
    host: "127.0.0.1",
    port: "8080"
  };
  var httpClient = new HttpClient(options);

  describe("#constructor", function() {
    it("should initialize options", function() {
      expect(httpClient.host).to.be.eql(options.host);
      expect(httpClient.port).to.be.eql(options.port);
    });
  });

  describe("#get Methods", function() {
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

    describe("#getRequest", function() {
      it("should make a get request", function(done) {
        httpClient.getRequest(
          httpClient.url(),
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
        var api = httpClient.getApi();
        expect(api).to.be.eql("Not Connected");
      });
    });

    describe("#getApi", function() {
      it("should returns an object containing info on the MCP", function() {
        httpClient.connect();
        var api = httpClient.getApi();
        expect(api).to.have.any.keys("commands", "events", "robots");
      });
    });

    describe("#getCommands", function() {
      it("should returns the MCP commands", function() {
        httpClient.connect();
        var commands = httpClient.getCommands();
        expect(commands[0].command).to.be.eql("myCommand1");
        expect(commands[1].command).to.be.eql("myCommand2");
        expect(commands[0]).to.be.instanceOf(Command);
        expect(commands[1]).to.be.instanceOf(Command);
      });
    });

    describe("#getRobots", function() {
      it("should returns the MCP robots", function() {
        httpClient.connect();
        var robots = httpClient.getRobots();
        expect(robots[0].name).to.be.eql("myRobot");
        expect(robots[0]).to.be.instanceOf(Robot);
      });
    });

    describe("#getEvents", function() {
      it("should returns the MCP events", function() {
        httpClient.connect();
        var events = httpClient.getEvents();
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
        .yields(null, 200, JSON.stringify({result: "ok"}));
      done();
    });

    afterEach(function(done) {
      request.post.restore();
      done();
    });

    it("should send the request", function(done) {
      httpClient.postRequest(
        httpClient.url(),
        {param: "my param"},
        function(error, response, body) {
          if (error) {
            return done();
          }
          expect(request.post.called).to.be.equal(true);
          expect(response).to.be.equal(200);
          expect(JSON.parse(body)).to.be.eql({result: "ok"});
          done();
        }
      );
    });

  });
});
