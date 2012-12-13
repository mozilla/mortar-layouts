
define(function(require) {
    var $ = require('zepto');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var BasicView = require('./view');

    var GroupView = BasicView.extend({
        // initialize: function() {
        //     this.initView();
        // },

        initContent: function(el) {
            // Do nothing
        }
    });

    return GroupView;
});