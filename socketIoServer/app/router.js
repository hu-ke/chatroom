'use strict';

module.exports = app => {
  // 聊天
  app.io.of('/io').route('msg', app.io.controller.chat.index);
  app.io.route('/chat', app.io.controller.chat.index);
  app.io.route('disconnect', app.io.controller.disconnect.index)
  // rtc视频
  app.io.of('/io').route('message', app.io.controller.rtc.forward)
  app.io.of('/io').route('createOrJoin', app.io.controller.rtc.createOrJoin)
  app.io.of('/io').route('disconnecting', app.io.controller.rtc.disconnecting)

  const { router, controller } = app;
  router.get('/login', controller.home.index);
};
