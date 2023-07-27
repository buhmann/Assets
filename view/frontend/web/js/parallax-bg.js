define([
    'jquery',
    'ScrollMagic',
    'matchMedia',
    'AnimationGsap',
    'jquery/ui',
], function($, ScrollMagic, mediaCheck){
    'use strict';

    $.widget('mage.parallaxBg', {
        options: {
            media: '(min-width: 768px)'
        },
        tween: {},
        controller: (function () {
            return new ScrollMagic.Controller({
                addIndicators: false
            });
        })(),
        _init: function(){
            mediaCheck({
                media: this.options.media,
                entry: $.proxy(function () {
                    this.tween = this.getTween(true);
                    this.windowSizeLogic(true);
                }, this),
                exit: $.proxy(function () {
                    this.tween = this.getTween(false);
                    this.windowSizeLogic(false);
                }, this)
            });

            this.addScene();
        },
        addScene: function () {
            const scene = new ScrollMagic.Scene({
                offset: this.element.data('attrs-offset') || 0,
                triggerElement: this.element[0],
                triggerHook: this.element.data('attrs-trigger-hook') || 0.5,
                duration: this.element.data('attrs-duration') || $(window).height() + this.element.height(),
            });

            return scene.setTween(this.tween)
                        .addTo(this.controller);
        },
        getTween: function (xlarge) {
            return TweenMax.fromTo(this.element, 1, {
                backgroundPosition: xlarge ? this.element.data('attrs-xlarge-pos-start') || '50% 100%' : this.element.data('attrs-pos-start') || '50% 50%',
                ease: Linear.easeNone
            }, {
                backgroundPosition: xlarge ? this.element.data('attrs-xlarge-pos-end') || '50% 0%' : this.element.data('attrs-pos-end') || '50% 100%',
                ease: Linear.easeNone
            })
        },
        windowSizeLogic: function (xlarge) {
            this.tween = this.getTween(xlarge);
            if (xlarge) {
                this.tween.progress(0);
                this.controller.enabled(true);
            } else {
                this.tween.progress(0);
                this.element.css('background-position', '50% 30%');
                this.controller.enabled(false);
            }
            this.controller.update(true)
        }
    });

    return $.mage.parallaxBg;
});
