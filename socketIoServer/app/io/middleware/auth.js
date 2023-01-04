'use strict';

// 处理connect的中间件
module.exports = () => {
  return async (ctx, next) => {
    if (!ctx.session.user) {
      return
    }
    // const say = await ctx.service.user.say();
    if (!ctx.session.userSocketMap) {
      ctx.session.userSocketMap = {}
    }
    ctx.session.userSocketMap[ctx.session.user.userId] = ctx.socket;
    ctx.socket.emit('auth', {
      socketId: ctx.socket.id,
      userId: ctx.session.user.userId
    });
    await next();
    console.log('disconnect!');
  };
};
