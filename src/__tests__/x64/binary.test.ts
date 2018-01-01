import {X64} from "../../index";
import {
    ah, al, ax, bl, bpl, bx, ch, cl, cx, dil, dl, eax, ebx, ecx, esp, r10b, r12, r13, r15, r8b, r9, rax, rbp, rbx, rcx,
    rdx,
    rsp, spl
} from "../../plugins/x86/operand/generator";

describe('Binary Arithmetic', function() {
    describe('adcx', function () {
        it('adcx rcx, rbx', function () { // 66 48 0f 38 f6 cb    	adcx   %rbx,%rcx
            const _ = X64();
            _._('adcx', [rcx, rbx]);
            const bin = _.compile([]);
            // console.log(new Buffer(bin));
            expect(bin).toEqual([0x66, 0x48, 0x0F, 0x38, 0xF6, 0xCB]);
        });

        it('adcx rax, rax', function () { // 66 48 0f 38 f6 c0    	adcx   %rax,%rax
            const _ = X64();
            _._('adcx', [rax, rax]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x66, 0x48, 0x0F, 0x38, 0xF6, 0xC0]);
        });
    });

    describe('adox', function () {
        it('adox r12, r9', function () { // f3 4d 0f 38 f6 e1    	adox   %r9,%r12
            const _ = X64();
            _._('adox', [r12, r9]);
            const bin = _.compile([]);
            expect(bin).toEqual([0xF3, 0x4D, 0x0F, 0x38, 0xF6, 0xE1]);
        });
    });

    describe('add', function () {
        it('add rax, 0x19', function () { // 48 83 c0 19          	add    $0x19,%rax
            const _ = X64();
            _._('add', [rax, 0x19]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x83, 0xC0, 0x19]);
        });

        it('add rax, rax', function () { // 48 01 c0             	add    %rax,%rax
            const _ = X64();
            _._('add', [rax, rax]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x01, 0xC0]);
        });

        it('add rbx, rsp', function () { // 48 01 e3             	add    %rsp,%rbx
            const _ = X64();
            _._('add', [rbx, rsp]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x01, 0xE3]);
        });

        it('add rcx, [rbx]', function () { // 48 03 0b             	add    (%rbx),%rcx
            const _ = X64();
            _._('add', [rcx, rbx.ref()]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x03, 0x0B]);
        });

        it('add rcx, [rcx + rdx]', function () { // 48 03 0c 11          	add    (%rcx,%rdx,1),%rcx
            const _ = X64();
            _._('add', [rcx, rcx.ref().ind(rdx)]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x03, 0x0C, 0x11]);
        });

        it('add rcx, [rcx + rbp * 4]', function () { // 48 03 0c a9          	add    (%rcx,%rbp,4),%rcx
            const _ = X64();
            _._('add', [rcx, rcx.ref().ind(rbp, 4)]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x03, 0x0C, 0xA9]);
        });

        it('add rcx, [rsp + rbp * 4 + 0x11]', function () { // 48 03 4c ac 11       	add    0x11(%rsp,%rbp,4),%rcx
            const _ = X64();
            _._('add', [rcx, rsp.ref().ind(rbp, 4).disp(0x11)]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x03, 0x4C, 0xAC, 0x11]);
        });

        it('add rcx, [rsp + rbp * 4 + -0x11223344]', function () { // 48 03 8c ac bc cc dd ee 	add    -0x11223344(%rsp,%rbp,4),%rcx
            const _ = X64();
            _._('add', [rcx, rsp.ref().ind(rbp, 4).disp(-0x11223344)]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x03, 0x8C, 0xAC, 0xBC, 0xCC, 0xDD, 0xEE]);
        });

        it('add [rsp + rbp * 4 + -0x11223344], rax', function () { // 48 01 84 ac bc cc dd ee 	add    %rax,-0x11223344(%rsp,%rbp,4)
            const _ = X64();
            _._('add', [rsp.ref().ind(rbp, 4).disp(-0x11223344), rax]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x01, 0x84, 0xAC, 0xBC, 0xCC, 0xDD, 0xEE]);
        });

        it('add rbx, 1', function () { // 48 83 c3 01          	add    $0x1,%rbx
            const _ = X64();
            _._('add', [rbx, 1]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x83, 0xC3, 0x01]);
        });

        it('add rbx, [1]', function () { // 48 03 1c 25 01 00 00 00 	add    0x1,%rbx
            const _ = X64();
            _._('add', [rbx, _._('mem', 1)]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x03, 0x1C, 0x25, 0x01, 0, 0, 0]);
        });

        it('add [1], rbx', function () { // 48 01 1c 25 01 00 00 00 	add    %rbx,0x1
            const _ = X64();
            _._('add', [_._('mem', 1), rbx]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x01, 0x1C, 0x25, 0x01, 0, 0, 0]);
        });

        it('add al, 0x11', function () { // 04 11                	add    $0x11,%al
            const _ = X64();
            _._('add', [al, 0x11]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x04, 0x11]);
        });

        it('add ax, 0x1122', function () { // 66 05 22 11          	add    $0x1122,%ax
            const _ = X64();
            _._('add', [ax, 0x1122]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x66, 0x05, 0x22, 0x11]);
        });

        it('add eax, 0x11223344', function () { // 05 44 33 22 11       	add    $0x11223344,%eax
            const _ = X64();
            _._('add', [eax, 0x11223344]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x05, 0x44, 0x33, 0x22, 0x11]);
        });

        it('add rax, -0x11223344', function () { // 48 05 bc cc dd ee    	add $-0x11223344, %rax
            const _ = X64();
            _._('add', [rax, -0x11223344]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x05, 0xbc, 0xcc, 0xdd, 0xee]);
        });

        it('add bl, 0x22', function () { // 80 c3 22             	add    $0x22,%bl
            const _ = X64();
            _._('add', [bl, 0x22]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x80, 0xc3, 0x22]);
        });

        it('add ah, 0x22', function () { // 80 c4 22             	add    $0x22,%ah
            const _ = X64();
            _._('add', [ah, 0x22]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x80, 0xc4, 0x22]);
        });

        it('add bx, 0x1122', function () { // 66 81 c3 22 11       	add    $0x1122,%bx
            const _ = X64();
            _._('add', [bx, 0x1122]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x66, 0x81, 0xC3, 0x22, 0x11]);
        });

        it('add bx, 0x11', function () { // 66 83 c3 11          	add    $0x11,%bx
            const _ = X64();
            _._('add', [bx, 0x11]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x66, 0x83, 0xC3, 0x11]);
        });

        it('add ebx, 0x1122', function () { // 81 c3 22 11 00 00    	add    $0x1122,%ebx
            const _ = X64();
            _._('add', [ebx, 0x1122]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x81, 0xC3, 0x22, 0x11, 0, 0]);
        });

        it('add ch, 0x22', function () { // 80 c5 22             	add    $0x22,%ch
            const _ = X64();
            _._('add', [ch, 0x22]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x80, 0xC5, 0x22]);
        });

        it('add dil, 0x22', function () { // 40 80 c7 22          	add    $0x22,%dil
            const _ = X64();
            _._('add', [dil, 0x22]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x40, 0x80, 0xC7, 0x22]);
        });

        it('add bpl, 0x22', function () { // 40 80 c5 22          	add    $0x22,%bpl
            const _ = X64();
            _._('add', [bpl, 0x22]);;
            const bin = _.compile([]);
            expect(bin).toEqual([0x40, 0x80, 0xC5, 0x22]);
        });

        it('add spl, 0x22', function () { // 40 80 c4 22          	add    $0x22,%spl
            const _ = X64();
            _._('add', [spl, 0x22]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x40, 0x80, 0xC4, 0x22]);
        });

        it('add r8b, 0x22', function () { // 41 80 c0 22          	add    $0x22,%r8b
            const _ = X64();
            _._('add', [r8b, 0x22]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x41, 0x80, 0xC0, 0x22]);
        });

        it('add esp, 0x12', function () { // 83 c4 12             	add    $0x12,%esp
            const _ = X64();
            _._('add', [esp, 0x12]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x83, 0xC4, 0x12]);
        });

        it('add dl, cl', function () { // 00 ca                	add    %cl,%dl
            const _ = X64();
            _._('add', [dl, cl]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x00, 0xCA]);
        });

        it('add bx, ax', function () { // 66 01 c3             	add    %ax,%bx
            const _ = X64();
            _._('add', [bx, ax]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x66, 0x01, 0xC3]);
        });

        it('add ecx, eax', function () { // 01 c1                	add    %eax,%ecx
            const _ = X64();
            _._('add', [ecx, eax]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x01, 0xC1]);
        });
    });

    describe('adc', function() {
        it('adc [rbx + rcx * 4 + 0x11], rax', function() {// 48 11 44 8b 11       	adc    %rax,0x11(%rbx,%rcx,4)
            const _ = X64();
            _._('adc', [rbx.ref().ind(rcx, 4).disp(0x11), rax]);
            expect(_.compile([])).toEqual([0x48, 0x11, 0x44, 0x8B, 0x11]);
        });
    });

    describe('mul', function() {
        it('mul al', function() {// 400580:	f6 e0                	mul    %al
            const _ = X64();
            _._('mul', al);
            expect(_.compile([])).toEqual([0xf6, 0xe0]);
        });

        it('mul ax', function() {// 66 f7 e0             	mul    %ax
            const _ = X64();
            _._('mul', ax);
            expect(_.compile([])).toEqual([0x66, 0xf7, 0xe0]);
        });

        it('mul eax', function() {// f7 e0                	mul    %eax
            const _ = X64();
            _._('mul', eax);
            expect(_.compile([])).toEqual([0xf7, 0xe0]);
        });

        it('mul rax', function() {// 48 f7 e0             	mul    %rax
            const _ = X64();
            _._('mul', rax);
            expect(_.compile([])).toEqual([0x48, 0xf7, 0xe0]);
        });

        it('mulq [rax]', function() {// 48 f7 20             	mulq   (%rax)
            const _ = X64();
            _._('mul', rax.ref(), 64);
            expect(_.compile([])).toEqual([0x48, 0xf7, 0x20]);
        });

        it('mulq [eax]', function() {// 67 48 f7 20          	mulq   (%eax)
            const _ = X64();
            _._('mul', eax.ref(), 64);
            expect(_.compile([])).toEqual([0x67, 0x48, 0xf7, 0x20]);
        });

        it('muld [rax]', function() {// f7 20                	mull   (%rax)
            const _ = X64();
            _._('mul', rax.ref(), 32);
            expect(_.compile([])).toEqual([0xf7, 0x20]);
        });

        it('muld [eax]', function() {// 67 f7 20             	mull   (%eax)
            const _ = X64();
            _._('mul', eax.ref(), 32);
            expect(_.compile([])).toEqual([0x67, 0xf7, 0x20]);
        });

        it('mulw [rax]', function() {// 66 f7 20             	mulw   (%rax)
            const _ = X64();
            _._('mul', rax.ref(), 16);
            expect(_.compile([])).toEqual([0x66, 0xf7, 0x20]);
        });

        it('mulw [eax]', function() {// 67 66 f7 20          	mulw   (%eax)
            const _ = X64();
            _._('mul', eax.ref(), 16);
            expect(_.compile([])).toEqual([0x67, 0x66, 0xf7, 0x20]);
        });

        it('mulb [rax]', function() {// f6 20                	mulb   (%rax)
            const _ = X64();
            _._('mul', rax.ref(), 8);
            expect(_.compile([])).toEqual([0xf6, 0x20]);
        });

        it('mulb [eax]', function() {// 67 f6 20             	mulb   (%eax)
            const _ = X64();
            _._('mul', eax.ref(), 8);
            expect(_.compile([])).toEqual([0x67, 0xf6, 0x20]);
        });
    });

    describe('div', function() {
        it('div bl', function() {// f6 f3                	div    %bl
            const _ = X64();
            _._('div', bl);
            expect(_.compile([])).toEqual([0xf6, 0xF3]);
        });

        it('div bx', function() {// 66 f7 f3             	div    %bx
            const _ = X64();
            _._('div', bx);
            expect(_.compile([])).toEqual([0x66, 0xf7, 0xF3]);
        });

        it('div ebx', function() {// f7 f3                	div    %ebx
            const _ = X64();
            _._('div', ebx);
            expect(_.compile([])).toEqual([0xf7, 0xF3]);
        });

        it('div rbx', function() {// 48 f7 f3             	div    %rbx
            const _ = X64();
            _._('div', rbx);
            expect(_.compile([])).toEqual([0x48, 0xf7, 0xF3]);
        });
    });

    describe('inc', function() {
        it('incq rbx', function() {
            const _ = X64();
            _._('inc', rbx, 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0xc3]);
        });

        it('incq [rax]', function() {
            const _ = X64();
            _._('inc', rax.ref(), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x00]);
        });

        it('incq [rbx]', function() {
            const _ = X64();
            _._('inc', rbx.ref(), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x03]);
        });

        it('incq [rbx + rcx]', function() {
            const _ = X64();
            _._('inc', rbx.ref().ind(rcx), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x04, 0x0b]);
        });

        it('incq [rbx + rcx * 8]', function() {
            const _ = X64();
            _._('inc', rbx.ref().ind(rcx, 8), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x04, 0xcb]);
        });

        it('incq [rax + rbx * 8 + 0x11]', function() {
            const _ = X64();
            _._('inc', rax.ref().ind(rbx, 8).disp(0x11), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x44, 0xd8, 0x11]);
        });

        it('incq [rax + rbx * 8 + -0x11223344]', function() {
            const _ = X64();
            const ins = _._('inc', rax.ref().ind(rbx, 8).disp(-0x11223344), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x84, 0xd8, 0xbc, 0xcc, 0xdd, 0xee]);
        });

        it('incq [rbx + r15 * 8 + -0x123]', function() {
            const _ = X64();
            const ins = _._('inc', rbx.ref().ind(r15, 8).disp(-0x123), 64);
            expect(_.compile([])).toEqual([0x4a, 0xff, 0x84, 0xfb, 0xdd, 0xfe, 0xff, 0xff]);
        });

        it('incq [rbp + rbp * 8]', function() {
            const _ = X64();
            const ins = _._('inc', rbp.ref().ind(rbp, 8), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x44, 0xed, 0x00]);
        });

        it('incq [rbp]', function() {
            const _ = X64();
            const ins = _._('inc', rbp.ref(), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x45, 0x00]);
        });

        it('incq [rsp]', function() {
            const _ = X64();
            const ins = _._('inc', rsp.ref(), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x04, 0x24]);
        });

        it('incq [r12]', function() {
            const _ = X64();
            const ins = _._('inc', r12.ref(), 64);
            expect(_.compile([])).toEqual([0x49, 0xff, 0x04, 0x24]);
        });

        it('incq [r13]', function() {
            const _ = X64();
            const ins = _._('inc', r13.ref(), 64);
            expect(_.compile([])).toEqual([0x49, 0xff, 0x45, 0x00]);
        });

        it('incq r15', function() {
            const _ = X64();
            const ins = _._('inc', r15, 64);
            expect(_.compile([])).toEqual([0x49, 0xff, 0xc7]);
        });

        it('incq [0x11]', function() {
            const _ = X64();
            const ins = _._('inc', _._('mem', 0x11), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x04, 0x25, 0x11, 0x00, 0x00, 0x00]);
        });

        it('incq [0x11223344]', function() {
            const _ = X64();
            const ins = _._('inc', _._('mem', 0x11223344), 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0x04, 0x25, 0x44, 0x33, 0x22, 0x11]);
        });
    });

    describe('dec', function() {
        it('decq rbx', function () {
            const _ = X64();
            _._('dec', rax, 64);
            expect(_.compile([])).toEqual([0x48, 0xff, 0xc8]);
        });

        it('dec r10b', function () { // 41 fe ca             	dec    %r10b
            const _ = X64();
            _._('dec', r10b);
            expect(_.compile([])).toEqual([0x41, 0xFE, 0xCA]);
        });

        it('dec ax', function () { // 66 ff c8             	dec    %ax
            const _ = X64();
            _._('dec', ax);
            expect(_.compile([])).toEqual([0x66, 0xFF, 0xC8]);
        });

        it('dec eax', function () { // ff c8                	dec    %eax
            const _ = X64();
            _._('dec', eax);
            expect(_.compile([])).toEqual([0xFF, 0xC8]);
        });

        it('dec rax', function () { // 48 ff c8             	dec    %rax
            const _ = X64();
            _._('dec', rax);
            expect(_.compile([])).toEqual([0x48, 0xFF, 0xC8]);
        });
    });

    describe('neg', function () {
        it('neg al', function () { // f6 d8                	neg    %al
            const _ = X64();
            _._('neg', al);
            const bin = _.compile([]);
            expect(bin).toEqual([0xF6, 0xD8]);
        });

        it('neg dil', function () { // 40 f6 df             	neg    %dil
            const _ = X64();
            _._('neg', dil);
            const bin = _.compile([]);
            expect(bin).toEqual([0x40, 0xF6, 0xDF]);
        });

        it('neg bx', function () { // 66 f7 db             	neg    %bx
            const _ = X64();
            _._('neg', bx);
            const bin = _.compile([]);
            expect(bin).toEqual([0x66, 0xF7, 0xDB]);
        });

        it('neg ecx', function () { // f7 d9                	neg    %ecx
            const _ = X64();
            _._('neg', ecx);
            const bin = _.compile([]);
            expect(bin).toEqual([0xF7, 0xD9]);
        });

        it('neg rdx', function () { // 48 f7 da             	neg    %rdx
            const _ = X64();
            _._('neg', rdx);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0xF7, 0xDA]);
        });
    });

    describe('cmp', function () {
        it('cmp al, 0x11', function () { // 3c 11                	cmp    $0x11,%al
            const _ = X64();
            _._('cmp', [al, 0x11]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x3C, 0x11]);
        });

        it('cmp ax, 0x1122', function () { // 66 3d 22 11          	cmp    $0x1122,%ax
            const _ = X64();
            _._('cmp', [ax, 0x1122]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x66, 0x3D, 0x22, 0x11]);
        });

        it('cmp eax, 0x11223344', function () { // 3d 44 33 22 11       	cmp    $0x11223344,%eax
            const _ = X64();
            _._('cmp', [eax, 0x11223344]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x3D, 0x44, 0x33, 0x22, 0x11]);
        });

        it('cmp rax, 0x11223344', function () { // 48 3d 44 33 22 11    	cmp    $0x11223344,%rax
            const _ = X64();
            _._('cmp', [rax, 0x11223344]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x3D, 0x44, 0x33, 0x22, 0x11]);
        });

        it('cmp bl, 0x11', function () { // 80 fb 11             	cmp    $0x11,%bl
            const _ = X64();
            _._('cmp', [bl, 0x11]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x80, 0xFB, 0x11]);
        });

        it('cmp bx, 0x1122', function () { // 66 81 fb 22 11       	cmp    $0x1122,%bx
            const _ = X64();
            _._('cmp', [bx, 0x1122]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x66, 0x81, 0xFB, 0x22, 0x11]);
        });

        it('cmp ebx, 0x11223344', function () { // 81 fb 44 33 22 11    	cmp    $0x11223344,%ebx
            const _ = X64();
            _._('cmp', [ebx, 0x11223344]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x81, 0xFB, 0x44, 0x33, 0x22, 0x11]);
        });

        it('cmp rbx, 0x11223344', function () { // 48 81 fb 44 33 22 11 	cmp    $0x11223344,%rbx
            const _ = X64();
            _._('cmp', [rbx, 0x11223344]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x81, 0xFB, 0x44, 0x33, 0x22, 0x11]);
        });

        it('cmp cx, 0x11', function () { // 66 83 f9 11          	cmp    $0x11,%cx
            const _ = X64();
            _._('cmp', [cx, 0x11]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x66, 0x83, 0xF9, 0x11]);
        });

        it('cmp ecx, 0x11', function () { // 83 f9 11             	cmp    $0x11,%ecx
            const _ = X64();
            _._('cmp', [ecx, 0x11]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x83, 0xF9, 0x11]);
        });

        it('cmp rcx, 0x11', function () { // 48 83 f9 11          	cmp    $0x11,%rcx
            const _ = X64();
            _._('cmp', [rcx, 0x11]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x83, 0xF9, 0x11]);
        });

        it('cmp al, bl', function () { // 38 d8                	cmp    %bl,%al
            const _ = X64();
            _._('cmp', [al, bl]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x38, 0xD8]);
        });

        it('cmp ax, bx', function () { // 66 39 d8             	cmp    %bx,%ax
            const _ = X64();
            _._('cmp', [ax, bx]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x66, 0x39, 0xD8]);
        });

        it('cmp ebx, eax', function () { // 39 c3                	cmp    %eax,%ebx
            const _ = X64();
            _._('cmp', [ebx, eax]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x39, 0xC3]);
        });

        it('cmp rbx, rax', function () { // 48 39 c3             	cmp    %rax,%rbx
            const _ = X64();
            _._('cmp', [rbx, rax]);
            const bin = _.compile([]);
            expect(bin).toEqual([0x48, 0x39, 0xC3]);
        });
    });
});
