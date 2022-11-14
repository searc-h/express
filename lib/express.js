/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var bodyParser = require('body-parser') // 做req.body接=接收

var EventEmitter = require('events').EventEmitter; //内置模块，做事件处理

/** -内置模块（Object.getOwnPropertyName ,Objg.getOwnPropertyDescriptor, Object.defineProperty的使用合并对象）
 *  -官网描述：
 * merge(destination, source)
 * Redefines destination's descriptors with source's.
 * merge(destination, source, false) 第三个参数：是否需要重定义重名属性，默认为true
 * Defines source's descriptors on destination if destination does not have a descriptor by the same name.
 */
var mixin = require('merge-descriptors'); 



var proto = require('./application');

var Route = require('./router/route');

var Router = require('./router');

var req = require('./request');

var res = require('./response');

/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication; //指定向外传递一个函数接口

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */

function createApplication() {
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  mixin(app, EventEmitter.prototype, false);// 添加app事件处理逻辑
  mixin(app, proto, false);  // 添加app内核逻辑

  // expose the prototype that will get set on requests
  app.request = Object.create(req, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })

  // expose the prototype that will get set on responses
  app.response = Object.create(res, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })

  app.init();
  return app;
}

/**
 * Expose the prototypes.
 */
//切记，对外提供的接口永远是以module.exports所指向的对象为准
// 这里的exports --> module.exports --> createApplication函数（本质也是对象）
exports.application = proto; // 向createApplication上添加 application属性
exports.request = req; // 向 creataApplication上添加request属性
exports.response = res;// 同理。。

/**
 * Expose constructors.
 */

exports.Route = Route; // 同理。。
exports.Router = Router; // 同理。。

/**
 * Expose middleware
 */

exports.json = bodyParser.json

exports.query = require('./middleware/query');

exports.raw = bodyParser.raw

/**
 * express.static即是使用serve-static工具包
 * 
 * var http = require('http')
 * var serveStatic = require('serve-static')
 * var serve = serveStatic('public/ftp', { index: ['index.html', 'index.htm'] })
 */
exports.static = require('serve-static');

exports.text = bodyParser.text 
exports.urlencoded = bodyParser.urlencoded // 引用 bodyParser.urlencoded

/**
 * Replace removed middleware with an appropriate error message.
 */

var removedMiddlewares = [
  'bodyParser',
  'compress',
  'cookieSession',
  'session',
  'logger',
  'cookieParser',
  'favicon',
  'responseTime',
  'errorHandler',
  'timeout',
  'methodOverride',
  'vhost',
  'csrf',
  'directory',
  'limit',
  'multipart',
  'staticCache'
]

// 避免访问express使用的第三方包上的属性
removedMiddlewares.forEach(function (name) {
  Object.defineProperty(exports, name, {
    get: function () {
      throw new Error('Most middleware (like ' + name + ') is no longer bundled with Express and must be installed separately. Please see https://github.com/senchalabs/connect#middleware.');
    },
    configurable: true
  });
});
