# cpppio.js

Client JavaScript library for interacting with any device that supports the CPPP.IO protocol.

## How we want to use it via REST:

```javascript
var client = require("cppp-io");

client.connect("http", {host: "192.168.0.1", port:3000});
client.getRobots(function(err, list){
	console.log(list);
});

client.getRobot(function(err, robot){
	robot.getDevices(function(err, list){
		console.log(list)
	});
});
```

## How we want to use it via socket-io:

```javascript
var client = require("cppp-io");

client.connect("socketio", {host: "192.168.0.1", port:3000});
client.getRobots(function(err, list){
	console.log(list);
});

client.getRobot(function(err, robot){
	robot.getDevices(function(err, list){
		console.log(list)
	});
});
```

## How we want to use it via MQTT:

```javascript
var client = require("cppp-io");

client.connect("mqtt", {host: "192.168.0.1", port:3000});
client.getRobots(function(err, list){
	console.log(list);
});

client.getRobot(function(err, robot){
	robot.getDevices(function(err, list){
		console.log(list)
	});
});
```


## License
Copyright (c) 2015 The Hybrid Group. Licensed under the Apache 2.0 license.
