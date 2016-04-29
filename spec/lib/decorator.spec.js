"use strict";

var decorator = lib("decorator"),
    _ = lib("utils"),
    data = support("mcp.json");

describe("decorator", function() {
  describe("#decorate", function() {
    var driver = { command: stub(), event: stub() },
        mcp = decorator.decorate(driver, _.extend({}, data)),
        bot = mcp.robots[0],
        device = bot.devices[0];

    it("binds MCP commands", function() {
      expect(mcp.echo).to.be.a("function");
      mcp.echo("one", "two");
      expect(driver.command).to.be.calledWith("echo", "", "one", "two");
    });

    it("adds an #on function to the MCP", function() {
      expect(mcp.on).to.be.a("function");
      mcp.on("event", console.log);
      expect(driver.event).to.be.calledWith("event", "", console.log);
    });

    it("adds a #robot function to the MCP", function() {
      expect(mcp.robot).to.be.a("function");
      expect(mcp.robot("TestBot")).to.be.eql(bot);
    });

    it("binds robot commands", function() {
      expect(bot.hello).to.be.a("function");
      bot.hello("world", console.log);
      expect(driver.command).to.be.calledWith(
        "hello", "robots/TestBot", "world", console.log
      );
    });

    it("adds an #on function to the robot", function() {
      expect(bot.on).to.be.a("function");
      bot.on("event", console.log);
      expect(driver.event).to.be.calledWith(
        "event", "robots/TestBot", console.log
      );
    });

    it("adds a #device function to the robot", function() {
      expect(bot.device("ping")).to.be.eql(device);
    });

    it("binds device commands", function() {
      expect(device.ping).to.be.a("function");
      device.ping(console.log);
      expect(driver.command).to.be.calledWith(
        "ping", "robots/TestBot/devices/ping", console.log
      );
    });

    it("adds an #on function to the device", function() {
      expect(device.on).to.be.a("function");
      device.on("event", console.log);
      expect(driver.event).to.be.calledWith(
        "event", "robots/TestBot/devices/ping", console.log
      );
    });
  });
});
