'use strict';

module.exports = app => {
  class Controller extends app.Controller {
    async index() {
      const info = this.ctx.args[0];
      console.log(`receiving msg from socketId ${this.ctx.socket.id}:`, info);

      if (info.target) {
        this.ctx.app.io.of('/io').sockets[info.target].emit('res', info.message)
      } else {
        this.ctx.app.io.of("/io").emit('res', {
          msg: info.message,
          userId: this.ctx.session.user.userId
        })
      }
      // this.ctx.app.io.of("/io").sockets.foreach(i => console.log(i))
      // const say = await this.ctx.service.user.say();
      // this.ctx.socket.emit('res', say);
    }
  }
  return Controller;
};
