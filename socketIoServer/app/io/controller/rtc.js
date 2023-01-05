'use strict';

module.exports = app => {
    class Controller extends app.Controller {
        // 转发candidate offer answer
        async forward() {
            const target = this.ctx.args[0];
            const message = this.ctx.args[1];

            // 转发客户端消息
            if (target) {
                // 发送消息到指定客户端
                this.ctx.app.io.of('/io').sockets[target]?.emit('message', message)
            }
        }

        // 创建或加入房间
        async createOrJoin() {
            const room = this.ctx.args[0];
            const { socket, app } = this.ctx
            const clientsInRoom = app.io.of('/io').adapter.rooms[room]
            const numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0
            if (numClients === 0) {
                // 创建房间
                socket.join(room)
            } else if (numClients < 10) {
                // 一个房间最多只能有10个人
                socket.join(room)
                // 通知房间中的其他客户端有人加入
                socket.broadcast.to(room).emit('message', {
                    socketId: socket.id,
                    type: 'join'
                })
            }
        }

        // peer离开房间，通知其他peer。
        async disconnecting() {
            const { socket } = this.ctx
            // 通知房间中的其他客户端断开连接 
            Object.keys(socket.rooms).forEach(room => {
                socket.broadcast.to(room).emit('leaveed', socket.id)
            })
        }
    }
    return Controller;
};

//通知聊天室内所有peer
// app.io.of('/io').to(room).emit('message', {
//     socketId: socket.id,
//     type: 'join'
// })