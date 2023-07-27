define([
    'jquery',
    'ScrollMagic',
    'matchMedia',
    'jquery/ui',
    'AnimationGsap'
], function($, ScrollMagic, mediaCheck){
    'use strict';

    $.widget('mage.parallaxCustomLens', {
        options: {
            speed: 0.7,
            media: '(min-width: 768px)',
            framesSelector: '',
            lensSelector: ''
        },
        tween: {},
        controller: (function () {
            return new ScrollMagic.Controller({
                addIndicators: false
            });
        })(),
        _init: function(){
            this.frame = this.element.find(this.options.framesSelector);
            this.lens = this.frame.find(this.options.lensSelector);

            this.frame.css({'top': this.element.data('attrs-top-start') || this.frame.height() * 0.5});

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
                triggerElement: this.frame[0],
                triggerHook: this.element.data('attrs-trigger-hook') || 'onEnter',
                duration: this.element.data('attrs-duration') || $(window).height() + this.frame.height(),
            });

            return scene.setTween(this.tween)
                        .addTo(this.controller);
        },
        getTween: function () {
            const timeline = new TimelineMax();

            return timeline.fromTo(this.frame, this.options.speed, {
                                top: this.element.data('attrs-top-start') || this.frame.height() * 0.5,
                                ease: Linear.easeNone
                            }, {
                                top: this.element.data('attrs-top-end') || '-40%',
                                ease: Linear.easeNone
                            }, 'start')
                            .to(this.lens, this.options.speed, {
                                right: '-10%'
                            }, 'start');
        },
        windowSizeLogic: function (xlarge) {
            this.tween = this.getTween(xlarge);
            if (xlarge) {
                this.controller.enabled(true);
            } else {
                this.controller.enabled(false);
            }
            this.controller.update(true);
            setTimeout(function () {
                this.frame.css({'top': this.element.data('attrs-top-start') || this.frame.height() * 0.5});
            }.bind(this), this.options.speed * 1000);
        }
    });

    return $.mage.parallaxCustomLens;
});
