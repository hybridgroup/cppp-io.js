"use strict";

var request = require("superagent");

var HTTP = lib("protocols/http");

describe("Protocols.HTTP", function() {
  var req, http;

  beforeEach(function() {
    req = { end: stub() };

    req.send = stub().returns(req);

    stub(request, "get").returns(req);
    stub(request, "post").returns(req);

    http = new HTTP({ host: "localhost", port: "3000" });
  });

  afterEach(function() {
    request.get.restore();
    request.post.restore();
  });

  describe("#constructor", function() {
    it("sets @connected to false", function() {
      expect(http.connected).to.be.eql(false);
    });

    it("sets @listeners to an empty object", function() {
      expect(http.listeners).to.be.eql({});
    });

    it("sets @data to null", function() {
      expect(http.data).to.be.eql(null);
    });

    it("sets @host to the provided host", function() {
      expect(http.host).to.be.eql("localhost");
    });

    it("sets @port to the provided port", function() {
      expect(http.port).to.be.eql("3000");
    });

    it("sets @url to a combination of host and port", function() {
      expect(http.url).to.be.eql("http://localhost:3000");
    });

    context("with no host opt", function() {
      it("throws an error", function() {
        var fn = function() { return new HTTP({ port: 3000 }); };
        expect(fn).to.throw("No host supplied for HTTP protocol");
      });
    });

    context("with no port opt", function() {
      it("throws an error", function() {
        var fn = function() { return new HTTP({ host: "localhost" }); };
        expect(fn).to.throw("No port supplied for HTTP protocol");
      });
    });
  });

  describe("#connect", function() {
    var callback;
    beforeEach(function() {
      callback = spy();
      spy(http, "update");
      http.connect(callback);
    });

    it("sets @connected to true", function() {
      expect(http.connected).to.be.eql(true);
    });

    it("calls #update", function() {
      expect(http.update).to.be.calledWith(callback);
    });
  });

  describe("#disconnect", function() {
    var callback;

    beforeEach(function() {
      callback = spy();

      http.connected = true;
      http.data = "hey here's some data";

      http.disconnect(callback);
    });

    it("sets @connected to false", function() {
      expect(http.connected).to.be.eql(false);
    });

    it("sets @data to null", function() {
      expect(http.data).to.be.eql(null);
    });

    it("resolves the callback", function() {
      expect(callback).to.be.called;
    });
  });

  describe("#update", function() {
    var callback;

    beforeEach(function() {
      callback = spy();
      http.update(callback);
    });

    it("makes a GET request for the data", function() {
      expect(request.get).to.be.calledWith(http.url + "/api");
    });

    context("when an error occurs", function() {
      beforeEach(function() {
        req.end.yield("error");
      });

      it("triggers the callback with the error", function() {
        expect(callback).to.be.calledWith("error");
      });
    });

    context("when an un-ok response occurs", function() {
      beforeEach(function() {
        req.end.yield(null, { ok: false, text: "an error" });
      });

      it("triggers the callback with the error", function() {
        expect(callback).to.be.calledWith("an error");
      });
    });

    context("when an ok response occurs", function() {
      beforeEach(function() {
        req.end.yield(null, { ok: true, body: { MCP: "data" }});
      });

      it("triggers the callback with the data", function() {
        expect(callback).to.be.calledWith(null, "data");
      });

      it("sets @data to the returned value", function() {
        expect(http.data).to.be.eql("data");
      });
    });
  });

  describe("#command", function() {
    var endpoint, name, params, callback;

    beforeEach(function() {
      endpoint = "robots/TestBot";
      name = "command";
      params = { hello: "world" };
      callback = spy();

      http.command(name, endpoint, params, callback);
    });

    it("makes a POST with the appropriate endpoint and params", function() {
      var url = http.url + "/api/" + endpoint + "/commands/" + name;
      expect(request.post).to.be.calledWith(url);
      expect(req.send).to.be.calledWith(params);
    });

    context("when an error occurs", function() {
      beforeEach(function() {
        req.end.yield("error", {});
      });

      it("triggers the callback with the error", function() {
        expect(callback).to.be.calledWith("error");
      });
    });

    context("when an un-ok response occurs", function() {
      beforeEach(function() {
        req.end.yield(null, { ok: false, text: "an error" });
      });

      it("triggers the callback with the error", function() {
        expect(callback).to.be.calledWith("an error");
      });
    });

    context("when an ok response occurs", function() {
      beforeEach(function() {
        req.end.yield(null, { ok: true, body: { result: "data" }});
      });

      it("triggers the callback with the data", function() {
        expect(callback).to.be.calledWith(null, "data");
      });
    });
  });

  describe("#event", function() {
    context("if the event is not already subscribed to", function() {
      it("creates a new event listener + EventSource", function() {
        function listener() {
          return http.listeners["robots/TestBot/events/hello"];
        }

        function callback() {}

        expect(listener()).to.be.undefined;

        http.event("hello", "robots/TestBot", callback);

        var evt = listener();

        expect(evt).to.be.an("object");
        expect(evt.callbacks).to.be.eql([callback]);

        expect(evt.eventsource.url).to.be.eql(
          "http://localhost:3000/api/robots/TestBot/events/hello"
        );
      });
    });

    it("triggers all callbacks when messages are received", function() {
      var callback1 = spy(),
          callback2 = spy();

      http.event("hello", "robots/TestBot", callback1);
      http.event("hello", "robots/TestBot", callback2);

      expect(callback1).to.not.be.called;
      expect(callback2).to.not.be.called;

      var es = http.listeners["robots/TestBot/events/hello"].eventsource;
      es.onmessage({ data: JSON.stringify({json: "data"}) });

      expect(callback1).to.be.calledWith({json: "data"});
      expect(callback2).to.be.calledWith({json: "data"});
    });

    context("if the event is already subscribed to", function() {
      beforeEach(function() {
        http.listeners["robots/TestBot/events/hello"] = {
          eventsource: {},
          callbacks: []
        };
      });

      it("registers a new callback", function() {
        var callback = function() {};
        http.event("hello", "robots/TestBot", callback);
        var cbs = http.listeners["robots/TestBot/events/hello"].callbacks;
        expect(cbs).to.be.eql([callback]);
      });
    });
  });
});
