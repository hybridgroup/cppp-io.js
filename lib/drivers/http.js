"use strict";

var request = require("request");
var Robot = require("./../robot");
var Command = require("./../command");
var Event = require("./../event");

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
      return self.renderResults(null, self.client, cb);
    }
    return self.renderResults("Error:" + error, null, cb);
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
    return this.client.renderResults(null, this.api, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

HTTP.prototype.getCommands = function(cb) {
  if (this.api && this.commands) {
    return this.client.renderResults(null, this.commands, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

HTTP.prototype.getRobots = function(cb) {
  if (this.api && this.robots) {
    return this.client.renderResults(null, this.robots, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

HTTP.prototype.getEvents = function(cb) {
  if (this.api && this.events) {
    return this.client.renderResults(null, this.events, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

HTTP.prototype.executeCommand =
  function(client, robot, device, command, params, cb) {
    var self = this;
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
        return self.client.renderResults(false, body, cb);
      }
      return self.client.renderResults("Error:" + error, null, cb);
    });
  };

HTTP.prototype.renderResults = function(error, result, cb) {
  return this.client.renderResults(error, result, cb);
};
