import MnemonicX86 from "../MnemonicX86";

const mnemonicCPUID = new MnemonicX86();
mnemonicCPUID.mnemonic = 'cpuid';
mnemonicCPUID.opcode = 0x0FA2;

export default mnemonicCPUID;
