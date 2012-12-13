
define(function(require) {
    var $ = require('zepto');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var anims = require('./anim');
    var Header = require('./header');
    var Footer = require('./footer');

    var globalObject = {
        _stack: [],
        stackSize: function() {
            return globalObject._stack.length;
        },
        clearStack: function() {
            var stack = globalObject._stack;

            while(stack.length) {
                stack[stack.length - 1].close();
            }
        }
    };

    var BasicView = Backbone.View.extend({
        initialize: function() {
            // `initView` is a separate function so anything that
            // extends `BasicView` and overrides `initialize` can still
            // call it
            this.initView();
        },

        initView: function() {
            var el = $(this.el);

            this._stack = [];
            this.manualLayout = el.data('layout') == 'manual';

            var p = el.parents('x-view').get(0);
            this.parent = p ? p.view : globalObject;

            this.initMarkup();
        },

        initMarkup: function() {
            var el = $(this.el);

            if(el.children('header').length) {
                this.header = new Header(this);
                el.children('header').remove();
            }

            if(el.children('footer').length) {
                this.footer = new Footer(this);
                el.children('footer').remove();
            }

            // We need to manipulate all of the child nodes, including
            // text nodes
            var nodes = Array.prototype.slice.call(el[0].childNodes);
            var contents = $(nodes);

            if(!contents.length) {
                if(this.manualLayout) {
                    el.append('<div class="_contents"></div>');
                }
                else {
                    el.append('<div class="_contents"><div class="contents"></div></div>');
                }
            }
            else {
                if(this.manualLayout) {
                    contents.wrapAll('<div class="_contents"></div>');
                }
                else {
                    contents.wrapAll('<div class="contents"></div>');
                    el.children('.contents').wrap('<div class="_contents"></div>');
                }
            }

            if(this.header) {
                el.prepend(this.header.el);
            }

            if(this.footer) {
                el.append(this.footer.el);
            }

            // Position the view (not done in css because we don't
            // want a "pop" when the page loads)
            // el.css({
            //     position: 'absolute',
            //     top: 0,
            //     left: 0
            // });
            this.onResize();
        },

        onResize: function() {
            var el = $(this.el);
            var parentEl;

            // The structure of a view is `x-view > ._contents >
            // .contents`. The extra markup lets users put padding on
            // the .contents element reliably. Because of this, if
            // views are inside views, we really want the dimension of
            // the parent ._contents. However, if we are not inside a
            // view, it should just use the immediate parent.

            if(el.parent().is('.contents') &&
               el.parent().parent().is('._contents') &&
               el.parent().parents().parent().is('x-view')) {
                parentEl = el.parent().parent();
            }
            else {
                parentEl = null;
            }

            var barHeights = (el.children('header').height() +
                              el.children('footer').height());

            if(parentEl) {
                el.width(parentEl.width());
                el.children('._contents').css({ height: parentEl.height() - barHeights });
            }
            else {
                el.children('._contents').css({ height: el.height() - barHeights });
            }

            if(this.header) {
                this.header.setTitle(this.header.getTitle());
            }
        },

        stackSize: function() {
            return this._stack.length;
        },

        clearStack: function() {
            var stack = this._stack;

            while(stack.length) {
                stack[stack.length - 1].close();
            }
        },

        setTitle: function() {
            if(!this.header) {
                return;
            }

            var titleField = this.options.titleField || 'title';
            var model = this.model;
            var text;

            if(this.getTitle) {
                text = this.getTitle();
            }
            else if(model && model.get(titleField)) {
                text = model.get(titleField);
            }
            else {
                // Since the header may have changed (buttons, etc),
                // reorient the header anyway
                text = this.header.getTitle();
            }

            this.header.setTitle(text);
        },

        open: function(model, anim) {
            // Open a view and push it on the parent view's navigation
            // stack

            anim = anim || 'instant';
            var stack = this.parent._stack;

            if(stack.indexOf(this.el) !== -1) {
                // It's already in the stack, do nothing
                return;
            }

            if(anims[anim]) {
                anims[anim](this.el);
            }
            else {
                console.log('WARNING: invalid animation: ' + anim);
            }

            if(stack.length && this.header) {
                this.header.addBack(this);
            }
            else if(this.header) {
                this.header.removeBack();
            }

            stack.push(this.el);
            this.model = model;
            this.setTitle();

            // This method fires when this view appears in the app, so bind
            // the render function to the current model's change event
            // TODO: could this add multiple even listeners, and
            // should it be done in `openAlone` also?
            if(this.model) {
                this.model.on('change', _.bind(this.render, this));
            }

            this.render();

            if(this.onOpen) {
                this.onOpen(this);
            }
        },

        openAlone: function(model, anim) {
            // Open a view but don't put it on the stack

            anim = anim || 'instant';

            if(anims[anim]) {
                anims[anim](this.el);
            }
            else {
                console.log('WARNING: invalid animation: ' + anim);
            }

            if(this.header) {
                this.header.removeBack();
            }

            this.model = model;
            this.setTitle();
            this.render();

            if(this.onOpen) {
                this.onOpen(this);
            }
        },

        close: function(anim) {
            anim = anim || 'instantOut';
            var stack = this.parent._stack;
            var lastIdx = stack.length - 1;

            if(stack[lastIdx] == this.el) {
                stack.pop();
            }

            anims[anim](this.el);
            this.model = null;
        },

        render: function() {
            var model = this.model;

            if(this.options.render) {
                this.options.render.call(this.el, model);
            }
            else {
                console.log('[BasicView] WARNING: No render function ' +
                            'available. Set one on the "render" property ' +
                            'of the x-view.');
            }
        }
    });

    return BasicView;
});