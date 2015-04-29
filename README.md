# cpppio.js

Client JavaScript library for interacting with any device that supports the CPPP.IO protocol.

## How we want to use it:

```javascript
var cpppio = require("cpppio");

cpppio.connect("mqtt", {host: "192.168.0.1", port:3000});
cpppio.getRobots(function(err, list){
	console.log(list);
});

cpppio.getRobot(function(err, robot){
	robot.getDevices(function(err, list){
		console.log(list)
	});
});
```

## License
Copyright (c) 2015 The Hybrid Group. Licensed under the Apache 2.0 license.
