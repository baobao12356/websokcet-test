/**
 * 基于TCP传输层协议实现一个websocket应用服务器
 */
const net = require('net');
const { EventEmitter } = require('events');
const { toAcceptKey, unmask, toHeaders } = require('./utils');
const OPCODE = {
    TEXT: 1,
    BINARY: 2
}
//EventEmitter事件库，可以用来发布和订阅事件 进行事件监听 jquery on trigger   addEventLister
class Server extends EventEmitter {
    constructor(options) {
        super(options);
        this.options = options;
        //创建一个TCP服务器 每当服务器收到客户端连接后
        this.server = net.createServer(this.listener);
        this.server.listen(options.port || 8888);
    }
    //socket 套接字 用来它发送和接收消息的 类似电话
    listener = (socket) => {
        socket.setKeepAlive(true);//tcp协议的内容，保持长连接
        socket.send = function (payload) {
            let opcode;
            // 服务端用向客户端发数据。。。。
            if (Buffer.isBuffer(payload)) {
                opcode = OPCODE.BINARY; //2
            } else {
                opcode = OPCODE.TEXT;//1
                // 字符串转成buffer
                payload = Buffer.from(payload);
            }
            let length = payload.length;
            // 分配长度 2个字节，因为服务端给客户端没有掩码键那些，，所以。加2个字节后边默认都是内容
            let buffer = Buffer.alloc(length + 2);
            buffer[0] = 0b10000000 | opcode;  //1是结束帧的意思。。。opcode可能是1，129可能是2.是130。。
            buffer[1] = length;
            // 把payload拷贝到buffer里边，从第二个字节开始拷贝、、、。前边是fn和mask。
            payload.copy(buffer, 2);
            // 写到客户端里边
            socket.write(buffer);
        }
        //当服务器收到客户端发过来的data后 chunk就是客户端发给服务器的数据
        socket.on('data', (chunk) => {
            // 第一次是http协议，发的是，，判断区分。。说明客户端要求升级协议
            // chunk是整个请求hesder里边的内容
            if (chunk.toString().match(/Upgrade: websocket/)) {
                this.upgradeProtocol(socket, chunk.toString());
            } else {
                // 不是升级握手协议。。。
                this.onmessage(socket, chunk);
            }
        });
        //外部链接成功后会触发connection事件，并传递socket对象
        this.emit('connection', socket);
    }
    //如果不是握手，就是正常的发消息了
    onmessage = (socket, chunk) => {
        // 取到fin..看是0还是1？？取字节数组的第一个字节。。。chunk[0]第一个字节。
        let FIN = (chunk[0] & 0b10000000) === 0b10000000;//0b10000000&0b10000000 是128.。。是1 都是1.。1是结束帧
        let opcode = chunk[0] & 0b00001111;//得到操作码的十进制数
        let masked = (chunk[1] & 0b10000000) === 0b10000000;//是否掩码了 1是掩码、、
        let payloadLength = chunk[1] & 0b01111111;// 干掉第一个mask占1位。。后边是7位全是1。 他是十进制数 数据长度
        let payload;
        // 1是掩码了。。
        if (masked) {
            // 假设目前后边是空的小于125，后边直接是掩码键。
            let maskingKey = chunk.slice(2, 6); //4个字节
            payload = chunk.slice(6, 6 + payloadLength);
            unmask(payload, maskingKey);//反掩码码得到真正的数据
        } else {
            payload = chunk.slice(6, 6 + payloadLength);
        }
        if (FIN) {//结束帧，，1是文本，2是2进制。。
            switch (opcode) {
                case OPCODE.TEXT://文本字符串的话
                    // 发射事件。。。外部订阅message事件了。。
                    socket.emit('message', payload.toString('utf8'));
                    break;
                case OPCODE.BINARY://二进制数据的话buffer就直接发射。。。。
                    socket.emit('message', payload);
                    break;
                default:
                    break;
            }
        }
    }
    // 握手操作。。。
    upgradeProtocol = (socket, chunk) => {
        // chunk是请求行+头+体。
        let rows = chunk.split('\r\n'); //变成一行一行
        // toHeaders 请求头变成{key:value}
        let headers = toHeaders(rows.slice(1, -2));//第一行请求行和最后两行请求体不要
        let wsKey = headers['Sec-WebSocket-Key'];
        let acceptKey = toAcceptKey(wsKey);
        let response = [
            "HTTP/1.1 101 Switching Protocols",
            "Upgrade: websocket",
            "Connection: Upgrade",
            `Sec-WebSocket-Accept: ${acceptKey}`,
            "\r\n"
        ].join('\r\n'); //
        socket.write(response);
    }
}
exports.Server = Server;