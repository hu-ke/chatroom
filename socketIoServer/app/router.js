'use strict';

module.exports = app => {
  app.io.of('/io').route('msg', app.io.controller.chat.index);
  app.io.of('/io').route('message', app.io.controller.rtc.index)
  app.io.of('/io').route('createOrJoin', app.io.controller.rtc.createOrJoin)
  app.io.route('disconnect', app.io.controller.disconnect.index)
  // 聊天
  app.io.route('/chat', app.io.controller.chat.index);

  // // app.io.of('/')
  // app.io.route('chat', app.io.controller.chat.index);

  // // app.io.of('/chat')
  // app.io.of('/chat').route('chat', app.io.controller.chat.index);

  const { router, controller } = app;
  router.get('/login', controller.home.index);
};
