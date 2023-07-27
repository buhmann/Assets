define([
    'jquery',
    'ScrollMagic',
    'matchMedia',
    'jquery/ui',
    'AnimationGsap'
], function($, ScrollMagic, mediaCheck){
    'use strict';

    $.widget('mage.staggerFade', {
        options: {
            speed: 1,
            media: '(min-width: 768px)',
            firstSelector: '[data-attrs-first]',
            lastSelector: '[data-attrs-last]'
        },
        tween: {},
        controller: (function () {
            return new ScrollMagic.Controller({
                addIndicators: false
            });
        })(),
        _init: function(){
            this.firstElement = this.element.find(this.options.firstSelector)[0];
            this.lastElement = this.element.find(this.options.lastSelector)[0];
            this.tween = this.getTween();

            mediaCheck({
                media: this.options.media,
                entry: $.proxy(function () {
                    this.windowSizeLogic(true);
                }, this),
                exit: $.proxy(function () {
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
                reverse: false,
            });

            return scene.setTween(this.tween)
                .addTo(this.controller);
        },
        getTween: function () {
            const timeline = new TimelineMax();

            if (!this.lastElement) {
                timeline.from(this.firstElement, this.options.speed, {
                    alpha: 0,
                    y: '100',
                    ease: Linear.easeOut
                })
            } else {
                timeline.from(this.firstElement, this.options.speed, {
                    alpha: 0,
                    y: '100',
                    ease: Linear.easeOut
                }).from(this.lastElement, this.options.speed, {
                    alpha: 0,
                    y: '100',
                    ease: Linear.easeOut
                }, 0.2)
            }
            return timeline;
        },
        windowSizeLogic: function (xlarge) {
            if (xlarge) {
                this.tween.seek(0);
                this.controller.enabled(true);
            } else {
                this.tween.seek(100);
                this.controller.enabled(false);
            }
            this.controller.update(true);
        }
    });

    return $.mage.staggerFade;
});
