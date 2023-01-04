'use strict';

module.exports = app => {
    class Controller extends app.Controller {
        async index() {
            const message = this.ctx.args[0];
            console.log('disconnection', JSON.stringify(message) + ' : ' + process.pid)
            //   console.log('chat :', JSON.stringify(message) + ' : ' + process.pid);
            //   let socketId = this.ctx.socket.id
            //   console.log('socket.id>>', socketId, this.ctx.app.io.of("/io").sockets[socketId].ide)
            //   // this.ctx.app.io.of("/io").sockets.foreach(i => console.log(i))
            //   const say = await this.ctx.service.user.say();
            //   this.ctx.socket.emit('res', say);
        }
    }
    return Controller;
};
