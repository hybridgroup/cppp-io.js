"use strict";

var request = require("request");

var HttpClient = source("http-client");
var Event = source("event");

/*global jsonApi*/

describe("Event", function() {
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

      done();
    });

    afterEach(function(done) {
      request.get.restore();
      done();
    });

    it("should initialize MCP events options", function() {
      httpClient.connect();
      var evt = httpClient.events[0];
      expect(evt).to.be.instanceOf(Event);
      expect(evt.name).to.be.eql("myEvent1");
      expect(evt.client).to.be.eql(httpClient);
      should.not.exist(evt.device);
      should.not.exist(evt.robot);
    });

    it("should initialize robot events options", function() {
      httpClient.connect();
      var evt = httpClient.robots[0].events[0];
      expect(evt).to.be.instanceOf(Event);
      expect(evt.name).to.be.eql("myRobotEvent1");
      expect(evt.robot).to.be.eql(httpClient.robots[0]);
      should.not.exist(evt.device);
      should.not.exist(evt.client);
    });

    it("should initialize device events options", function() {
      httpClient.connect();
      var evt = httpClient.robots[0].devices[0].events[0];
      expect(evt).to.be.instanceOf(Event);
      expect(evt.name).to.be.eql("myDeviceEvent1");
      expect(evt.device).to.be.eql(httpClient.robots[0].devices[0]);
      should.not.exist(evt.robot);
      should.not.exist(evt.client);
    });

  });


});
