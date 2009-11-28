process.mixin(require("./common"));

assert.equal(14, process._byteLength("Il était tué"));
assert.equal(14, process._byteLength("Il était tué", "utf8"));

assert.equal(12, process._byteLength("Il était tué", "ascii"));

assert.equal(12, process._byteLength("Il était tué", "binary"));

assertThrows('process._byteLength()');
assertThrows('process._byteLength(5)');