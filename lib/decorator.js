"use strict";

function decorate(protocol, data) {
  function bindCommand(target, path) {
    return function(name) {
      if (target[name]) { return; }
      target[name] = protocol.command.bind(protocol, name, path);
    };
  }

  function on(path) {
    return function(event, callback) {
      return protocol.event(event, path, callback);
    };
  }

  data.commands.forEach(bindCommand(data, ""));
  data.on = on("");
  data.robot = function(name) {
    return data.robots.filter(function(bot) { return bot.name === name; })[0];
  };

  data.robots.forEach(function(robot) {
    var path = "robots/" + robot.name;

    robot.commands.forEach(bindCommand(robot, path));
    robot.on = on(path);
    robot.device = function(name) {
      return robot.devices.filter(function(d) { return d.name === name; })[0];
    };

    robot.devices.forEach(function(device) {
      var devicePath = path + "/devices/" + device.name;

      device.commands.forEach(bindCommand(device, devicePath));
      device.on = on(devicePath);
    });
  });

  return data;
}

module.exports = { decorate: decorate };
