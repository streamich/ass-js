"use strict";
var o = require('../../x86/operand');
var code_1 = require('../../x86/x64/code');
var _ = new code_1.Code;
// _._('mov', [o.rax, 123], 64);
// 400578:	0f 58 d1             	addps  %xmm1,%xmm2
// 40057b:	c5 e8 58 d9          	vaddps %xmm1,%xmm2,%xmm3
// 40057f:	c5 ec 58 d9          	vaddps %ymm1,%ymm2,%ymm3
_._('inc', [o.rax]).lock();
_._('divsd', [o.xmm(1), o.xmm(2)]);
_._('vdivsd', [o.xmm(1), o.xmm(2), o.xmm(3)]);
_._('vdivsd', [o.xmm(1), o.xmm(2), o.xmm(3)], { mask: o.k(1), z: 1 });
_._('vdivsd', [o.xmm(13), o.xmm(14), o.xmm(15)], { mask: o.k(7) });
_._('mov', [o.rax, o.rbx]);
// _._('vaddps', [o.xmm(3), o.xmm(2), o.xmm(1)]);
// console.log(_.table.toString());
// console.log(_.table.toJson());
console.log(_.toString());
var bin = _.compile();
console.log(new Buffer(bin));
// console.log(_.table.toString());
// console.log(_.table.toJson());
// require('fs').writeFileSync(__dirname + '/tbl.json', JSON.stringify(_.table.toJson(), null, 2));
// var _ = Code.create();
// console.log(Code.table);
// var json = Code.table.toJson();
// console.log(json);
// require('fs').writeFileSync(__dirname + '/table.json', JSON.stringify(json, null, 4));
// console.log(Code.table.toString());
// console.log(Code.table.groups.sysexit.toString());
// console.log(Code.table.groups.vextractf128.toString());
// console.log(d.Def.parseVexString('256.66.0F3A.W0'));
// console.log(d.Def.parseVexString('VEX.DDS.128.66.0F38.W0'));
// console.log(d.Def.parseVexString('VEX.DDS.LIG.66.0F38.W1'));
//
// _.vcvtph2ps(o.ymm(1), o.rax.ref());
// _.vfmadd132pd(o.xmm(1), o.xmm(1), o.xmm(1));
// _.vfmadd132pd(o.xmm(12), o.xmm(12), o.xmm(12));
//
//
// console.log(_.toString());
// var bin = _.compile();
// console.log(_.toString());
// console.log(new Buffer(bin));
