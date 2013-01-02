/* Adapted to AMD module -- James Long 12/21/2012 */

/**
 * CSS Animation Store v0.1
 * JSON style interface to CSS Animations
 *
 * Copyright 2011, Joe Lambert (http://www.joelambert.co.uk).
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * https://github.com/joelambert/CSS-Animation-Store/blob/master/cssanimationstore.js
 */

define(function() {
	var KeyframeRule = function(r) {
		this.original = r;
		this.keyText = r.keyText;
		this.css = r.css();
	};

	var KeyframeAnimation = function(kf) {
		var _this = this;
		this.original = kf;
		this.name = kf.name;

		this.keyframes = [];
		var keytexts = [],
			keyframeHash = {},

		/**
		 * Makes the rule indexable
		 * @param {WebKitKeyframeRule} r The CSSOM keyframe rule
		 * @returns undefined
		 */

		indexRule = function(r) {
			var rule = new KeyframeRule(r);
			_this.keyframes.push(rule);
			keytexts.push(rule.keyText);
			keyframeHash[rule.keyText] = rule;
		},


		/**
		 * Initialises the object
		 * @returns undefined
		 */

		init = function() {
			_this.keyframes = [];
			keytexts = [];
			keyframeHash = {};

			for(var i=0; i<kf.cssRules.length; i++) {
				indexRule(kf.cssRules[i]);
			}
		};

		init();

		this.getKeyframeTexts = function() {
			return keytexts;
		};

		this.getKeyframe = function(text) {
			return keyframeHash[text];
		};

		this.setKeyframe = function(text, css) {
			var cssRule = text+" {";

			for(var k in css) {
				cssRule += k+':'+css[k]+';';
			}

			cssRule += "}";
			_this.original.insertRule(cssRule);
			init();
		};

        this.clear = function() {
            for(var i=0; i<this.keyframes.length; i++) {
                this.original.deleteRule(this.keyframes[i].keyText);
            }
        };
	};

	var trim = function(str) {
		str = str || "";
		return str.replace(/^\s+|\s+$/g,"");
	};

	var prefix = "",
		prefixes = ['WebKit', 'Moz'];

	for(var i=0; i<prefixes.length; i++) {
		if(window[prefixes[i]+'CSSKeyframeRule'])
			prefix = prefixes[i];
	}

	window[prefix+'CSSKeyframeRule'].prototype.css = function() {
		var css = {};

		var rules = this.style.cssText.split(';');
		for(var i=0; i<rules.length; i++) {
			var parts = rules[i].split(':'),
				key = trim(parts[0]),
				value = trim(parts[1]);

			if(key !== '' && value !== '')
				css[key] = value;
		}

		return css;
	};

    function findRules(styles, func) {
		var rules = styles.cssRules || styles.rules || [];

		for(var i = rules.length - 1; i >= 0; i--) {
            var rule = rules[i];

            if(rule.type == CSSRule.IMPORT_RULE) {
                findRules(rule.styleSheet, func);
            }
			else if(rule.type === window.CSSRule.WEBKIT_KEYFRAMES_RULE ||
                    rule.type === window.CSSRule.MOZ_KEYFRAMES_RULE) {
                func(rule, styles, i);
			}
		}
    }

	function findAnimations() {
		var styles = document.styleSheets;
        var anims = {};

		for(var i = styles.length - 1; i >= 0; i--) {
			//try {
                findRules(styles[i], function(rule) {
                    anims[rule.name] = new KeyframeAnimation(rule);
                });
		//}
			// catch(e) {
            //     // Trying to interrogate a stylesheet from another
            //     // domain will throw a security error
            // }
		}

		return anims;
	};

    function Animations() {
        this.animations = findAnimations();
    }

    Animations.prototype.get = function(name) {
        return this.animations[name];
    };

    Animations.prototype.create = function(name) {
        // TODO: create custom stylesheet and append
        var styles = document.styleSheets[0];
        if(!name) {
            name = 'anim' + Math.floor(Math.random() * 100000);
        }

        // Append a empty animation to the end of the stylesheet
        try {
            var idx = styles.insertRule('@keyframes ' + name + '{}',
                                        styles.cssRules.length);
        }
        catch(e) {
            if(e.name == 'SYNTAX_ERR') {
                idx = styles.insertRule('@-webkit-keyframes ' + name + '{}',
                                        styles.cssRules.length);
            }
            else {
                throw e;
            }
        }

        this.animations[name] = new KeyframeAnimation(styles.cssRules[idx]);

        return this.animations[name];
    };

    Animations.prototype.remove = function(name) {
        var styles = document.styleSheets[0];
        name = name instanceof KeyframeAnimation ? name.name : name;

        this.animations[name] = null;

        try {
            findRules(styles, function(rule, styles, i) {
                if(rule.name == name) {
                    styles.deleteRule(i);
                }
            });
        }
        catch(e) {
            // Trying to interrogate a stylesheet from another
            // domain will throw a security error
        }
    };

	return new Animations();
});