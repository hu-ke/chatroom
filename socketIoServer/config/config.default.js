'use strict';

const path = require("path");

exports.io = {
  namespace: {
    '/io': {
      connectionMiddleware: ['auth'],
      packetMiddleware: [],
    },
  },
};

exports.keys = '123';

// exports.cors = {
//   origin: '*'
// }

exports.security = {
  csrf: {
    enable: false,
  },
  domainWhiteList: ['*'],
};

exports.cors = {
  origin: '*',
  credentials: true, // 允许Cookies可以跨域
  allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
};
