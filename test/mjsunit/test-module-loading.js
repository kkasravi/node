process.mixin(require("./common"));

debug("load test-module-loading.js");

var a = require("./fixtures/a");
var d = require("./fixtures/b/d");
var d2 = require("./fixtures/b/d");
// Absolute
var d3 = require(require('path').dirname(__filename)+"/fixtures/b/d");
// Relative
var d4 = require("../mjsunit/fixtures/b/d");

assert.equal(false, false, "testing the test program.");

assertInstanceof(a.A, Function);
assert.equal("A", a.A());

assertInstanceof(a.C, Function);
assert.equal("C", a.C());

assertInstanceof(a.D, Function);
assert.equal("D", a.D());

assertInstanceof(d.D, Function);
assert.equal("D", d.D());

assertInstanceof(d2.D, Function);
assert.equal("D", d2.D());

assertInstanceof(d3.D, Function);
assert.equal("D", d3.D());

assertInstanceof(d4.D, Function);
assert.equal("D", d4.D());

process.addListener("exit", function () {
  assertInstanceof(a.A, Function);
  assert.equal("A done", a.A());

  assertInstanceof(a.C, Function);
  assert.equal("C done", a.C());

  assertInstanceof(a.D, Function);
  assert.equal("D done", a.D());

  assertInstanceof(d.D, Function);
  assert.equal("D done", d.D());

  assertInstanceof(d2.D, Function);
  assert.equal("D done", d2.D());

  puts("exit");
});
