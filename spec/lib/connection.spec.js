"use strict";

var request = require("request");

var HttpClient = source("http-client");
var Connection = source("connection");

/*global jsonApi*/

describe("Connection", function() {
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

    it("should initialize robot commands connections", function() {
      httpClient.connect();
      var connection = httpClient.robots[0].connections[0];
      expect(connection).to.be.instanceOf(Connection);
      expect(connection.name).to.be.eql("myRobotConnection");
      expect(connection.adaptor).to.be.eql("myRobotAdaptor");
      expect(connection.robot).to.be.eql(httpClient.robots[0]);
    });

  });


});
