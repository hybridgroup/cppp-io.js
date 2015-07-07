"use strict";

var request = require("request");

var Client = source("client");
var HttpDriver = source("http-driver");
var Event = source("event");

/*global jsonApi*/

describe("Event", function() {
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

    it("should initialize MCP events options", function() {
      httpDriver.connect();
      var evt = httpDriver.events[0];
      expect(evt).to.be.instanceOf(Event);
      expect(evt.name).to.be.eql("myEvent1");
      expect(evt.driver).to.be.eql(httpDriver);
      should.not.exist(evt.device);
      should.not.exist(evt.robot);
    });

    it("should initialize robot events options", function() {
      httpDriver.connect();
      var evt = httpDriver.robots[0].events[0];
      expect(evt).to.be.instanceOf(Event);
      expect(evt.name).to.be.eql("myRobotEvent1");
      expect(evt.robot).to.be.eql(httpDriver.robots[0]);
      should.not.exist(evt.device);
      should.not.exist(evt.client);
    });

    it("should initialize device events options", function() {
      httpDriver.connect();
      var evt = httpDriver.robots[0].devices[0].events[0];
      expect(evt).to.be.instanceOf(Event);
      expect(evt.name).to.be.eql("myDeviceEvent1");
      expect(evt.device).to.be.eql(httpDriver.robots[0].devices[0]);
      should.not.exist(evt.robot);
      should.not.exist(evt.client);
    });

  });


});
