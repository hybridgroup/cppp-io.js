"use strict";

var request = require("request");

var Robot = require("./../robot"),
    Command = require("./../command"),
    Event = require("./../event"),
    _ = require("./../utils");

var HTTP = module.exports = function HTTP(client) {
  this.client = client;
  this.host = client.host;
  this.port = client.port;
  this.resetValues();
};

HTTP.prototype.resetValues = function() {
  this.api = null;
  this.robots = [];
  this.commands = [];
  this.events = [];
  this.lastExecutionResult = null;
};

HTTP.prototype.reload = function(cb) {
  this.resetValues();
  this.connect(cb);
};

HTTP.prototype.disconnect = function() {
  this.resetValues();
};

HTTP.prototype.connect = function(cb) {
  var self = this;
  var url = self.url() + "/api";
  this.getRequest(url, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      self.initApi(JSON.parse(body));
      return _.resolve(cb, null, self.client);
    }
    return _.resolve(cb, "Error:" + error);
  });
};

HTTP.prototype.url = function() {
  return "http://" + this.host + ":" + this.port;
};

HTTP.prototype.getRequest = function(url, cb) {
  request.get({
    url: url,
    withCredentials: false
  }, cb);
};

HTTP.prototype.postRequest = function(url, params, cb) {
  request.post({
    url: url,
    withCredentials: false,
    form: params
  }, cb);
};

HTTP.prototype.initApi = function(body) {
  this.api = body.MCP;
  var self = this;
  var i;
  for (i in self.api.robots) {
    self.robots.push(new Robot(self.api.robots[i], self));
  }
  for (i in self.api.commands) {
    self.commands.push(new Command(self.api.commands[i], self));
  }
  for (i in self.api.events) {
    self.events.push(new Event(self.api.events[i], self));
  }
};

HTTP.prototype.getApi = function(cb) {
  if (this.api) {
    return _.resolve(cb, null, this.api);
  }

  return _.resolve(cb, "Not Connected");
};

HTTP.prototype.getCommands = function(cb) {
  return _.resolve(cb, null, this.commands);
};

HTTP.prototype.getRobots = function(cb) {
  return _.resolve(cb, null, this.robots);
};

HTTP.prototype.getEvents = function(cb) {
  return _.resolve(cb, null, this.events);
};

HTTP.prototype.executeCommand =
  function(client, robot, device, command, params, cb) {
    var url = this.url() + "/api";
    if (device) {
      url += "/robots/" +
        robot.name + "/devices/" +
        device.name + "/commands/" +
        command;
    }
    else if (robot) {
      url += "/robots/" +
        robot.name + "/commands/" + command;
    }
    else {
      url += "/commands/" + command;
    }

    this.postRequest(url, params, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        return _.resolve(cb, null, body);
      }
      return _.resolve(cb, "Error:" + error, null);
    });
  };
