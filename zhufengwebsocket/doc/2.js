/**
 * 8个bit就称为一个字节(Byte)
 * 1.一个字节是8个位  一个字节等于8位 1byte=8bit 表示的数字是0~255 最小-最大 00000000~11111111
 * 1.大端序和小端序
 */
// Buffer是字节数组，
let buffer = Buffer.from([0b00000001, 0b00000000]);
//console.log(buffer);// 0b10 010 10  0x10 
console.log(Math.pow(2, 8));

// B大端  E端的意思 buffer 16位是2个字节，上边正好是16位 从0读取
console.log(buffer.readUInt16BE(0));// 000000001 000000000  //256  2的8次方 Math.pow(2, 8)
console.log(buffer.readUInt16LE(0));// 000000000 000000001  //1

function getLength(buffer) {
    debugger
    //如果 x<=125 x就是数据的长度
    //如果 x===126 后面的2个字节才是真正的数据长度
    //如果说x===127 后面的8个字节表示真正的数据长度
    // 从0开始读取8个位就是1个字节， 变成10进制
    const byte = buffer.readUInt8(0);//变成10进制
    console.log(byte, 'byte') //255
    const str = byte.toString(2);//我在变成2进制
    console.log(str, 'str')//11111111

    // 再把第一位截取掉 因为第一位是Mask。。占1个位，所以剩下才是数据长度
    // 转成10进制
    let length = parseInt(str.substring(1), 2);
    console.log(length, 'length')//127 
    if (length === 126) {//0b11111110
        // 2个字节2816
        length = buffer.readUInt16BE(1);
        console.log(length, '126length')//
    } else if (length === 127) {
        //8个字节8864 u是无符号的意思
        length = buffer.readBigUInt64BE(1);
        console.log(length, '127length')//65536n
    }
    return length;

}

console.log(126..toString(2));
console.log(127..toString(2));
console.log(getLength(Buffer.from([0b11111110, 0b00000001, 0b00000001]))); //0b0000000100000001 是256+1是257  16位整体表示1个字节

console.log(getLength(Buffer.from([0b11111111,
    0b00000000, 0b00000000,//2个字节 length === 126的时候这是长度
    0b00000000, 0b00000000,
    0b00000000, 0b00000001,
    0b00000000, 0b00000000]))); // 0b00000000, 0b00000000 这两个加起来是65535在多加一个就是65536了。


console.log(Math.pow(2, 16)); //65536

console.log(Buffer.from([0b11111110, 0b00000001, 0b00000001]).length) //3
console.log(Buffer.from([0, 2]).length) //2


console.log(0b11111110&0b00000111) //6 10进制6
console.log(0b11111110|0b00000111) //255 10进制255
console.log(0b11111110^0b00000111) //249 10进制249
