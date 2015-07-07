"use strict";

var request = require("request");
var Robot = require("./robot");
var Command = require("./command");
var Event = require("./event");

var HttpDriver = function HttpDriver(client) {
  this.client = client;
  this.host = client.host;
  this.port = client.port;
  this.resetValues();
};

HttpDriver.prototype.resetValues = function() {
  this.api = null;
  this.robots = [];
  this.commands = [];
  this.events = [];
  this.lastExecutionResult = null;
};

HttpDriver.prototype.reload = function(cb) {
  this.resetValues();
  this.connect(cb);
};

HttpDriver.prototype.disconnect = function() {
  this.resetValues();
};

HttpDriver.prototype.connect = function(cb) {
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

HttpDriver.prototype.url = function() {
  return "http://" + this.host + ":" + this.port;
};

HttpDriver.prototype.getRequest = function(url, cb) {
  request.get({
    url: url,
    withCredentials: false
  }, cb);
};

HttpDriver.prototype.postRequest = function(url, params, cb) {
  request.post({
    url: url,
    withCredentials: false,
    form: params
  }, cb);
};

HttpDriver.prototype.initApi = function(body) {
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

HttpDriver.prototype.getApi = function(cb) {
  if (this.api) {
    return this.client.renderResults(null, this.api, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

HttpDriver.prototype.getCommands = function(cb) {
  if (this.api && this.commands) {
    return this.client.renderResults(null, this.commands, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

HttpDriver.prototype.getRobots = function(cb) {
  if (this.api && this.robots) {
    return this.client.renderResults(null, this.robots, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

HttpDriver.prototype.getEvents = function(cb) {
  if (this.api && this.events) {
    return this.client.renderResults(null, this.events, cb);
  }
  return this.client.renderResults("Not Connected", null, cb);
};

HttpDriver.prototype.executeCommand =
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

HttpDriver.prototype.renderResults = function(error, result, cb) {
  return this.client.renderResults(error, result, cb);
};


module.exports = HttpDriver;
