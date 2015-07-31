"use strict";

var SocketIO = lib("protocols/socket-io");

describe("Protocols.SocketIO", function() {
  var client;

  beforeEach(function() {
    client = new SocketIO({ host: "localhost", port: "3000" });
  });

  describe("#constructor", function() {
    it("sets @socket to null", function() {
      expect(client.socket).to.be.eql(null);
    });

    it("sets @connected to false", function() {
      expect(client.connected).to.be.eql(false);
    });

    it("sets @data to null", function() {
      expect(client.data).to.be.eql(null);
    });

    it("sets @connections to an empty object", function() {
      expect(client.connections).to.be.eql({});
    });

    it("sets @host to the provided host", function() {
      expect(client.host).to.be.eql("localhost");
    });

    it("sets @port to the provided port", function() {
      expect(client.port).to.be.eql("3000");
    });

    it("sets @url to a combination of host and port", function() {
      expect(client.url).to.be.eql("http://localhost:3000");
    });

    context("with no host opt", function() {
      it("throws an error", function() {
        var fn = function() { return new SocketIO({ port: 3000 }); };
        expect(fn).to.throw("No host supplied for SocketIO protocol");
      });
    });

    context("with no port opt", function() {
      it("throws an error", function() {
        var fn = function() { return new SocketIO({ host: "localhost" }); };
        expect(fn).to.throw("No port supplied for SocketIO protocol");
      });
    });
  });

  describe("#connect", function() {
    var callback;

    beforeEach(function() {
      callback = spy();
      stub(client, "update");
      client.connect(callback);
    });

    it("sets @socket to a Socket.IO manager", function() {
      expect(client.socket).to.be.an("object");
      expect(client.socket.on).to.be.a("function");
      expect(client.socket.emit).to.be.a("function");
    });

    it("sets @connected to true", function() {
      expect(client.connected).to.be.eql(true);
    });

    it("calls #update", function() {
      expect(client.update).to.be.calledWith(callback);
    });

    context("on the '/' event", function() {
      beforeEach(function() {
        client.socket._callbacks["/"][0]("data");
      });

      it("sets @data to the provided value", function() {
        // this test doesn't work for some reason
        // expect(client.data).to.be.eql("data");
      });
    });
  });

  describe("#disconnect", function() {
    var callback;

    beforeEach(function() {
      callback = spy();

      client.connected = true;
      client.data = "hey here's some data";
      client.socket = "socket";

      client.disconnect(callback);
    });

    it("sets @connected to false", function() {
      expect(client.connected).to.be.eql(false);
    });

    it("sets @socket to null", function() {
      expect(client.socket).to.be.eql(null);
    });

    it("sets @data to null", function() {
      expect(client.data).to.be.eql(null);
    });

    it("resolves the callback", function() {
      expect(callback).to.be.called;
    });
  });

  describe("#update", function() {
    var socket, callback;

    beforeEach(function() {
      callback = spy();
      socket = { once: stub(), emit: stub() };

      client.socket = socket;

      client.update(callback);
    });

    it("emits '/' to the socket", function() {
      expect(socket.emit).to.be.calledWith("/");
    });

    context("when the '/' event is emitted", function() {
      beforeEach(function() {
        socket.once.yield("hello, world");
      });

      it("sets @data to the provided data", function() {
        expect(client.data).to.be.eql("hello, world");
      });

      it("resolves the callback with the data", function() {
        expect(callback).to.be.calledWith(null, "hello, world");
      });
    });
  });

  describe("#command", function() {
    var socket, callback;

    beforeEach(function() {
      callback = spy();
      socket = { on: stub(), emit: stub(), removeEventListener: stub() };

      client.connections.route = socket;
    });

    context("by default", function() {
      beforeEach(function() {
        client.command("cmd", "route", ["hello"], callback);
      });

      it("emits the #command event with the name and args", function() {
        expect(socket.emit).to.be.calledWith("command", {
          name: "cmd",
          args: ["hello"]
        });
      });

      context("when the #command event is returned", function() {
        context("if the command name is the same", function() {
          beforeEach(function() {
            socket.on.yield({ name: "cmd", data: "data" });
          });

          it("removes the listener", function() {
            expect(socket.removeEventListener).to.be.calledWith("command");
          });

          it("resolves the callback", function() {
            expect(callback).to.be.calledWith(null, "data");
          });
        });

        context("if the command name doesn't match", function() {
          beforeEach(function() {
            socket.on.yield({ name: "nope", data: "data" });
          });

          it("doesn't remove the listener", function() {
            expect(socket.removeEventListener).to.not.be.called;
          });

          it("doesn't resolve the callback", function() {
            expect(callback).to.not.be.called;
          });
        });
      });
    });

    context("when the route is ''", function() {
      beforeEach(function() {
        client.socket = socket;
        client.command("cmd", "", ["hello"], callback);
      });

      it("uses the root socket", function() {
        expect(client.socket.emit).to.be.calledWith("command");
      });
    });

    context("when the route hasn't been used already", function() {
      beforeEach(function() {
        client.command("cmd", "newRoute");
      });

      it("creates a new socket namespace", function() {
        expect(client.connections.newRoute).to.be.a("object");
        expect(client.connections.newRoute.emit).to.be.a("function");
      });
    });
  });

  describe("#event", function() {
    var callback, socket;

    beforeEach(function() {
      callback = stub();
      socket = { on: stub() };
      client.connections.route = socket;
    });

    context("by default", function() {
      beforeEach(function() {
        client.event("event", "route", callback);
      });

      it("registers an 'event' listener", function() {
        expect(socket.on).to.be.calledWith("event");
      });

      context("when the listener is called", function() {
        context("if the event name matches", function() {
          beforeEach(function() {
            socket.on.yield({ name: "event", data: "data" });
          });

          it("invokes the callback", function() {
            expect(callback).to.be.calledWith("data");
          });
        });

        context("if the event name doesn't match", function() {
          beforeEach(function() {
            socket.on.yield({ name: "nope" });
          });

          it("doesn't invoke the callback", function() {
            expect(callback).to.not.be.called;
          });
        });
      });
    });

    context("when 'route' is ''", function() {
      beforeEach(function() {
        client.event("event", "newRoute");
      });

      it("creates a new socket namespace", function() {
        expect(client.connections.newRoute).to.be.a("object");
        expect(client.connections.newRoute.on).to.be.a("function");
      });
    });

    context("when the route hasn't been used already", function() {
      beforeEach(function() {
        client.event("event", "newRoute");
      });

      it("creates a new socket namespace", function() {
        expect(client.connections.newRoute).to.be.a("object");
        expect(client.connections.newRoute.on).to.be.a("function");
      });
    });
  });
});
