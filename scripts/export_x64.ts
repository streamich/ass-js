import * as fs from 'fs';
import {join} from 'path';
import {ITableDefinitionX86, TTableOperandX86} from "../src/plugins/x86/table";
import {defaults as x86TableDefinitionDefaults} from '../src/plugins/x86/table';
import mnemonicFromDefX86 from "../src/plugins/x86/mnemonicFromDefX86";
import MnemonicX86 from "../src/plugins/x86/MnemonicX86";
const mkdirp = require('mkdirp');

const DIR_X64 = join(__dirname, '..', 'src', 'plugins', 'x64', 'mnemonics');
const DIR_X64_OUT = join(__dirname, '..', 'mnemonics', 'x64');
const DIR_X64_GENERATED = join(__dirname, '..', 'src', 'plugins', 'x64', '__generated');

mkdirp.sync(DIR_X64_OUT);
mkdirp.sync(DIR_X64_GENERATED);

const fileList = fs.readdirSync(DIR_X64);

const formatOpName = (op: TTableOperandX86) =>  {
    const typeofOperand = typeof op;

    if (typeofOperand === 'number')     return op;
    if (typeofOperand === 'string')     return op;

    if ((typeofOperand === 'object') || (typeofOperand === 'function')) {
        const opObj = op as any;
        if (typeof opObj.atomName === 'string')       return 'a.' + opObj.atomName;
        if (typeof opObj.name === 'string')           return opObj.name;
        if (typeof opObj.toString === 'function')     return opObj.toString();
    }

    return String(op);
}

const formatOperand = (operand: TTableOperandX86[]) => {
    const names = [];
    for (const op of operand) {
        names.push(formatOpName(op));
    }
    return '[' + names.join(', ') + ']';
};

const formatOperands = (operands: TTableOperandX86[][]) => {
    return `[${operands.map(operand => formatOperand(operand)).join(', ')}]`;
};

const formatGeneratedMnemonic = (mnemonic: MnemonicX86, index: number) => {
    const instance = `mnemonic_add_${index}`;
    let code = `
const ${instance} = new MnemonicX86;
${instance}.opcode = ${mnemonic.opcode};
${instance}.operands = ${formatOperands(mnemonic.operands)};
`;

    return [instance, code];
};

const writeGenerated = (mnemonicVariations: MnemonicX86[], groupDefaults: ITableDefinitionX86) => {
    const mnemonicName = mnemonicVariations[0].mnemonic;
    const varName = `x86_mnemonic_variations_${mnemonicName}`;
    const instances = [];
    let code = `import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';
`;

    for (let i = 0; i < mnemonicVariations.length; i++) {
        const mnemonic = mnemonicVariations[i];
        const [instance, instanceCode] = formatGeneratedMnemonic(mnemonic, i);

        code += instanceCode;
        instances.push(instance);
    }

    code += `
const ${varName} = new MnemonicVariationsX86([
    ${instances.join(',\n    ')},
]);
${varName}.defaultOperandSize = ${groupDefaults.ds};

export default ${varName};
`;

    const filePath = join(DIR_X64_GENERATED, mnemonicName + '.ts');
    console.log(filePath);
    fs.writeFileSync(filePath, code);
};

for (const file of fileList) {
    const mnemonicName = file.substr(0, file.length - 3);
    const filePath = join(DIR_X64, file);
    const list = require(filePath).default;

    // First definition may be just defaults.
    let groupDefaults = {
        ...x86TableDefinitionDefaults,
        ...list[0],
    };

    let defs: ITableDefinitionX86[];
    if (list.length === 1) {
        defs = list;
    } else {
        defs = list.slice(1);
    }

    const output = [];
    const mnemonicVariations = [];

    for (let def of defs) {
        def = {
            ...groupDefaults,
            ...def,
            mn: mnemonicName,
        };

        const mnemonic = mnemonicFromDefX86(def);
        mnemonicVariations.push(mnemonic);
        output.push(mnemonic.toJson());
    }

    const outFilePath = join(DIR_X64_OUT, `${mnemonicName}.json`);
    console.log(outFilePath);
    fs.writeFileSync(outFilePath, JSON.stringify(output, null, 4));

    writeGenerated(mnemonicVariations, groupDefaults);
}
