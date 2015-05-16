"use strict";

var _ = require("lodash");
var request = require("request");
var async = require("async");
var deasync = require("deasync");
var Robot = require("./robot");
var Command = require("./command");
var Event = require("./event");

var HttpClient = function HttpClient(opts) {
  opts = opts || {};

  _.forEach(this.defaults, function(def, name) {
    this[name] = _.has(opts, name) ? opts[name] : def;
  }, this);
};

HttpClient.prototype.defaults = {
  host: "127.0.0.1",
  port: "3000",
  api: null,
  lastExecutionResult: null,
  robots: [],
  commands: [],
  events: []
};

HttpClient.prototype.connect = function() {
  var self = this;
  var sync = true;
  var status = null;

  this.disconnect();

  var url = self.url() + "/api";
  this.getRequest(url, function(error, response, body) {
    if (error) {
      status = "Connection Error: " + error.code;
      sync = false;
    }
    else {
      self.initApi(JSON.parse(body));
      status = "Connected!";
      sync = false;
    }
  });
  while (sync) {
    deasync.sleep(100);
  }
  return status;
};

HttpClient.prototype.url = function() {
  return "http://" + this.host + ":" + this.port;
};

HttpClient.prototype.getRequest = function(url, cb) {
  async.waterfall([
    function(callback) {
      request
        .get(url, callback);
    }
  ], cb);
};

HttpClient.prototype.postRequest = function(url, params, cb) {
  async.waterfall([
    function(callback) {
      request
        .post(url, {form: params}, callback);
    }
  ], cb);
};

HttpClient.prototype.initApi = function(body) {
  var self = this;
  this.api = body.MCP;
  _.forEach(this.api.robots, function(robot) {
    self.robots.push(new Robot(robot, self));
  });
  _.forEach(this.api.commands, function(command) {
    self.commands.push(new Command(command, self));
  });
  _.forEach(this.api.events, function(evt) {
    self.events.push(new Event(evt, self));
  });
};

HttpClient.prototype.send = function(url, params) {
  var self = this;
  var sync = true;
  var status = null;

  this.postRequest(url, params, function(error, response, body) {
    if (error) {
      status = "Execution Error: " + error.code;
      sync = false;
    }
    else {
      self.lastExecutionResult = JSON.parse(body);
      status = "Success!";
      sync = false;
    }
  });
  while (sync) {
    deasync.sleep(100);
  }
  return status;
};

HttpClient.prototype.reload = function() {
  this.api = null;
  this.robots = [];
  this.commands = [];
  this.events = [];
  this.lastExecutionResult = null;
  return this.connect();
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
        return cb(null, this.lastExecutionResult);
      }
      return this.lastExecutionResult;
    }

    if (cb) {
      return cb(status, null);
    }
    return status;
  };


module.exports = HttpClient;
