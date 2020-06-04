let SecWebSocketKey = 'yZIB/WHqB3IJVRDApb1Nkg==';
let SecWebSocketAccept = 'oYmc5SZQnZNcJ5aC6mfKMhRUEDo=';
// 固定值定死的
let CODE = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
let crypto = require('crypto');

function toAcceptKey(wsKey) {
    //md5 hash 
    return crypto.createHash('sha1')
    // update里边加数据，，
        .update(wsKey + CODE)
        // 摘要base64
        .digest('base64');
}
let result = toAcceptKey(SecWebSocketKey);
console.log(result);

//SecWebSocketKey 不是安全的加密协议只是简单的校验