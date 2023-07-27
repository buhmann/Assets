/* Cutting Text By Text Lines Count */
/**
 * Copyright © Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'assetsBase',
    'Magento_Ui/js/lib/view/utils/dom-observer',
    'Buhmann_Assets/js/lib/polyfills'
], function(b, domObserver){
    'use strict';

    let GoToElement = window.ClassCreate();

    GoToElement.prototype = {
        baseOptions: {
            selector: null,
            margin: 0,
            easing: 'linear',
            events: 'click',
            duration: 300,
            initialize: function(){},
            scrollBefore: function(){},
            scrollAfter: function(){}
        },
        methods: Object.assign({}, b.methods || {}, {}),
        lib: Object.assign({}, b.lib || {}, {}),
        getTargetY: function(){
            let targetY = 0;
            let targetNode = document.querySelector(this.options.selector);
            if(targetNode){
                targetY = this.lib.getOffset(targetNode).top;
            }
            targetY = !targetY? 0 : targetY - this.options.margin;
            return targetY;
        },
        animateScroll: function(){
            let self = this;
            return new this.methods.ScrollTo({
                destinationOffset: this.getTargetY(),
                easing: this.options.easing,
                duration: this.options.duration,
                scrollBefore: function(){
                    return self.options.scrollBefore(self);
                },
                scrollAfter: function(){
                    return self.options.scrollAfter(self);
                }
            });
        },
        initialize: function(node, opt){
            let self = this;
            this.node = node;
            this.options = Object.assign({}, this.baseOptions, opt);
            this.targetNode = document.querySelector(this.options.selector);
            let events = this.options.events.split(' ');
            for(let i in events){
                this.lib.event.add(this.node, events[i], function(){
                    this.options.initialize(this),
                    this.animateScroll();
                    setTimeout(function(){
                        self.animateScroll();
                    }, this.options.duration);
                }, this);
            }
            this.node.goToNode = this;
        }
    };

    b.addMethod('GoToElement', {
        elementSelector:'[data-goto]', //'a[href^="#"]',
        enabled: false,
        dataAttribute: 'data-goto',
        baseOptions: {
            margin: 0,
            easing: 'linear',
            events: 'click',
            duration: 300,
            initialize: function(){},
            scrollBefore: function(){},
            scrollAfter: function(){}
        },
        lib: Object.assign({}, b.lib, {}),
        initialize: function(elementSelector, opt){
            this.elementSelector = elementSelector || this.elementSelector;
            this.options = Object.assign({}, this.baseOptions, opt);
            domObserver.get(this.elementSelector, function(node){
                this.addElement(node);
            }.bind(this));
        },
        addElement: function(node){
            if(!node.goToNode){
                let opt = Object.assign({}, this.options);
                if(node.getAttribute(this.dataAttribute)){
                    opt = Object.assign(opt, eval('(' + node.getAttribute(this.dataAttribute) + ')'));
                }
                new GoToElement(node, opt);
            }
        },
    });

    return b.methods.GoToElement;
});
