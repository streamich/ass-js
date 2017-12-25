import Asm from '../src/Asm';
import PluginData from '../src/plugins/data/PluginData';

const asm = new Asm;
new PluginData(asm);


// asm._('mov', ['rax', 25]);
asm.$('db', 123);
console.log(asm.expressions);

console.log(asm.toString());

