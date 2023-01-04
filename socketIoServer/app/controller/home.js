'use strict';

const { Controller } = require('egg');
const { v4: uuidv4 } = require('uuid');

class HomeController extends Controller {

    async index() {
        const { ctx } = this;
        if (!ctx.session.user) {
            ctx.session.user = {
                userId: uuidv4()
            }
        }
        ctx.body = {
            code: 200,
            mgs: 'logged',
            userId: ctx.session.user.userId
        };
    }
}

module.exports = HomeController;
