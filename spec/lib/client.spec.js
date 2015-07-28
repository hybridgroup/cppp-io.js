"use strict";

var Client = lib("client"),
    decorator = lib("decorator"),
    HTTP = lib("protocols/http");

describe("Client", function() {
  var client;

  beforeEach(function() {
    client = new Client("http", { host: "localhost", port: 3000 });
  });

  it("is a class", function() {
    expect(Client).to.be.a("function");
    expect(client).to.be.an("object");
  });

  describe("constructor", function() {
    function create(protocol, opts) {
      return function() { return new Client(protocol, opts); };
    }

    it("sets @protocol to the specified protocol", function() {
      expect(client.protocol).to.be.eql("http");
    });

    it("sets @driver to a driver instance", function() {
      expect(client.driver).to.be.an.instanceOf(HTTP);
    });

    context("without a protocol", function() {
      it("throws an error", function() {
        expect(create()).to.throw("Missing protocol");
      });
    });

    context("with an invalid protocol", function() {
      it("throws an error", function() {
        expect(create("nope")).to.throw("Unsupported protocol");
      });
    });

    context("with no options", function() {
      it("throws an error", function() {
        expect(create("http")).to.throw("No options provided");
      });
    });

    context("with no host", function() {
      it("throws an error", function() {
        var fn = create("http", { port: "3000" });
        expect(fn).to.throw("No host option provided");
      });
    });

    context("with no port", function() {
      it("throws an error", function() {
        var fn = create("http", { host: "localhost" });
        expect(fn).to.throw("No port option provided");
      });
    });
  });

  describe("#connect", function() {
    var callback;

    beforeEach(function() {
      callback = spy();
      stub(client.driver, "connect");
      stub(decorator, "decorate");
      client.connect(callback);
    });

    afterEach(function() {
      decorator.decorate.restore();
    });

    it("tells the driver to connect", function() {
      expect(client.driver.connect).to.be.called;
      expect(callback).to.not.be.called;
    });

    describe("once connected", function() {
      context("if data was returned", function() {
        it("decorates and returns the server data", function() {
          decorator.decorate.returns("decorated data");
          client.driver.connect.yield(null, "data");
          expect(callback).to.be.calledWith(null, "decorated data");
        });
      });

      context("if there was an error", function() {
        it("resolves the callback", function() {
          client.driver.connect.yield("error");
          expect(callback).to.be.calledWith("error", undefined);
          expect(decorator.decorate).to.not.be.called;
        });
      });
    });
  });

  describe("#update", function() {
    var callback;

    beforeEach(function() {
      callback = spy();

      stub(client.driver, "update");
      stub(decorator, "decorate");
    });

    afterEach(function() {
      decorator.decorate.restore();
    });

    context("if not connected", function() {
      it("triggers the callback with an error", function() {
        client.update(callback);
        var err = "Not connected. Call Client#connect instead.";
        expect(callback).to.be.calledWith(err);
      });
    });

    context("if connected", function() {
      beforeEach(function() {
        client.driver.connected = true;
        client.update(callback);
      });

      it("tells the driver to update", function() {
        expect(client.driver.update).to.be.called;
        expect(callback).to.not.be.called;
      });

      describe("once updated", function() {
        context("if data was returned", function() {
          it("decorates and returns the server data", function() {
            decorator.decorate.returns("decorated data");
            client.driver.update.yield(null, "data");
            expect(callback).to.be.calledWith(null, "decorated data");
          });
        });

        context("if there was an error", function() {
          it("resolves the callback", function() {
            client.driver.update.yield("error");
            expect(callback).to.be.calledWith("error", undefined);
            expect(decorator.decorate).to.not.be.called;
          });
        });
      });
    });
  });
});
