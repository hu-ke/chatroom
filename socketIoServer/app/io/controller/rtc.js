'use strict';

module.exports = app => {
    class Controller extends app.Controller {
        async index() {
            const target = this.ctx.args[0];
            const message = this.ctx.args[1];
            console.log('target>>', target)
            console.log('message>>', message)
            // 转发客户端消息
            if (target) {
                // 发送消息到指定客户端
                this.ctx.app.io.of('/io').sockets[target]?.emit('message', message)
            }
            //   console.log(`receiving msg from socketId ${this.ctx.socket.id}:`, info);

            //   if (info.target) {
            //     this.ctx.app.io.of('/io').sockets[info.target].emit('res', info.message)
            //   } else {
            //     // broadcast
            //     this.ctx.app.io.of("/io").emit('res', info.message)
            //   }
            // this.ctx.app.io.of("/io").sockets.foreach(i => console.log(i))
            // const say = await this.ctx.service.user.say();
            // this.ctx.socket.emit('res', say);
        }

        async createOrJoin() {
            const room = this.ctx.args[0];
            const { socket, app } = this.ctx
            const clientsInRoom = app.io.of('/io').adapter.rooms[room]
            const numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0
            console.log('room>>', room, numClients)
            if (numClients === 0) {
                // 创建房间
                socket.join(room)
                // 通知当前客户端创建房间成功
                // this.ctx.socket.emit('created', room, socket.id)
            } else if (numClients < 10) {
                // 一个房间最多只能有10个人
                socket.join(room)
                // 通知当前客户端加入房间成功
                // socket.emit('joined', room, socket.id)

                // 通知房间中的其他客户端有人加入
                socket.broadcast.to(room).emit('message', {
                    socketId: socket.id,
                    type: 'join'
                })
            }
        }
    }
    return Controller;
};

//通知聊天室内所有peer
// app.io.of('/io').to(room).emit('message', {
//     socketId: socket.id,
//     type: 'join'
// })