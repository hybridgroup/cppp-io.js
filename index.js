"use strict";

function lib(file) {
  return require("./lib/" + file);
}

module.exports = {
  Client: lib("client"),
  HttpDriver: lib("http-driver"),
  Command: lib("command"),
  Event: lib("event"),
  Robot: lib("robot"),
  Device: lib("device"),
  Connection: lib("connection")
};
