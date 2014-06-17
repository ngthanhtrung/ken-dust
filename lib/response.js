'use strict';

var parentRequire = require('parent-require'),

    ken = parentRequire('ken'),

    express = ken.express,
    resProto = express.response;

exports.setup = function () {
    resProto.layout = function (name) {
        this.locals.layout = name;
    };
};
