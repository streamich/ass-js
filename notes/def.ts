import * as d from '../x86/def';
import * as t from '../x64/table';
import * as o from '../x86/operand';
import {Code} from '../x64/code';


var table = new d.DefTable(t.table, t.defaults);
// var ops = new o.Operands([o.rax]);
// var code = new Code;
// console.log(table);
// console.log(table.groups.mov);
// console.log(table.toString());
// console.log(table.groups.push.groupBySize());
// console.log(table.groups.mov.defs[0]);

// var ops = [o.rax.ref(), o.rcx];
var ops = [o.al, 123];
// var ops = [o.rax];
// var tpl = table.groups.mov.defs[0].matchOperands(ops);
// var tpl = table.groups.push.defs[0].matchOperands(ops);
// console.log(tpl);
// console.log(table.groups.add.defs[0].operands[0]);
// console.log(table.groups.add.defs[0].operands);
// console.log(table.groups.add.defs[0].matchOperands(ops));
// console.log(table.groups.add.defs[0].operandSize);
// console.log(table.groups.add.groupBySize());
// var operands = o.Operands.fromUiOpsAndTpl(ops, tpl);
// console.log(operands);


// console.log(table.groups.mov.defs[0]);

// var ops = new o.Operands([o.al]);

// console.log(table.toString());

// console.log(table);
// console.log(table.find('push', ops, o.SIZE.ANY));

