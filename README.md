# cppp-io.js

Client JavaScript library for interacting with any device that supports the CPPP.IO protocol.

## How we want to use it via REST:

```
var opts = {host: "192.168.0.1", port:3000};
var client = new Threepio.Client("http", opts)

// Connect
client.connect();

// OR

client.connect(function(error, result){
  console.log(result);
})

// Get Robots 
var robots = client.getRobots();
console.log(robots);

// OR

client.getRobots(function(err, robots){
  console.log(robots);
});


// Get Robot
var robot = client.getRobot('myRobot');

// OR

client.getRobot("cyborg1", function(err, robot){
  robot.getDevices(function(err, devices){
    console.log(devices)
  });
  robot.getCommands(function(err, commands){
    console.log(commands)
  });
});


// Execute Command
var robot = client.getRobot('myRobot');
robot.commands[0].execute()

// OR

var robots = client.getRobots;
robots[0].commands[0].execute()

// OR
client.getRobots(function(err, robots){
  robots[0].commands[0].execute({param:"param1"})
  // or
  robots[0].getCommands(err, commands){
    commands[0].execute();
  }
});
```

## How we want to use it via socket-io:

```
var opts = {host: "192.168.0.1", port:3000};
var client = new Threepio.Client("socketio", opts)


client.connect(function(error, result){
  
  
  // Listen on client commands
  client.driver.on("commands", function(){
    // Get commands
    client.getCommands(function(err, list){
      console.log(list);

      // Listen for robot command execution
      client.on(list[0].command, function(a,b){
        console.log(a);
        console.log(b);
      });

      // Execute command
      list[0].execute();
    });
  });

  // Listen on client robots
  client.driver.on("robots", function(){

    // Get robots
    client.getRobots(function(err, list){
      console.log(list);
    });

    // Get an specific Robot
    var rosie = client.getRobot("rosie");
    console.log(rosie);

    // Listen on robot commands
    rosie.on("commands", function(){
      console.log(rosie.commands);

      // get the first robot command
      var command1 = rosie.commands[0];
      console.log(command1);

      // Listen for robot command execution
      rosie.on(command1.command, function(a,b){
        console.log(a);
        console.log(b);
      });

      // Execute command
      command1.execute();
    });

    // Listen on robot devices
    rosie.on("devices", function(){
      console.log(rosie.devices);

      // get the first robot device
      var device1 = rosie.devices[0];
      console.log(device1);

      // Listen for device commands
      device1.on("commands", function(){
        console.log(device1.commands);

        // get the first device command
        var command1 = device1.commands[0];
        console.log(command1);

        // Listen for device command execution
        device1.on(command1.command, function(a,b){
          console.log(a);
          console.log(b);
        });

        // Execute command
        command1.execute();
      });
    });
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

client.getRobot("cyborg1", function(err, robot){
  robot.getDevices(function(err, list){
    console.log(list)
  });
});
```


## License
Copyright (c) 2015 The Hybrid Group. Licensed under the Apache 2.0 license.
