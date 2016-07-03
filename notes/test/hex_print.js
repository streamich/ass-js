

var buf = Buffer([123, 1,2, 3,54,65,6,7,8,3,4,4,45,75,4,3,4,56,675,54,3,3]);


function printBuffer(buf) {
    var int_size = 8;
    var ints = Math.ceil(buf.length / int_size);
    var lines = [];

    for(var j = 0; j < ints; j++) {
        var parts = [];
        var chars = [];

        var addr = '';
        addr = j.toString();
        if(addr.length < 6)
            addr = (new Array(7 - addr.length)).join('0') + addr;

        parts.push(addr + ' ');

        for(var m = 0; m < int_size; m++) {
            var index = (j * int_size) + m;
            if(index >= buf.length) break;
            var char = buf[index];
            chars.push(String.fromCharCode(char));
            var hex = char.toString(16);
            if(hex.length === 1) hex = '0' + hex;
            parts.push(hex);
        }

        var len = parts.join(' ').length;
        if(len < 32) parts.push((new Array(32 - len)).join(' '))
        else parts.push('  ');
        parts.push(chars.join(' '));
        lines.push(parts.join(' '));
    }

    var str = lines.join('\n');
    console.log(str);
}

printBuffer(buf);