"use strict";
var d = require('../x86/def');
var t = require('../x86/x64/table');
var table = (new d.DefTable).create(t.table, t.defaults);
console.log(table.toString());
