define([
    'jquery',
    'jquery/ui',
    'AnimationGsap',
], function($){
    'use strict';

    $.widget('mage.completedFadeUp', {
        options: {
            timeout: 300
        },
        controller: (function () {
            return new TimelineLite();
        })(),
        _init: function(){
            this.element.fadeIn(1000);
            setTimeout(function () {
                this.loaderWhiteAnimationCompleted();
            }.bind(this), this.options.timeout);
        },
        loaderWhiteAnimationCompleted: function () {
            this.controller.staggerFromTo(this.element, 0.7, {
                opacity: 0,
                y: 60
            }, {
                opacity: 1,
                y: 0
            }, 0.3)
        }
    });

    return $.mage.completedFadeUp;
});
