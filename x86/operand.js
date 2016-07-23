"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var regfile_1 = require('./regfile');
var operand_1 = require('../operand');
var o = require('../operand');
var ii = require('../instruction');
var DisplacementValue = (function (_super) {
    __extends(DisplacementValue, _super);
    function DisplacementValue(value) {
        _super.call(this, value, true);
    }
    DisplacementValue.fromExpression = function (expr) {
        var rel = o.Relative.fromExpression(expr);
        return DisplacementValue.fromVariable(rel);
    };
    DisplacementValue.fromVariable = function (value) {
        var disp;
        if (value instanceof o.Variable) {
            disp = new DisplacementValue(0);
            disp.setVariable(value);
        }
        else if (o.isTnumber(value)) {
            disp = new DisplacementValue(value);
        }
        else
            throw TypeError('Displacement must be of type Tvariable.');
        return disp;
    };
    DisplacementValue.prototype.setValue32 = function (value) {
        _super.prototype.setValue32.call(this, value);
        /* Make sure `Displacement` is 1 or 4 bytes, not 2. */
        // if(this.size > DisplacementValue.SIZE.DISP8) this.zeroExtend(DisplacementValue.SIZE.DISP32);
    };
    DisplacementValue.SIZE = {
        DISP8: operand_1.SIZE.B,
        DISP32: operand_1.SIZE.D
    };
    return DisplacementValue;
}(operand_1.Immediate));
exports.DisplacementValue = DisplacementValue;
// ## Registers
//
// `Register` represents one of `%rax`, `%rbx`, etc. registers.
var Register = (function (_super) {
    __extends(Register, _super);
    function Register(id, size) {
        _super.call(this, id, size);
        this.name = Register.getName(size, id).toLowerCase();
    }
    Register.getName = function (size, id) {
        var def = 'REG';
        if (typeof size !== 'number')
            return def;
        if (typeof id !== 'number')
            return def;
        switch (size) {
            case operand_1.SIZE.Q: return regfile_1.R64[id];
            case operand_1.SIZE.D: return regfile_1.R32[id];
            case operand_1.SIZE.W: return regfile_1.R16[id];
            case operand_1.SIZE.B:
                if (this instanceof Register8High)
                    return regfile_1.R8H[id];
                else
                    return regfile_1.R8[id];
            default: return def;
        }
    };
    Register.prototype.ref = function () {
        return (new Memory).ref(this);
    };
    Register.prototype.ind = function (scale_factor) {
        return (new Memory).ind(this, scale_factor);
    };
    Register.prototype.disp = function (value) {
        return (new Memory).ref(this).disp(value);
    };
    // Whether the register is one of `%r8`, `%r9`, etc. extended registers.
    Register.prototype.isExtended = function () {
        return this.id > 7;
    };
    return Register;
}(operand_1.Register));
exports.Register = Register;
var RegisterGP = (function (_super) {
    __extends(RegisterGP, _super);
    function RegisterGP() {
        _super.apply(this, arguments);
    }
    return RegisterGP;
}(Register));
exports.RegisterGP = RegisterGP;
var Register8 = (function (_super) {
    __extends(Register8, _super);
    function Register8(id) {
        _super.call(this, id, operand_1.SIZE.B);
    }
    return Register8;
}(RegisterGP));
exports.Register8 = Register8;
var Register8High = (function (_super) {
    __extends(Register8High, _super);
    function Register8High() {
        _super.apply(this, arguments);
    }
    return Register8High;
}(Register8));
exports.Register8High = Register8High;
var Register16 = (function (_super) {
    __extends(Register16, _super);
    function Register16(id) {
        _super.call(this, id, operand_1.SIZE.W);
    }
    return Register16;
}(Register));
exports.Register16 = Register16;
var Register32 = (function (_super) {
    __extends(Register32, _super);
    function Register32(id) {
        _super.call(this, id, operand_1.SIZE.D);
    }
    return Register32;
}(RegisterGP));
exports.Register32 = Register32;
var Register64 = (function (_super) {
    __extends(Register64, _super);
    function Register64(id) {
        _super.call(this, id, operand_1.SIZE.Q);
    }
    return Register64;
}(RegisterGP));
exports.Register64 = Register64;
var Register128 = (function (_super) {
    __extends(Register128, _super);
    function Register128(id) {
        _super.call(this, id, operand_1.SIZE.O);
    }
    return Register128;
}(RegisterGP));
exports.Register128 = Register128;
var Register256 = (function (_super) {
    __extends(Register256, _super);
    function Register256(id) {
        _super.call(this, id, operand_1.SIZE.H);
    }
    return Register256;
}(RegisterGP));
exports.Register256 = Register256;
var Register512 = (function (_super) {
    __extends(Register512, _super);
    function Register512(id) {
        _super.call(this, id, operand_1.SIZE.I);
    }
    return Register512;
}(RegisterGP));
exports.Register512 = Register512;
var RegisterRip = (function (_super) {
    __extends(RegisterRip, _super);
    function RegisterRip() {
        _super.call(this, 0, operand_1.SIZE.Q);
        this.name = 'rip';
    }
    return RegisterRip;
}(Register));
exports.RegisterRip = RegisterRip;
var RegisterSegment = (function (_super) {
    __extends(RegisterSegment, _super);
    function RegisterSegment(id) {
        _super.call(this, id, operand_1.SIZE.W);
    }
    return RegisterSegment;
}(Register));
exports.RegisterSegment = RegisterSegment;
var RegisterBounds = (function (_super) {
    __extends(RegisterBounds, _super);
    function RegisterBounds(id) {
        _super.call(this, id, operand_1.SIZE.O);
    }
    return RegisterBounds;
}(Register));
exports.RegisterBounds = RegisterBounds;
var RegisterFloatingPoint = (function (_super) {
    __extends(RegisterFloatingPoint, _super);
    function RegisterFloatingPoint() {
        _super.apply(this, arguments);
    }
    return RegisterFloatingPoint;
}(Register));
exports.RegisterFloatingPoint = RegisterFloatingPoint;
var RegisterMm = (function (_super) {
    __extends(RegisterMm, _super);
    function RegisterMm(id) {
        _super.call(this, id, operand_1.SIZE.O);
        this.name = 'mm' + id;
    }
    return RegisterMm;
}(RegisterFloatingPoint));
exports.RegisterMm = RegisterMm;
var RegisterSt = (function (_super) {
    __extends(RegisterSt, _super);
    function RegisterSt(id) {
        _super.call(this, id, operand_1.SIZE.T);
        this.name = 'st' + id;
    }
    return RegisterSt;
}(RegisterFloatingPoint));
exports.RegisterSt = RegisterSt;
var RegisterVector = (function (_super) {
    __extends(RegisterVector, _super);
    function RegisterVector() {
        _super.apply(this, arguments);
    }
    return RegisterVector;
}(Register));
exports.RegisterVector = RegisterVector;
var RegisterXmm = (function (_super) {
    __extends(RegisterXmm, _super);
    function RegisterXmm(id) {
        _super.call(this, id, operand_1.SIZE.O);
        this.name = 'xmm' + id;
    }
    return RegisterXmm;
}(RegisterVector));
exports.RegisterXmm = RegisterXmm;
var RegisterYmm = (function (_super) {
    __extends(RegisterYmm, _super);
    function RegisterYmm(id) {
        _super.call(this, id, operand_1.SIZE.H);
        this.name = 'ymm' + id;
    }
    return RegisterYmm;
}(RegisterVector));
exports.RegisterYmm = RegisterYmm;
var RegisterZmm = (function (_super) {
    __extends(RegisterZmm, _super);
    function RegisterZmm(id) {
        _super.call(this, id, operand_1.SIZE.I);
        this.name = 'zmm' + id;
    }
    return RegisterZmm;
}(RegisterVector));
exports.RegisterZmm = RegisterZmm;
var RegisterK = (function (_super) {
    __extends(RegisterK, _super);
    function RegisterK(id) {
        _super.call(this, id, operand_1.SIZE.Q);
        this.name = 'k' + id;
    }
    return RegisterK;
}(Register));
exports.RegisterK = RegisterK;
var RegisterCr = (function (_super) {
    __extends(RegisterCr, _super);
    function RegisterCr(id) {
        _super.call(this, id, operand_1.SIZE.Q);
        this.name = 'cr' + id;
    }
    return RegisterCr;
}(Register));
exports.RegisterCr = RegisterCr;
var RegisterDr = (function (_super) {
    __extends(RegisterDr, _super);
    function RegisterDr(id) {
        _super.call(this, id, operand_1.SIZE.Q);
        this.name = 'dr' + id;
    }
    return RegisterDr;
}(Register));
exports.RegisterDr = RegisterDr;
// # Scale
//
// `Scale` used in SIB byte in two bit `SCALE` field.
var Scale = (function (_super) {
    __extends(Scale, _super);
    function Scale(scale) {
        if (scale === void 0) { scale = 1; }
        _super.call(this);
        if (Scale.VALUES.indexOf(scale) < 0)
            throw TypeError("Scale must be one of [1, 2, 4, 8].");
        this.value = scale;
    }
    Scale.prototype.toString = function () {
        return '' + this.value;
    };
    Scale.VALUES = [1, 2, 4, 8];
    return Scale;
}(operand_1.Operand));
exports.Scale = Scale;
// ## Memory
//
// `Memory` is RAM addresses which `Register`s can *dereference*.
var Memory = (function (_super) {
    __extends(Memory, _super);
    function Memory() {
        _super.apply(this, arguments);
        this.base = null;
        this.index = null;
        this.scale = null;
        this.displacement = null;
    }
    Memory.factory = function (size) {
        switch (size) {
            case operand_1.SIZE.B: return new Memory8;
            case operand_1.SIZE.W: return new Memory16;
            case operand_1.SIZE.D: return new Memory32;
            case operand_1.SIZE.Q: return new Memory64;
            default: return new Memory;
        }
    };
    // Case memory to some size.
    Memory.prototype.cast = function (size) {
        var mem = Memory.factory(size);
        mem.base = this.base;
        mem.index = this.index;
        mem.scale = this.scale;
        mem.displacement = this.displacement;
        return mem;
    };
    Memory.prototype.reg = function () {
        if (this.base)
            return this.base;
        if (this.index)
            return this.index;
        // throw Error('No backing register.');
        return null;
    };
    Memory.prototype.needsSib = function () {
        return !!this.index || !!this.scale;
    };
    Memory.prototype.ref = function (base) {
        if (this.index) {
            if (base.size !== this.index.size)
                throw TypeError('Registers dereferencing memory must be of the same size.');
        }
        // RBP, EBP etc.. always need displacement for ModRM and SIB bytes.
        var is_ebp = (regfile_1.R64.RBP & 7) === base.get3bitId();
        if (is_ebp && !this.displacement)
            this.displacement = new DisplacementValue(0);
        return _super.prototype.ref.call(this, base);
    };
    Memory.prototype.ind = function (index, scale_factor) {
        if (scale_factor === void 0) { scale_factor = 1; }
        if (this.base) {
            if (this.base instanceof RegisterRip)
                throw TypeError("Cannot have index in memory reference that bases on " + this.base.toString() + ".");
            if (this.base.size !== index.size)
                throw TypeError('Registers dereferencing memory must be of the same size.');
        }
        if (!(index instanceof Register))
            throw TypeError('Index must by of type Register.');
        var esp = (regfile_1.R64.RSP & 7);
        if (index.get3bitId() === esp)
            throw TypeError('%esp, %rsp or other 0b100 registers cannot be used as addressing index.');
        this.index = index;
        this.scale = new Scale(scale_factor);
        return this;
    };
    Memory.prototype.disp = function (value) {
        if (value instanceof ii.Expression)
            this.displacement = DisplacementValue.fromExpression(value);
        else
            this.displacement = DisplacementValue.fromVariable(value);
        return this;
    };
    Memory.prototype.toString = function () {
        var parts = [];
        if (this.base)
            parts.push(this.base.toString());
        if (this.index)
            parts.push(this.index.toString() + ' * ' + this.scale.toString());
        if (this.displacement)
            parts.push(this.displacement.toString());
        return "[" + parts.join(' + ') + "]";
    };
    return Memory;
}(operand_1.Memory));
exports.Memory = Memory;
var Memory8 = (function (_super) {
    __extends(Memory8, _super);
    function Memory8() {
        _super.apply(this, arguments);
        this.size = operand_1.SIZE.B;
    }
    return Memory8;
}(Memory));
exports.Memory8 = Memory8;
var Memory16 = (function (_super) {
    __extends(Memory16, _super);
    function Memory16() {
        _super.apply(this, arguments);
        this.size = operand_1.SIZE.W;
    }
    return Memory16;
}(Memory));
exports.Memory16 = Memory16;
var Memory32 = (function (_super) {
    __extends(Memory32, _super);
    function Memory32() {
        _super.apply(this, arguments);
        this.size = operand_1.SIZE.D;
    }
    return Memory32;
}(Memory));
exports.Memory32 = Memory32;
var Memory64 = (function (_super) {
    __extends(Memory64, _super);
    function Memory64() {
        _super.apply(this, arguments);
        this.size = operand_1.SIZE.Q;
    }
    return Memory64;
}(Memory));
exports.Memory64 = Memory64;
var Memory128 = (function (_super) {
    __extends(Memory128, _super);
    function Memory128() {
        _super.apply(this, arguments);
        this.size = operand_1.SIZE.O;
    }
    return Memory128;
}(Memory));
exports.Memory128 = Memory128;
var Memory256 = (function (_super) {
    __extends(Memory256, _super);
    function Memory256() {
        _super.apply(this, arguments);
        this.size = operand_1.SIZE.H;
    }
    return Memory256;
}(Memory));
exports.Memory256 = Memory256;
var Memory512 = (function (_super) {
    __extends(Memory512, _super);
    function Memory512() {
        _super.apply(this, arguments);
        this.size = operand_1.SIZE.I;
    }
    return Memory512;
}(Memory));
exports.Memory512 = Memory512;
// Collection of operands an instruction might have.
var Operands = (function (_super) {
    __extends(Operands, _super);
    function Operands() {
        _super.apply(this, arguments);
    }
    Operands.findSize = function (ops) {
        for (var _i = 0, ops_1 = ops; _i < ops_1.length; _i++) {
            var operand = ops_1[_i];
            if (operand instanceof Register)
                return operand.size;
        }
        return operand_1.SIZE.NONE;
    };
    // getRegisterOperand(dst_first = true): Register {
    //     var [dst, src] = this.list;
    //     var first, second;
    //     if(dst_first) {
    //         first = dst;
    //         second = src;
    //     } else {
    //         first = src;
    //         second = dst;
    //     }
    //     if(first instanceof Register) return first as Register;
    //     if(second instanceof Register) return second as Register;
    //     return null;
    // }
    Operands.prototype.hasImmediate = function () {
        return !!this.getImmediate();
    };
    Operands.prototype.hasExtendedRegister = function () {
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op instanceof o.Register) {
                if (op.idSize() > 3)
                    return true;
            }
            else if (op instanceof o.Memory) {
                var mem = op;
                if (mem.base && (mem.base.idSize() > 3))
                    return true;
                if (mem.index && (mem.index.idSize() > 3))
                    return true;
            }
        }
        return false;
    };
    return Operands;
}(o.Operands));
exports.Operands = Operands;
// ## Export Registers
function validateRegId(id, min, max, Clazz) {
    if (typeof id !== 'number')
        throw TypeError(Clazz.name + ' register ID must be a number.');
    if (id < min)
        throw TypeError(Clazz.name + " register ID must be at least " + min + ".");
    if (id > max)
        throw TypeError(Clazz.name + " register ID must be at most " + max + ".");
}
function createRegisterGenerator(Clazz, min_id, max_id) {
    if (min_id === void 0) { min_id = 0; }
    if (max_id === void 0) { max_id = 15; }
    var cache;
    return function (id) {
        validateRegId(id, min_id, max_id, Clazz);
        if (!cache)
            cache = new Array(max_id + 1);
        if (!cache[id])
            cache[id] = new Clazz(id);
        return cache[id];
    };
}
exports.rb = createRegisterGenerator(Register8, 0, 15);
exports.rw = createRegisterGenerator(Register16, 0, 15);
exports.rd = createRegisterGenerator(Register32, 0, 15);
exports.rq = createRegisterGenerator(Register64, 0, 15);
exports.r = exports.rq;
exports.seg = createRegisterGenerator(RegisterSegment, 0, 15);
exports.mm = createRegisterGenerator(RegisterMm, 0, 15);
exports.st = createRegisterGenerator(RegisterSt, 0, 7);
exports.xmm = createRegisterGenerator(RegisterXmm, 0, 31);
exports.ymm = createRegisterGenerator(RegisterYmm, 0, 31);
exports.zmm = createRegisterGenerator(RegisterZmm, 0, 31);
exports.k = createRegisterGenerator(RegisterK, 0, 7);
exports.bnd = createRegisterGenerator(RegisterBounds, 0, 3);
exports.cr = createRegisterGenerator(RegisterCr, 0, 15);
exports.dr = createRegisterGenerator(RegisterDr, 0, 15);
exports.al = exports.rb(regfile_1.R8.AL);
exports.bl = exports.rb(regfile_1.R8.BL);
exports.cl = exports.rb(regfile_1.R8.CL);
exports.dl = exports.rb(regfile_1.R8.DL);
exports.sil = exports.rb(regfile_1.R8.SIL);
exports.dil = exports.rb(regfile_1.R8.DIL);
exports.bpl = exports.rb(regfile_1.R8.BPL);
exports.spl = exports.rb(regfile_1.R8.SPL);
exports.r8b = exports.rb(regfile_1.R8.R8B);
exports.r9b = exports.rb(regfile_1.R8.R9B);
exports.r10b = exports.rb(regfile_1.R8.R10B);
exports.r11b = exports.rb(regfile_1.R8.R11B);
exports.r12b = exports.rb(regfile_1.R8.R12B);
exports.r13b = exports.rb(regfile_1.R8.R13B);
exports.r14b = exports.rb(regfile_1.R8.R14B);
exports.r15b = exports.rb(regfile_1.R8.R15B);
exports.ah = new Register8High(regfile_1.R8H.AH);
exports.bh = new Register8High(regfile_1.R8H.BH);
exports.ch = new Register8High(regfile_1.R8H.CH);
exports.dh = new Register8High(regfile_1.R8H.DH);
exports.ax = exports.rw(regfile_1.R16.AX);
exports.bx = exports.rw(regfile_1.R16.BX);
exports.cx = exports.rw(regfile_1.R16.CX);
exports.dx = exports.rw(regfile_1.R16.DX);
exports.si = exports.rw(regfile_1.R16.SI);
exports.di = exports.rw(regfile_1.R16.DI);
exports.bp = exports.rw(regfile_1.R16.BP);
exports.sp = exports.rw(regfile_1.R16.SP);
exports.r8w = exports.rw(regfile_1.R16.R8W);
exports.r9w = exports.rw(regfile_1.R16.R9W);
exports.r10w = exports.rw(regfile_1.R16.R10W);
exports.r11w = exports.rw(regfile_1.R16.R11W);
exports.r12w = exports.rw(regfile_1.R16.R12W);
exports.r13w = exports.rw(regfile_1.R16.R13W);
exports.r14w = exports.rw(regfile_1.R16.R14W);
exports.r15w = exports.rw(regfile_1.R16.R15W);
exports.eax = exports.rd(regfile_1.R32.EAX);
exports.ebx = exports.rd(regfile_1.R32.EBX);
exports.ecx = exports.rd(regfile_1.R32.ECX);
exports.edx = exports.rd(regfile_1.R32.EDX);
exports.esi = exports.rd(regfile_1.R32.ESI);
exports.edi = exports.rd(regfile_1.R32.EDI);
exports.ebp = exports.rd(regfile_1.R32.EBP);
exports.esp = exports.rd(regfile_1.R32.ESP);
exports.r8d = exports.rd(regfile_1.R32.R8D);
exports.r9d = exports.rd(regfile_1.R32.R9D);
exports.r10d = exports.rd(regfile_1.R32.R10D);
exports.r11d = exports.rd(regfile_1.R32.R11D);
exports.r12d = exports.rd(regfile_1.R32.R12D);
exports.r13d = exports.rd(regfile_1.R32.R13D);
exports.r14d = exports.rd(regfile_1.R32.R14D);
exports.r15d = exports.rd(regfile_1.R32.R15D);
exports.rax = exports.rq(regfile_1.R64.RAX);
exports.rcx = exports.rq(regfile_1.R64.RCX);
exports.rdx = exports.rq(regfile_1.R64.RDX);
exports.rbx = exports.rq(regfile_1.R64.RBX);
exports.rsp = exports.rq(regfile_1.R64.RSP);
exports.rbp = exports.rq(regfile_1.R64.RBP);
exports.rsi = exports.rq(regfile_1.R64.RSI);
exports.rdi = exports.rq(regfile_1.R64.RDI);
exports.r8 = exports.rq(regfile_1.R64.R8);
exports.r9 = exports.rq(regfile_1.R64.R9);
exports.r10 = exports.rq(regfile_1.R64.R10);
exports.r11 = exports.rq(regfile_1.R64.R11);
exports.r12 = exports.rq(regfile_1.R64.R12);
exports.r13 = exports.rq(regfile_1.R64.R13);
exports.r14 = exports.rq(regfile_1.R64.R14);
exports.r15 = exports.rq(regfile_1.R64.R15);
exports.rip = new RegisterRip;
exports.es = exports.seg(regfile_1.SEG.ES);
exports.cs = exports.seg(regfile_1.SEG.CS);
exports.ss = exports.seg(regfile_1.SEG.SS);
exports.ds = exports.seg(regfile_1.SEG.DS);
exports.fs = exports.seg(regfile_1.SEG.FS);
exports.gs = exports.seg(regfile_1.SEG.GS);
