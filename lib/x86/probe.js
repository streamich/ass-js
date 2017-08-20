"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var o = require("./operand");
function createProbe(code) {
    var probe = (function (mnemonic, operands, opts) {
        code._(mnemonic, operands, opts);
    });
    probe.r = function (rname, index) {
        return o[rname];
    };
    return probe;
}
exports.createProbe = createProbe;
