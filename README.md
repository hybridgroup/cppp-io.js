# cppp-io.js

cppp-io.js is a JavaScript client library for interacting with APIs that support the [CPPP.IO protocol][cppp.io].

[cppp.io]: http://cppp.io

## Installation

    $ npm install cppp-io

## Usage

```javascript
var Threepio = require("cppp-io");

var client = new Threepio("http", { host: "localhost", port: "3000" });

client.connect(function(err, mcp) {
  if (err) { throw err; }

  console.log(mcp);

  mcp.echo({ string: "Hello, world!" }, function(null, value) {
    console.log(value);
  });

  mcp.robot("TestBot").device("ping").on("ping", console.log);
  mcp.robot("TestBot").device("ping").ping();
});
```

## License

Copyright (c) 2015 The Hybrid Group.

Licensed under the Apache 2.0 license.
