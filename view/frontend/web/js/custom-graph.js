define([
    'jquery',
    'ScrollMagic',
    'matchMedia',
    'jquery/ui',
    'AnimationGsap'
], function($, ScrollMagic, mediaCheck){
    'use strict';

    $.widget('mage.iconPulsate', {
        options: {
            speed: 0.9,
            media: '(min-width: 1024px)',
            competitionSelector: '',
            testSelector: '',
            scale1: 0.97,
            scale2: 1.02,
        },
        tween: {},
        controller: (function () {
            return new ScrollMagic.Controller({
                addIndicators: false
            });
        })(),
        _init: function(){
            this.compCol = this.element.find(this.options.competitionSelector);
            this.lensCol = this.element.find(this.options.testSelector);
            this.tween = this.getTween();

            let update = true;
            mediaCheck({
                media: this.options.media,
                entry: $.proxy(function () {
                    update = true;
                }, this),
                exit: $.proxy(function () {
                    update = false;
                }, this)
            });
            $(window).resize(function () {
                if (update) this.addScene();
            }.bind(this));

            this.addScene();
        },
        addScene: function () {
            const scene = new ScrollMagic.Scene({
                offset: this.element.data('attrs-offset') || 50,
                triggerElement: this.element[0],
                triggerHook: this.element.data('attrs-trigger-hook') || 0.5,
                reverse: false,
            });

            return scene.setTween(this.tween)
                .addTo(this.controller);
        },
        getTween: function () {
            const timeline = new TimelineMax();

            return timeline.to(this.compCol, this.options.speed, {
                height: this.compCol.data('height') || '89%',
                ease: Linear.easeIn
            }, 'start')
            .to(this.lensCol, this.options.speed, {
                height: this.compCol.data('height') || '19%',
                ease: Linear.easeIn
            }, 'start');
        },
    });

    return $.mage.iconPulsate;
});
