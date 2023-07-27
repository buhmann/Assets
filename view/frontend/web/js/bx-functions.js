define([
    'jquery',
    'jquery/ui',
    'bxSliderMin',
    'imagesLoaded'
], function($){
    'use strict';

    let touchHandler = function(){
        let TouchMouseEvent = {
            DOWN: "touchstart",
            UP: "touchend",
            MOVE: "touchmove"
        },
        doc = $(document);

        let normalizeEvent = function(type, original, x, y) {
            return $.Event(type, {
                pageX: x,
                pageY: y,
                originalEvent: original
            });
        };

        let onMouseEvent = function(event) {
            let type;

            switch (event.type) {
                case "mousedown": type = TouchMouseEvent.DOWN; break;
                case "mouseup":   type = TouchMouseEvent.UP;   break;
                case "mousemove": type = TouchMouseEvent.MOVE; break;
                default:
                    return;
            }

            let touchMouseEvent = normalizeEvent(type, event, event.pageX, event.pageY);
            $(event.target).trigger(touchMouseEvent);
        };

        if ("ontouchstart" in window) {

        } else {
            doc.on("mousedown", onMouseEvent);
            doc.on("mouseup", onMouseEvent);
            doc.on("mousemove", onMouseEvent);
        }
    };

    if(navigator.userAgent.indexOf("Firefox") !== -1 ){
        touchHandler();
    }

    $.fn.easyBxSlider = function(opt){
        let options = $.extend({
            // GENERAL
            mode: 'horizontal',
            slideSelector: '',
            adaptiveHeight: true,
            galleryListSelector: '.gallery-list',
            destroy: false,
            pager: true,
            controls: true,
            slideMargin: 0,

            // CAROUSEL
            dataCountAttr: 'data-slide-visible',
            breakpoints: {},
            resizeInterval: 200,

            // CALLBACKS
            onSliderBeforeInit: function(){return true;},
            onSliderLoad: function(){return true;},
            onSlideBefore: function(){return true;},
            onSlideAfter: function(){return true;},
            onSlideNext: function(){return true;},
            onSlidePrev: function(){return true;},
            onSliderResize: function(){return true;},
            onSliderReloadAfter: function(){return true;},

            // ACTIONS
            destroySliderAction: function(){return false;},
        }, opt);

        if(this.length === 0) return this;

        if(this.length > 1){
            this.each(function(){$(this).easyBxSlider(opt)});
            return this;
        }

        if ($(this).data('easyBxSlider')) {
            return this;
        }

        return (function(el, options){
            let obj = {},
                refreshStateResize,
                resizeInterval,
                startNodeWidth,
                setModeClass,
                currentBreakpoint,
                getRandomInt = function(min, max){
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                };

            if(!el.attr('id')){
                el.attr('id', 'gallery-list-' + getRandomInt(1, 1000));
            }
            obj.el = el;
            obj.options = $.extend({}, options);
            obj.id = obj.el.attr('id');
            obj.galleryList = obj.el.closest(obj.options.galleryListSelector);
            if(!obj.galleryList.length){
                obj.galleryList = obj.el.find(obj.options.galleryListSelector);
                obj.slides = obj.galleryList.children(obj.options.slideSelector);
            }

            obj.breakpoints = Object.keys(obj.options.breakpoints);

            obj.el.css('visibility', 'visible');
            obj.galleryList.css('visibility', 'visible');

            if(obj.galleryList.data('bxSlider')){
                return;
            }

            Object.defineProperty(obj, "currentBreakpoint", {
                get: function() {
                    let currentBreakpoint = '1';
                    if(this.breakpoints.length){
                        for (let i = 0; i < this.breakpoints.length; i++) {
                            if(obj.el.width() >= parseInt(this.breakpoints[i]) && (i + 1) < this.breakpoints.length){
                                if(obj.el.width() < parseInt(this.breakpoints[i+1])){
                                    currentBreakpoint = this.breakpoints[i];
                                }
                            }else if((i + 1) == this.breakpoints.length && obj.el.width() >= parseInt(this.breakpoints[i])){
                                currentBreakpoint = this.breakpoints[i];
                            }
                        }
                    }
                    return parseInt(currentBreakpoint);
                },
                set: function(val) {
                    return parseInt(val);
                }
            });

            Object.defineProperty(obj, "settings", {
                get: function() {
                    let breakOpt = {};
                    if(this.breakpoints.length && (obj.el.width() > this.currentBreakpoint) && obj.options.breakpoints[this.currentBreakpoint]){
                        breakOpt = obj.options.breakpoints[this.currentBreakpoint];
                    }
                    let o = $.extend({}, obj.options, breakOpt);

                    o.maxSlides = o.hasOwnProperty('maxSlides')? o.maxSlides : 1;
                    o.minSlides = o.hasOwnProperty('minSlides')? o.minSlides : o.maxSlides;
                    o.slideWidth = o.hasOwnProperty('slideWidth')? o.slideWidth : (obj.el.width() / o.maxSlides) - o.slideMargin;
                    o.touchEnabled = o.hasOwnProperty('touchEnabled')? o.touchEnabled : this.getSlideCount() > o.minSlides;
                    o.pager = (o.hasOwnProperty('pager') && this.getSlideCount() > o.minSlides)? o.pager : false;
                    o.controls = (o.hasOwnProperty('controls') && this.getSlideCount() > o.minSlides)? o.controls : false;

                    o.onSliderBeforeInit = function(){
                        if(breakOpt.hasOwnProperty('onSliderBeforeInit')){
                            breakOpt.onSliderBeforeInit(obj);
                        }else{
                            obj.options.onSliderBeforeInit(obj);
                        }
                    };
                    o.onSliderLoad = function(){
                        if(breakOpt.hasOwnProperty('onSliderLoad')){
                            breakOpt.onSliderLoad(obj);
                        }else{
                            obj.options.onSliderLoad(obj);
                        }
                    };
                    o.onSlideBefore = function(){
                        if(breakOpt.hasOwnProperty('onSlideBefore')){
                            breakOpt.onSlideBefore(obj);
                        }else{
                            obj.options.onSlideBefore(obj);
                        }
                    };
                    o.onSlideAfter = function(){
                        if(breakOpt.hasOwnProperty('onSlideAfter')){
                            breakOpt.onSlideAfter(obj);
                        }else{
                            obj.options.onSlideAfter(obj);
                        }
                    };
                    o.onSlideNext = function(){
                        if(breakOpt.hasOwnProperty('onSlideNext')){
                            breakOpt.onSlideNext(obj);
                        }else{
                            obj.options.onSlideNext(obj);
                        }
                    };
                    o.onSlidePrev = function(){
                        if(breakOpt.hasOwnProperty('onSlidePrev')){
                            breakOpt.onSlidePrev(obj);
                        }else{
                            obj.options.onSlidePrev(obj);
                        }
                    };
                    o.onSliderResize = function(){
                        if(breakOpt.hasOwnProperty('onSliderResize')){
                            breakOpt.onSliderResize(obj);
                        }else{
                            obj.options.onSliderResize(obj);
                        }
                    };
                    o.onSliderReloadAfter = function(){
                        if(breakOpt.hasOwnProperty('onSliderReloadAfter')){
                            breakOpt.onSliderReloadAfter(obj);
                        }else{
                            obj.options.onSliderReloadAfter(obj);
                        }
                    };
                    return o;
                }
            });

            currentBreakpoint = obj.currentBreakpoint;

            refreshStateResize = function(func){
                startNodeWidth = obj.el[0].offsetWidth;
                clearInterval(resizeInterval);
                resizeInterval = setInterval(function(){
                    if(startNodeWidth !== obj.el[0].offsetWidth){
                        startNodeWidth = obj.el[0].offsetWidth;
                    }else{
                        clearInterval(resizeInterval);
                        func();
                    }
                }, obj.options.resizeInterval);
            };

            setModeClass = function(){
                obj.el.attr('data-mode', obj.settings.mode);
            };

            obj.getSlideCount = function(){
                if(obj.galleryList.data('bxSlider')){
                    return obj.galleryList.getSlideCount();
                }else{
                    return obj.slides.length;
                }
            };

            obj.destroySlider = function(){
                if(obj.galleryList.data('bxSlider'))
                    obj.galleryList.destroySlider(obj.settings);
            };
            obj.reloadSlider = function(){
                obj.galleryList.reloadSlider(obj.settings);
                obj.viewport = obj.galleryList.parent();
                obj.settings.onSliderReloadAfter();
            };
            obj.redrawSlider = function(){
                if(obj.galleryList.data('bxSlider')){
                    obj.galleryList.redrawSlider();
                    obj.settings.onSliderReloadAfter();
                }
            };
            obj.initSlider = function(){
                if(obj.options.destroySliderAction()){
                    obj.destroySlider();
                }else if(obj.el.width() > parseInt(obj.currentBreakpoint)){
                    if(obj.settings.destroy){
                        obj.destroySlider();
                    }else{
                        if(!obj.galleryList.data('bxSlider')){
                            obj.galleryList.bxSlider(obj.settings);
                            obj.viewport = obj.galleryList.parent();
                        }else if(currentBreakpoint !== obj.currentBreakpoint){
                            currentBreakpoint = obj.currentBreakpoint;
                            obj.reloadSlider();
                        }else{
                            obj.redrawSlider();
                        }
                    }
                    setModeClass();
                }
            };

            $(window).on('resize orientationchange', function(event){
                refreshStateResize(obj.initSlider);
            });
            $(el).data('easyBxSlider', obj);

            obj.settings.onSliderBeforeInit(obj);
            obj.galleryList.waitForImages(function(){
                obj.redrawSlider();
            }.bind(this));

            obj.initSlider();

            return $(el);
        }(this, options));
    };

    $.widget('mage.setBxSlider', {
        options: {},
        _init: function(){
            this.element.easyBxSlider(this.options);
        }
    });
    
    return $.mage.setBxSlider;
});