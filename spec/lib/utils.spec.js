"use strict";

var _ = source("utils");

describe("_", function() {
  describe("extend", function() {
    var extend = _.extend;

    var base = {
      fruits: ["apple"],
      vegetables: ["beet"],
      thing: null,
      otherThing: "hello!",
      data: [{ user: "barney" }, { user: "fred" }]
    };

    var source = {
      fruits: ["banana"],
      vegetables: ["carrot"],
      thing: "hello!",
      otherThing: null,
      data: [{ age: 36 }, { age: 40 }]
    };

    var expected = {
      data: [ { age: 36, user: "barney" }, { age: 40, user: "fred" } ],
      fruits: [ "apple", "banana" ],
      vegetables: [ "beet", "carrot" ],
      thing: "hello!",
      otherThing: null
    };

    it("extends two objects", function() {
      var extended = extend(base, source);
      expect(extended).to.be.eql(expected);
    });
  });

  describe("#map", function() {
    var object = { a: { item: "hello" }, b: { item: "world" } },
        array = [ { item: "hello" }, { item: "world" } ];

    var fn = function(value, key) {
      return [value, key];
    };

    it("runs a function over items in a collection", function() {
      expect(_.map(object, fn)).to.be.eql([
        [{ item: "hello" }, "a"],
        [{ item: "world" }, "b"]
      ]);

      expect(_.map(array, fn)).to.be.eql([
        [{ item: "hello" }, 0],
        [{ item: "world" }, 1]
      ]);
    });

    it("defaults to the identity function", function() {
      expect(_.map(array)).to.be.eql(array);
      expect(_.map(object)).to.be.eql(array);
    });
  });

  describe("#each", function() {
    var object = { a: { item: "hello" }, b: { item: "world" } },
        array = [ { item: "hello" }, { item: "world" } ];

    var fn = function(value, key) {
      return [value, key];
    };

    it("runs a function over items in a collection", function() {
      fn = spy();
      _.map(object, fn);

      expect(fn).to.be.calledWith(object.a, "a");
      expect(fn).to.be.calledWith(object.b, "b");

      fn = spy();
      _.map(array, fn);

      expect(fn).to.be.calledWith(array[0], 0);
      expect(fn).to.be.calledWith(array[1], 1);
    });
  });
});
