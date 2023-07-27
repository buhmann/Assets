define([
    'jquery',
    'ScrollMagic',
    'jquery/ui',
    'AnimationGsap'
], function($, ScrollMagic){
    'use strict';

    $.widget('mage.iconPulsate', {
        options: {
            panelLeftSelector: '',
            panelRightSelector: '',
            iconSelector: '',
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
            this.panelLeft = this.element.find(this.options.panelLeftSelector);
            this.panelRight = this.element.find(this.options.panelRightSelector);
            this.icon = this.element.find(this.options.iconSelector);
            this.tween = this.getTween();

            this.addScene();
        },
        addScene: function () {
            const scene = new ScrollMagic.Scene({
                offset: this.element.data('attrs-offset') || 150,
                triggerElement: this.element[0],
                triggerHook: this.element.data('attrs-trigger-hook') || 'onEnter',
                reverse: false,
            });

            return scene.setTween(this.tween)
                .addTo(this.controller);
        },

        getTween: function () {
            const timeline = new TimelineMax();

            return timeline.add([
                this._getPanelLeftTween(),
                this._getPanelRightTween(),
                this._getIconTween()
            ]);
        },
        _getPanelLeftTween: function () {
            const timeline = new TimelineMax({ repeat: 0 });

            timeline.fromTo(this.panelLeft, 0.3, {
                alpha: 0,
                x: '-70px',
                scaleX: 1
            }, {
                alpha: 1,
                x: '20px',
                scaleX: this.options.scale1
            }).fromTo(this.panelLeft, 0.17, {
                x: '20px',
                scaleX: this.options.scale1
            }, {
                x: '-5px',
                scaleX: this.options.scale2
            }).fromTo(this.panelLeft, 0.2, {
                x: '-5px',
                scaleX: this.options.scale2
            }, {
                x: 0,
                scaleX: 1
            });
            return timeline;
        },
        _getPanelRightTween: function () {
            const timeline = new TimelineMax({ repeat: 0 });

            timeline.fromTo(this.panelRight, 0.3, {
                alpha: 0,
                x: '70px',
                scaleX: 1
            }, {
                alpha: 1,
                x: '-20px',
                scaleX: this.options.scale1
            }).fromTo(this.panelRight, 0.17, {
                x: '-20px',
                scaleX: this.options.scale1
            }, {
                x: '5px',
                scaleX: this.options.scale2
            }).fromTo(this.panelRight, 0.2, {
                x: '5px',
                scaleX: this.options.scale2
            }, {
                x: 0,
                scaleX: 1
            });

            return timeline;
        },
        _getIconTween: function () {
            const timeline = new TimelineMax({ repeat: 0 });

            timeline.fromTo(this.icon, 0.2, {
                    alpha: 0,
                    scale: 0.2
                }, {
                    alpha: 1,
                    scale: 1.18,
                    delay: 0.6
                })
                .fromTo(this.icon, 0.17, {
                    scale: 1.18
                }, {
                    scale: 0.95
                })
                .fromTo(this.icon, 0.2, {
                    scale: 0.95
                }, {
                    scale: 1.05
                })
                .fromTo(this.icon, 0.35, {
                    scale: 1.05
                }, {
                    scale: 1
                });

            return timeline;
        },
    });

    return $.mage.iconPulsate;
});
