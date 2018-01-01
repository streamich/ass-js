import * as fs from 'fs';
import {join} from 'path';
import {ITableDefinitionX86} from "../src/plugins/x86/table";
import {defaults as x86TableDefinitionDefaults} from '../src/plugins/x86/table';
import mnemonicFromDefX86 from "../src/plugins/x86/mnemonicFromDefX86";
const mkdirp = require('mkdirp');

const DIR_X86 = join(__dirname, '..', 'src', 'plugins', 'x86', 'mnemonics');
const DIR_X86_OUT = join(__dirname, '..', 'mnemonics', 'x86');


const exportX86Mnemonics = (inPath, outPath) => {
    mkdirp.sync(outPath);

    const fileList = fs.readdirSync(DIR_X86);

    for (const file of fileList) {
        const mnemonic = file.substr(0, file.length - 3);
        const filePath = join(inPath, file);
        const list = require(filePath).default;

        // First definition may be just defaults.
        const groupDefaults = list[0];
        let defs: ITableDefinitionX86[];
        if (list.length === 1) {
            defs = list;
        } else {
            defs = list.slice(1);
        }

        const output = [];

        for (let def of defs) {
            def = {
                ...x86TableDefinitionDefaults,
                ...groupDefaults,
                ...def,
                mn: mnemonic,
            };

            const definition = mnemonicFromDefX86(def);
            output.push(definition.toJson());
        }

        const outFilePath = join(outPath, `${mnemonic}.json`);
        console.log(outFilePath);
        fs.writeFileSync(outFilePath, JSON.stringify(output, null, 4));
    }
};


exportX86Mnemonics(DIR_X86, DIR_X86_OUT);


