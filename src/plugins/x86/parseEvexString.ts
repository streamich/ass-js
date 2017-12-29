import {IEvexDefinition} from "./parts/PrefixEvex";
import parseVexString from "./parseVexString";

function parseEvexString(estr: string): IEvexDefinition {
    return parseVexString(estr) as IEvexDefinition;
}

export default parseEvexString;
