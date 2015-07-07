"use strict";

var request = require("request");

var Client = source("client");
var HttpDriver = source("http-driver");
var Connection = source("connection");

/*global jsonApi*/

describe("Connection", function() {
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

    it("should initialize robot commands connections", function() {
      httpDriver.connect();
      var connection = httpDriver.robots[0].connections[0];
      expect(connection).to.be.instanceOf(Connection);
      expect(connection.name).to.be.eql("myRobotConnection");
      expect(connection.adaptor).to.be.eql("myRobotAdaptor");
      expect(connection.robot).to.be.eql(httpDriver.robots[0]);
    });

  });


});
