import {X64} from "../src/index";

const _ = X64();

// e4 05
_._('in', ['al', 5]);

console.log(_.toString());
console.log(_.compile());
console.log(_.toString());
