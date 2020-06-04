const { Server } = require('./ws');
const wsServer = new Server({ port: 8888 });
//wsServer服务器
//socket套接字 电源插座  监听客户端过来的连接 类似电话一样
wsServer.on('connection', (socket) => {
    //onmessage监听客户端发过来的消息
    socket.on('message', (message) => {
        console.log(message);
        socket.send(message);
    });
});