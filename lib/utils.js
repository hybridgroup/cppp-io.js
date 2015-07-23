"use strict";

var _ = module.exports = {};

function identity(value) {
  return value;
}

function extend(base, source) {
  var isArray = Array.isArray(source);

  if (base == null) {
    base = isArray ? [] : {};
  }

  if (isArray) {
    source.forEach(function(e, i) {
      if (typeof base[i] === "undefined") {
        base[i] = e;
      } else if (typeof e === "object") {
        base[i] = extend(base[i], e);
      } else if (!~base.indexOf(e)) {
        base.push(e);
      }
    });
  } else {
    var key;

    for (key in source) {
      if (typeof source[key] !== "object" || !source[key]) {
        base[key] = source[key];
      } else if (base[key]) {
        extend(base[key], source[key]);
      } else {
        base[key] = source[key];
      }
    }
  }

  return base;
}

extend(_, {
  identity: identity,
  extend: extend
});

function iterate(thing, fn, thisVal) {
  if (Array.isArray(thing)) {
    thing.forEach(fn, thisVal);
    return;
  }

  if (typeof thing === "object") {
    for (var key in thing) {
      var value = thing[key];
      fn.call(thisVal, value, key);
    }
  }
}

function map(collection, fn, thisVal) {
  var vals = [];

  if (fn == null) {
    fn = identity;
  }

  iterate(collection, function(object, index) {
    vals.push(fn.call(thisVal, object, index));
  });

  return vals;
}

extend(_, {
  each: iterate,
  map: map
});

function resolve(err, value, callback) {
  if (typeof callback === "function") { callback(err, value); }
  return err || value;
}

extend(_, { resolve: resolve });
