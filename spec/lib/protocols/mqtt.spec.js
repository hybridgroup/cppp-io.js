"use strict";

var MQTT = lib("protocols/mqtt");

var mqtt = require("mqtt");

function fakeClient() {
  return {
    on: stub(),
    subscribe: stub(),
    unsubscribe: stub(),
    publish: stub(),
    removeListener: stub()
  };
}

describe("Protocols.MQTT", function() {
  var client;

  beforeEach(function() {
    client = new MQTT({ broker: "mqtt://localhost" });
  });

  describe("constructor", function() {
    it("sets @client to null", function() {
      expect(client.client).to.be.eql(null);
    });

    it("sets @connected to false", function() {
      expect(client.connected).to.be.eql(false);
    });

    it("sets @data to null", function() {
      expect(client.data).to.be.eql(null);
    });

    it("sets @broker to the provided value", function() {
      expect(client.broker).to.be.eql("mqtt://localhost");
    });

    context("if no broker is provided", function() {
      it("throws an error", function() {
        var fn = function() { return new MQTT({}); };
        expect(fn).to.throw("No broker supplied for MQTT protocol");
      });
    });
  });

  describe("#connect", function() {
    var mqttClient, callback;

    beforeEach(function() {
      mqttClient = fakeClient();
      callback = spy();

      stub(mqtt, "connect").returns(mqttClient);

      client.connect(callback);
    });

    afterEach(function() {
      mqtt.connect.restore();
    });

    it("calls mqtt#connect with the broker URL", function() {
      expect(mqtt.connect).to.be.calledWith("mqtt://localhost");
    });

    it("sets @client to the returned MQTT instance", function() {
      expect(client.client).to.be.eql(mqttClient);
    });

    it("attaches a 'connect' event listener", function() {
      expect(mqttClient.on).to.be.calledWith("connect");
    });

    it("attaches a 'close' event listener", function() {
      expect(mqttClient.on).to.be.calledWith("close");
    });

    it("attaches a 'message' event listener", function() {
      expect(mqttClient.on).to.be.calledWith("message");
    });

    it("subscribes to updates on the '/api' topic", function() {
      expect(mqttClient.subscribe).to.be.calledWith("/api");
    });

    it("pings the broker for data", function() {
      expect(mqttClient.publish).to.be.calledWith("/api");
    });

    context("when MCP data is emitted by the server", function() {
      var message;

      beforeEach(function() {
        var body = new Buffer(JSON.stringify({
          robots: ["Freddy"],
          sender: 1102.10
        }));

        message = function() {
          mqttClient.on.withArgs("message").yield("/api", body);
        };
      });

      it("stores the data in the client", function() {
        expect(client.data).to.be.eql(null);
        message();
        expect(client.data).to.be.eql({ robots: ["Freddy"] });
      });

      it("resolves the callback with data, but only once", function() {
        expect(callback).to.not.be.called;
        message();
        expect(callback).to.be.calledWith(null, client.data);
        message();
        expect(callback).to.be.calledOnce;
      });
    });
  });

  describe("#disconnect", function() {
    var callback;

    beforeEach(function() {
      callback = spy();
      client.client = { end: stub() };
      client.disconnect(callback);
    });

    it("calls #end on the MQTT client", function() {
      expect(client.client.end).to.be.calledWith(false, callback);
    });
  });

  describe("#update", function() {
    var mqttClient, callback;

    beforeEach(function() {
      callback = spy();
      mqttClient = fakeClient();
      client.client = mqttClient;

      client.update(callback);
    });

    it("subscribes to the 'message' event", function() {
      expect(mqttClient.on).to.be.calledWith("message");
    });

    it("pings the broker for data", function() {
      expect(mqttClient.publish).to.be.calledWith("/api");
    });

    context("when data is sent from the broker", function() {
      beforeEach(function() {
        var data = { robots: ["Freddy"] },
            body = new Buffer(JSON.stringify(data));

        client.data = data;

        mqttClient.on.withArgs("message").yield("/api", body);
      });

      it("resolves the callback", function() {
        expect(callback).to.be.calledWith(null, client.data);
      });

      it("removes the event listener", function() {
        var fn = mqttClient.on.firstCall.args[1];
        expect(mqttClient.removeListener).to.be.calledWith("message", fn);
      });
    });
  });

  describe("#command", function() {
    var mqttClient, callback, path;

    beforeEach(function() {
      callback = spy();
      client.client = mqttClient = fakeClient();
      path = "/api/robots/TestBot/command";

      client.command("cmd", "robots/TestBot", ["hello, world"], callback);
    });

    it("adds an events listener for 'message'", function() {
      expect(mqttClient.on).to.be.calledWith("message");
    });

    it("subscribes to the command route", function() {
      expect(mqttClient.subscribe).to.be.calledWith(path);
    });

    it("publishes a message with the command name and arguments", function() {
      expect(mqttClient.publish).to.be.calledWith(path, JSON.stringify({
        command: "cmd",
        args: ["hello, world"],
        sender: "client"
      }));
    });

    context("when a response is received", function() {
      beforeEach(function() {
        var msg = mqttClient.on.withArgs("message");
        msg.yield(path, new Buffer(JSON.stringify({
          command: "cmd",
          data: "response",
          sender: 11.2
        })));
      });

      it("triggers the callback", function() {
        expect(callback).to.be.calledWith(null, "response");
      });

      it("removes the event listener", function() {
        var fn = mqttClient.on.firstCall.args[1];
        expect(mqttClient.removeListener).to.be.calledWith("message", fn);
      });
    });

    context("when a response is received for a different command", function() {
      beforeEach(function() {
        var msg = mqttClient.on.withArgs("message");
        msg.yield(path, new Buffer(JSON.stringify({
          command: "nope",
          sender: 11.2
        })));
      });

      it("does nothing", function() {
        expect(callback).to.not.be.called;
      });
    });
  });

  describe("#event", function() {
    var callback, mqttClient, path;

    beforeEach(function() {
      callback = spy();
      client.client = mqttClient = fakeClient();
      path = "/api/robots/TestBot/events/evt";

      client.event("evt", "robots/TestBot", callback);
    });

    it("subscribes to the specified event", function() {
      expect(mqttClient.subscribe).to.be.calledWith(path);
    });

    context("when the event is emitted", function() {
      beforeEach(function() {
        var msg = mqttClient.on.withArgs("message");
        msg.yield(path, new Buffer(JSON.stringify({
          data: "event data",
          sender: 11.2
        })));
      });

      it("triggers the callback", function() {
        expect(callback).to.be.calledWith("event data");
      });
    });
  });

  describe("#ping", function() {
    var publish;

    beforeEach(function() {
      client.client = {};
      publish = client.client.publish = spy();
      client.ping("topic");
    });

    it("sends a (mostly) empty message to the broker", function() {
      var payload = JSON.stringify({ sender: "client" });
      expect(publish).to.be.calledWith("topic", payload);
    });
  });

  describe("#publish", function() {
    var publish;

    beforeEach(function() {
      client.client = {};
      publish = client.client.publish = spy();
      client.publish("topic", { data: "hello, world!" });
    });

    it("publishes a payload to the broker", function() {
      var payload = JSON.stringify({
        data: "hello, world!",
        sender: "client"
      });

      expect(publish).to.be.calledWith("topic", payload);
    });
  });
});
