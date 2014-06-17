'use strict';

var path = require('path'),
    fs = require('fs'),

    parentRequire = require('parent-require'),

    ken = parentRequire('ken'),

    consts = ken.consts,
    pathConsts = consts.path,
    viewConsts = consts.view,

    app = ken.app,

    dust = require('dustjs-helpers');

module.exports = dust;

dust.setup = function (opts) {
    var o = opts || {},
        ext = o.extension || 'dust',
        min = (typeof o.minify !== 'undefined' ? o.minify : !ken.isDevEnv),

        viewsPath = app.get('views'),
        cache = app.get('view cache');

    ken.dust = dust;

    dust.onLoad = function (view, cb) {
        var f = path.join(
                pathConsts.APP_VIEWS,
                view
            ) + '.' + ext;

        fs.readFile(f, 'utf8', cb);
    };

    if (!cache) {
        var load = dust.load;

        dust.load = function (view) {
            delete dust.cache[view];
            return load.apply(dust, arguments);
        };
    }

    if (!min) {
        dust.optimizers.format = function (ctx, node) {
            return node;
        };
    }

    var helpers = require('./helpers'),
        response = require('./response');

    helpers.setup();
    response.setup();

    app.set('view engine', ext);

    app.engine(ext, function (p, opts, cb) {
        var view = path.join(
            path.relative(pathConsts.APP_VIEWS, path.dirname(p)),
            path.basename(p, path.extname(p))
        );

        if (opts.layout === false) {
            return dust.render(view, opts, cb);
        }

        var layout = path.join(
            viewConsts.LAYOUTS_DIR,
            opts.layout ? opts.layout : viewConsts.BASE_LAYOUT
        );

        delete opts.layout;
        opts.view = view;

        dust.render(layout, opts, cb);
    });
};
