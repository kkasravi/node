process.mixin(require("./common"));

var MESSAGE = 'catch me if you can';
var caughtException = false;

process.addListener('uncaughtException', function (e) {
  assertEquals(MESSAGE, e.message);
  caughtException = true;
});

setTimeout(function() {
  throw new Error(MESSAGE);
});

process.addListener("exit", function () {
  assertTrue(caughtException);
});
