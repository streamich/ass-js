// # x86_64 Instruction
//
// Each CPU instruction is encoded in the following form, where only
// *Op-code* byte is required:
//
//     |-------------------------------------------------|--------------------------------------------|
//     |                  Instruction                    |               Next instruction             |
//     |-------------------------------------------------|--------------------------------------------|
//     |byte 1   |byte 2   |byte 3   |byte 4   |byte 5   |
//     |---------|---------|---------|---------|---------|                     ...
//     |REX      |Op-code  |Mod-R/M  |SIB      |Immediat |                     ...
//     |---------|---------|---------|---------|---------|                     ...
//     |optional |required |optional |optional |optional |
//     |-------------------------------------------------|
abstract class InstructionPart {
    abstract write(arr: number[]): number[];
}

export default InstructionPart;
