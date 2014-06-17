'use strict';

var parentRequire = require('parent-require'),

    ken = parentRequire('ken'),
    app = ken.app,

    dust = require('dustjs-helpers');

exports.setup = function () {
    dust.helpers.url = function (chunk, context, bodies, params) {
        for (var prop in params) {
            params[prop] = this.tap(
                params[prop],
                chunk,
                context
            );
        }

        var route = params.route || context.get('route');
        delete params.route;

        return chunk.write(
            app.url(route, params)
        );
    };

    dust.helpers.join = function (chunk, context, bodies, params) {
        var key = this.tap(params.key, chunk, context),
            array = context.get(key),

            transform = params.transform,
            join = (params.join ? this.tap(params.join, chunk, context) : '');

        array = array.map(function (item) {
            return this.tap(
                transform,
                chunk,
                context.push(item)
            );
        }, this);

        return chunk.write(
            array.join(join)
        );
    }

    dust.helpers.reconstruct = function (chunk, context, bodies, params) {
        var source = this.tap(params.source, chunk, context),
            delimiter = this.tap(params.delimiter, chunk, context),
            transform = params.transform,
            join = (params.join ? this.tap(params.join, chunk, context) : ''),

            matches;

        if (matches = /\/([^\/]+)\/([gim]*)/.exec(delimiter)) {
            delimiter = new RegExp(matches[1], matches[2]);
        }

        var parts = source.split(delimiter).map(function (part) {
            return this.tap(
                transform,
                chunk,
                context.push(part)
            );
        }, this);

        return chunk.write(
            parts.join(join)
        );
    };
};
