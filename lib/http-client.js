"use strict";

var request = require("request");
var deasync = require("deasync");
var Robot = require("./robot");
var Command = require("./command");
var Event = require("./event");

var HttpClient = function HttpClient(client, opts) {
  var self = this;
  opts = opts || {};

  this.client = client;

  for (var name in opts) {
    self[name] = opts[name];
  }
};

HttpClient.prototype.connect = function() {
  this.disconnect();
  var self = this;
  var status = null;
  var done = false;
  var url = self.url() + "/api";

  this.getRequest(url, function(error, response, body) {
    if (error) {
      status = "Connection Error: " + error.code;
      self.client.connected = false;
    }
    else {
      self.initApi(JSON.parse(body));
      status = "Connected!";
      self.client.connected = true;
    }
    done = true;
  });
  deasync.loopWhile(function() {
    return !done;
  });
  return status;
};

HttpClient.prototype.send = function(url, params) {
  var self = this;
  var status = null;
  var done = false;

  this.postRequest(url, params, function(error, response, body) {
    if (error) {
      status = "Execution Error: " + error.code;
    }
    else {
      self.lastExecutionResult = JSON.parse(body);
      status = "Success!";
    }
    done = true;
  });
  deasync.loopWhile(function() {
    return !done;
  });
  return status;
};

HttpClient.prototype.url = function() {
  return "http://" + this.host + ":" + this.port;
};

HttpClient.prototype.getRequest = function(url, cb) {
  request.get(url, cb);
};

HttpClient.prototype.postRequest = function(url, params, cb) {
  request.post(url, {form: params}, cb);
};

HttpClient.prototype.initApi = function(body) {
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

HttpClient.prototype.reload = function() {
  this.api = null;
  this.robots = [];
  this.commands = [];
  this.events = [];
  this.lastExecutionResult = null;
  this.connect();
};

HttpClient.prototype.disconnect = function() {
  this.api = null;
  this.robots = [];
  this.commands = [];
  this.events = [];
  this.lastExecutionResult = null;
};

HttpClient.prototype.renderResults = function(error, result, cb) {
  if (cb) {
    return cb(error, result);
  }
  else if (error) {
    return error;
  }
  return result;
};

HttpClient.prototype.getApi = function(cb) {
  if (this.api) {
    return this.renderResults(null, this.api, cb);
  }
  return this.renderResults("Not Connected", null, cb);
};

HttpClient.prototype.getCommands = function(cb) {
  if (this.api && this.commands) {
    return this.renderResults(null, this.commands, cb);
  }
  return this.renderResults("Not Connected", null, cb);
};

HttpClient.prototype.getRobots = function(cb) {
  if (this.api && this.robots) {
    return this.renderResults(null, this.robots, cb);
  }
  return this.renderResults("Not Connected", null, cb);
};

HttpClient.prototype.getEvents = function(cb) {
  if (this.api && this.events) {
    return this.renderResults(null, this.events, cb);
  }
  return this.renderResults("Not Connected", null, cb);
};

HttpClient.prototype.executeCommand =
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

    var status = this.send(url, params);
    if (status === "Success!") {
      if (cb) {
        return cb(status, this.lastExecutionResult);
      }
      return this.lastExecutionResult;
    }

    if (cb) {
      return cb(status, null);
    }
    return status;
  };


module.exports = HttpClient;
