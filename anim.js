
define(function(require) {
    var $ = require('zepto');
    var animations = require('./cssanimationstore');

    var zindex = 100;

    // Utility

    function vendorized(prop, val, obj) {
        obj['-webkit-' + prop] = val;
        obj['-moz-' + prop] = val;
        obj['-ms-' + prop] = val;
        obj['-o-' + prop] = val;
        obj[prop] = val;
        return obj;
    }

    function onOnce(node, event, func) {
        var props = ['', 'webkit', 'moz', 'ms', 'o'];
        for(var k in props) {
            (function(prefix) {
                node.on(prefix + event, function() {
                    func();
                    node.off(prefix + event);
                });
            })(props[k]);
        }
    }

    function animateX(node, start, end, duration, bury) {
        animate(node,
                { transform: 'translateX(' + Math.floor(start) + 'px)' },
                { transform: 'translateX(' + Math.floor(end) + 'px)' },
                duration,
                bury);
    }

    function animate(node, start, end, duration, bury) {
        node = $(node);
        var anim = animations.create();

        anim.setKeyframe('0%', start);
        anim.setKeyframe('100%', end);

        node.css({
            'animation-duration': duration,
            'animation-name': anim.name,
            'z-index': zindex++
        });

        onOnce(node, 'animationend', function() {
            var styles = { 'animation-name': 'none' };
            if(bury) {
                styles['z-index'] = 0;
            }

            node.css(styles);
            animations.remove(anim);
        });
    }

    // Animations

    function instant(node) {
        node = $(node);
        node.css(vendorized('transition', 'none', {
            zIndex: zindex++
        }));
    }

    function instantOut(node) {
        node = $(node);
        node.css(vendorized('transition', 'none', {
            zIndex: 0
        }));
    }

    function slideLeft(node) {
        animateX(node, $(node).width(), 0, '300ms');
    }

    function slideRightOut(node) {
        animateX(node, 0, $(node).width(), '300ms', true);
    }

    return {
        instant: instant,
        instantOut: instantOut,
        slideLeft: slideLeft,
        slideRightOut: slideRightOut
    };
});